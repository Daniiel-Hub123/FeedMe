
import { AppError } from "@/src/util/AppError";
import { NextRequest } from "next/server";
import { ZodSchema } from "zod";



export async function zodValidateFormData<T>(
  req: NextRequest | FormData,
  schema: ZodSchema<T>
) {
  const fd = req instanceof FormData ? req : await req.formData();
  const raw = Object.fromEntries(fd);
  const clean = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, v == "" ? null : v])
  );
  
  const result = schema.safeParse(clean);

  if (!result.success || !result.data) {
    console.log(result.error?.issues);
    
    throw AppError.validation(
      result.error?.issues[0].message || "Datos no validos",
      result.error?.issues
    );
  }
  return result.data;
}
export async function zodValidateJson<T>(
  req: NextRequest,
  schema: ZodSchema<T>
) {
  const data = await req.json();
  const clean = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v == "" ? null : v])
  );
  const result = schema.safeParse(clean);
  if (!result.success || !result.data) {
    throw AppError.validation(
      result.error?.issues[0].message || "Datos no validos",
      result.error?.issues
    );
  }
  return { validated: result.data, json: data };
}
