import type { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodSchema } from "zod";
import { ValidationError } from "../utils/errors.js";

export function validateBody<T>(schema: ZodSchema<T>) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const message = error.errors
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", ");
                next(new ValidationError(message));
                return;
            }
            next(error);
        }
    };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            req.query = schema.parse(req.query) as typeof req.query;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const message = error.errors
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", ");
                next(new ValidationError(message));
                return;
            }
            next(error);
        }
    };
}

export function validateParams<T>(schema: ZodSchema<T>) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            req.params = schema.parse(req.params) as typeof req.params;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const message = error.errors
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", ");
                next(new ValidationError(message));
                return;
            }
            next(error);
        }
    };
}