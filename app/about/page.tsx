"use client";

import { Space_Grotesk } from "next/font/google";
import { Header } from "../components/Header";
import Image from "next/image";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1
                className={`text-4xl sm:text-5xl font-bold text-gray-900 ${spaceGrotesk.className}`}
              >
                About
                <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
                  Our Mission
                </span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Transforming government spending through transparency,
                efficiency, and blockchain technology.
              </p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Vision Section */}
            <div className="space-y-6">
              <h2
                className={`text-3xl font-bold text-gray-900 ${spaceGrotesk.className}`}
              >
                Our Vision
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We envision a future where government spending is completely
                transparent, efficient, and accountable to the public. Through
                blockchain technology and innovative solutions, we're making
                this vision a reality.
              </p>
              <ul className="space-y-4">
                {[
                  "Complete transparency in government spending",
                  "Efficient allocation of resources",
                  "Real-time tracking of department budgets",
                  "Public accountability through blockchain",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technology Section */}
            <div className="space-y-6">
              <h2
                className={`text-3xl font-bold text-gray-900 ${spaceGrotesk.className}`}
              >
                Our Technology
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Built on cutting-edge blockchain technology, our platform
                ensures:
              </p>
              <div className="grid gap-6">
                {[
                  {
                    title: "Smart Contracts",
                    description:
                      "Automated and transparent execution of department budgets and proposals",
                  },
                  {
                    title: "Real-time Analytics",
                    description:
                      "Advanced monitoring and analysis of spending patterns",
                  },
                  {
                    title: "Secure Transactions",
                    description:
                      "Military-grade encryption and blockchain security",
                  },
                  {
                    title: "Public Verification",
                    description:
                      "Anyone can verify transactions on the blockchain",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="p-6 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <h3 className="font-medium text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
