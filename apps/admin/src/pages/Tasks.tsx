import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Alert,
} from "@mui/material";
import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import {
  DndContext,
  DragOverlay,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PageBanner from "@/components/shared/PageBanner";
import ActionBar from "@/components/shared/ActionBar";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import EmptyState from "@/components/shared/EmptyState";
import PageSkeleton from "@/components/shared/PageSkeleton";
import { useAuth } from "@/context/AuthContext";

/* ── Types ── */

interface ApiTask {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignee_id?: string;
  labels: string[];
  created_at: string;
  updated_at: string;
}

interface ApiProject {
  id: string;
  title: string;
}

/* ── Constants ── */

const STATUSES = ["backlog", "todo", "in_progress", "review", "done"] as const;
type Status = (typeof STATUSES)[number];

const COLUMN_META: Record<Status, { label: string; color: string }> = {
  backlog: { label: "Backlog", color: "#94A3B8" },
  todo: { label: "To Do", color: "#6C63FF" },
  in_progress: { label: "In Progress", color: "#F59E0B" },
  review: { label: "Review", color: "#8B5CF6" },
  done: { label: "Done", color: "#10B981" },
};

const priorityColors: Record<string, string> = {
  low: "#94A3B8",
  medium: "#6C63FF",
  high: "#F59E0B",
  critical: "#EF4444",
};

const INPUT_SX = {
  "& .MuiOutlinedInput-root": {
    fontFamily: "monospace",
    fontSize: "0.85rem",
    bgcolor: "rgba(108, 99, 255, 0.04)",
    "& fieldset": { borderColor: "rgba(108, 99, 255, 0.15)" },
    "&:hover fieldset": { borderColor: "rgba(108, 99, 255, 0.30)" },
    "&.Mui-focused fieldset": { borderColor: "#6C63FF" },
  },
  "& .MuiInputLabel-root": {
    fontFamily: "monospace",
    fontSize: "0.8rem",
    color: "text.secondary",
  },
};

/* ── Sortable Task Card ── */

function SortableTaskCard({
  task,
  colColor,
  colIndex,
  taskIndex,
  projectName,
}: {
  task: ApiTask;
  colColor: string;
  colIndex: number;
  taskIndex: number;
  projectName: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const pColor = priorityColors[task.priority] ?? "#94A3B8";

  return (
    <Box ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Cell
        color={colColor}
        colInRow={colIndex}
        totalCols={5}
        animDelay={0.5 + (colIndex + taskIndex) * 0.05}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, fontSize: "0.8rem" }}>
          {task.title}
        </Typography>
        <Typography
          sx={{
            fontFamily: "monospace",
            fontSize: "0.6rem",
            color: "text.secondary",
            opacity: 0.6,
            mb: 1,
          }}
        >
          {projectName}
        </Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Chip
            label={task.priority}
            size="small"
            sx={{
              fontFamily: "monospace",
              fontSize: "0.55rem",
              height: 20,
              bgcolor: `${pColor}18`,
              color: pColor,
              border: `1px solid ${pColor}30`,
            }}
          />
          <Avatar
            sx={{
              width: 22,
              height: 22,
              fontSize: 9,
              bgcolor: `${colColor}20`,
              color: colColor,
            }}
          >
            {(task.assignee_id ?? "??").slice(0, 2).toUpperCase()}
          </Avatar>
        </Stack>
      </Cell>
    </Box>
  );
}

/* ── Static Task Card (for DragOverlay) ── */

function TaskCardOverlay({ task, projectName }: { task: ApiTask; projectName: string }) {
  const status = task.status as Status;
  const colColor = COLUMN_META[status]?.color ?? "#6C63FF";
  const pColor = priorityColors[task.priority] ?? "#94A3B8";

  return (
    <Box
      sx={{
        width: 220,
        p: 2,
        bgcolor: "background.paper",
        border: `1px solid ${colColor}40`,
        borderRadius: 1,
        boxShadow: `0 8px 32px ${colColor}30`,
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, fontSize: "0.8rem" }}>
        {task.title}
      </Typography>
      <Typography
        sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.6, mb: 1 }}
      >
        {projectName}
      </Typography>
      <Chip
        label={task.priority}
        size="small"
        sx={{
          fontFamily: "monospace",
          fontSize: "0.55rem",
          height: 20,
          bgcolor: `${pColor}18`,
          color: pColor,
          border: `1px solid ${pColor}30`,
        }}
      />
    </Box>
  );
}

/* ── Droppable Column ── */

