import React, { useState, useEffect } from "react";
import { apiClient } from "../../api/client";
import { Search, Filter, Calendar, MapPin, Users } from "lucide-react";

const BrowseHackathons = ({ user }) => {
  const [hackathons, setHackathons] = useState([]);
  const [filteredHackathons, setFilteredHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchHackathons();
  }, []);

  useEffect(() => {
    filterHackathons();
  }, [hackathons, searchTerm, filterStatus]);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      setError("");

      // For now, use mock data - later connect to real API
      const mockHackathons = [
        {
          _id: "1",
          name: "TechVision 2026",
          description: "Build innovative web applications",
          startDate: "2026-02-15",
          endDate: "2026-02-17",
          location: "San Francisco, CA",
          image: "https://via.placeholder.com/300x200?text=TechVision",
          status: "upcoming",
          participants: 250,
          prize: "$50,000"
        },
        {
          _id: "2",
          name: "AI Challenge",
          description: "Create AI solutions for real-world problems",
          startDate: "2026-03-01",
          endDate: "2026-03-03",
          location: "New York, NY",
          image: "https://via.placeholder.com/300x200?text=AIChallenge",
          status: "upcoming",
          participants: 180,
          prize: "$75,000"
        },
        {
          _id: "3",
          name: "Web Dev Marathon",
          description: "24-hour web development competition",
          startDate: "2026-01-25",
          endDate: "2026-01-26",
          location: "Remote",
          image: "https://via.placeholder.com/300x200?text=WebDev",
          status: "live",
          participants: 450,
          prize: "$30,000"
        },
        {
          _id: "4",
          name: "Mobile Apps Expo",
          description: "Build the next big mobile application",
          startDate: "2026-02-28",
          endDate: "2026-03-02",
          location: "Austin, TX",
          image: "https://via.placeholder.com/300x200?text=MobileApps",
          status: "upcoming",
          participants: 320,
          prize: "$40,000"
        }
      ];

      setHackathons(mockHackathons);
    } catch (err) {
      setError("Failed to load hackathons");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterHackathons = () => {
    let filtered = hackathons;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((h) =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((h) => h.status === filterStatus);
    }

    setFilteredHackathons(filtered);
  };

  if (loading) {
    return <div className="text-center py-10">Loading hackathons...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search hackathons by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-600" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Hackathons</option>
              <option value="live">Live Now</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Found {filteredHackathons.length} hackathon
          {filteredHackathons.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Hackathons Grid */}
      {filteredHackathons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHackathons.map((hackathon) => (
            <div
              key={hackathon._id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition duration-200"
            >
              {/* Image */}
              <img
                src={hackathon.image}
                alt={hackathon.name}
                className="w-full h-40 object-cover"
              />

              {/* Status Badge */}
              <div className="absolute top-2 right-2 mt-2 mr-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    hackathon.status === "live"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {hackathon.status === "live" ? "🔴 Live" : "📅 Upcoming"}
                </span>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {hackathon.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {hackathon.description}
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-2 border-t border-b border-gray-200 py-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <Calendar size={16} />
                    <span>
                      {new Date(hackathon.startDate).toLocaleDateString()} -{" "}
                      {new Date(hackathon.endDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <MapPin size={16} />
                    <span>{hackathon.location}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <Users size={16} />
                    <span>{hackathon.participants} Participants</span>
                  </div>
                </div>

                {/* Prize and Button */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-600">
                      {hackathon.prize}
                    </span>
                    <span className="text-xs text-gray-500">Prize Pool</span>
                  </div>

                  <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition duration-200 font-semibold">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No hackathons found</p>
          <p className="text-gray-500 text-sm mt-2">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default BrowseHackathons;
