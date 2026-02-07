import React, { useState } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";

const HackathonApprovals = () => {
  const [hackathons, setHackathons] = useState([
    {
      id: 1,
      name: "AI Hackathon",
      organizer: "Google",
      participants: 120,
      status: "pending"
    },
    {
      id: 2,
      name: "Web3 Hackathon",
      organizer: "Ethereum",
      participants: 85,
      status: "approved"
    },
    {
      id: 3,
      name: "Open Source Sprint",
      organizer: "GitHub",
      participants: 40,
      status: "rejected"
    },
    {
      id: 4,
      name: "Cloud Computing Challenge",
      organizer: "AWS",
      participants: 95,
      status: "pending"
    }
  ]);

  const handleApprove = (id) => {
    setHackathons(
      hackathons.map((h) =>
        h.id === id ? { ...h, status: "approved" } : h
      )
    );
  };

  const handleReject = (id) => {
    setHackathons(
      hackathons.map((h) =>
        h.id === id ? { ...h, status: "rejected" } : h
      )
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
            <Clock size={16} />
            <span>Pending</span>
          </div>
        );
      case "approved":
        return (
          <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
            <CheckCircle size={16} />
            <span>Approved</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center space-x-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
            <XCircle size={16} />
            <span>Rejected</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Hackathon Approvals</h3>
      
      <div className="space-y-3">
        {hackathons.map((hackathon) => (
          <div
            key={hackathon.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex-1">
              <h4 className="font-bold text-gray-900">{hackathon.name}</h4>
              <p className="text-sm text-gray-600">Organiser: {hackathon.organizer}</p>
              <p className="text-sm text-gray-600">Participants: {hackathon.participants}</p>
            </div>

            <div className="flex items-center space-x-3">
              {getStatusBadge(hackathon.status)}

              {hackathon.status === "pending" && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprove(hackathon.id)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors duration-200"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(hackathon.id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors duration-200"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HackathonApprovals;
