"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🎓</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">DiplomaChain</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link
                href="/upload"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Upload Diploma
              </Link>
              <Link
                href="/verify"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Verify Diploma
              </Link>
              <Link
                href="/university"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                University Portal
              </Link>
              <Link
                href="/verifier"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Verifier Portal
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Secure Diploma Verification on Blockchain
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Issue, verify, and manage academic diplomas with the security and transparency of blockchain technology.
            Prevent fraud and ensure authenticity with immutable records.
          </p>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link href="/upload">
              <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📤</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload Diploma</h3>
                <p className="text-gray-600">
                  Issue a new diploma and anchor it to the blockchain for permanent, tamper-proof storage.
                </p>
              </div>
            </Link>

            <Link href="/verify">
              <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-green-500">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Verify Diploma</h3>
                <p className="text-gray-600">
                  Verify the authenticity of any diploma by checking its hash against the blockchain.
                </p>
              </div>
            </Link>
          </div>

          {/* Features Section */}
          <div className="mt-20">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">1</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">University Issues Diploma</h4>
                <p className="text-gray-600 text-sm">
                  Universities create and issue digital diplomas with unique cryptographic hashes.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">2</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Anchored to Blockchain</h4>
                <p className="text-gray-600 text-sm">
                  Diplomas are batched and anchored to the Arbitrum blockchain using Merkle trees.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">3</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Instant Verification</h4>
                <p className="text-gray-600 text-sm">
                  Anyone can verify diploma authenticity instantly using the blockchain record.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 DiplomaChain. Built with Next.js, Convex, and Arbitrum.
          </p>
        </div>
      </footer>
    </div>
  );
}
