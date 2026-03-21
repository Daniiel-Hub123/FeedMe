import { AxiosError, isAxiosError } from "axios";

export const ERROR_CODES = {
  INTERNAL_ERROR: "INTERNAL_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  CREATE_FAILED: "CREATE_FAILED",
  DUPLICATE: "DUPLICATE",
  DEPENDENCY_INVALID: "DEPENDENCY_INVALID",
  HAS_DEPENDENCIES: "HAS_DEPENDENCIES",
} as const;
export type AppErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export interface ApiSuccess<T = any> {
  success: true;
  message: string;
  data: T;
}

export type ApiError<D = unknown> = {
  success: false;
  message: string;
  code: AppErrorCode;
  errors?: D;
};
// 2️⃣ Únelas en un alias
export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === "object" && !Array.isArray(x);
}

/** Type guard: ¿es un error JSON de tu API? */
export function isApiError<D = unknown>(x: any): x is ApiError<D> {
 if (!isPlainObject(x)) return false;
  const success = "success" in x && (x as any).success === false;
  const message = "message" in x && typeof (x as any).message === "string";
  const code = "code" in x && typeof (x as any).code === "string";
  return success && message && code;
}

/** Primero comprueba que sea AxiosError y luego que response.data sea ApiError */
export function isAxiosApiError<D = unknown>(
  err: unknown
): err is AxiosError<ApiError<D>> {
  return (
    isAxiosError(err) &&
    !!err.response &&
    !!err.response.data &&
    isApiError<D>(err.response.data)
  );
}