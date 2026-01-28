"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function UniversityPortal() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showCreateDiploma, setShowCreateDiploma] = useState(false);
  const [showAttestation, setShowAttestation] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Query university by name
  const university = useQuery(api.universities.getByName, { name: "Demo University" });
  
  // Query university stats (disabled for demo)
  // const stats = useQuery(api.universities.getStats, { universityId: university?._id as any });

  // Query diplomas (disabled for demo)
  // const diplomas = useQuery(api.universities.listDiplomas, { universityId: university?._id as any });
  
  const stats: any = null;
  const diplomas: any[] = [];
  
  // Query diplomas with batch information
  const diplomasWithBatch = useQuery(
    api.universities.listDiplomasWithBatchInfo,
    university ? { universityId: university._id as any } : "skip"
  ) || [];

  // Mutations
  const createDiploma = useMutation(api.universities.createDiploma);
  const attestPublisher = useMutation(api.universities.attestPublisher);
  
  // Actions
  const attestPublisherOnChain = useAction(api.blockchain.attestPublisherOnChain);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Портал университета
              </h1>
            </div>
            <nav className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "dashboard"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Панель управления
              </button>
              <button
                onClick={() => setActiveTab("diplomas")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "diplomas"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Дипломы
              </button>
              <button
                onClick={() => setActiveTab("batches")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "batches"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Пакеты
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === "dashboard" && (
          <Dashboard
            stats={stats}
            onCreateDiploma={() => setShowCreateDiploma(true)}
            onAttestPublisher={() => setShowAttestation(true)}
          />
        )}

        {activeTab === "diplomas" && (
          <DiplomaList
            diplomas={diplomasWithBatch}
            onCreateDiploma={() => setShowCreateDiploma(true)}
          />
        )}

        {activeTab === "batches" && <BatchList university={university} />}
      </main>

      {/* Create Diploma Modal */}
      {showCreateDiploma && (
        <CreateDiplomaModal
          onClose={() => setShowCreateDiploma(false)}
          onSubmit={async (data: any) => {
            if (!university) {
              alert("Демонстрационный университет не найден. Убедитесь, что база данных правильно инициализирована.");
              return;
            }
            await createDiploma({
              universityId: university._id,
              ownerEmail: data.studentEmail,
              data: data,
            });
            setShowCreateDiploma(false);
          }}
        />
      )}

      {/* Attestation Modal */}
      {showAttestation && (
        <AttestationModal
          onClose={() => setShowAttestation(false)}
          onSubmit={async (data: any) => {
            await attestPublisherOnChain(data);
          }}
          university={university}
        />
      )}
    </div>
  );
}

// Dashboard Component
function Dashboard({ stats, onCreateDiploma, onAttestPublisher }: any) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Всего дипломов"
          value={stats?.total || 0}
          icon="📜"
          color="blue"
        />
        <StatCard
          title="Ожидают принятия"
          value={stats?.pending || 0}
          icon="⏳"
          color="yellow"
        />
        <StatCard
          title="Закреплено на блокчейне"
          value={stats?.anchored || 0}
          icon="✅"
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={onCreateDiploma}
            className="flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <span className="mr-2">📝</span>
            Создать новый диплом
          </button>
          <button
            onClick={onAttestPublisher}
            className="flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <span className="mr-2">🔐</span>
            Аттестовать издателя
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Недавняя активность</h2>
        <div className="space-y-3">
          <ActivityItem
            title="Диплом выдан Ивану Иванову"
            time="2 часа назад"
            status="completed"
          />
          <ActivityItem
            title="Пакет #123 закреплен на блокчейне"
            time="5 часов назад"
            status="completed"
          />
          <ActivityItem
            title="Издатель аттестован в блокчейне"
            time="1 день назад"
            status="completed"
          />
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color }: any) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    yellow: "bg-yellow-50 text-yellow-700",
    green: "bg-green-50 text-green-700",
  };

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} rounded-lg p-6`}>
      <div className="flex items-center">
        <span className="text-3xl mr-3">{icon}</span>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Activity Item Component
function ActivityItem({ title, time, status }: any) {
  const statusColors = {
    completed: "text-green-600",
    pending: "text-yellow-600",
    failed: "text-red-600",
  };

  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0">
        <div className={`h-2 w-2 rounded-full ${statusColors[status as keyof typeof statusColors]}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
}

