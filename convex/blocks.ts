import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from "./application_errors";
import { requireAuth, requireOwnership } from "./auth";

export const createBlock = mutation({
  args: {
    title: v.string(),
    subtitle: v.optional(v.string()),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const block = await ctx.db.insert("blocks", {
      title: args.title,
      subtitle: args.subtitle,
      content: args.content,
      userId,
    });

    return block;
  },
});

export const getAllBlocks = query({
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const blocks = await ctx.db
      .query("blocks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return blocks;
  },
});

export const getBlockById = query({
  args: {
    id: v.id("blocks"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const block = await ctx.db.get(args.id);

    if (!block) {
      throw new NotFoundError(
        "The block you're looking for might have been deleted.",
        { blockId: args.id },
      );
    }

    requireOwnership(ctx, "blocks", block, userId);

    return block;
  },
});

export const updateBlockById = mutation({
  args: {
    id: v.id("blocks"),
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const block = await ctx.db.get(args.id);

    if (!block) {
      throw new NotFoundError(
        "The block you're looking for might have been deleted.",
        { blockId: args.id },
      );
    }

    requireOwnership(ctx, "blocks", block, userId);

    const updatedBlock = await ctx.db.patch(args.id, {
      title: args.title,
      subtitle: args.subtitle,
      content: args.content,
    });

    return updatedBlock;
  },
});

export const deleteBlockById = mutation({
  args: {
    id: v.id("blocks"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const block = await ctx.db.get(args.id);

    if (!block) {
      throw new NotFoundError(
        "The block you're looking for might have been deleted.",
        { blockId: args.id },
      );
    }

    requireOwnership(ctx, "blocks", block, userId);

    const deletedBlock = await ctx.db.delete(args.id);

    return deletedBlock;
  },
});
