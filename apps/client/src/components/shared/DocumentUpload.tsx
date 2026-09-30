import { useCallback, useId, useRef, useState } from "react";
import { Alert, Box, Button, CircularProgress, LinearProgress, Stack, Typography } from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { MAX_UPLOAD_BYTES, formatBytes } from "@neurodyne/shared";
import { useAuth } from "@/context/AuthContext";

/**
 * Attaches files to a project.
 *
 * `POST /api/v1/files/upload` has existed and worked for a long time, but no
 * interface in any of the three apps called it — so the client Documents page
 * told people their documents "will appear here" while nothing in the product
 * could put one there. This is the missing half.
 *
 * `projectId` is mandatory rather than optional. The files list is queried per
 * project, so a file uploaded without one is invisible to every listing in the
 * product, including to the person who uploaded it.
 */

interface DocumentUploadProps {
  projectId: string;
  /** Called after at least one file lands, so the caller can refetch. */
  onUploaded: () => void;
  /** Rendered instead of the drop zone — for compact placements. */
  compact?: boolean;
  disabled?: boolean;
  /** Shown when `disabled`, so the control explains itself. */
  disabledReason?: string;
}

const ACCENT = "#3B82F6";

export default function DocumentUpload({
  projectId,
  onUploaded,
  compact = false,
  disabled = false,
  disabledReason,
}: DocumentUploadProps) {
  const { api } = useAuth();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [errors, setErrors] = useState<string[]>([]);
  const [done, setDone] = useState("");

  const send = useCallback(
    async (files: File[]) => {
      if (files.length === 0 || disabled) return;
      setBusy(true);
      setErrors([]);
      setDone("");
      setProgress({ done: 0, total: files.length });

      const failed: string[] = [];
      let uploaded = 0;

      // Sequential, not Promise.all: these go through Cloudinary and a burst of
      // ten parallel 10MB uploads is worse for the person on a slow connection
      // than a queue that reports honest progress.
      for (const file of files) {
        try {
          await api.uploadFile(file, "documents", projectId);
          uploaded += 1;
        } catch (err) {
          failed.push(err instanceof Error ? err.message : `${file.name} could not be uploaded.`);
        }
        setProgress((p) => ({ ...p, done: p.done + 1 }));
      }

      setBusy(false);
      setErrors(failed);
      if (uploaded > 0) {
        setDone(`${uploaded} file${uploaded === 1 ? "" : "s"} uploaded.`);
        onUploaded();
      }
    },
    [api, disabled, onUploaded, projectId],
  );

  const pick = useCallback(
    (list: FileList | null) => {
      if (!list) return;
      void send(Array.from(list));
      // Clearing lets the same file be re-picked after a failure; without it
      // the input's value is unchanged and onChange never fires again.
      if (inputRef.current) inputRef.current.value = "";
    },
    [send],
  );

  const control = (
    <>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        multiple
        hidden
        disabled={disabled || busy}
        onChange={(e) => pick(e.target.files)}
      />
      <Button
        component="label"
        htmlFor={inputId}
        variant={compact ? "outlined" : "contained"}
        size="small"
        disabled={disabled || busy}
        startIcon={busy ? <CircularProgress size={14} color="inherit" /> : <UploadFileOutlinedIcon />}
        sx={{ textTransform: "none", borderRadius: "8px", alignSelf: "flex-start" }}
      >
        {busy ? `Uploading ${progress.done}/${progress.total}…` : "Upload document"}
      </Button>
    </>
  );

  const messages = (
    <>
      {busy && progress.total > 1 && (
        <LinearProgress
          variant="determinate"
          value={(progress.done / progress.total) * 100}
          sx={{ mt: 1.5, borderRadius: "999px", height: 4 }}
        />
      )}
      {disabled && disabledReason && (
        <Typography variant="caption" sx={{ display: "block", mt: 1, color: "text.secondary" }}>
          {disabledReason}
        </Typography>
      )}
      {errors.map((message) => (
        <Alert key={message} severity="error" variant="outlined" sx={{ mt: 1.5 }}>
          {message}
        </Alert>
      ))}
      {done && !busy && errors.length === 0 && (
        <Alert severity="success" variant="outlined" sx={{ mt: 1.5 }}>
          {done}
        </Alert>
      )}
    </>
  );

  if (compact) {
    return (
      <Box>
        {control}
        {messages}
      </Box>
    );
  }

  return (
    <Box>
      <Box
        onDragOver={(e) => {
          if (disabled || busy) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          if (disabled || busy) return;
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files);
        }}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: "12px",
          textAlign: "center",
          // Dashed-to-solid, not colour alone: the drag state has to be legible
          // without relying on hue.
          border: `1px ${dragging ? "solid" : "dashed"} ${dragging ? ACCENT : "rgba(148,163,184,0.35)"}`,
          bgcolor: dragging ? `${ACCENT}0F` : "transparent",
          opacity: disabled ? 0.55 : 1,
          transition: "border-color 160ms ease, background-color 160ms ease",
        }}
      >
        <Stack spacing={1.25} sx={{ alignItems: "center" }}>
          <UploadFileOutlinedIcon sx={{ fontSize: 30, color: ACCENT, opacity: 0.7 }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Drop files here, or choose them
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Up to {formatBytes(MAX_UPLOAD_BYTES)} per file
          </Typography>
          <Box>{control}</Box>
        </Stack>
      </Box>
      {messages}
    </Box>
  );
}
