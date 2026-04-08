import { ConvexError, Value } from "convex/values";


export type ApplicationErrorData = {
  [key: string]: Value | undefined;
  statusCode: number;
  message: string;
  data?: Value;
};

export class AuthenticationError extends ConvexError<ApplicationErrorData> {
  constructor(message: string, data?: Value) {
    const errorData: ApplicationErrorData = {
      statusCode: 401,
      message,
      data,
    };
    super(errorData);
  }
}

export class AuthorizationError extends ConvexError<ApplicationErrorData> {
  constructor(message: string, data?: Value) {
    const errorData: ApplicationErrorData = {
      statusCode: 403,
      message,
      data,
    };
    super(errorData);
  }
}

export class NotFoundError extends ConvexError<ApplicationErrorData> {
  constructor(message: string, data?: Value) {
    const errorData: ApplicationErrorData = {
      statusCode: 404,
      message,
      data,
    };
    super(errorData);
  }
}

export class BadRequestError extends ConvexError<ApplicationErrorData> {
  constructor(message: string, data?: Value) {
    const errorData: ApplicationErrorData = {
      statusCode: 400,
      message,
      data,
    };
    super(errorData);
  }
}