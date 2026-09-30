import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  CardContent,
  Divider,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Chip,
  IconButton,
  Skeleton,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DescriptionIcon from "@mui/icons-material/Description";
import FolderOffOutlinedIcon from "@mui/icons-material/FolderOffOutlined";
import PageBanner from "@/components/shared/PageBanner";
import AnimatedCard from "@/components/shared/AnimatedCard";
import EmptyState from "@/components/shared/EmptyState";
import DocumentUpload from "@/components/shared/DocumentUpload";
import { useAuth } from "@/context/AuthContext";

interface DocumentRow {
  name: string;
  mimeType: string;
  project: string;
  date: string;
  url?: string;
}

interface ProjectOption {
  id: string;
  title: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function Documents() {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [target, setTarget] = useState("");
  // Distinguishes "you have no documents" from "we could not find out". An
  // empty table after a failed request asserts the first while meaning the
  // second.
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await api.listProjects();
      const docs: DocumentRow[] = [];
      const items = res.items ?? [];

      setProjects(items.map((p: any) => ({ id: p.id, title: p.title })));
      setTarget((current) =>
        current && items.some((p: any) => p.id === current) ? current : (items[0]?.id ?? ""),
      );

      for (const project of items) {
        // Prefer files API (uploads land here); fall back to project.attachments.
        try {
          const filesRes = await api.listFiles(project.id);
          const files = Array.isArray(filesRes) ? filesRes : (filesRes.items ?? []);
          for (const f of files) {
            docs.push({
              name: f.file_name ?? f.fileName ?? f.filename ?? f.name ?? "Unknown",
              mimeType: f.mime_type ?? f.mimeType ?? "file",
              project: project.title,
              date: f.created_at ?? f.createdAt ?? f.uploaded_at ?? project.created_at,
              url: f.url ?? f.file_url ?? f.fileURL,
            });
          }
        } catch {
          const attachments = project.attachments ?? [];
          for (const att of attachments as any[]) {
            docs.push({
              name: att.file_name ?? att.fileName ?? att.name ?? "Unknown",
              mimeType: att.mime_type ?? att.mimeType ?? "file",
              project: project.title,
              date: att.uploaded_at ?? att.uploadedAt ?? project.created_at,
              url: att.file_url ?? att.fileURL,
            });
          }
        }
      }

      docs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setDocuments(docs);
      setLoadError("");
    } catch {
      setDocuments([]);
      setLoadError("Could not load your documents. This is a problem reaching the server, not an empty library.");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const noProjects = projects.length === 0;

  return (
    <Box>
      <PageBanner
        icon={<DescriptionIcon />}
        title="Documents"
        description="Access specifications, contracts, deliverables, and project documentation."
      />

      {loadError && (
        <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}

      <AnimatedCard delay={0}>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ alignItems: { sm: "flex-end" }, mb: 2 }}
          >
            <TextField
              select
              size="small"
              label="Add to project"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={noProjects}
              sx={{ minWidth: { xs: "100%", sm: 260 } }}
              helperText={
                noProjects ? undefined : "Documents are filed against a project so your team can find them."
              }
            >
              {projects.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.title}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ pb: noProjects ? 0 : 3 }}>
              <DocumentUpload
                projectId={target}
                onUploaded={load}
                compact
                disabled={noProjects || !target}
                disabledReason="You need an active project before you can upload documents."
              />
            </Box>
          </Stack>

          <Divider sx={{ mb: 1 }} />

          {loading ? (
            <Box>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} variant="text" height={48} sx={{ mb: 1 }} />
              ))}
            </Box>
          ) : documents.length === 0 ? (
            <EmptyState
              icon={<FolderOffOutlinedIcon />}
              title={loadError ? "Documents unavailable" : "No documents yet"}
              description={
                loadError
                  ? "We could not reach the server, so this list is not a complete picture. Try again."
                  : "Upload a document above, or ask your delivery contact to share one."
              }
              color="#8B5CF6"
              onRefresh={() => {
                setLoading(true);
                void load();
              }}
            />
          ) : (
            <TableContainer>
              <Table>
                <caption style={{ captionSide: "top", textAlign: "left", padding: "0 0 8px" }}>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {documents.length} document{documents.length === 1 ? "" : "s"} across your projects
                  </Typography>
                </caption>
                <TableHead>
                  <TableRow>
                    <TableCell>Document</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc, i) => (
                    <TableRow key={`${doc.project}-${doc.name}-${i}`}>
                      <TableCell>{doc.name}</TableCell>
                      <TableCell>
                        <Chip label={doc.mimeType} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{doc.project}</TableCell>
                      <TableCell>{formatDate(doc.date)}</TableCell>
                      <TableCell align="right">
                        {doc.url && (
                          <>
                            <IconButton
                              size="small"
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`View ${doc.name}`}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              href={doc.url}
                              download
                              aria-label={`Download ${doc.name}`}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </AnimatedCard>
    </Box>
  );
}
