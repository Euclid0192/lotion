import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from "./application_errors";
import { requireAuth, requireOwnership } from "./auth";

export const createNewNote = mutation({
  args: {
    title: v.string(),
    parentNote: v.optional(v.id("notes")),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

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
    const userId = await requireAuth(ctx);

    const notes = await ctx.db.query("notes").collect();

    return notes;
  },
});

export const getSidebar = query({
  args: {
    parentNote: v.optional(v.id("notes")),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

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
    const userId = await requireAuth(ctx);

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return notes;
  },
});

export const getNoteById = query({
  args: {
    id: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const note = await ctx.db.get(args.id);

    if (!note) {
      throw new NotFoundError(
        "The note you're looking for might have been deleted.",
        { noteId: args.id },
      );
    }

    if (note.isPublished && !note.isArchived) {
      return note;
    }

    requireOwnership(ctx, "notes", note, userId);

    return note;
  },
});

export const archiveNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const note = await ctx.db.get(args.id);

    if (!note) {
      throw new NotFoundError(
        "The note you're looking for might have been deleted.",
        { noteId: args.id },
      );
    }

    requireOwnership(ctx, "notes", note, userId);

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
    const userId = await requireAuth(ctx);

    const existingNote = await ctx.db.get(args.id);

    if (!existingNote) {
      throw new NotFoundError(
        "The note you're looking for might have been deleted.",
        { noteId: args.id },
      );
    }

    requireOwnership(ctx, "notes", existingNote, userId);

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
    const userId = await requireAuth(ctx);

    const note = await ctx.db.get(args.id);
    if (!note) {
      throw new NotFoundError(
        "The note you're looking for might have been deleted.",
        { noteId: args.id },
      );
    }

    requireOwnership(ctx, "notes", note, userId);

    const recursiveDeleteNotes = async (noteId: Id<"notes">) => {
      // TODO: Wrap inside a transaction?
      const deletedNote = await ctx.db.delete(noteId);

      const children = await ctx.db
        .query("notes")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentNote", noteId),
        )
        .collect();

      for (const child of children) {
        await recursiveDeleteNotes(child._id);
      }

      return deletedNote;
    };

    const deletedNote = await recursiveDeleteNotes(args.id);

    return deletedNote;
  },
});

export const getTrash = query({
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const notesInTrash = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .collect();

    return notesInTrash;
  },
});

export const updateNote = mutation({
  args: {
    id: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const { id, ...rest } = args;

    const note = await ctx.db.get(id);
    if (!note) {
      throw new NotFoundError(
        "The note you're looking for might have been deleted.",
        { noteId: id },
      );
    }

    requireOwnership(ctx, "notes", note, userId);

    const updatedNote = await ctx.db.patch(id, rest);

    return updatedNote;
  },
});

export const removeIcon = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const note = await ctx.db.get(args.id);
    if (!note) {
      throw new NotFoundError(
        "The note you're looking for might have been deleted.",
        { noteId: args.id },
      );
    }

    requireOwnership(ctx, "notes", note, userId);

    const updatedNote = await ctx.db.patch(args.id, { icon: undefined });

    return updatedNote;
  },
});

export const removeCoverImage = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const note = await ctx.db.get(args.id);
    if (!note) {
      throw new NotFoundError(
        "The note you're looking for might have been deleted.",
        { noteId: args.id },
      );
    }

    requireOwnership(ctx, "notes", note, userId);

    const updatedNote = await ctx.db.patch(args.id, { coverImage: undefined });

    return updatedNote;
  },
});
