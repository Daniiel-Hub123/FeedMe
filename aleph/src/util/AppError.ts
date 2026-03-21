// app/lib/AppError.ts
import { NextResponse } from "next/server";

/**
 * Opciones para construir un {@link AppError}.
 *
 * @property {number} [status=500]  Código HTTP que representa el tipo de error.
 * @property {string} [code="INTERNAL_ERROR"]  Código interno y estable para tu dominio
 *   (p. ej. "VALIDATION_ERROR", "NOT_FOUND", etc.). Útil para el frontend.
 * @property {unknown} [details]  Información extra para depuración o UI (p. ej. issues de Zod).
 * @property {unknown} [cause]  Error original (se preserva en `Error.cause`).
 */
type AppErrorOpts = {
  status?: number;
  code?: string; // tu código interno: "VALIDATION_ERROR", "NOT_FOUND", etc.
  details?: unknown; // zod issues, campos inválidos, etc.
  cause?: unknown; // preserve original error
};

/**
 * Error de aplicación con metadata HTTP y conversión a respuesta JSON.
 *
 * - Usa **códigos internos** en `code` para que el frontend no dependa de textos.
 * - Coloca detalles estructurados en `details` (p. ej. `zodError.format()`).
 * - Convierte el error a `NextResponse` mediante {@link AppError.toResponse}.
 *
 * ### Forma de la respuesta JSON
 * ```json
 * {
 *   "success": false,
 *   "message": "Dato cliente incorrecto",
 *   "code": "VALIDATION_ERROR",
 *   "errors": { ... } // opcional (si hay details)
 * }
 * ```
 *
 * @example
 * // Lanzar un error de validación con detalles (Zod)
 * throw AppError.validation("Dato cliente incorrecto", zodError.format());
 *
 * @example
 * // Capturar y responder en un route handler
 * export async function POST(req: NextRequest) {
 *   try {
 *     // ... lógica
 *   } catch (err) {
 *     if (err instanceof AppError) return err.toResponse();
 *     return AppError.internal().toResponse();
 *   }
 * }
 */
export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;


  constructor(message: string, opts: AppErrorOpts = {}) {
    super(message, { cause: opts.cause });
    this.status = opts.status ?? 500;
    this.code = opts.code ?? "INTERNAL_ERROR";
    this.details = opts.details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static validation(message = "Datos inválidos", details?: unknown) {
    return new AppError(message, {
      status: 400,
      code: "VALIDATION_ERROR",
      details,
    });
  }

  static unauthorized(message = "No autorizado") {
    return new AppError(message, { status: 401, code: "UNAUTHORIZED" });
  }

  static forbidden(message = "Prohibido") {
    return new AppError(message, { status: 403, code: "FORBIDDEN" });
  }
  static notFound(message = "No encontrado") {
    return new AppError(message, { status: 404, code: "NOT_FOUND" });
  }

  static hasDependencies(
    message = "No se puede eliminar: tiene registros asociados"
  ) {
    return new AppError(message, { status: 409, code: "HAS_DEPENDENCIES" });
  }

  static conflict(message = "Conflicto", details?:{}) {
    return new AppError(message, { status: 409, code: "CONFLICT",details });
  }

  static createFailed(
    message = "No se pudo crear el registro",
    details?: unknown
  ) {
    return new AppError(message, {
      status: 422,
      code: "CREATE_FAILED",
      details,
    });
  }

  static dependencyInvalid(message = "Relación inválida o inexistente") {
    return new AppError(message, { status: 422, code: "DEPENDENCY_INVALID" });
  }

  static internal(message = "Error interno en el servidor") {
    return new AppError(message, { status: 500, code: "INTERNAL_ERROR" });
  }

  toResponse() {
    return NextResponse.json(
      {
        success: false,
        message: this.message,
        code: this.code,
        errors: this.details ?? undefined,
      },
      { status: this.status }
    );
  }
}
