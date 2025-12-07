import type { ActionAPIContext } from "astro:actions";
import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { db, eq, and, Meetings, MeetingSections, ActionItems } from "astro:db";

function requireUser(context: ActionAPIContext) {
  const locals = context.locals as App.Locals | undefined;
  const user = locals?.user;

  if (!user) {
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "You must be signed in to perform this action.",
    });
  }

  return user;
}

export const server = {
  createMeeting: defineAction({
    input: z.object({
      id: z.string().optional(),
      title: z.string().min(1, "Title is required"),
      sourceType: z.string().optional(),
      sourceUrl: z.string().optional(),
      scheduledAt: z.coerce.date().optional(),
      durationMinutes: z.number().int().positive().optional(),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);

      const [meeting] = await db
        .insert(Meetings)
        .values({
          id: input.id ?? crypto.randomUUID(),
          userId: user.id,
          title: input.title,
          sourceType: input.sourceType,
          sourceUrl: input.sourceUrl,
          scheduledAt: input.scheduledAt,
          durationMinutes: input.durationMinutes,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return { meeting };
    },
  }),

  updateMeeting: defineAction({
    input: z.object({
      id: z.string(),
      title: z.string().min(1).optional(),
      sourceType: z.string().optional(),
      sourceUrl: z.string().optional(),
      scheduledAt: z.coerce.date().optional(),
      durationMinutes: z.number().int().positive().optional(),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);
      const { id, ...rest } = input;

      const [existing] = await db
        .select()
        .from(Meetings)
        .where(and(eq(Meetings.id, id), eq(Meetings.userId, user.id)))
        .limit(1);

      if (!existing) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Meeting not found.",
        });
      }

      const updateData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(rest)) {
        if (typeof value !== "undefined") {
          updateData[key] = value;
        }
      }

      if (Object.keys(updateData).length === 0) {
        return { meeting: existing };
      }

      const [meeting] = await db
        .update(Meetings)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(and(eq(Meetings.id, id), eq(Meetings.userId, user.id)))
        .returning();

      return { meeting };
    },
  }),

  listMeetings: defineAction({
    input: z.object({}).optional(),
    handler: async (_, context) => {
      const user = requireUser(context);

      const meetings = await db.select().from(Meetings).where(eq(Meetings.userId, user.id));

      return { meetings };
    },
  }),

  deleteMeeting: defineAction({
    input: z.object({
      id: z.string(),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);

      const [deleted] = await db
        .delete(Meetings)
        .where(and(eq(Meetings.id, input.id), eq(Meetings.userId, user.id)))
        .returning();

      if (!deleted) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Meeting not found.",
        });
      }

      return { meeting: deleted };
    },
  }),

  saveSection: defineAction({
    input: z.object({
      id: z.string().optional(),
      meetingId: z.string(),
      type: z.string().min(1, "Section type is required"),
      orderIndex: z.number().int().positive(),
      content: z.string().min(1, "Content is required"),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);

      const [meeting] = await db
        .select()
        .from(Meetings)
        .where(and(eq(Meetings.id, input.meetingId), eq(Meetings.userId, user.id)))
        .limit(1);

      if (!meeting) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Meeting not found.",
        });
      }

      const baseValues = {
        meetingId: input.meetingId,
        type: input.type,
        orderIndex: input.orderIndex,
        content: input.content,
        createdAt: new Date(),
      };

      if (input.id) {
        const [existing] = await db
          .select()
          .from(MeetingSections)
          .where(eq(MeetingSections.id, input.id))
          .limit(1);

        if (!existing || existing.meetingId !== input.meetingId) {
          throw new ActionError({
            code: "NOT_FOUND",
            message: "Section not found.",
          });
        }

        const [section] = await db
          .update(MeetingSections)
          .set(baseValues)
          .where(eq(MeetingSections.id, input.id))
          .returning();

        return { section };
      }

      const [section] = await db.insert(MeetingSections).values(baseValues).returning();
      return { section };
    },
  }),

  deleteSection: defineAction({
    input: z.object({
      id: z.string(),
      meetingId: z.string(),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);

      const [meeting] = await db
        .select()
        .from(Meetings)
        .where(and(eq(Meetings.id, input.meetingId), eq(Meetings.userId, user.id)))
        .limit(1);

      if (!meeting) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Meeting not found.",
        });
      }

      const [deleted] = await db
        .delete(MeetingSections)
        .where(and(eq(MeetingSections.id, input.id), eq(MeetingSections.meetingId, input.meetingId)))
        .returning();

      if (!deleted) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Section not found.",
        });
      }

      return { section: deleted };
    },
  }),

  saveActionItem: defineAction({
    input: z.object({
      id: z.string().optional(),
      meetingId: z.string(),
      assignee: z.string().optional(),
      description: z.string().min(1, "Description is required"),
      dueDate: z.coerce.date().optional(),
      status: z.string().optional(),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);

      const [meeting] = await db
        .select()
        .from(Meetings)
        .where(and(eq(Meetings.id, input.meetingId), eq(Meetings.userId, user.id)))
        .limit(1);

      if (!meeting) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Meeting not found.",
        });
      }

      const baseValues = {
        meetingId: input.meetingId,
        assignee: input.assignee,
        description: input.description,
        dueDate: input.dueDate,
        status: input.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (input.id) {
        const [existing] = await db
          .select()
          .from(ActionItems)
          .where(eq(ActionItems.id, input.id))
          .limit(1);

        if (!existing || existing.meetingId !== input.meetingId) {
          throw new ActionError({
            code: "NOT_FOUND",
            message: "Action item not found.",
          });
        }

        const [item] = await db
          .update(ActionItems)
          .set(baseValues)
          .where(eq(ActionItems.id, input.id))
          .returning();

        return { item };
      }

      const [item] = await db.insert(ActionItems).values(baseValues).returning();
      return { item };
    },
  }),

  listActionItems: defineAction({
    input: z
      .object({
        meetingId: z.string().optional(),
      })
      .optional(),
    handler: async (input, context) => {
      const user = requireUser(context);

      const meetings = await db
        .select()
        .from(Meetings)
        .where(eq(Meetings.userId, user.id));

      const allowedMeetingIds = new Set(meetings.map((m) => m.id));

      if (input?.meetingId && !allowedMeetingIds.has(input.meetingId)) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Meeting not found.",
        });
      }

      const items = await db.select().from(ActionItems);

      const filtered = items.filter((item) => {
        const matchesMeeting = allowedMeetingIds.has(item.meetingId);
        const matchesRequestedMeeting = input?.meetingId ? item.meetingId === input.meetingId : true;
        return matchesMeeting && matchesRequestedMeeting;
      });

      return { actionItems: filtered };
    },
  }),
};
