import React, { useState, useMemo } from 'react';
import {
  Search,
  Loader2,
  Zap
} from 'lucide-react';
import HackathonCard from '../components/HackathonCard';
import SearchAndFilter from '../components/SearchAndFilter';
import { useHackathons, useHackathonStats } from '../hooks/useHackathons';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const filters = useMemo(
  () => ({
    searchTerm: searchTerm || "",
    status: selectedStatus || "",
    type: selectedType || ""
  }),
  [searchTerm, selectedStatus, selectedType]
);

  const {
    hackathons,
    total,
    loading: hackathonsLoading,
    error: hackathonsError
  } = useHackathons(filters);

  const {
    stats,
    loading: statsLoading,
    error: statsError
  } = useHackathonStats();

  const defaultStats = {
    total: 0,
    upcoming: 0,
    ongoing: 0,
    ended: 0,
    totalPrize: '$0'
  };

  const displayStats = stats || defaultStats;

  if (hackathonsError || statsError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-12 w-12 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-600 mb-4">
            {hackathonsError || statsError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Hero Section with Enhanced Background */}
      <div className="relative overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="mb-8 inline-block">
            <div className="flex items-center justify-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Discover Amazing Opportunities</span>
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6">
            <span className="text-gray-900">Find</span>
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent block">Hackathons</span>
            <span className="text-gray-600 text-3xl sm:text-4xl md:text-5xl font-semibold block mt-2">that Match Your Passion</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
            Explore and participate in hackathons from top platforms worldwide. Build innovative solutions, connect with fellow developers, and unleash your potential.
          </p>

          <div className="flex justify-center mt-6">
  <a
    href="#hackathons"
    className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
  >
    Explore Hackathons
  </a>

          </div>
        </div>
      </div>

      {/* Hackathons List Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="hackathons">
        <div id="filter" className="mb-8">
          <SearchAndFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
          />
        </div>

        {/* Results */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {hackathonsLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading Hackathons...
              </div>
            ) : total === hackathons.length ? (
              'All Hackathons'
            ) : (
              `Found ${hackathons.length} hackathon${
                hackathons.length !== 1 ? 's' : ''
              }`
            )}
          </h2>
          <p className="text-gray-600">
            {hackathonsLoading
              ? 'Fetching the latest hackathons...'
              : 'Showing the latest hackathons from various platforms'}
          </p>
        </div>

        {/* Hackathon Grid */}
        {hackathonsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
              >
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : hackathons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathons.map((hackathon) => (
              <HackathonCard key={hackathon.id} hackathon={hackathon} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hackathons found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
