import { defineTable, column, NOW } from "astro:db";

export const Meetings = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text(),
    title: column.text(),
    sourceType: column.text({ optional: true }),
    sourceUrl: column.text({ optional: true }),
    scheduledAt: column.date({ optional: true }),
    durationMinutes: column.number({ optional: true }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
});

export const MeetingSections = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    meetingId: column.text({
      references: () => Meetings.columns.id,
    }),
    type: column.text(),
    orderIndex: column.number(),
    content: column.text(),
    createdAt: column.date({ default: NOW }),
  },
});

export const ActionItems = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    meetingId: column.text({
      references: () => Meetings.columns.id,
    }),
    assignee: column.text({ optional: true }),
    description: column.text(),
    dueDate: column.date({ optional: true }),
    status: column.text({ optional: true }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
});

export const tables = {
  Meetings,
  MeetingSections,
  ActionItems,
} as const;