function DroppableColumn({
  status,
  tasks,
  colIndex,
  projectMap,
}: {
  status: Status;
  tasks: ApiTask[];
  colIndex: number;
  projectMap: Record<string, string>;
}) {
  const { label, color } = COLUMN_META[status];
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: 200,
        transition: "background 0.2s",
        background: isOver ? `${color}08` : "transparent",
        borderRadius: isOver ? 1 : 0,
      }}
    >
      <Cell
        color={color}
        index={String(colIndex + 4).padStart(2, "0")}
        colInRow={colIndex}
        totalCols={5}
        animDelay={0.4 + colIndex * 0.05}
        minH={40}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: color,
              filter: `drop-shadow(0 0 4px ${color}60)`,
            }}
          />
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.05em" }}>
            {label}
          </Typography>
          <Chip
            label={tasks.length}
            size="small"
            sx={{
              fontFamily: "monospace",
              fontSize: "0.6rem",
              height: 20,
              bgcolor: `${color}18`,
              color,
              border: `1px solid ${color}30`,
            }}
          />
        </Stack>
      </Cell>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        {tasks.map((task, ti) => (
          <SortableTaskCard
            key={task.id}
            task={task}
            colColor={color}
            colIndex={colIndex}
            taskIndex={ti}
            projectName={projectMap[task.project_id] ?? "Unknown"}
          />
        ))}
      </SortableContext>
    </Box>
  );
}

/* ── New Task Dialog ── */

