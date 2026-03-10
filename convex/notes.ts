import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// TODO: Add centralized error class and handling

export const createNewNote = mutation({
  args: {
    title: v.string(),
    parentNote: v.optional(v.id("notes")),
  },
  handler: async (ctx, args) => {
    // TODO: this identity is checked everywhere, create a helper/middleware later
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.subject;

    const note = await ctx.db.insert("notes", {
      title: args.title,
      parentNote: args.parentNote,
      userId,
      isArchived: false,
      isPublished: false,
    });

    return note;
  },
});

export const getNotes = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const notes = await ctx.db.query("notes").collect();

    return notes;
  },
});

export const getSidebar = query({
  args: {
    parentNote: v.optional(v.id("notes")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.subject;

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user_parent", (q) =>
        q.eq("userId", userId).eq("parentNote", args.parentNote),
      )
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc") // default order by creation time
      .collect();

    return notes;
  },
});

export const getSearch = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.subject;

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return notes;
  },
});

export const archiveNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.subject;

    const note = await ctx.db.get(args.id);

    if (!note) {
      throw new Error("Note not found");
    }

    if (note.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const recursiveArchiveNotes = async (noteId: Id<"notes">) => {
      // TODO: Wrap inside a transaction?
      const archivedNote = await ctx.db.patch(noteId, {
        isArchived: true,
      });

      const children = await ctx.db
        .query("notes")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentNote", noteId),
        )
        .collect();

      for (const child of children) {
        await recursiveArchiveNotes(child._id);
      }

      return archivedNote;
    };

    const archivedNote = await recursiveArchiveNotes(args.id);

    return archivedNote;
  },
});

export const restoreNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.subject;
    const existingNote = await ctx.db.get(args.id);

    if (!existingNote) {
      throw new Error("Note not found");
    }

    if (existingNote.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const recursiveRestoreNotes = async (noteId: Id<"notes">) => {
      const childrenNotes = await ctx.db
        .query("notes")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentNote", noteId),
        )
        .collect();

      for (const child of childrenNotes) {
        await ctx.db.patch(child._id, {
          isArchived: false,
        });

        await recursiveRestoreNotes(child._id);
      }
    };

    const updatedAttributes: Partial<Doc<"notes">> = {
      isArchived: false,
    };

    if (existingNote.parentNote) {
      const parentNote = await ctx.db.get(existingNote.parentNote);
      if (parentNote?.isArchived) {
        updatedAttributes.parentNote = undefined;
      }
    }

    const restoredNote = await ctx.db.patch(args.id, updatedAttributes);
    recursiveRestoreNotes(args.id);

    return restoredNote;
  },
});

export const deleteNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.subject;

    const note = await ctx.db.get(args.id);
    if (!note) {
      throw new Error("Note not found");
    }

    if (note.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const deletedNote = await ctx.db.delete(args.id);

    return deletedNote;
  },
});

export const getTrash = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.subject;

    const notesInTrash = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .collect();

    return notesInTrash;
  },
});
