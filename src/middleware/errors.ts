import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: { code: "not_found", message: "Ressource introuvable" } });
}

// Ne renvoie JAMAIS la stack trace au client.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message } });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({ error: { code: "validation_error", message: "Requete invalide" } });
    return;
  }
  // A remplacer par le logger JSON de D
  console.error(JSON.stringify({ level: "error", msg: "unhandled_error", detail: String(err) }));
  res.status(500).json({ error: { code: "internal_error", message: "Erreur interne" } });
}
