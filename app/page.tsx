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
                Загрузить диплом
              </Link>
              <Link
                href="/verify"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Проверить диплом
              </Link>
              <Link
                href="/university"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Портал университета
              </Link>
              <Link
                href="/wallet"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Портал кошелька
              </Link>
              <Link
                href="/verifier"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Портал верификатора
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Безопасная верификация дипломов на блокчейне
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Выпускайте, проверяйте и управляйте академическими дипломами с безопасностью и прозрачностью блокчейн-технологий.
            Предотвращайте мошенничество и обеспечивайте подлинность с неизменяемыми записями.
          </p>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link href="/upload">
              <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📤</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Загрузить диплом</h3>
                <p className="text-gray-600">
                  Выпустите новый диплом и закрепите его на блокчейне для постоянного, защищенного от подделки хранения.
                </p>
              </div>
            </Link>

            <Link href="/verify">
              <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-green-500">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Проверить диплом</h3>
                <p className="text-gray-600">
                  Проверьте подлинность любого диплома, сверив его хеш с блокчейном.
                </p>
              </div>
            </Link>
          </div>

          {/* Features Section */}
          <div className="mt-20">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">Как это работает</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">1</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Университет выдает диплом</h4>
                <p className="text-gray-600 text-sm">
                  Университеты создают и выдают цифровые дипломы с уникальными криптографическими хешами.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">2</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Закрепление на блокчейне</h4>
                <p className="text-gray-600 text-sm">
                  Дипломы группируются и закрепляются на блокчейне Arbitrum с использованием деревьев Меркла.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">3</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Мгновенная верификация</h4>
                <p className="text-gray-600 text-sm">
                  Любой может мгновенно проверить подлинность диплома, используя запись в блокчейне.
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
            © 2026 DiplomaChain.
          </p>
        </div>
      </footer>
    </div>
  );
}
