"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function UniversityPortal() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showCreateDiploma, setShowCreateDiploma] = useState(false);
  const [showAttestation, setShowAttestation] = useState(false);

  // Query university stats
  const stats = useQuery(api.universities.getStats, { universityId: "placeholder" as any });

  // Query diplomas
  const diplomas = useQuery(api.universities.listDiplomas, { universityId: "placeholder" as any });

  // Mutations
  const createDiploma = useMutation(api.universities.createDiploma);
  const attestPublisher = useMutation(api.universities.attestPublisher);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                University Portal
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
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("diplomas")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "diplomas"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Diplomas
              </button>
              <button
                onClick={() => setActiveTab("batches")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "batches"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Batches
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
            diplomas={diplomas}
            onCreateDiploma={() => setShowCreateDiploma(true)}
          />
        )}

        {activeTab === "batches" && <BatchList />}
      </main>

      {/* Create Diploma Modal */}
      {showCreateDiploma && (
        <CreateDiplomaModal
          onClose={() => setShowCreateDiploma(false)}
          onSubmit={async (data) => {
            await createDiploma.mutate(data);
            setShowCreateDiploma(false);
          }}
        />
      )}

      {/* Attestation Modal */}
      {showAttestation && (
        <AttestationModal
          onClose={() => setShowAttestation(false)}
          onSubmit={async (data) => {
            await attestPublisher.mutate(data);
            setShowAttestation(false);
          }}
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
          title="Total Diplomas"
          value={stats?.total || 0}
          icon="📜"
          color="blue"
        />
        <StatCard
          title="Pending Acceptance"
          value={stats?.pending || 0}
          icon="⏳"
          color="yellow"
        />
        <StatCard
          title="Anchored on Blockchain"
          value={stats?.anchored || 0}
          icon="✅"
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={onCreateDiploma}
            className="flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <span className="mr-2">📝</span>
            Create New Diploma
          </button>
          <button
            onClick={onAttestPublisher}
            className="flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <span className="mr-2">🔐</span>
            Attest Publisher
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <ActivityItem
            title="Diploma issued to Ivan Ivanov"
            time="2 hours ago"
            status="completed"
          />
          <ActivityItem
            title="Batch #123 anchored to blockchain"
            time="5 hours ago"
            status="completed"
          />
          <ActivityItem
            title="Publisher attested on-chain"
            time="1 day ago"
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
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Issued Diplomas</h2>
        <button
          onClick={onCreateDiploma}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Create Diploma
        </button>
      </div>

      {diplomas?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No diplomas issued yet</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Degree
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
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
                      View
                    </button>
                    {diploma.status === "anchored" && (
                      <button className="text-green-600 hover:text-green-900">
                        Verify on Blockchain
                      </button>
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
    pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
    accepted: { color: "bg-blue-100 text-blue-800", text: "Accepted" },
    anchored: { color: "bg-green-100 text-green-800", text: "Anchored" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}>
      {config.text}
    </span>
  );
}

// Batch List Component
function BatchList() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Batch Anchoring</h2>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500 text-center py-8">
          Batches are automatically created and anchored every hour.
          <br />
          Diplomas with status "accepted" will be included in the next batch.
        </p>
      </div>
    </div>
  );
}

// Create Diploma Modal Component
function CreateDiplomaModal({ onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    studentName: "",
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
          <h3 className="text-lg font-semibold">Create New Diploma</h3>
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
              Student Name
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
            <label className="block text-sm font-medium text-gray-700">Degree</label>
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
              Specialty
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
                Issue Date
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
                Graduation Date
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
              <label className="block text-sm font-medium text-gray-700">GPA</label>
              <input
                type="text"
                value={formData.gpa}
                onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Diploma Number
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
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Diploma
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Attestation Modal Component
function AttestationModal({ onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    publisherKey: "",
    universityName: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Attest Publisher</h3>
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
              University Name
            </label>
            <input
              type="text"
              required
              value={formData.universityName}
              onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Publisher Key (will be generated)
            </label>
            <input
              type="text"
              value={formData.publisherKey}
              onChange={(e) => setFormData({ ...formData, publisherKey: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 sm:text-sm"
              disabled
              placeholder="Auto-generated during attestation"
            />
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <p className="text-sm text-blue-800">
              <strong>Important:</strong> This will attest your university on the
              Arbitrum blockchain. A transaction will be submitted and the publisher key
              will be stored on-chain.
            </p>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Attest on Blockchain
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
