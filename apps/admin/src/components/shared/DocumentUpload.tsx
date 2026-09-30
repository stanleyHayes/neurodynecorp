import { useCallback, useId, useRef, useState } from "react";
import { Alert, Box, Button, CircularProgress } from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { MAX_UPLOAD_BYTES, formatBytes } from "@neurodyne/shared";
import { useAuth } from "@/context/AuthContext";

/**
 * Attaches files to a project from the admin side.
 *
 * The upload endpoint existed but had no caller in any interface, so staff had
 * no way to put a deliverable in front of a client except by pasting a link
 * into a field. Sibling of the client app's component — the logic is the same,
 * the chrome follows this app's section idiom.
 */

interface DocumentUploadProps {
  projectId: string;
  /** Called once at least one file lands, so the caller can refetch. */
  onUploaded: () => void;
  /** Surfaces success and failure through the page's existing toast. */
  onMessage?: (message: string) => void;
}

export default function DocumentUpload({ projectId, onUploaded, onMessage }: DocumentUploadProps) {
  const { api } = useAuth();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const send = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setBusy(true);
      setErrors([]);

      const failed: string[] = [];
      let uploaded = 0;

      for (const file of files) {
        try {
          await api.uploadFile(file, "documents", projectId);
          uploaded += 1;
        } catch (err) {
          failed.push(err instanceof Error ? err.message : `${file.name} could not be uploaded.`);
        }
      }

      setBusy(false);
      setErrors(failed);
      if (uploaded > 0) {
        onMessage?.(`${uploaded} file${uploaded === 1 ? "" : "s"} uploaded`);
        onUploaded();
      }
      if (inputRef.current) inputRef.current.value = "";
    },
    [api, onMessage, onUploaded, projectId],
  );

  return (
    <Box>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        multiple
        hidden
        disabled={busy}
        onChange={(e) => e.target.files && void send(Array.from(e.target.files))}
      />
      <Button
        component="label"
        htmlFor={inputId}
        size="small"
        variant="outlined"
        disabled={busy}
        startIcon={busy ? <CircularProgress size={13} color="inherit" /> : <UploadFileOutlinedIcon />}
        sx={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "0.65rem",
          letterSpacing: "0.1em",
          borderColor: "#06B6D440",
          color: "#06B6D4",
          "&:hover": { borderColor: "#06B6D4" },
        }}
      >
        {busy ? "Uploading…" : `Upload (max ${formatBytes(MAX_UPLOAD_BYTES)})`}
      </Button>
      {errors.map((message) => (
        <Alert key={message} severity="error" variant="outlined" sx={{ mt: 1 }}>
          {message}
        </Alert>
      ))}
    </Box>
  );
}
