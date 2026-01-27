"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";

export default function VerifyDiploma() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Query to search diploma by hash or ID
  const diploma = useQuery(api.diplomas.searchDiploma, {
    searchTerm: searchQuery,
  });

  // Query to get diploma with batch info (when we have a result)
  const diplomaWithBatch = useQuery(
    api.diplomas.getDiplomaWithBatch,
    searchResult ? { diplomaId: searchResult._id as any } : "skip"
  );

  // Action to verify diploma on chain
  const verifyOnChain = useAction(api.blockchain.verifyDiplomaOnChain);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setError("");
    setSearchResult(null);

    try {
      if (!searchQuery.trim()) {
        setError("Please enter a diploma ID or hash");
        setIsSearching(false);
        return;
      }

      // Wait a bit for the query to update
      await new Promise(resolve => setTimeout(resolve, 500));

      if (diploma) {
        setSearchResult(diploma);
      } else {
        setError("Diploma not found. Please check the ID or hash and try again. Make sure you're using the exact value shown after upload.");
      }
    } catch (err) {
      setError("Failed to search for diploma. Please try again.");
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleVerifyOnChain = async () => {
    if (!searchResult) return;

    try {
      const verificationResult = await verifyOnChain({
        diplomaHash: searchResult.diplomaHash,
      });

      setSearchResult({
        ...searchResult,
        verificationResult,
      });
    } catch (err) {
      setError("Failed to verify diploma on blockchain. Please try again.");
      console.error(err);
    }
  };

  const handleCopyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (err) {
      console.error("Failed to copy hash:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-green-600 hover:text-green-800 font-medium">
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Verify Diploma</h2>
          <p className="text-gray-600 text-lg">
            Enter the diploma ID or hash to verify its authenticity on the blockchain
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter diploma ID or hash (both work)..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Search Result */}
        {searchResult && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Diploma Details</h3>
              <StatusBadge status={searchResult.status} />
            </div>

            {/* Diploma Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Student Name</label>
                  <p className="text-lg font-semibold text-gray-900">{searchResult.data?.studentName || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Degree</label>
                  <p className="text-lg font-semibold text-gray-900">{searchResult.data?.degree || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Specialty</label>
                  <p className="text-lg font-semibold text-gray-900">{searchResult.data?.specialty || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Issue Date</label>
                  <p className="text-lg font-semibold text-gray-900">{searchResult.data?.issueDate || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Graduation Date</label>
                  <p className="text-lg font-semibold text-gray-900">{searchResult.data?.graduationDate || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Diploma Number</label>
                  <p className="text-lg font-semibold text-gray-900">{searchResult.data?.diplomaNumber || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Blockchain Information */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">Diploma Hash:</span>
                  <code className="text-sm bg-white px-3 py-1 rounded border break-all max-w-xs">{searchResult.diplomaHash}</code>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">Diploma ID:</span>
                  <code className="text-sm bg-white px-3 py-1 rounded border break-all max-w-xs">{searchResult._id}</code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <StatusBadge status={searchResult.status} />
                </div>
                {diplomaWithBatch?.batch?.txHash && (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-600">Transaction Hash:</span>
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <code className="text-sm bg-white px-3 py-1 rounded border break-all max-w-xs">
                          {diplomaWithBatch.batch.txHash}
                        </code>
                        <button
                          onClick={() => diplomaWithBatch.batch?.txHash && handleCopyHash(diplomaWithBatch.batch.txHash)}
                          className="text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border flex items-center"
                          title="Copy transaction hash"
                        >
                          {copiedHash === diplomaWithBatch.batch?.txHash ? (
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">View on Arbiscan:</span>
                      <a
                        href={`https://sepolia.arbiscan.io/tx/${diplomaWithBatch.batch.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm bg-green-50 px-3 py-1 rounded border border-green-200 text-green-700 hover:text-green-900 hover:bg-green-100 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open in New Tab
                      </a>
                    </div>
                  </div>
                )}
                {searchResult.batchId && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Batch ID:</span>
                    <code className="text-sm bg-white px-3 py-1 rounded border">{searchResult.batchId}</code>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Result */}
            {searchResult.verificationResult && (
              <div className="bg-green-50 border-l-4 border-green-400 p-6 mb-6">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">
                    {searchResult.verificationResult.verified ? "✅" : "❌"}
                  </span>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {searchResult.verificationResult.verified ? "Verified on Blockchain" : "Verification Failed"}
                  </h4>
                </div>
                {searchResult.verificationResult.txHash && (
                  <p className="text-sm text-gray-700">
                    Transaction Hash:{" "}
                    <code className="bg-white px-2 py-1 rounded border">{searchResult.verificationResult.txHash}</code>
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              {searchResult.status === "anchored" && !searchResult.verificationResult && (
                <button
                  onClick={handleVerifyOnChain}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Verify on Blockchain
                </button>
              )}
              <Link
                href="/"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors text-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!searchResult && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">How to Verify a Diploma</h3>
            <ol className="list-decimal list-inside space-y-3 text-gray-600">
              <li>Obtain the diploma ID or hash from the diploma document or issuer</li>
              <li>Enter the ID or hash in the search field above (both work!)</li>
              <li>Click "Search" to retrieve the diploma details</li>
              <li>Review the diploma information to ensure it matches</li>
              <li>If the diploma is anchored, click "Verify on Blockchain" to confirm authenticity</li>
            </ol>

            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You can search using either the Diploma ID (shown after upload) or the Diploma Hash.
                Only diplomas that have been anchored to the blockchain can be verified on-chain.
                Diplomas with status "pending" or "accepted" are waiting to be included in the next batch.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
    accepted: { color: "bg-blue-100 text-blue-800", text: "Accepted" },
    anchored: { color: "bg-green-100 text-green-800", text: "Anchored" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${config.color}`}>
      {config.text}
    </span>
  );
}
