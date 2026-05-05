package http

import (
	"crypto/sha1"
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"sync"
	"time"

	"github.com/neurodynecorp/api/internal/domain/port"
	"github.com/neurodynecorp/api/pkg/logger"
)

const (
	websocketGUID = "258EAFA5-E914-47DA-95CA-5AB5DC29E11B"

	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period (must be less than pongWait).
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 4096
)

// WSMessageType enumerates the supported real-time message types.
type WSMessageType string

const (
	WSTypeMessage      WSMessageType = "message"
	WSTypeNotification WSMessageType = "notification"
	WSTypeTyping       WSMessageType = "typing"
	WSTypeError        WSMessageType = "error"
	WSTypePong         WSMessageType = "pong"
)

// WSMessage is the envelope for every WebSocket frame the server sends or receives.
type WSMessage struct {
	Type      WSMessageType `json:"type"`
	ProjectID string        `json:"project_id,omitempty"`
	SenderID  string        `json:"sender_id,omitempty"`
	ThreadID  string        `json:"thread_id,omitempty"`
	Content   string        `json:"content,omitempty"`
	Payload   any           `json:"payload,omitempty"`
	Timestamp time.Time     `json:"timestamp"`
}

// Client represents a single WebSocket connection.
type Client struct {
	hub    *Hub
	userID string
	conn   *wsConn
	send   chan []byte
}

// Hub maintains the set of active clients and broadcasts messages.
type Hub struct {
	mu       sync.RWMutex
	clients  map[*Client]bool
	byUser   map[string]map[*Client]bool
	byProject map[string]map[*Client]bool

	register   chan *Client
	unregister chan *Client

	log *logger.Logger
}

// NewHub creates a new Hub.
func NewHub(log *logger.Logger) *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		byUser:     make(map[string]map[*Client]bool),
		byProject:  make(map[string]map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		log:        log.WithComponent("websocket_hub"),
	}
}

// Run starts the hub event loop. Call this in a goroutine.
func (h *Hub) Run() {
	h.log.Info().Msg("websocket hub started")
	for {
		select {
		case client := <-h.register:
			h.addClient(client)
		case client := <-h.unregister:
			h.removeClient(client)
		}
	}
}

func (h *Hub) addClient(c *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	h.clients[c] = true

	if _, ok := h.byUser[c.userID]; !ok {
		h.byUser[c.userID] = make(map[*Client]bool)
	}
	h.byUser[c.userID][c] = true

	h.log.Info().
		Str("user_id", c.userID).
		Int("total_clients", len(h.clients)).
		Msg("client connected")
}

func (h *Hub) removeClient(c *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if _, ok := h.clients[c]; !ok {
		return
	}

	delete(h.clients, c)
	close(c.send)

	if userClients, ok := h.byUser[c.userID]; ok {
		delete(userClients, c)
		if len(userClients) == 0 {
			delete(h.byUser, c.userID)
		}
	}

	// Remove from all project subscriptions.
	for projectID, projectClients := range h.byProject {
		delete(projectClients, c)
		if len(projectClients) == 0 {
			delete(h.byProject, projectID)
		}
	}

	h.log.Info().
		Str("user_id", c.userID).
		Int("total_clients", len(h.clients)).
		Msg("client disconnected")
}

// SubscribeProject adds a client to a project's broadcast group.
func (h *Hub) SubscribeProject(c *Client, projectID string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if _, ok := h.byProject[projectID]; !ok {
		h.byProject[projectID] = make(map[*Client]bool)
	}
	h.byProject[projectID][c] = true

	h.log.Debug().
		Str("user_id", c.userID).
		Str("project_id", projectID).
		Msg("client subscribed to project")
}

// BroadcastToProject sends a message to every client subscribed to the given project.
func (h *Hub) BroadcastToProject(projectID string, msg *WSMessage) {
	data, err := json.Marshal(msg)
	if err != nil {
		h.log.Error().Err(err).Msg("failed to marshal broadcast message")
		return
	}

	h.mu.RLock()
	projectClients := h.byProject[projectID]
	h.mu.RUnlock()

	for c := range projectClients {
		select {
		case c.send <- data:
		default:
			// Client send buffer is full; drop and disconnect.
			h.log.Warn().
				Str("user_id", c.userID).
				Str("project_id", projectID).
				Msg("dropping slow client")
			go func(cl *Client) { h.unregister <- cl }(c)
		}
	}
}

