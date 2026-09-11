export interface ChangelogEntry {
  id: string;
  version: string;
  date: string;
  type: "feature" | "improvement" | "fix" | "security";
  title: string;
  body: string[];
}

export function parseChangelog(payload: unknown): ChangelogEntry[] {
  if (
    !payload ||
    typeof payload !== "object" ||
    !("items" in payload) ||
    !Array.isArray(payload.items)
  ) {
    throw new Error("Invalid changelog response");
  }
  return payload.items
    .map((raw: unknown, index): ChangelogEntry => {
      if (!raw || typeof raw !== "object" || !("title" in raw) || typeof raw.title !== "string")
        throw new Error("Invalid changelog entry");
      const entry = raw as Record<string, unknown>;
      const dateValue =
        entry.publishedAt ?? entry.published_at ?? entry.createdAt ?? entry.created_at;
      const date = typeof dateValue === "string" ? new Date(dateValue) : null;
      const type = entry.category ?? entry.type;
      const body = Array.isArray(entry.body)
        ? entry.body.filter((line): line is string => typeof line === "string")
        : typeof entry.body === "string"
          ? entry.body
              .split(/\n+/)
              .map((line) => line.replace(/^[-•*]\s*/, "").trim())
              .filter(Boolean)
          : [];
      return {
        id: typeof entry.id === "string" ? entry.id : `${index}-${raw.title}`,
        version: typeof entry.version === "string" ? entry.version : "",
        title: raw.title,
        date: date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : "",
        type: type === "feature" || type === "fix" || type === "security" ? type : "improvement",
        body,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Public GET only. Kept separate from the client used by forms and mutations. */
export async function loadChangelog(
  baseUrl: string,
  signal: AbortSignal,
): Promise<ChangelogEntry[]> {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/v1/changelog`, {
    signal,
    credentials: "omit",
  });
  if (!response.ok) throw new Error(`Changelog unavailable (${response.status})`);
  return parseChangelog(await response.json());
}
