"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";

export default function UploadDiploma() {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [createdDiploma, setCreatedDiploma] = useState<any>(null);
  const [diplomaHash, setDiplomaHash] = useState<string>("");

  // Query to get university by name
  const university = useQuery(api.universities.getByName, { name: "Demo University" });
  
  // Mutation to create diploma
  const createDiploma = useMutation(api.universities.createDiploma);
  
  // Query to get diploma with batch information (to retrieve hash and transaction info after creation)
  // Only call the query when createdDiploma is not null
  const diploma = useQuery(api.diplomas.getDiplomaWithBatch, createdDiploma ? { diplomaId: createdDiploma } : "skip");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Check if university exists
      if (!university) {
        setError("Демонстрационный университет не найден. Убедитесь, что база данных правильно инициализирована.");
        setIsSubmitting(false);
        return;
      }

      const result = await createDiploma({
        universityId: university._id,
        ownerEmail: formData.studentEmail,
        data: formData,
      });

      setCreatedDiploma(result);
      setSuccess(true);
    } catch (err) {
      setError("Не удалось создать диплом. Попробуйте снова.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success && createdDiploma) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Вернуться на главную
            </Link>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Диплом успешно создан!</h2>
              <p className="text-gray-600">Ваш диплом выдан и готов к закреплению на блокчейне.</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Детали диплома</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Имя студента:</span>
                  <span className="font-medium">{formData.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Степень:</span>
                  <span className="font-medium">{formData.degree}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Специальность:</span>
                  <span className="font-medium">{formData.specialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Номер диплома:</span>
                  <span className="font-medium">{formData.diplomaNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ID диплома:</span>
                  <span className="font-medium text-sm text-blue-600">{createdDiploma}</span>
                </div>
                {diploma && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Хеш диплома:</span>
                      <span className="font-medium text-sm text-blue-600">{diploma.diplomaHash}</span>
                    </div>
                    {diploma.batch && diploma.batch.txHash && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Транзакция блокчейна:</span>
                        <a
                          href={`https://sepolia.arbiscan.io/tx/${diploma.batch.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          {diploma.batch.txHash.slice(0, 10)}...{diploma.batch.txHash.slice(-8)}
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">Информация для верификации</h4>
              <p className="text-sm text-blue-800 mb-2">
                Вы можете проверить этот диплом, используя:
              </p>
              <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                <li><strong>ID диплома:</strong> {createdDiploma}</li>
                {diploma && (
                  <>
                    <li><strong>Хеш диплома:</strong> {diploma.diplomaHash}</li>
                    {diploma.batch && diploma.batch.txHash && (
                      <li>
                        <strong>Транзакция блокчейна:</strong>{" "}
                        <a
                          href={`https://sepolia.arbiscan.io/tx/${diploma.batch.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {diploma.batch.txHash.slice(0, 10)}...{diploma.batch.txHash.slice(-8)}
                        </a>
                      </li>
                    )}
                  </>
                )}
              </ul>
              <p className="text-sm text-blue-800 mt-2">
                Скопируйте ID или хеш диплома выше и вставьте на странице верификации, чтобы найти ваш диплом.
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Следующие шаги:</strong> Диплом будет автоматически включен в следующий процесс закрепления пакета.
                После закрепления он будет постоянно храниться в блокчейне и может быть проверен кем угодно.
              </p>
            </div>

            <div className="flex gap-4">
              <Link
                href="/"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors text-center"
              >
                Вернуться на главную
              </Link>
              <Link
                href="/verify"
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
              >
                Проверить диплом
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Вернуться на главную
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📤</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Загрузить диплом</h2>
            <p className="text-gray-600">Заполните детали ниже для выдачи нового диплома</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                Имя студента *
              </label>
              <input
                type="text"
                id="studentName"
                required
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Введите полное имя студента"
              />
            </div>

            <div>
              <label htmlFor="studentEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email студента *
              </label>
              <input
                type="email"
                id="studentEmail"
                required
                value={formData.studentEmail}
                onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="student@example.com"
              />
            </div>

            <div>
              <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-2">
                Степень *
              </label>
              <input
                type="text"
                id="degree"
                required
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="например, Бакалавр наук"
              />
            </div>

            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-2">
                Специальность *
              </label>
              <input
                type="text"
                id="specialty"
                required
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="например, Информатика"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Дата выдачи *
                </label>
                <input
                  type="date"
                  id="issueDate"
                  required
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="graduationDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Дата окончания *
                </label>
                <input
                  type="date"
                  id="graduationDate"
                  required
                  value={formData.graduationDate}
                  onChange={(e) => setFormData({ ...formData, graduationDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="gpa" className="block text-sm font-medium text-gray-700 mb-2">
                  Средний балл
                </label>
                <input
                  type="text"
                  id="gpa"
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="например, 3.8"
                />
              </div>

              <div>
                <label htmlFor="diplomaNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Номер диплома *
                </label>
                <input
                  type="text"
                  id="diplomaNumber"
                  required
                  value={formData.diplomaNumber}
                  onChange={(e) => setFormData({ ...formData, diplomaNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="например, DIP-2024-001"
                />
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <p className="text-sm text-blue-800">
                <strong>Примечание:</strong> После создания диплом будет автоматически включен в следующий процесс
                закрепления пакета. После закрепления он будет постоянно храниться в блокчейне.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Создание диплома..." : "Создать диплом"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
