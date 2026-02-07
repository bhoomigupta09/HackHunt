import React, { useState } from "react";
import { Plus, Edit2, Trash2, Eye, Calendar, Users, MapPin } from "lucide-react";

const ManageHackathons = ({ user }) => {
  const [hackathons, setHackathons] = useState([
    {
      id: 1,
      title: "Web Dev Challenge 2026",
      description: "Build amazing web applications",
      startDate: "2026-02-15",
      endDate: "2026-02-17",
      location: "Virtual",
      participants: 45,
      maxParticipants: 100,
      status: "active",
      prize: "$5000"
    },
    {
      id: 2,
      title: "AI Innovation Summit",
      description: "Explore AI and machine learning innovations",
      startDate: "2026-03-01",
      endDate: "2026-03-03",
      location: "San Francisco, CA",
      participants: 38,
      maxParticipants: 80,
      status: "active",
      prize: "$10000"
    },
    {
      id: 3,
      title: "Mobile App Sprint",
      description: "Create mobile apps in 24 hours",
      startDate: "2026-01-10",
      endDate: "2026-01-11",
      location: "Virtual",
      participants: 62,
      maxParticipants: 120,
      status: "completed",
      prize: "$3000"
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    maxParticipants: "",
    prize: ""
  });

  const handleOpenForm = (hackathon = null) => {
    if (hackathon) {
      setEditingId(hackathon.id);
      setFormData({
        title: hackathon.title,
        description: hackathon.description,
        startDate: hackathon.startDate,
        endDate: hackathon.endDate,
        location: hackathon.location,
        maxParticipants: hackathon.maxParticipants,
        prize: hackathon.prize
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        location: "",
        maxParticipants: "",
        prize: ""
      });
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitForm = () => {
    if (editingId) {
      // Update existing hackathon
      setHackathons((prev) =>
        prev.map((h) =>
          h.id === editingId
            ? { ...h, ...formData }
            : h
        )
      );
    } else {
      // Create new hackathon
      setHackathons((prev) => [
        ...prev,
        {
          id: Math.max(...prev.map((h) => h.id), 0) + 1,
          ...formData,
          participants: 0,
          status: "active"
        }
      ]);
    }
    setShowModal(false);
  };

  const handleDeleteHackathon = (id) => {
    if (window.confirm("Are you sure you want to delete this hackathon?")) {
      setHackathons((prev) => prev.filter((h) => h.id !== id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Manage Hackathons</h3>
          <p className="text-gray-600 mt-1">Create, edit, and manage your hackathons</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition duration-200"
        >
          <Plus size={18} />
          <span>New Hackathon</span>
        </button>
      </div>

      {/* Hackathons List */}
      <div className="grid grid-cols-1 gap-4">
        {hackathons.length > 0 ? (
          hackathons.map((hackathon) => (
            <div
              key={hackathon.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition duration-200"
            >
              {/* Title and Status */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-800">{hackathon.title}</h4>
                  <p className="text-gray-600 text-sm mt-1">{hackathon.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(hackathon.status)}`}>
                  {hackathon.status}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {/* Date */}
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar size={16} className="text-orange-500" />
                  <div className="text-sm">
                    <p className="font-medium">{new Date(hackathon.startDate).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">Start Date</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin size={16} className="text-orange-500" />
                  <div className="text-sm">
                    <p className="font-medium">{hackathon.location}</p>
                    <p className="text-xs text-gray-500">Location</p>
                  </div>
                </div>

                {/* Participants */}
                <div className="flex items-center space-x-2 text-gray-600">
                  <Users size={16} className="text-orange-500" />
                  <div className="text-sm">
                    <p className="font-medium">{hackathon.participants}/{hackathon.maxParticipants}</p>
                    <p className="text-xs text-gray-500">Participants</p>
                  </div>
                </div>

                {/* Prize */}
                <div className="text-sm">
                  <p className="font-medium text-gray-800">{hackathon.prize}</p>
                  <p className="text-xs text-gray-500">Prize Pool</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full"
                    style={{ width: `${(hackathon.participants / hackathon.maxParticipants) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round((hackathon.participants / hackathon.maxParticipants) * 100)}% filled
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                <button className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                  <Eye size={16} />
                  <span className="text-sm">View</span>
                </button>
                <button
                  onClick={() => handleOpenForm(hackathon)}
                  className="flex items-center space-x-1 px-3 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                >
                  <Edit2 size={16} />
                  <span className="text-sm">Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteHackathon(hackathon.id)}
                  className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={16} />
                  <span className="text-sm">Delete</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No hackathons yet. Create your first one!</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-800">
                {editingId ? "Edit Hackathon" : "Create New Hackathon"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hackathon Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Web Dev Challenge 2026"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your hackathon"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Virtual or City, Country"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Max Participants and Prize */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Participants *
                  </label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    placeholder="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prize Pool
                  </label>
                  <input
                    type="text"
                    name="prize"
                    value={formData.prize}
                    onChange={handleInputChange}
                    placeholder="e.g., $5000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex space-x-2 justify-end sticky bottom-0 bg-white">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitForm}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition"
              >
                {editingId ? "Update" : "Create"} Hackathon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageHackathons;
