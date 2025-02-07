import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

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

export default function Home() {
  return (
    <div className={`min-h-screen bg-gray-50 ${inter.className}`}>
      {/* Header with USA Flag Banner */}
      <div className="bg-gradient-to-r from-[#E31C3D] to-[#cd1834] text-white text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/images/us-flag.png"
              alt="US Flag"
              width={20}
              height={14}
            />
            <span>An official website of the United States government</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline">
              Here's how you know
            </a>
            <a href="#" className="hover:underline">
              Language
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-gradient-to-r from-[#112e51] to-[#1a4480] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Image
                  src="/images/doge-seal.png"
                  alt="DOGE Seal"
                  width={60}
                  height={60}
                  className="rounded-full transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight">DOGE</span>
                <span className="hidden md:block text-sm text-gray-300">
                  Department of Government Efficiency
                </span>
              </div>
            </div>
            <nav className="flex items-center gap-8">
              <a
                href="#"
                className="hover:text-blue-200 transition-colors text-sm font-medium"
              >
                Home
              </a>
              <a
                href="#"
                className="hover:text-blue-200 transition-colors text-sm font-medium"
              >
                Departments
              </a>
              <a
                href="#"
                className="hover:text-blue-200 transition-colors text-sm font-medium"
              >
                Reports
              </a>
              <button className="bg-white text-[#112e51] px-6 py-2 rounded-md hover:bg-gray-100 transition-colors font-medium">
                Sign In
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Banner with Background Image */}
        <div className="relative bg-white border-b">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-5"
            style={{ backgroundImage: "url('/images/capitol.jpg')" }}
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center space-y-8">
              <h1 className="text-5xl sm:text-6xl font-bold text-[#112e51] mb-6 leading-tight">
                Federal Spending
                <span className="block text-[#E31C3D]">
                  Transparency Portal
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Track, analyze, and understand how your tax dollars are being
                utilized across government departments
              </p>
              <div className="flex gap-4 justify-center">
                <button className="bg-[#112e51] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#1a4480] transition-colors">
                  Get Started
                </button>
                <button className="text-[#112e51] bg-white border-2 border-[#112e51] px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Quick Stats - Enhanced version */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              {
                label: "Total Budget",
                value: "$1.2T",
                change: "+12.3%",
                trend: "up",
                color: "emerald",
              },
              {
                label: "Departments",
                value: "45+",
                change: "+2",
                trend: "up",
                color: "blue",
              },
              {
                label: "Active Projects",
                value: "12,458",
                change: "-234",
                trend: "down",
                color: "purple",
              },
              {
                label: "Fiscal Year",
                value: "2024",
                subtitle: "Q2",
                color: "orange",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
              >
                <div className="flex flex-col h-full">
                  <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-3xl font-bold text-${stat.color}-600`}>
                      {stat.value}
                    </p>
                    {stat.subtitle && (
                      <span className="text-gray-500 text-sm">
                        {stat.subtitle}
                      </span>
                    )}
                  </div>
                  {stat.change && (
                    <div className="mt-2 flex items-center">
                      {stat.trend === "up" ? (
                        <svg
                          className="w-4 h-4 text-emerald-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"
                          />
                        </svg>
                      )}
                      <span
                        className={`text-sm ml-1 ${
                          stat.trend === "up"
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Department Cards */}
          <div className="space-y-8 mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-[#112e51]">
                Featured Departments
              </h2>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2">
                View All Departments
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

            <div className="grid md:grid-cols-2 gap-8">
              {departments.map((dept, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
                >
                  <div
                    className={`${dept.bgColor} p-6 flex items-center justify-between group-hover:scale-[1.01] transition-transform`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-white rounded-lg p-2 shadow-md">
                        <Image
                          src={dept.logo}
                          alt={`${dept.name} logo`}
                          width={50}
                          height={50}
                          className="rounded-lg"
                        />
                      </div>
                      <h3 className="text-xl font-semibold text-white">
                        {dept.name}
                      </h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        ["Annual Budget", dept.budget],
                        ["Active Projects", dept.projects],
                        ["Utilization", dept.utilization],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="bg-gray-50 p-4 rounded-lg text-center hover:bg-gray-100 transition-colors"
                        >
                          <p className="text-2xl font-bold text-[#112e51]">
                            {value}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">{label}</p>
                        </div>
                      ))}
                    </div>
                    <button className="mt-6 w-full bg-gray-50 text-[#112e51] py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                      View Department Details
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

          {/* Key Features */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {[
              {
                title: "Real-Time Tracking",
                icon: "/images/icons/chart-line.svg",
                desc: "Monitor government spending across departments with instant updates and complete transparency.",
              },
              {
                title: "Spending Analytics",
                icon: "/images/icons/chart-line.svg",
                desc: "Advanced analytics to identify spending patterns, anomalies, and opportunities for optimization.",
              },
              {
                title: "Blockchain Security",
                icon: "/images/icons/chart-line.svg",
                desc: "Immutable record-keeping ensures every transaction is verified and permanently recorded.",
              },
              {
                title: "Public Access",
                icon: "/images/icons/chart-line.svg",
                desc: "Citizens can view and analyze government spending data through an intuitive interface.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Image
                      src={feature.icon}
                      alt={feature.title}
                      width={24}
                      height={24}
                      className="text-blue-600"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-[#112e51] to-[#1a4480] text-white rounded-xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-8">
              Ready to Access Government Spending Data?
            </h2>
            <div className="flex gap-6 justify-center">
              <button className="bg-white text-[#112e51] px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                View Dashboard
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
                Download Reports
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#112e51] text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
              <p className="text-sm text-gray-600">
                1500 Pennsylvania Avenue NW
              </p>
              <p className="text-sm text-gray-600">Washington, DC 20220</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick Links</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  <a href="#" className="hover:underline">
                    Accessibility
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    FOIA
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Stay Connected
              </h3>
              <p className="text-sm text-gray-600">
                Sign up for updates on government spending and new features.
              </p>
            </div>
          </div>
          <div className="text-center text-sm text-gray-600 mt-8">
            © 2024 DOGE - Department of Government Efficiency. All rights
            reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
