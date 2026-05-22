import { useEffect, useState } from "react";
import {
  Box,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Skeleton,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DescriptionIcon from "@mui/icons-material/Description";
import FolderOffOutlinedIcon from "@mui/icons-material/FolderOffOutlined";
import PageBanner from "@/components/shared/PageBanner";
import AnimatedCard from "@/components/shared/AnimatedCard";
import EmptyState from "@/components/shared/EmptyState";
import { useAuth } from "@/context/AuthContext";

interface DocumentRow {
  name: string;
  mimeType: string;
  project: string;
  date: string;
  url?: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function Documents() {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await api.listProjects();
        const docs: DocumentRow[] = [];

        for (const project of (res.items ?? [])) {
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

        // Sort by date, newest first
        docs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (!cancelled) setDocuments(docs);
      } catch {
        // handled by API client
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [api]);

  return (
    <Box>
      <PageBanner
        icon={<DescriptionIcon />}
        title="Documents"
        description="Access specifications, contracts, deliverables, and project documentation."
      />

      <AnimatedCard delay={0}>
        <CardContent>
          {loading ? (
            <Box>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} variant="text" height={48} sx={{ mb: 1 }} />
              ))}
            </Box>
          ) : documents.length === 0 ? (
            <EmptyState
              icon={<FolderOffOutlinedIcon />}
              title="No documents yet"
              description="When documents are uploaded to your projects, they will appear here for easy access."
              color="#8B85FF"
            />
          ) : (
            <TableContainer>
              <Table>
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
                    <TableRow key={i}>
                      <TableCell>{doc.name}</TableCell>
                      <TableCell>
                        <Chip label={doc.mimeType} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{doc.project}</TableCell>
                      <TableCell>{formatDate(doc.date)}</TableCell>
                      <TableCell align="right">
                        {doc.url && (
                          <>
                            <IconButton size="small" href={doc.url} target="_blank">
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" href={doc.url} download>
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
