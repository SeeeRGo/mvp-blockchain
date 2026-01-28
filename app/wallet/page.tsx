"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function WalletPortal() {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [accepting, setAccepting] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  
  // Query all users
  const users = useQuery(api.users.list) || [];
  
  // Query diplomas with batch information for selected user
  const diplomas = useQuery(
    api.diplomas.listWithBatchInfo,
    selectedUser ? { userId: selectedUser as any } : "skip"
  ) || [];
  
  const acceptDiploma = useMutation(api.wallet.acceptDiploma);
  
  const handleAccept = async (diplomaId: string) => {
    if (!selectedUser) return;
    
    setAccepting(diplomaId);
    try {
      await acceptDiploma({
        diplomaId: diplomaId as any,
        userId: selectedUser as any,
      });
    } catch (error) {
      console.error("Не удалось принять диплом:", error);
      alert("Не удалось принять диплом. Попробуйте снова.");
    } finally {
      setAccepting(null);
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
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "anchored":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Ожидает принятия";
      case "accepted":
        return "Принят";
      case "anchored":
        return "Закреплен в блокчейне";
      default:
        return status;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Портал кошелька
              </h1>
            </div>
            <nav className="flex items-center space-x-4">
              <a
                href="/university"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Портал университета
              </a>
              <a
                href="/verifier"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Портал верификатора
              </a>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* User Selection */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Выбрать пользователя</h2>
          <p className="text-sm text-gray-500 mb-4">
            Выберите пользователя для просмотра и управления его дипломами
          </p>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Выберите пользователя...</option>
            {users.map((user: any) => (
              <option key={user._id} value={user._id}>
                {user.email} {user.phone ? `(${user.phone})` : ""}
              </option>
            ))}
          </select>
          
          {users.length === 0 && (
            <p className="mt-4 text-sm text-gray-500">
              Пользователи не найдены. Сначала создайте пользователя через панель Convex или CLI.
            </p>
          )}
        </div>
        
        {/* Diplomas List */}
        {selectedUser && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Мои дипломы</h2>
              <span className="text-sm text-gray-500">
                {diplomas.length} диплом{diplomas.length !== 1 ? "ов" : ""}
              </span>
            </div>
            
            {diplomas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Дипломы для этого пользователя не найдены</p>
                <p className="text-sm text-gray-400 mt-2">
                  Дипломы появятся здесь после выдачи университетом
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {diplomas.map((diploma: any) => (
                  <div
                    key={diploma._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-lg">
                          {diploma.data?.studentName || "Неизвестный студент"}
                        </h3>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Степень:</span> {diploma.data?.degree}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Специальность:</span> {diploma.data?.specialty}
                          </p>
                          {diploma.data?.gpa && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Средний балл:</span> {diploma.data.gpa}
                            </p>
                          )}
                          {diploma.data?.diplomaNumber && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Номер диплома:</span> {diploma.data.diplomaNumber}
                            </p>
                          )}
                          {diploma.data?.issueDate && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Дата выдачи:</span> {new Date(diploma.data.issueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        
                        <div className="mt-3 flex flex-col gap-2">
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(diploma.status)}`}>
                              {getStatusText(diploma.status)}
                            </span>
                            
                            {diploma.status === "anchored" && diploma.batch?.txHash && (
                              <a
                                href={`https://sepolia.arbiscan.io/tx/${diploma.batch.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center font-medium"
                                title={`Просмотр транзакции ${diploma.batch.txHash} на Arbiscan`}
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Просмотр в блокчейне
                              </a>
                            )}
                          </div>
                          
                          {diploma.status === "anchored" && diploma.batch?.txHash && (
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">TX:</span>
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all flex-1">
                                {diploma.batch.txHash}
                              </code>
                              <button
                                onClick={() => handleCopyHash(diploma.batch.txHash)}
                                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border flex items-center flex-shrink-0"
                                title="Копировать хеш транзакции"
                              >
                                {copiedHash === diploma.batch.txHash ? (
                                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                )}
                              </button>
                              <a
                                href={`https://sepolia.arbiscan.io/tx/${diploma.batch.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-green-600 hover:text-green-800 flex items-center flex-shrink-0"
                                title="Открыть в новой вкладке"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {diploma.status === "pending" && (
                        <div className="ml-4">
                          <button
                            onClick={() => handleAccept(diploma._id)}
                            disabled={accepting === diploma._id}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                          >
                            {accepting === diploma._id ? "Принятие..." : "Принять диплом"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Instructions */}
        {!selectedUser && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Как использовать портал кошелька
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Выберите пользователя из выпадающего списка выше</li>
                    <li>Просмотрите все дипломы, выданные этому пользователю</li>
                    <li>Примите ожидающие дипломы для включения закрепления в блокчейне</li>
                    <li>После принятия дипломы будут включены в следующий цикл закрепления пакета</li>
                    <li>После закрепления вы можете проверить дипломы в блокчейне</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
