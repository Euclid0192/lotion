import { Doc, Id, TableNames } from "./_generated/dataModel";
import { MutationCtx, QueryCtx } from "./_generated/server";
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from "./application_errors";

export const requireAuth = async (ctx: MutationCtx | QueryCtx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new AuthenticationError(
      "Unauthenticated. Please log in before continue.",
    );
  }

  const userId = identity.subject;

  return userId;
};

export const requireOwnership = async <T extends TableNames>(
  ctx: MutationCtx | QueryCtx,
  table: T,
  record: Doc<T>,
  userId: string,
) => {
  if (!record) {
    throw new NotFoundError(
      `The ${table} you're looking for might have been deleted.`,
      { type: table },
    );
  }

  if (record.userId !== userId) {
    throw new AuthorizationError(
      `You don't have permission to access this ${table}.`,
      { type: table, id: record._id, userId: record.userId },
    );
  }
};
