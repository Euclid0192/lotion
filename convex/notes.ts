import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const createNewNote = mutation({
  args: {
    title: v.string(),
    parentNote: v.optional(v.id("notes")),
  },
  handler: async (ctx, args) => {
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

export const getNote = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const documents = await ctx.db.query("notes").collect();

    return documents;
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

    const documents = await ctx.db
      .query("notes")
      .withIndex("by_user_parent", (q) =>
        q.eq("userId", userId).eq("parentNote", args.parentNote),
      )
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc") // default order by creation time
      .collect();

    return documents;
  },
});
