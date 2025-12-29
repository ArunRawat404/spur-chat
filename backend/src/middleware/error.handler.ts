import type { Request, Response, NextFunction } from "express";
import { ApplicationError } from "../utils/errors.js";

export function errorHandler(
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    if (error instanceof ApplicationError) {
        res.status(error.statusCode).json({
            success: false,
            error: { message: error.message },
        });
        return;
    }

    res.status(500).json({
        success: false,
        error: { message: "An unexpected error occurred" },
    });
}

export function notFoundHandler(_req: Request, res: Response): void {
    res.status(404).json({
        success: false,
        error: { message: "Route not found" },
    });
}