// Diploma List Component
function DiplomaList({ diplomas, onCreateDiploma }: any) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Выданные дипломы</h2>
        <button
          onClick={onCreateDiploma}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Создать диплом
        </button>
      </div>

      {diplomas?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Дипломы еще не выданы</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Имя студента
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Степень
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {diplomas?.map((diploma: any) => (
                <tr key={diploma._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {diploma.data.studentName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{diploma.data.degree}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={diploma.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      Просмотр
                    </button>
                    {diploma.status === "anchored" && diploma.batch?.txHash && (
                      <>
                        <a
                          href={`https://sepolia.arbiscan.io/tx/${diploma.batch.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-900 flex items-center font-medium mr-2"
                          title={`Просмотр транзакции ${diploma.batch.txHash} на Arbiscan`}
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Просмотр на Arbiscan
                        </a>
                        <button
                          onClick={() => handleCopyHash(diploma.batch.txHash)}
                          className="text-gray-600 hover:text-gray-900 flex items-center"
                          title="Копировать хеш транзакции"
                        >
                          {copiedHash === diploma.batch.txHash ? (
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: any) {
  const statusConfig = {
    pending: { color: "bg-yellow-100 text-yellow-800", text: "Ожидает" },
    accepted: { color: "bg-blue-100 text-blue-800", text: "Принят" },
    anchored: { color: "bg-green-100 text-green-800", text: "Закреплен" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}>
      {config.text}
    </span>
  );
}

// Batch List Component
function BatchList({ university }: any) {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Query stats to get pending diplomas count
  const stats = useQuery(
    api.universities.getStats,
    university ? { universityId: university._id as any } : "skip"
  );

  // Query batches with details
  const batches = useQuery(
    api.batches.listBatchesWithDetails,
    university ? { universityId: university._id as any } : "skip"
  );

  // Action to create batch anchor
  const createBatchAnchor = useAction(api.blockchain.createBatchAnchor);

  const handleCreateBatch = async () => {
    if (!university) return;
    
    setIsCreating(true);
    setResult(null);
    
    try {
      const response = await createBatchAnchor({
        universityId: university._id,
      });
      setResult(response);
    } catch (error) {
      console.error("Не удалось создать пакет:", error);
      setResult({ error: "Не удалось создать пакет. Попробуйте снова." });
    } finally {
      setIsCreating(false);
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Закрепление пакетов</h2>
        <button
          onClick={handleCreateBatch}
          disabled={isCreating || !stats || stats.accepted === 0}
          className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isCreating || !stats || stats.accepted === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isCreating ? "Создание пакета..." : "Создать пакет сейчас"}
        </button>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Ожидающие дипломы"
          value={stats?.pending || 0}
          icon="⏳"
          color="yellow"
        />
        <StatCard
          title="Готовы к закреплению"
          value={stats?.accepted || 0}
          icon="📦"
          color="blue"
        />
        <StatCard
          title="Всего пакетов"
          value={batches?.length || 0}
          icon="🔗"
          color="green"
        />
      </div>

      {/* Result Message */}
      {result && (
        <div className={`rounded-lg p-4 ${
          result.error ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"
        }`}>
          {result.error ? (
            <p className="text-red-800">{result.error}</p>
          ) : (
            <div>
              <p className="text-green-800 font-medium mb-2">✓ Пакет успешно создан!</p>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>ID пакета:</strong> {result.batchId}</p>
                <p><strong>Хеш транзакции:</strong> {result.txHash}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Batches List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">История пакетов</h3>
        </div>
        
        {batches?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Пакеты еще не созданы</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дипломы
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Корень Меркла
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Хеш транзакции
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Создан
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {batches?.map((batch: any) => (
                  <tr key={batch._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <BatchStatusBadge status={batch.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {batch.itemCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {batch.merkleRoot.slice(0, 10)}...{batch.merkleRoot.slice(-8)}
                        </code>
                        <button
                          onClick={() => handleCopyHash(batch.merkleRoot)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Копировать корень Меркла"
                        >
                          {copiedHash === batch.merkleRoot ? (
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {batch.txHash ? (
                        <div className="flex items-center space-x-2">
                          <a
                            href={`https://sepolia.arbiscan.io/tx/${batch.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
                          >
                            {batch.txHash.slice(0, 10)}...{batch.txHash.slice(-8)}
                          </a>
                          <button
                            onClick={() => handleCopyHash(batch.txHash)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Копировать хеш транзакции"
                          >
                            {copiedHash === batch.txHash ? (
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Не закреплен</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(batch.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        Просмотр деталей
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Batch Status Badge Component
function BatchStatusBadge({ status }: any) {
  const statusConfig = {
    pending: { color: "bg-yellow-100 text-yellow-800", text: "Ожидает" },
    anchored: { color: "bg-green-100 text-green-800", text: "Закреплен" },
    failed: { color: "bg-red-100 text-red-800", text: "Ошибка" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}>
      {config.text}
    </span>
  );
}

// Create Diploma Modal Component
function CreateDiplomaModal({ onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    studentName: "",
    studentEmail: "",
    degree: "",
    specialty: "",
    issueDate: "",
    graduationDate: "",
    gpa: "",
    diplomaNumber: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Создать новый диплом</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Имя студента
            </label>
            <input
              type="text"
              required
              value={formData.studentName}
              onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email студента</label>
            <input
              type="email"
              required
              value={formData.studentEmail}
              onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Степень</label>
            <input
              type="text"
              required
              value={formData.degree}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Специальность
            </label>
            <input
              type="text"
              required
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Дата выдачи
              </label>
              <input
                type="date"
                required
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Дата окончания
              </label>
              <input
                type="date"
                required
                value={formData.graduationDate}
                onChange={(e) => setFormData({ ...formData, graduationDate: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Средний балл</label>
              <input
                type="text"
                value={formData.gpa}
                onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Номер диплома
              </label>
              <input
                type="text"
                required
                value={formData.diplomaNumber}
                onChange={(e) => setFormData({ ...formData, diplomaNumber: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Создать диплом
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Attestation Modal Component
function AttestationModal({ onClose, onSubmit, university }: any) {
  const [isAttesting, setIsAttesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!university) {
      alert("Университет не найден. Убедитесь, что база данных правильно инициализирована.");
      return;
    }

    setIsAttesting(true);
    setResult(null);

    try {
      const response = await onSubmit({
        universityId: university._id,
        universityName: university.name,
      });
      setResult(response);
    } catch (error: any) {
      console.error("Не удалось аттестовать издателя:", error);
      setResult({ error: error.message || "Не удалось аттестовать издателя. Попробуйте снова." });
    } finally {
      setIsAttesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Аттестовать издателя</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Название университета
            </label>
            <input
              type="text"
              value={university?.name || ""}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 sm:text-sm"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ключ издателя (автоматически генерируется из кошелька)
            </label>
            <input
              type="text"
              value="Будет сгенерирован из адреса вашего кошелька"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 sm:text-sm"
              disabled
            />
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <p className="text-sm text-blue-800">
              <strong>Важно:</strong> Это аттестует ваш университет в блокчейне
              Arbitrum. Будет отправлена транзакция, и ключ издателя
              (адрес вашего кошелька) будет сохранен в блокчейне.
            </p>
          </div>
          
          {/* Result Message */}
          {result && (
            <div className={`rounded-lg p-4 ${
              result.error ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"
            }`}>
              {result.error ? (
                <p className="text-red-800">{result.error}</p>
              ) : (
                <div>
                  <p className="text-green-800 font-medium mb-2">✓ Издатель успешно аттестован!</p>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Ключ издателя:</strong> {result.publisherKey}</p>
                    <p><strong>Хеш транзакции:</strong> {result.txHash}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {result && !result.error ? "Закрыть" : "Отмена"}
            </button>
            {!result || result.error ? (
              <button
                onClick={handleSubmit}
                disabled={isAttesting}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isAttesting ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isAttesting ? "Аттестация..." : "Аттестовать в блокчейне"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
