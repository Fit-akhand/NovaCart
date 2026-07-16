import { connectDB } from "@/lib/db";
import { ApiResponse } from "@/utils/ApiResponse";

export async function GET() {
  try {
    await connectDB();

    return Response.json(
      new ApiResponse(
        200,
        "MongoDB Connected Successfully"
      )
    );
  } catch (error) {
    return Response.json({
      success: false,
      message: error.message,
    });
  }
}