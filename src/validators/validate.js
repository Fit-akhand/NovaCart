import { ZodError } from "zod";
import { ApiError } from "@/utils/ApiError";

export function validate(schema, data) {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = {};

      error.errors.forEach((err) => {
        formattedErrors[err.path.join(".")] = err.message;
      });

      throw new ApiError(400, "Validation failed", formattedErrors);
    }

    throw error;
  }
}