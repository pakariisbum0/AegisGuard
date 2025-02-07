import { Space_Grotesk } from "next/font/google";
import { Header } from "@/app/components/Header";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

const reports = [
  {
    title: "Budget Overview",
    description: "Comprehensive analysis of department budgets and spending",
    date: "March 2024",
    type: "Financial",
    status: "Ready",
    downloads: 234,
    lastUpdated: "2024-03-15",
  },
  {
    title: "Project Status",
    description: "Status update for all ongoing government projects",
    date: "March 2024",
    type: "Operations",
    status: "Processing",
    downloads: 156,
    lastUpdated: "2024-03-14",
  },
  {
    title: "Efficiency Metrics",
    description: "Department performance and resource utilization",
    date: "March 2024",
    type: "Analytics",
    status: "Ready",
    downloads: 189,
    lastUpdated: "2024-03-13",
  },
];

export default function ReportsPage() {
  return (
    <>
      <Header />
      <main className="pt-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Section */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1
                  className={`text-3xl font-bold text-gray-900 ${spaceGrotesk.className}`}
                >
                  Reports & Analytics
                </h1>
                <p className="text-gray-500 mt-2">
                  Access and generate detailed reports on government spending
                  and operations
                </p>
              </div>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Generate New Report
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-6 mt-8">
              {[
                { label: "Total Reports", value: "45" },
                { label: "Generated This Month", value: "12" },
                { label: "Total Downloads", value: "1,234" },
                { label: "Active Users", value: "89" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                >
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1">
              <input
                type="search"
                placeholder="Search reports..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Types</option>
              <option>Financial</option>
              <option>Operations</option>
              <option>Analytics</option>
            </select>
            <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Time</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
            </select>
          </div>

          {/* Reports Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {reports.map((report) => (
              <div
                key={report.title}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {report.title}
                  </h3>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    {report.type}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  {report.description}
                </p>
                <div className="flex items-center gap-4 mb-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      report.status === "Ready"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-yellow-50 text-yellow-600 border border-yellow-100"
                    }`}
                  >
                    {report.status}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    {report.downloads}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    Updated {new Date(report.lastUpdated).toLocaleDateString()}
                  </span>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    View Report
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
