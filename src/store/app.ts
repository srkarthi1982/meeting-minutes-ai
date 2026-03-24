import type { Alpine } from "alpinejs";
import {
  STORAGE_KEY,
  createActionItem,
  createDefaultDraft,
  formatActionItemsOnly,
  formatMeetingSummary,
  parseStoredDraft,
  type MeetingDraft,
} from "../lib/meeting";

type CopyTarget = "summary" | "actions";

interface MeetingAppStore extends MeetingDraft {
  copiedTarget: CopyTarget | null;
  copyStatus: string;
  init: () => void;
  persist: () => void;
  addActionItem: () => void;
  removeActionItem: (id: string) => void;
  copySummary: () => Promise<void>;
  copyActionItems: () => Promise<void>;
  resetDraft: () => void;
  getSummaryText: () => string;
  getActionItemsText: () => string;
}

function writeClipboardText(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);

  return Promise.resolve();
}

export function registerMeetingAppStore(Alpine: Alpine) {
  Alpine.store("meetingApp", {
    ...createDefaultDraft(),
    copiedTarget: null,
    copyStatus: "",

    init() {
      if (typeof window === "undefined") {
        return;
      }

      const stored = window.localStorage.getItem(STORAGE_KEY);
      const draft = parseStoredDraft(stored);
      this.basics = draft.basics;
      this.sections = draft.sections;
      this.actionItems = draft.actionItems;
      this.toggles = draft.toggles;
    },

    persist() {
      if (typeof window === "undefined") {
        return;
      }

      const payload: MeetingDraft = {
        basics: this.basics,
        sections: this.sections,
        actionItems: this.actionItems,
        toggles: this.toggles,
      };

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    },

    addActionItem() {
      this.actionItems.push(createActionItem());
      this.persist();
    },

    removeActionItem(id: string) {
      this.actionItems = this.actionItems.filter((item) => item.id !== id);
      if (this.actionItems.length === 0) {
        this.actionItems = [createActionItem()];
      }
      this.persist();
    },

    async copySummary() {
      const text = this.getSummaryText();
      await writeClipboardText(text);
      this.copiedTarget = "summary";
      this.copyStatus = "Meeting summary copied.";
    },

    async copyActionItems() {
      const text = this.getActionItemsText();
      await writeClipboardText(text);
      this.copiedTarget = "actions";
      this.copyStatus = "Action items copied.";
    },

    resetDraft() {
      if (typeof window === "undefined") {
        return;
      }

      const ok = window.confirm("Clear this meeting draft and start a new meeting?");
      if (!ok) {
        return;
      }

      const next = createDefaultDraft();
      this.basics = next.basics;
      this.sections = next.sections;
      this.actionItems = next.actionItems;
      this.toggles = next.toggles;
      this.copyStatus = "Workspace reset. Ready for a new meeting.";
      this.persist();
    },

    getSummaryText() {
      return formatMeetingSummary({
        basics: this.basics,
        sections: this.sections,
        actionItems: this.actionItems,
        toggles: this.toggles,
      });
    },

    getActionItemsText() {
      return formatActionItemsOnly({
        basics: this.basics,
        sections: this.sections,
        actionItems: this.actionItems,
        toggles: this.toggles,
      });
    },
  } satisfies MeetingAppStore);
}
