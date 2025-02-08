"use client";

import { useState, useEffect } from "react";
import { TransactionAnalysis } from "@/lib/services/ai-monitoring";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

interface MonitoringStats {
  total_anomalies: number;
  high_risk_count: number;
  average_risk_score: number;
  recommendations: string[];
}

export function AIMonitoring({ transactions }: { transactions: any[] }) {
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState<TransactionAnalysis[]>([]);
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/monitoring", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactions }),
        });

        if (!response.ok) throw new Error("Failed to analyze transactions");

        const data = await response.json();
        setAnalyses(data.analyses);
        setStats(data.summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (transactions.length > 0) {
      analyzeTransactions();
    }
  }, [transactions]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-xl">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <h2
        className={`text-2xl font-bold text-gray-900 mb-6 ${spaceGrotesk.className}`}
      >
        AI-Powered Monitoring
      </h2>

      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Transactions Analyzed</p>
            <p className="text-2xl font-semibold text-gray-900">
              {transactions.length}
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600">High Risk Transactions</p>
            <p className="text-2xl font-semibold text-red-600">
              {stats.high_risk_count}
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600">Anomalies Detected</p>
            <p className="text-2xl font-semibold text-yellow-600">
              {stats.total_anomalies}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Average Risk Score</p>
            <p className="text-2xl font-semibold text-green-600">
              {stats.average_risk_score.toFixed(1)}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {analyses.map((analysis, index) => (
          <div
            key={index}
            className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {analysis.risk_level === "high" ? (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                ) : analysis.risk_level === "medium" ? (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    Transaction #{index + 1}
                  </p>
                  <p className="text-sm text-gray-500">
                    {analysis.explanation}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  analysis.risk_level === "high"
                    ? "bg-red-100 text-red-700"
                    : analysis.risk_level === "medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {analysis.risk_level.toUpperCase()}
              </span>
            </div>

            {analysis.recommendations.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Recommendations:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
