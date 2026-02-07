import React, { useState, useEffect } from "react";
import { apiClient } from "../../api/client";
import { Trash2, ExternalLink, AlertCircle } from "lucide-react";

const RegisteredHackathons = ({ user }) => {
  const [registeredHackathons, setRegisteredHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchRegisteredHackathons();
  }, []);

  const fetchRegisteredHackathons = async () => {
    try {
      setLoading(true);
      setError("");

      // For now, use mock data - later connect to real API
      const mockRegistrations = [
        {
          _id: "reg1",
          hackathonId: "1",
          hackathonName: "TechVision 2026",
          registrationDate: "2026-01-10",
          status: "registered",
          startDate: "2026-02-15",
          endDate: "2026-02-17",
          teamName: "Innovation Squad",
          teamMembers: 4,
          location: "San Francisco, CA"
        },
        {
          _id: "reg2",
          hackathonId: "3",
          hackathonName: "Web Dev Marathon",
          registrationDate: "2026-01-05",
          status: "in_progress",
          startDate: "2026-01-25",
          endDate: "2026-01-26",
          teamName: "Code Warriors",
          teamMembers: 3,
          location: "Remote"
        }
      ];

      setRegisteredHackathons(mockRegistrations);
    } catch (err) {
      setError("Failed to load registrations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async (registrationId) => {
    if (!window.confirm("Are you sure you want to unregister from this hackathon?")) {
      return;
    }

    try {
      // TODO: Call API to unregister
      setRegisteredHackathons((prev) =>
        prev.filter((reg) => reg._id !== registrationId)
      );
      setSuccess("Successfully unregistered from hackathon");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to unregister");
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading registrations...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-semibold">Total Registrations</div>
          <div className="text-3xl font-bold text-blue-900 mt-2">
            {registeredHackathons.length}
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-semibold">Active</div>
          <div className="text-3xl font-bold text-purple-900 mt-2">
            {registeredHackathons.filter((r) => r.status === "in_progress").length}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 font-semibold">Upcoming</div>
          <div className="text-3xl font-bold text-green-900 mt-2">
            {registeredHackathons.filter((r) => r.status === "registered").length}
          </div>
        </div>
      </div>

      {/* Registrations List */}
      {registeredHackathons.length > 0 ? (
        <div className="space-y-4">
          {registeredHackathons.map((registration) => (
            <div
              key={registration._id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Title and Status */}
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-800">
                      {registration.hackathonName}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        registration.status === "in_progress"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {registration.status === "in_progress" ? "🔴 In Progress" : "📅 Upcoming"}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Left Column */}
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Registered On
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {new Date(registration.registrationDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Hackathon Dates
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {new Date(registration.startDate).toLocaleDateString()} -{" "}
                          {new Date(registration.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Location
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {registration.location}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Team Information
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {registration.teamName} ({registration.teamMembers} members)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Team Members Status */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-600 mb-2">Team Members: </p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: registration.teamMembers }).map((_, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 bg-purple-300 rounded-full flex items-center justify-center text-xs font-bold text-purple-900"
                        >
                          +
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="ml-4 flex flex-col space-y-2">
                  <button className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 text-sm font-semibold">
                    <ExternalLink size={16} />
                    <span>View Details</span>
                  </button>

                  <button
                    onClick={() => handleUnregister(registration._id)}
                    className="flex items-center space-x-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition duration-200 text-sm font-semibold"
                  >
                    <Trash2 size={16} />
                    <span>Unregister</span>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 mt-4 pt-4">
                <p className="text-xs text-gray-500">
                  Registration ID: <code className="bg-gray-100 px-2 py-1 rounded">{registration._id}</code>
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No registrations yet</p>
          <p className="text-gray-500 text-sm mt-2">
            Browse hackathons and register for one to get started!
          </p>
        </div>
      )}
    </div>
  );
};

export default RegisteredHackathons;