// SendToUser sends a message to all connections for a specific user.
func (h *Hub) SendToUser(userID string, msg *WSMessage) {
	data, err := json.Marshal(msg)
	if err != nil {
		h.log.Error().Err(err).Msg("failed to marshal user message")
		return
	}

	h.mu.RLock()
	userClients := h.byUser[userID]
	h.mu.RUnlock()

	for c := range userClients {
		select {
		case c.send <- data:
		default:
			h.log.Warn().
				Str("user_id", userID).
				Msg("dropping slow client")
			go func(cl *Client) { h.unregister <- cl }(c)
		}
	}
}

// ClientCount returns the total number of connected clients (useful for metrics).
func (h *Hub) ClientCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}

// ---------------------------------------------------------------------------
// Minimal RFC 6455 WebSocket implementation (text frames only, no extensions)
// ---------------------------------------------------------------------------

// wsConn wraps an http.ResponseWriter that has been hijacked for WebSocket use.
type wsConn struct {
	rwc io.ReadWriteCloser
	mu  sync.Mutex // serialise writes
}

// ServeWS handles the HTTP-to-WebSocket upgrade and starts read/write pumps.
func ServeWS(hub *Hub, tokenService port.TokenService, w http.ResponseWriter, r *http.Request) {
	// Authenticate via query-string token (WebSocket clients cannot set headers).
	token := r.URL.Query().Get("token")
	if token == "" {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "missing token query parameter"})
		return
	}

	claims, err := tokenService.ValidateAccessToken(token)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid token"})
		return
	}

	// Perform the WebSocket handshake (RFC 6455 Section 4.2.2).
	if r.Header.Get("Upgrade") != "websocket" {
		http.Error(w, "expected websocket upgrade", http.StatusBadRequest)
		return
	}

	challengeKey := r.Header.Get("Sec-WebSocket-Key")
	if challengeKey == "" {
		http.Error(w, "missing Sec-WebSocket-Key", http.StatusBadRequest)
		return
	}

	hj, ok := w.(http.Hijacker)
	if !ok {
		http.Error(w, "server does not support hijacking", http.StatusInternalServerError)
		return
	}

	conn, bufrw, err := hj.Hijack()
	if err != nil {
		hub.log.Error().Err(err).Msg("websocket hijack failed")
		return
	}

	// Write the HTTP 101 Switching Protocols response.
	acceptKey := computeAcceptKey(challengeKey)
	bufrw.WriteString("HTTP/1.1 101 Switching Protocols\r\n")
	bufrw.WriteString("Upgrade: websocket\r\n")
	bufrw.WriteString("Connection: Upgrade\r\n")
	bufrw.WriteString("Sec-WebSocket-Accept: " + acceptKey + "\r\n")
	bufrw.WriteString("\r\n")
	bufrw.Flush()

	ws := &wsConn{rwc: conn}

	client := &Client{
		hub:    hub,
		userID: claims.UserID,
		conn:   ws,
		send:   make(chan []byte, 256),
	}

	hub.register <- client

	// Start read and write pumps in separate goroutines.
	go client.writePump(hub.log)
	go client.readPump(hub.log)
}

// readPump reads messages from the WebSocket connection and dispatches them.
func (c *Client) readPump(log *logger.Logger) {
	defer func() {
		c.hub.unregister <- c
		c.conn.rwc.Close()
	}()

	for {
		payload, err := readFrame(c.conn.rwc)
		if err != nil {
			if err != io.EOF {
				log.Debug().Err(err).Str("user_id", c.userID).Msg("websocket read error")
			}
			return
		}

		// Nil payload comes from control frames (ping/pong) -- skip processing.
		if payload == nil {
			continue
		}

		var msg WSMessage
		if err := json.Unmarshal(payload, &msg); err != nil {
			log.Warn().Err(err).Str("user_id", c.userID).Msg("invalid websocket message")
			errMsg, _ := json.Marshal(WSMessage{
				Type:      WSTypeError,
				Content:   "invalid message format",
				Timestamp: time.Now().UTC(),
			})
			select {
			case c.send <- errMsg:
			default:
			}
			continue
		}

		msg.SenderID = c.userID
		msg.Timestamp = time.Now().UTC()

		switch msg.Type {
		case WSTypeMessage:
			if msg.ProjectID == "" {
				continue
			}
			log.Debug().
				Str("user_id", c.userID).
				Str("project_id", msg.ProjectID).
				Msg("broadcasting message to project")
			c.hub.BroadcastToProject(msg.ProjectID, &msg)

		case WSTypeTyping:
			if msg.ProjectID == "" {
				continue
			}
			c.hub.BroadcastToProject(msg.ProjectID, &msg)

		case WSTypeNotification:
			// Clients normally do not send notifications; the server does.
			// Silently ignore.

		default:
			log.Debug().
				Str("user_id", c.userID).
				Str("type", string(msg.Type)).
				Msg("unknown websocket message type")
		}
	}
}

