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

  // Query to get university by name
  const university = useQuery(api.universities.getByName, { name: "Demo University" });
  
  // Mutation to create diploma
  const createDiploma = useMutation(api.universities.createDiploma);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Check if university exists
      if (!university) {
        setError("Demo university not found. Please ensure the database is properly initialized.");
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
      setError("Failed to create diploma. Please try again.");
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
              ← Back to Home
            </Link>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Diploma Created Successfully!</h2>
              <p className="text-gray-600">Your diploma has been issued and is ready to be anchored to the blockchain.</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Diploma Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Student Name:</span>
                  <span className="font-medium">{formData.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Degree:</span>
                  <span className="font-medium">{formData.degree}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Specialty:</span>
                  <span className="font-medium">{formData.specialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Diploma Number:</span>
                  <span className="font-medium">{formData.diplomaNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Diploma ID:</span>
                  <span className="font-medium text-sm text-blue-600">{createdDiploma}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">Verification Information</h4>
              <p className="text-sm text-blue-800 mb-2">
                You can verify this diploma using either:
              </p>
              <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                <li><strong>Diploma ID:</strong> {createdDiploma}</li>
                <li><strong>Diploma Hash:</strong> (Use the hash from the diploma details)</li>
              </ul>
              <p className="text-sm text-blue-800 mt-2">
                Copy the Diploma ID above and paste it in the verification page to find your diploma.
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong> The diploma will be automatically included in the next batch anchoring process.
                Once anchored, it will be permanently stored on the blockchain and can be verified by anyone.
              </p>
            </div>

            <div className="flex gap-4">
              <Link
                href="/"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors text-center"
              >
                Back to Home
              </Link>
              <Link
                href="/verify"
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
              >
                Verify Diploma
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
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📤</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Diploma</h2>
            <p className="text-gray-600">Fill in the details below to issue a new diploma</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                Student Name *
              </label>
              <input
                type="text"
                id="studentName"
                required
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter student's full name"
              />
            </div>

            <div>
              <label htmlFor="studentEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Student Email *
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
                Degree *
              </label>
              <input
                type="text"
                id="degree"
                required
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., Bachelor of Science"
              />
            </div>

            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-2">
                Specialty *
              </label>
              <input
                type="text"
                id="specialty"
                required
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., Computer Science"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date *
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
                  Graduation Date *
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
                  GPA
                </label>
                <input
                  type="text"
                  id="gpa"
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., 3.8"
                />
              </div>

              <div>
                <label htmlFor="diplomaNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Diploma Number *
                </label>
                <input
                  type="text"
                  id="diplomaNumber"
                  required
                  value={formData.diplomaNumber}
                  onChange={(e) => setFormData({ ...formData, diplomaNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., DIP-2024-001"
                />
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> After creating the diploma, it will be automatically included in the next batch
                anchoring process. Once anchored, it will be permanently stored on the blockchain.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating Diploma..." : "Create Diploma"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
