"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function VerifierPortal() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showCreateRequest, setShowCreateRequest] = useState(false);

  // Query verification requests
  const requests = useQuery(api.verifiers.listVerificationRequests, { verifierId: "placeholder" as any });

  // Mutation
  const createRequest = useMutation(api.verifiers.createVerificationRequest);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Verifier Portal
              </h1>
            </div>
            <nav className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "dashboard"
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("requests")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "requests"
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Verification Requests
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === "dashboard" && (
          <Dashboard onCreateRequest={() => setShowCreateRequest(true)} />
        )}

        {activeTab === "requests" && (
          <RequestList
            requests={requests}
            onCreateRequest={() => setShowCreateRequest(true)}
          />
        )}
      </main>

      {/* Create Request Modal */}
      {showCreateRequest && (
        <CreateRequestModal
          onClose={() => setShowCreateRequest(false)}
          onSubmit={async (data) => {
            await createRequest.mutate(data);
            setShowCreateRequest(false);
          }}
        />
      )}
    </div>
  );
}

// Dashboard Component
function Dashboard({ onCreateRequest }: any) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Requests"
          value="24"
          icon="📋"
          color="purple"
        />
        <StatCard
          title="Approved"
          value="18"
          icon="✅"
          color="green"
        />
        <StatCard
          title="Pending"
          value="6"
          icon="⏳"
          color="yellow"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <button
          onClick={onCreateRequest}
          className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
        >
          <span className="mr-2">➕</span>
          Create Verification Request
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Verifications</h2>
        <div className="space-y-3">
          <ActivityItem
            title="Diploma verified for Ivan Ivanov"
            time="1 hour ago"
            status="completed"
          />
          <ActivityItem
            title="Verification request approved by owner"
            time="3 hours ago"
            status="completed"
          />
          <ActivityItem
            title="New verification request created"
            time="5 hours ago"
            status="pending"
          />
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color }: any) {
  const colorClasses = {
    purple: "bg-purple-50 text-purple-700",
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

// Request List Component
function RequestList({ requests, onCreateRequest }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Verification Requests
        </h2>
        <button
          onClick={onCreateRequest}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
        >
          Create Request
        </button>
      </div>

      {requests?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No verification requests yet</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests?.map((request: any) => (
                <tr key={request._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request._id.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(request.expiresAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-purple-600 hover:text-purple-900 mr-3">
                      View
                    </button>
                    {request.status === "approved" && (
                      <button className="text-green-600 hover:text-green-900">
                        View on Blockchain
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
    approved: { color: "bg-green-100 text-green-800", text: "Approved" },
    rejected: { color: "bg-red-100 text-red-800", text: "Rejected" },
    expired: { color: "bg-gray-100 text-gray-800", text: "Expired" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}>
      {config.text}
    </span>
  );
}

// Create Request Modal Component
function CreateRequestModal({ onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    diplomaHash: "",
    requestedFields: [] as string[],
    ttlSeconds: 3600, // 1 hour default
  });

  const availableFields = [
    { id: "studentName", label: "Student Name" },
    { id: "degree", label: "Degree" },
    { id: "specialty", label: "Specialty" },
    { id: "issueDate", label: "Issue Date" },
    { id: "graduationDate", label: "Graduation Date" },
    { id: "gpa", label: "GPA" },
    { id: "diplomaNumber", label: "Diploma Number" },
  ];

  const handleFieldToggle = (fieldId: string) => {
    if (formData.requestedFields.includes(fieldId)) {
      setFormData({
        ...formData,
        requestedFields: formData.requestedFields.filter((f) => f !== fieldId),
      });
    } else {
      setFormData({
        ...formData,
        requestedFields: [...formData.requestedFields, fieldId],
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Create Verification Request</h3>
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
              Diploma Hash
            </label>
            <input
              type="text"
              required
              value={formData.diplomaHash}
              onChange={(e) => setFormData({ ...formData, diplomaHash: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              placeholder="Enter the diploma hash"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requested Fields
            </label>
            <div className="space-y-2">
              {availableFields.map((field) => (
                <label key={field.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.requestedFields.includes(field.id)}
                    onChange={() => handleFieldToggle(field.id)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {field.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Access Duration (TTL)
            </label>
            <select
              value={formData.ttlSeconds.toString()}
              onChange={(e) =>
                setFormData({ ...formData, ttlSeconds: parseInt(e.target.value) })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            >
              <option value="3600">1 Hour</option>
              <option value="86400">24 Hours</option>
              <option value="604800">7 Days</option>
            </select>
          </div>
          <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
            <p className="text-sm text-purple-800">
              <strong>Important:</strong> The diploma owner will receive a
              notification and must explicitly approve sharing of the requested fields.
              Access will expire after the selected duration.
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
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
            >
              Create Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