// writePump writes messages from the send channel to the WebSocket connection.
func (c *Client) writePump(log *logger.Logger) {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.rwc.Close()
	}()

	for {
		select {
		case data, ok := <-c.send:
			if !ok {
				// Hub closed the channel.
				_ = writeFrame(c.conn, 0x8, nil) // close frame
				return
			}
			if err := writeFrame(c.conn, 0x1, data); err != nil { // text frame
				log.Debug().Err(err).Str("user_id", c.userID).Msg("websocket write error")
				return
			}

		case <-ticker.C:
			// Send a ping frame to keep the connection alive.
			if err := writeFrame(c.conn, 0x9, nil); err != nil { // ping frame
				log.Debug().Err(err).Str("user_id", c.userID).Msg("websocket ping error")
				return
			}
		}
	}
}

// ---------------------------------------------------------------------------
// Low-level WebSocket frame helpers (RFC 6455 Sections 5.1 - 5.2)
// ---------------------------------------------------------------------------

// readFrame reads a single WebSocket frame and returns the unmasked payload.
// It handles continuation, text, binary, close, ping, and pong opcodes.
func readFrame(r io.Reader) ([]byte, error) {
	// Read the first two bytes: FIN + opcode, MASK + payload length.
	header := make([]byte, 2)
	if _, err := io.ReadFull(r, header); err != nil {
		return nil, err
	}

	opcode := header[0] & 0x0F
	masked := (header[1] & 0x80) != 0
	length := uint64(header[1] & 0x7F)

	switch {
	case length == 126:
		ext := make([]byte, 2)
		if _, err := io.ReadFull(r, ext); err != nil {
			return nil, err
		}
		length = uint64(ext[0])<<8 | uint64(ext[1])
	case length == 127:
		ext := make([]byte, 8)
		if _, err := io.ReadFull(r, ext); err != nil {
			return nil, err
		}
		length = uint64(ext[0])<<56 | uint64(ext[1])<<48 | uint64(ext[2])<<40 | uint64(ext[3])<<32 |
			uint64(ext[4])<<24 | uint64(ext[5])<<16 | uint64(ext[6])<<8 | uint64(ext[7])
	}

	if length > maxMessageSize {
		return nil, io.ErrUnexpectedEOF
	}

	var maskKey [4]byte
	if masked {
		if _, err := io.ReadFull(r, maskKey[:]); err != nil {
			return nil, err
		}
	}

	payload := make([]byte, length)
	if _, err := io.ReadFull(r, payload); err != nil {
		return nil, err
	}

	if masked {
		for i := range payload {
			payload[i] ^= maskKey[i%4]
		}
	}

	// Handle control frames.
	switch opcode {
	case 0x8: // close
		return nil, io.EOF
	case 0x9: // ping – respond with pong (handled by write pump, just return empty)
		return nil, nil
	case 0xA: // pong – ignore
		return nil, nil
	}

	return payload, nil
}

// writeFrame writes a single unmasked WebSocket frame (server-to-client frames are never masked).
func writeFrame(ws *wsConn, opcode byte, payload []byte) error {
	ws.mu.Lock()
	defer ws.mu.Unlock()

	length := len(payload)

	// FIN bit + opcode.
	header := []byte{0x80 | opcode}

	switch {
	case length <= 125:
		header = append(header, byte(length))
	case length <= 65535:
		header = append(header, 126, byte(length>>8), byte(length))
	default:
		header = append(header, 127,
			byte(length>>56), byte(length>>48), byte(length>>40), byte(length>>32),
			byte(length>>24), byte(length>>16), byte(length>>8), byte(length),
		)
	}

	if _, err := ws.rwc.Write(header); err != nil {
		return err
	}
	if len(payload) > 0 {
		if _, err := ws.rwc.Write(payload); err != nil {
			return err
		}
	}
	return nil
}

// computeAcceptKey computes the Sec-WebSocket-Accept value per RFC 6455 Section 4.2.2.
func computeAcceptKey(challengeKey string) string {
	h := sha1.New()
	h.Write([]byte(challengeKey))
	h.Write([]byte(websocketGUID))
	return base64.StdEncoding.EncodeToString(h.Sum(nil))
}