function NewTaskDialog({
  open,
  onClose,
  onSubmit,
  projects,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { project_id: string; title: string; description?: string; priority: string }) => void;
  projects: ApiProject[];
  submitting: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [projectId, setProjectId] = useState("");

  const handleSubmit = () => {
    if (!title.trim() || !projectId) return;
    onSubmit({
      project_id: projectId,
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
    });
  };

  // Reset form on open
  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setProjectId(projects.length > 0 ? projects[0]!.id : "");
    }
  }, [open, projects]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          backgroundImage: "none",
          border: "1px solid rgba(108, 99, 255, 0.15)",
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "monospace",
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#EF4444",
              opacity: 0.7,
              mb: 0.5,
            }}
          >
            ADD TO SPRINT
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            New Task
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
          <CloseOutlinedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2 }}>
        <TextField
          label="Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          sx={INPUT_SX}
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={3}
          sx={INPUT_SX}
        />
        <TextField
          label="Priority"
          select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          fullWidth
          sx={INPUT_SX}
        >
          {["low", "medium", "high", "critical"].map((p) => (
            <MenuItem key={p} value={p}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: priorityColors[p],
                  }}
                />
                <span style={{ fontFamily: "monospace", fontSize: "0.8rem", textTransform: "capitalize" }}>
                  {p}
                </span>
              </Stack>
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Project"
          select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          fullWidth
          required
          sx={INPUT_SX}
        >
          {projects.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              <span style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{p.title}</span>
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={onClose}
          sx={{
            fontFamily: "monospace",
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "text.secondary",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || !projectId || submitting}
          variant="contained"
          sx={{
            fontFamily: "monospace",
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            bgcolor: "#EF4444",
            "&:hover": { bgcolor: "#DC2626" },
            "&.Mui-disabled": { bgcolor: "rgba(239, 68, 68, 0.3)" },
          }}
        >
          {submitting ? "Creating..." : "Create Task"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ── Main Page ── */

export default function Tasks() {
  const { api } = useAuth();

  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  /* ── Project name lookup ── */
  const projectMap = useMemo(() => {
    const map: Record<string, string> = {};
    projects.forEach((p) => {
      map[p.id] = p.title;
    });
    return map;
  }, [projects]);

  /* ── Fetch data ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const projectRes = await api.listProjects();
      const loadedProjects = (projectRes.items ?? []) as ApiProject[];
      setProjects(loadedProjects);

      // Fetch tasks for every project and merge
      const allTasks: ApiTask[] = [];
      await Promise.all(
        loadedProjects.map(async (proj) => {
          try {
            const taskRes = await api.listTasks(proj.id);
            const items = (taskRes.items ?? []) as ApiTask[];
            allTasks.push(...items);
          } catch {
            // Skip projects that fail to load tasks
          }
        }),
      );
      setTasks(allTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Tasks grouped by status ── */
  const tasksByStatus = useMemo(() => {
    const grouped: Record<Status, ApiTask[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    };
    tasks.forEach((t) => {
      const s = t.status as Status;
      if (grouped[s]) grouped[s].push(t);
      else grouped.backlog.push(t);
    });
    return grouped;
  }, [tasks]);

  /* ── Stats ── */
  const totalTasks = tasks.length;
  const inProgress = tasksByStatus.in_progress.length;
  const critical = tasks.filter((t) => t.priority === "critical").length;
  const done = tasksByStatus.done.length;

  const stats = [
    { label: "Total Tasks", value: String(totalTasks), change: "across all boards", icon: <ViewKanbanOutlinedIcon />, color: "#6C63FF" },
    { label: "In Progress", value: String(inProgress), change: "active this sprint", icon: <PlayCircleOutlinedIcon />, color: "#F59E0B" },
    { label: "Critical", value: String(critical), change: "needs attention", icon: <BlockOutlinedIcon />, color: "#EF4444" },
    { label: "Done This Week", value: String(done), change: "completed tasks", icon: <AssignmentTurnedInOutlinedIcon />, color: "#10B981" },
  ];

  /* ── Drag handlers ── */
  const activeTask = useMemo(() => tasks.find((t) => t.id === activeId) ?? null, [tasks, activeId]);

  const findColumnForTask = useCallback(
    (taskId: string): Status | null => {
      for (const status of STATUSES) {
        if (tasksByStatus[status].some((t) => t.id === taskId)) return status;
      }
      return null;
    },
    [tasksByStatus],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeTaskId = String(active.id);
      const overId = String(over.id);

      const sourceCol = findColumnForTask(activeTaskId);
      // Determine target column: if dropped on a column directly or on a task in a column
      const targetCol: Status | null = STATUSES.includes(overId as Status) ? (overId as Status) : findColumnForTask(overId);

      if (!sourceCol || !targetCol || sourceCol === targetCol) return;

      // Optimistically move the task to the new column
      setTasks((prev) =>
        prev.map((t) => (t.id === activeTaskId ? { ...t, status: targetCol as string } : t)),
      );
    },
    [findColumnForTask],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const taskId = String(active.id);
      const overId = String(over.id);

      // Determine which column the task ended up in
      const targetCol: Status | null = STATUSES.includes(overId as Status)
        ? (overId as Status)
        : findColumnForTask(taskId);

      if (!targetCol) return;

      // Find the original status from before the drag (check if it changed)
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      // The status was already optimistically updated in handleDragOver.
      // Persist to API if it differs from what was last saved.
      // We compare against the current task status which was already optimistically set.
      if (task.status !== targetCol) {
        // This case is handled by dragOver, but let's also handle direct drops
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: targetCol } : t)),
        );
      }

      // Persist to API
      try {
        await api.updateTask(taskId, { status: targetCol });
      } catch {
        // Revert on failure — refetch
        fetchData();
      }
    },
    [api, tasks, findColumnForTask, fetchData],
  );

  /* ── Create task ── */
  const handleCreateTask = useCallback(
    async (data: { project_id: string; title: string; description?: string; priority: string }) => {
      setSubmitting(true);
      try {
        const newTask = (await api.createTask(data)) as ApiTask;
        setTasks((prev) => [...prev, newTask]);
        setDialogOpen(false);
      } catch {
        setError("Failed to create task");
      } finally {
        setSubmitting(false);
      }
    },
    [api],
  );

  /* ── Loading state ── */
  if (loading) return <PageSkeleton stats={4} rows={8} grid cols={5} />;

  return (
    <Box>
      <PageBanner
        icon={<ViewKanbanOutlinedIcon />}
        title="Kanban Board"
        description="Track tasks across sprints with a visual drag-and-drop workflow."
        tag="ADMIN // TASKS"
        accentWord="Kanban"
        iconColor="#EF4444"
        iconLabel="SPRINT ACTIVE"
      />

      <ActionBar label="New Task" subtitle="ADD TO SPRINT" color="#EF4444" onClick={() => setDialogOpen(true)} />

      {error && (
        <Alert severity="error" sx={{ mx: 2, mt: 1 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats */}
      <SectionLabel>Task Metrics</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" } }}>
        {stats.map((stat, i) => (
          <Cell key={stat.label} color={stat.color} index={String(i).padStart(2, "0")} colInRow={i} totalCols={4} animDelay={i * 0.1} minH={120}>
            <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 28 }, color: stat.color, filter: `drop-shadow(0 0 12px ${stat.color}40)`, mb: 1 }}>
              {stat.icon}
            </Box>
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>
              {stat.label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>{stat.value}</Typography>
            <Typography variant="caption" sx={{ color: stat.color, opacity: 0.8 }}>{stat.change}</Typography>
          </Cell>
        ))}
      </Box>

      {/* Board */}
      <SectionLabel>Board</SectionLabel>

      {totalTasks === 0 && !loading ? (
        <EmptyState
          icon={<ViewKanbanOutlinedIcon />}
          title="No Tasks Yet"
          description="Create your first task to start organizing your sprint board."
          color="#6C63FF"
          onRefresh={fetchData}
          onAdd={() => setDialogOpen(true)}
          addLabel="New Task"
        />
      ) : (
        <Box sx={{ overflowX: "auto", pb: 2 }}>
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <Box sx={{ display: "grid", gridTemplateColumns: `repeat(5, minmax(220px, 1fr))`, minWidth: 1100 }}>
              {STATUSES.map((status, ci) => (
                <DroppableColumn
                  key={status}
                  status={status}
                  tasks={tasksByStatus[status]}
                  colIndex={ci}
                  projectMap={projectMap}
                />
              ))}
            </Box>

            <DragOverlay>
              {activeTask ? (
                <TaskCardOverlay task={activeTask} projectName={projectMap[activeTask.project_id] ?? "Unknown"} />
              ) : null}
            </DragOverlay>
          </DndContext>
        </Box>
      )}

      {/* New Task Dialog */}
      <NewTaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreateTask}
        projects={projects}
        submitting={submitting}
      />
    </Box>
  );
}
