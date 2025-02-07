import Image from "next/image";
import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

const departments = [
  {
    name: "Department of Defense",
    budget: "$773.1B",
    projects: "21,345",
    utilization: "98.2%",
    logo: "/images/dod-logo.png",
    bgColor: "bg-[#1B2C4E]",
  },
  {
    name: "Department of Health & Human Services",
    budget: "$1.7T",
    projects: "15,234",
    utilization: "96.8%",
    logo: "/images/dod-logo.png",
    bgColor: "bg-[#0071BC]",
  },
  {
    name: "NASA",
    budget: "$24.5B",
    projects: "12,458",
    utilization: "94.2%",
    logo: "/images/dod-logo.png",
    bgColor: "bg-[#1A5DAD]",
  },
  {
    name: "Department of Education",
    budget: "$79.8B",
    projects: "8,765",
    utilization: "92.5%",
    logo: "/images/dod-logo.png",
    bgColor: "bg-[#2E4E87]",
  },
];

const stats = [
  {
    label: "Total Budget Tracked",
    value: "$1.2T",
    change: "+12.3%",
    trend: "up",
    subtitle: "On Blockchain"
  },
  {
    label: "Verified Transactions",
    value: "2.4M",
    change: "+1,234",
    trend: "up",
    subtitle: "Last 24h"
  },
  {
    label: "Active Proposals",
    value: "156",
    change: "-12",
    trend: "down",
    subtitle: "Under Review"
  },
  {
    label: "Blockchain Health",
    value: "99.9%",
    subtitle: "Uptime",
  },
];

const budgetPhases = [
  {
    phase: "Proposal",
    status: "In Progress",
    departments: 12,
    totalAmount: "$450B",
  },
  {
    phase: "Review",
    status: "Active",
    departments: 8,
    totalAmount: "$280B",
  },
  {
    phase: "Approved",
    status: "Complete",
    departments: 25,
    totalAmount: "$470B",
  },
];

export default function Home() {
  return (
    <div className={`min-h-screen bg-white ${inter.className}`}>
      {/* Simplified Header - Remove the USA banner and make header minimal */}
      <header className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span
                className={`text-xl font-bold text-gray-900 ${spaceGrotesk.className}`}
              >
                DOGE
              </span>
            </div>
            <nav className="flex items-center gap-8">
              {["Home", "Departments", "Reports"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {item}
                </a>
              ))}
              <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm">
                Sign In
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {" "}
        {/* Add padding-top to account for fixed header */}
        {/* Simplified Hero - Remove background image for cleaner look */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1 className={`text-4xl sm:text-5xl font-bold text-gray-900 ${spaceGrotesk.className}`}>
                Blockchain-Powered
                <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
                  Government Transparency
                </span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Track, verify, and analyze government spending with immutable blockchain records
              </p>
              <div className="flex gap-4 justify-center">
                <button className="bg-black text-white px-6 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition-colors">
                  Explore Departments
                </button>
                <button className="text-gray-700 bg-gray-50 px-6 py-2.5 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                  Verify Transaction
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add Budget Phase Timeline */}
        <div className="bg-gray-50 border-y">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className={`text-2xl font-bold text-gray-900 mb-8 ${spaceGrotesk.className}`}>
              Budget Cycle Status
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {budgetPhases.map((phase, i) => (
                <div
                  key={phase.phase}
                  className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-all relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    i === 0 ? "bg-blue-500" : i === 1 ? "bg-yellow-500" : "bg-green-500"
                  }`} />
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{phase.phase}</h3>
                      <p className="text-sm text-gray-500">{phase.status}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      i === 0 ? "bg-blue-50 text-blue-600" : 
                      i === 1 ? "bg-yellow-50 text-yellow-600" : 
                      "bg-green-50 text-green-600"
                    }`}>
                      {phase.departments} Departments
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{phase.totalAmount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Existing Stats Section with updated styling */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-6 hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-gray-200 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/20 to-violet-500/20" />

                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  {stat.subtitle && (
                    <span className="text-sm text-gray-500">
                      {stat.subtitle}
                    </span>
                  )}
                </div>
                {stat.change && (
                  <div className="mt-2 flex items-center">
                    {stat.trend === "up" ? (
                      <span className="text-emerald-600 text-sm bg-emerald-50 px-2 py-0.5 rounded-full">
                        ↑ {stat.change}
                      </span>
                    ) : (
                      <span className="text-red-600 text-sm bg-red-50 px-2 py-0.5 rounded-full">
                        ↓ {stat.change}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Blockchain Verification Section */}
          <div className="mt-24 bg-gray-50 rounded-xl p-8 border border-gray-100">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className={`text-2xl font-bold text-gray-900 mb-4 ${spaceGrotesk.className}`}>
                Verify Transaction
              </h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Enter transaction hash or department ID"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                  Verify
                </button>
              </div>
            </div>
          </div>

          {/* Department Cards with blockchain info */}
          <div className="mt-24">
            <div className="flex justify-between items-center mb-12">
              <h2
                className={`text-2xl font-bold text-gray-900 ${spaceGrotesk.className}`}
              >
                Featured Departments
              </h2>
              <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                View All →
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {departments.map((dept, i) => (
                <div
                  key={i}
                  className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 group-hover:border-gray-200 transition-colors">
                      <Image
                        src={dept.logo}
                        alt={dept.name}
                        width={40}
                        height={40}
                        className="rounded-lg"
                      />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {dept.name}
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      ["Budget", dept.budget],
                      ["Projects", dept.projects],
                      ["Utilization", dept.utilization],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="group-hover:bg-gray-50 p-3 rounded-lg transition-colors border border-transparent group-hover:border-gray-100"
                      >
                        <p className="text-sm text-gray-500">{label}</p>
                        <p className="text-lg font-medium text-gray-900">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Simplified Footer */}
      <footer className="bg-gray-50 border-t mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <span
                className={`text-xl font-bold text-gray-900 ${spaceGrotesk.className}`}
              >
                DOGE
              </span>
              <p className="mt-2 text-sm text-gray-500">
                Department of Government Efficiency
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Links</h3>
              <ul className="space-y-3 text-sm text-gray-500">
                {["About", "Privacy", "Terms", "Contact"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="hover:text-gray-900 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-3 text-sm text-gray-500">
                {["FOIA", "Accessibility", "Privacy Policy"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="hover:text-gray-900 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
