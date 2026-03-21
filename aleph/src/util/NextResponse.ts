import { NextResponse } from "next/server";
import { AppError } from "./AppError";
import { isAxiosApiError } from "../types/index.types";

export type ApiSuccess<T = unknown> = {
  success: true;
  message: string;
  data: T;
};
export type BinaryFileInput = Blob | ArrayBuffer | Uint8Array;

export class ResponseHandler {
  static success<T = unknown>(
    message: string,
    data: T | null = null,
    status: number = 200,
  ): NextResponse<ApiSuccess> {
    return NextResponse.json<ApiSuccess<T | null>>(
      {
        success: true,
        message,
        data,
      },
      { status },
    );
  }

  static qr(data: Buffer, status: number = 200): NextResponse<ApiSuccess> {
    //@ts-ignore
    return new NextResponse(data, {
    status,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": 'inline; filename="qr.png"',
    },
  });
  }

  static error(error: unknown, fallbackMsg?: string): NextResponse {
    if (isAxiosApiError(error)) {
      return AppError.internal(error.response?.data.message).toResponse();
    }
    if (error instanceof AppError) {
      return error.toResponse();
    }
    return AppError.internal(
      fallbackMsg ?? "Error interno en el servidor",
    ).toResponse();
  }
}
