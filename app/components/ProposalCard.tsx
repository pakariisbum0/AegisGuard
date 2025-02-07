"use client";

import { Space_Grotesk } from "next/font/google";
import { useRouter } from "next/navigation";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

interface ProposalCardProps {
  department: string;
  amount: string;
  status: string;
  submittedDate: string;
  category: string;
  description?: string;
  progress?: number;
}

export function ProposalCard({
  department,
  amount,
  status,
  submittedDate,
  category,
  description,
  progress = 0,
}: ProposalCardProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "under review":
        return "bg-yellow-50 text-yellow-600 border-yellow-100";
      case "approved":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "pending":
        return "bg-blue-50 text-blue-600 border-blue-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  return (
    <div
      className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-all duration-300 group cursor-pointer"
      onClick={() =>
        router.push(`/proposals/${department.toLowerCase().replace(/ /g, "-")}`)
      }
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
            {department}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">{category}</span>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-500">
              Submitted {new Date(submittedDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(
            status
          )}`}
        >
          {status}
        </span>
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">Review Progress</span>
          <span className="text-xs font-medium text-gray-700">{progress}%</span>
        </div>
      </div>

      {/* Footer */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
          <p className="text-sm text-gray-500">Requested Amount</p>
          <p className="text-lg font-medium text-gray-900">{amount}</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
          <p className="text-sm text-gray-500">Expected Duration</p>
          <p className="text-lg font-medium text-gray-900">6 months</p>
        </div>
      </div>

      {/* View Details Button */}
      <div className="mt-4 flex justify-end">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium group-hover:underline">
          View Details →
        </button>
      </div>
    </div>
  );
}
