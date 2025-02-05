import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <main className="space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-8">
            <h1 className="text-4xl sm:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              DeFAI Guard
            </h1>
            <p className="text-xl sm:text-2xl max-w-3xl mx-auto text-gray-300">
              AI-powered protection against fraud and scams on the Sonic
              blockchain
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 p-6 rounded-xl backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-4 text-blue-400">
                🔍 Fraud Detection
              </h3>
              <p className="text-gray-300">
                Real-time monitoring and detection of suspicious transactions
                and contract behaviors on the Sonic blockchain.
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-xl backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-4 text-blue-400">
                🪙 Meme Coin Analysis
              </h3>
              <p className="text-gray-300">
                Advanced AI algorithms to analyze and identify legitimate meme
                coin opportunities with automatic buying capabilities.
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-xl backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-4 text-blue-400">
                🤖 Automated Trading
              </h3>
              <p className="text-gray-300">
                Secure automated trading system that executes purchases when
                legitimate opportunities are detected.
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-xl backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-4 text-blue-400">
                🛡️ DeFi Protection
              </h3>
              <p className="text-gray-300">
                Comprehensive security for all DeFAI applications running on the
                Sonic blockchain ecosystem.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-semibold">
              Ready to secure your DeFi investments?
            </h2>
            <div className="flex gap-4 justify-center flex-wrap">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-medium transition-colors">
                Launch App
              </button>
              <button className="border border-blue-500 text-blue-400 hover:bg-blue-500/10 px-8 py-3 rounded-full font-medium transition-colors">
                Learn More
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-400">$10M+</p>
              <p className="text-gray-400">Protected Assets</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400">1000+</p>
              <p className="text-gray-400">Scams Detected</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400">99.9%</p>
              <p className="text-gray-400">Accuracy Rate</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400">24/7</p>
              <p className="text-gray-400">Monitoring</p>
            </div>
          </div>
        </main>

        <footer className="mt-20 text-center text-gray-400">
          <p>© 2024 DeFAI Guard. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
