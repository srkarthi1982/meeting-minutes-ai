export type MeetingSectionKey = "agenda" | "decisions" | "actionItems" | "notes";

export interface MeetingBasics {
  title: string;
  date: string;
  participants: string;
  organizer: string;
  purpose: string;
}

export interface MeetingSections {
  agenda: string;
  discussion: string;
  decisions: string;
  notes: string;
}

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  dueDate: string;
}

export interface MeetingDraft {
  basics: MeetingBasics;
  sections: MeetingSections;
  actionItems: ActionItem[];
  toggles: Record<MeetingSectionKey, boolean>;
}

export const STORAGE_KEY = "meeting-minutes-ai:v1:draft";

export function createActionItem(): ActionItem {
  return {
    id: crypto.randomUUID(),
    task: "",
    owner: "",
    dueDate: "",
  };
}

export function createDefaultDraft(): MeetingDraft {
  return {
    basics: {
      title: "",
      date: "",
      participants: "",
      organizer: "",
      purpose: "",
    },
    sections: {
      agenda: "",
      discussion: "",
      decisions: "",
      notes: "",
    },
    actionItems: [createActionItem()],
    toggles: {
      agenda: true,
      decisions: true,
      actionItems: true,
      notes: true,
    },
  };
}

export function normalizeActionItems(actionItems: ActionItem[]): ActionItem[] {
  const normalized = actionItems
    .map((item) => ({
      id: item.id || crypto.randomUUID(),
      task: item.task?.trim() ?? "",
      owner: item.owner?.trim() ?? "",
      dueDate: item.dueDate ?? "",
    }))
    .filter((item) => item.task || item.owner || item.dueDate);

  return normalized.length > 0 ? normalized : [createActionItem()];
}

function formatListBlock(content: string): string {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return "- —";
  }

  return lines.map((line) => `- ${line}`).join("\n");
}

export function formatMeetingSummary(draft: MeetingDraft): string {
  const { basics, sections, toggles } = draft;
  const participants = basics.participants.trim() || "—";

  const blocks: string[] = [
    basics.title.trim() || "Meeting Minutes",
    `Date: ${basics.date || "—"}`,
    `Organizer: ${basics.organizer.trim() || "—"}`,
    `Participants: ${participants}`,
    "",
    "Purpose",
    basics.purpose.trim() || "—",
    "",
  ];

  if (toggles.agenda) {
    blocks.push("Agenda", formatListBlock(sections.agenda), "");
  }

  blocks.push("Discussion Points", formatListBlock(sections.discussion), "");

  if (toggles.decisions) {
    blocks.push("Decisions Made", formatListBlock(sections.decisions), "");
  }

  if (toggles.actionItems) {
    blocks.push("Action Items", formatActionItemsOnly(draft), "");
  }

  if (toggles.notes) {
    blocks.push("Additional Notes", formatListBlock(sections.notes), "");
  }

  return blocks.join("\n").trim();
}

export function formatActionItemsOnly(draft: MeetingDraft): string {
  const items = normalizeActionItems(draft.actionItems);

  const populated = items.filter((item) => item.task || item.owner || item.dueDate);
  if (populated.length === 0) {
    return "- No action items recorded.";
  }

  return populated
    .map((item, index) => {
      const owner = item.owner || "Unassigned";
      const due = item.dueDate || "No due date";
      return `${index + 1}. ${item.task || "Untitled task"} | Owner: ${owner} | Due: ${due}`;
    })
    .join("\n");
}

export function parseStoredDraft(value: string | null): MeetingDraft {
  if (!value) {
    return createDefaultDraft();
  }

  try {
    const parsed = JSON.parse(value) as Partial<MeetingDraft>;

    return {
      basics: {
        ...createDefaultDraft().basics,
        ...parsed.basics,
      },
      sections: {
        ...createDefaultDraft().sections,
        ...parsed.sections,
      },
      toggles: {
        ...createDefaultDraft().toggles,
        ...parsed.toggles,
      },
      actionItems: normalizeActionItems(parsed.actionItems ?? []),
    };
  } catch {
    return createDefaultDraft();
  }
}
