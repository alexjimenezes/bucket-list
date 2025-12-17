import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRequestHandler<T extends Request = Request> = (
  req: T,
  res: Response,
  next: NextFunction
) => Promise<void>;

export function asyncHandler<T extends Request = Request>(
  fn: AsyncRequestHandler<T>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as T, res, next)).catch(next);
  };
}
