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
    label: "Total Budget",
    value: "$1.2T",
    change: "+12.3%",
    trend: "up",
  },
  {
    label: "Departments",
    value: "45+",
    change: "+2",
    trend: "up",
  },
  {
    label: "Active Projects",
    value: "12,458",
    change: "-234",
    trend: "down",
  },
  {
    label: "Q2 2024",
    value: "94%",
    subtitle: "Budget Utilized",
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
              <h1
                className={`text-4xl sm:text-5xl font-bold text-gray-900 ${spaceGrotesk.className}`}
              >
                Federal Spending
                <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
                  Transparency Portal
                </span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Track and analyze government spending with real-time insights
              </p>
              <div className="flex gap-4 justify-center">
                <button className="bg-black text-white px-6 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition-colors">
                  Get Started
                </button>
                <button className="text-gray-700 bg-gray-50 px-6 py-2.5 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Simplified Stats Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-6 hover:shadow-md transition-all duration-300"
              >
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
                      <span className="text-emerald-600 text-sm">
                        ↑ {stat.change}
                      </span>
                    ) : (
                      <span className="text-red-600 text-sm">
                        ↓ {stat.change}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Department Cards - Simplified Version */}
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
                  className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-lg">
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
                        className="group-hover:bg-gray-50 p-3 rounded-lg transition-colors"
                      >
                        <p className="text-sm text-gray-500">{label}</p>
                        <p className="text-lg font-medium text-gray-900">
                          {value}
                        </p>
                      </div>
                    ))}
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
