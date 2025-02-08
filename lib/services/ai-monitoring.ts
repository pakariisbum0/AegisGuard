import OpenAI from "openai";
import { logger } from "../logger";

export interface TransactionAnalysis {
  risk_level: "low" | "medium" | "high";
  anomaly_score: number;
  explanation: string;
  recommendations: string[];
  flagged_patterns?: string[];
}

export class AIMonitoringService {
  private openai: OpenAI;
  private static instance: AIMonitoringService;

  private constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });
  }

  public static getInstance(): AIMonitoringService {
    if (!AIMonitoringService.instance) {
      AIMonitoringService.instance = new AIMonitoringService();
    }
    return AIMonitoringService.instance;
  }

  async analyzeTransaction(transaction: {
    department: string;
    amount: string;
    description: string;
    type: string;
    timestamp: string;
  }): Promise<TransactionAnalysis> {
    try {
      const prompt = `
        Analyze this government department transaction for potential anomalies or risks:
        Department: ${transaction.department}
        Amount: ${transaction.amount}
        Type: ${transaction.type}
        Description: ${transaction.description}
        Timestamp: ${transaction.timestamp}

        Please provide:
        1. Risk level (low, medium, or high)
        2. Anomaly score (0-100)
        3. Brief explanation
        4. Recommendations
        5. Any suspicious patterns identified

        Format the response as JSON.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an AI auditor specialized in government spending analysis.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      logger.info("Transaction analysis completed", { transaction, analysis });

      return {
        risk_level: analysis.risk_level,
        anomaly_score: analysis.anomaly_score,
        explanation: analysis.explanation,
        recommendations: analysis.recommendations,
        flagged_patterns: analysis.flagged_patterns,
      };
    } catch (error) {
      logger.error("Failed to analyze transaction", { error, transaction });
      throw new Error("Failed to analyze transaction");
    }
  }

  async analyzeBatch(transactions: any[]): Promise<{
    analyses: TransactionAnalysis[];
    summary: {
      total_anomalies: number;
      high_risk_count: number;
      average_risk_score: number;
      recommendations: string[];
    };
  }> {
    try {
      const analyses = await Promise.all(
        transactions.map((tx) => this.analyzeTransaction(tx))
      );

      const summary = {
        total_anomalies: analyses.filter((a) => a.anomaly_score > 70).length,
        high_risk_count: analyses.filter((a) => a.risk_level === "high").length,
        average_risk_score:
          analyses.reduce((acc, curr) => acc + curr.anomaly_score, 0) /
          analyses.length,
        recommendations: Array.from(
          new Set(analyses.flatMap((a) => a.recommendations))
        ),
      };

      return { analyses, summary };
    } catch (error) {
      logger.error("Failed to analyze batch transactions", { error });
      throw new Error("Failed to analyze batch transactions");
    }
  }
}
