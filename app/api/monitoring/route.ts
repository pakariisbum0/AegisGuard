import { NextResponse } from "next/server";
import { AIMonitoringService } from "@/lib/services/ai-monitoring";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const { transactions } = await request.json();
    const monitoringService = AIMonitoringService.getInstance();
    const analysis = await monitoringService.analyzeBatch(transactions);

    return NextResponse.json(analysis);
  } catch (error) {
    logger.error("Error in monitoring API", { error });
    return NextResponse.json(
      { error: "Failed to analyze transactions" },
      { status: 500 }
    );
  }
}
