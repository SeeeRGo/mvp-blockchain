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
        setError("Пожалуйста, введите ID или хеш диплома");
        setIsSearching(false);
        return;
      }

      // Wait a bit for the query to update
      await new Promise(resolve => setTimeout(resolve, 500));

      if (diploma) {
        setSearchResult(diploma);
      } else {
        setError("Диплом не найден. Проверьте ID или хеш и попробуйте снова. Убедитесь, что используете точное значение, показанное после загрузки.");
      }
    } catch (err) {
      setError("Не удалось найти диплом. Попробуйте снова.");
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
      setError("Не удалось проверить диплом в блокчейне. Попробуйте снова.");
      console.error(err);
    }
  };

  const handleCopyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (err) {
      console.error("Не удалось скопировать хеш:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-green-600 hover:text-green-800 font-medium">
            ← Вернуться на главную
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Проверить диплом</h2>
          <p className="text-gray-600 text-lg">
            Введите ID или хеш диплома для проверки его подлинности в блокчейне
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Введите ID или хеш диплома (оба работают)..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSearching ? "Поиск..." : "Поиск"}
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
              <h3 className="text-2xl font-bold text-gray-900">Детали диплома</h3>
              <StatusBadge status={searchResult.status} />
            </div>

            {/* Diploma Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Имя студента</label>
                  <p className="text-lg font-semibold text-gray-900">{searchResult.data?.studentName || "Н/Д"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Степень</label>
                  <p className="text-lg font-semibold text-gray-900">{searchResult.data?.degree || "Н/Д"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Специальность</label>
                  <p className="text-lg font-semibold text-gray-900">{searchResult.data?.specialty || "Н/Д"}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Дата выдачи</label>
                  <p className="text-lg font-semibold text-gray-900">{searchResult.data?.issueDate || "Н/Д"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Дата окончания</label>
                  <p className="text-lg font-semibold text-gray-900">{searchResult.data?.graduationDate || "Н/Д"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Номер диплома</label>
                  <p className="text-lg font-semibold text-gray-900">{searchResult.data?.diplomaNumber || "Н/Д"}</p>
                </div>
              </div>
            </div>

            {/* Blockchain Information */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Информация о блокчейне</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">Хеш диплома:</span>
                  <code className="text-sm bg-white px-3 py-1 rounded border break-all max-w-xs">{searchResult.diplomaHash}</code>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">ID диплома:</span>
                  <code className="text-sm bg-white px-3 py-1 rounded border break-all max-w-xs">{searchResult._id}</code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Статус:</span>
                  <StatusBadge status={searchResult.status} />
                </div>
                {diplomaWithBatch?.batch?.txHash && (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-600">Хеш транзакции:</span>
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <code className="text-sm bg-white px-3 py-1 rounded border break-all max-w-xs">
                          {diplomaWithBatch.batch.txHash}
                        </code>
                        <button
                          onClick={() => diplomaWithBatch.batch?.txHash && handleCopyHash(diplomaWithBatch.batch.txHash)}
                          className="text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border flex items-center"
                          title="Копировать хеш транзакции"
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
                      <span className="text-sm text-gray-600">Просмотр на Arbiscan:</span>
                      <a
                        href={`https://sepolia.arbiscan.io/tx/${diplomaWithBatch.batch.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm bg-green-50 px-3 py-1 rounded border border-green-200 text-green-700 hover:text-green-900 hover:bg-green-100 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Открыть в новой вкладке
                      </a>
                    </div>
                  </div>
                )}
                {searchResult.batchId && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">ID пакета:</span>
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
                    {searchResult.verificationResult.verified ? "Проверено в блокчейне" : "Верификация не удалась"}
                  </h4>
                </div>
                {searchResult.verificationResult.txHash && (
                  <p className="text-sm text-gray-700">
                    Хеш транзакции:{" "}
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
                  Проверить в блокчейне
                </button>
              )}
              <Link
                href="/"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors text-center"
              >
                Вернуться на главную
              </Link>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!searchResult && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Как проверить диплом</h3>
            <ol className="list-decimal list-inside space-y-3 text-gray-600">
              <li>Получите ID или хеш диплома из документа диплома или у издателя</li>
              <li>Введите ID или хеш в поле поиска выше (оба работают!)</li>
              <li>Нажмите "Поиск" для получения деталей диплома</li>
              <li>Проверьте информацию о дипломе, чтобы убедиться в совпадении</li>
              <li>Если диплом закреплен, нажмите "Проверить в блокчейне" для подтверждения подлинности</li>
            </ol>

            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400">
              <p className="text-sm text-blue-800">
                <strong>Примечание:</strong> Вы можете искать, используя ID диплома (показанный после загрузки) или хеш диплома.
                Только дипломы, закрепленные в блокчейне, могут быть проверены в блокчейне.
                Дипломы со статусом "ожидает" или "принят" ожидают включения в следующий пакет.
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
    pending: { color: "bg-yellow-100 text-yellow-800", text: "Ожидает" },
    accepted: { color: "bg-blue-100 text-blue-800", text: "Принят" },
    anchored: { color: "bg-green-100 text-green-800", text: "Закреплен" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${config.color}`}>
      {config.text}
    </span>
  );
}
