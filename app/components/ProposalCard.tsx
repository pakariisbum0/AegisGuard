"use client";

import { Space_Grotesk } from "next/font/google";
import { useRouter } from "next/navigation";
import Image from "next/image";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

interface ProposalCardProps {
  department: string;
  departmentLogo?: string;
  amount: string;
  status: string;
  submittedDate: string;
  category: string;
  description?: string;
  timeline?: string;
  objectives?: string;
}

export function ProposalCard({
  department,
  departmentLogo = "/images/default-department.png",
  amount,
  status,
  submittedDate,
  category,
  description,
  timeline,
  objectives,
}: ProposalCardProps) {
  console.log(departmentLogo);
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

  // Format the date to be more readable
  const formattedDate = new Date(submittedDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-all duration-300 group cursor-pointer"
      onClick={() =>
        router.push(
          `/departments/${department.toLowerCase().replace(/ /g, "-")}`
        )
      }
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg border border-gray-100 overflow-hidden flex-shrink-0">
                <Image
                  src={departmentLogo}
                  alt={department}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {department}
              </h3>
            </div>
            <span
              className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                status === "Approved"
                  ? "bg-green-50 text-green-700"
                  : status === "Pending"
                  ? "bg-yellow-50 text-yellow-700"
                  : status === "Under Review"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-gray-50 text-gray-700"
              }`}
            >
              {status}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="capitalize">{category.toLowerCase()}</span>
            <span>•</span>
            <span>Submitted {formattedDate}</span>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        )}

        {/* Details Grid */}
        <div className="grid gap-4">
          <div>
            <p className="text-sm text-gray-500">Requested Amount</p>
            <p className="text-lg font-medium text-gray-900">{amount}</p>
          </div>
          {/* {timeline && (
            <div>
              <p className="text-sm text-gray-500">Timeline</p>
              <p className="text-sm text-gray-900">{timeline}</p>
            </div>
          )}
          {objectives && (
            <div>
              <p className="text-sm text-gray-500">Objectives</p>
              <p className="text-sm text-gray-900 line-clamp-2">{objectives}</p>
            </div>
          )} */}
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <a
            href="#"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View Details →
          </a>
        </div>
      </div>
    </div>
  );
}
