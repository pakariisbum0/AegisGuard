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
    <div className={`min-h-screen bg-white ${inter.className}`}>
      {/* Header with USA Flag Banner */}
      <div className="bg-[#E31C3D] text-white text-sm py-1">
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
      <header className="bg-[#112e51] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <Image
                src="/images/doge-seal.png"
                alt="DOGE Seal"
                width={60}
                height={60}
                className="rounded-full"
              />
              <div>
                <span className="text-2xl font-semibold">DOGE</span>
                <span className="hidden md:block text-sm text-gray-300">
                  Department of Government Efficiency
                </span>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <a href="#" className="hover:text-blue-200 transition-colors">
                Home
              </a>
              <a href="#" className="hover:text-blue-200 transition-colors">
                Departments
              </a>
              <a href="#" className="hover:text-blue-200 transition-colors">
                Reports
              </a>
              <button className="bg-[#E31C3D] px-4 py-2 rounded-md hover:bg-[#cd1834] transition-colors">
                Sign In
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Banner with Background Image */}
        <div className="relative bg-[#f1f1f1] border-b">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{ backgroundImage: "url('/images/capitol.jpg')" }}
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-5xl sm:text-6xl font-bold text-[#112e51] mb-6">
                Federal Spending Transparency Portal
              </h1>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Track, analyze, and understand how your tax dollars are being
                utilized across government departments
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              "Total Budget",
              "Departments",
              "Active Projects",
              "Fiscal Year",
            ].map((label, i) => (
              <div
                key={i}
                className="bg-gray-50 border rounded-lg p-4 text-center"
              >
                <p className="text-2xl font-bold text-blue-900">
                  {["$1.2T", "45+", "12,458", "2024"][i]}
                </p>
                <p className="text-sm text-gray-600">{label}</p>
              </div>
            ))}
          </div>

          {/* Department Cards */}
          <div className="space-y-8 mb-12">
            <h2 className="text-3xl font-bold text-[#112e51] mb-8">
              Featured Departments
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {departments.map((dept, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div
                    className={`${dept.bgColor} p-6 flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-4">
                      <Image
                        src={dept.logo}
                        alt={`${dept.name} logo`}
                        width={60}
                        height={60}
                        className="rounded-lg bg-white p-1"
                      />
                      <h3 className="text-xl font-semibold text-white">
                        {dept.name}
                      </h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-[#112e51]">
                          {dept.budget}
                        </p>
                        <p className="text-sm text-gray-600">Annual Budget</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-[#112e51]">
                          {dept.projects}
                        </p>
                        <p className="text-sm text-gray-600">Active Projects</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-[#112e51]">
                          {dept.utilization}
                        </p>
                        <p className="text-sm text-gray-600">Utilization</p>
                      </div>
                    </div>
                    <button className="mt-4 text-blue-700 hover:text-blue-800 font-medium flex items-center gap-1">
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
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              {
                title: "Real-Time Tracking",
                icon: "📊",
                desc: "Monitor government spending across departments with instant updates and complete transparency.",
              },
              {
                title: "Spending Analytics",
                icon: "🔍",
                desc: "Advanced analytics to identify spending patterns, anomalies, and opportunities for optimization.",
              },
              {
                title: "Blockchain Security",
                icon: "🔐",
                desc: "Immutable record-keeping ensures every transaction is verified and permanently recorded.",
              },
              {
                title: "Public Access",
                icon: "📱",
                desc: "Citizens can view and analyze government spending data through an intuitive interface.",
              },
            ].map((feature, i) => (
              <div key={i} className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.icon} {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="bg-[#112e51] text-white rounded-xl p-12 text-center">
            <h2 className={`text-3xl font-bold mb-6`}>
              Access Government Spending Data
            </h2>
            <div className="flex gap-4 justify-center">
              <button className="bg-[#e31c3d] hover:bg-[#cd1834] px-8 py-3 rounded-lg font-medium transition-colors">
                View Dashboard
              </button>
              <button className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-lg font-medium transition-colors">
                Download Reports
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#f1f1f1] border-t mt-12">
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
