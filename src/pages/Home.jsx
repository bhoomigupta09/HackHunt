import React, { useState, useMemo } from 'react';
import {
  Search,
  Loader2,
  Sparkles
} from 'lucide-react';
import HackathonCard from '../components/HackathonCard';
import SearchAndFilter from '../components/SearchAndFilter';
import WhyChooseHackHunt from '../components/WhyChooseHackHunt';
import { useHackathons, useHackathonStats } from '../hooks/useHackathons';

// local assets
import heroImage from '../assets/hero.png';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const filters = useMemo(
    () => ({
      searchTerm: searchTerm || '',
      status: selectedStatus || '',
      type: selectedType || ''
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-purple-200/30 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-48 w-48 rounded-full bg-indigo-200/30 blur-3xl" />
        </div>

        <style jsx>{`
          @keyframes fade-up {
            from {
              opacity: 0;
              transform: translateY(24px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-up {
            animation: fade-up 0.8s ease-out both;
          }
          .animate-fade-up-delayed {
            animation: fade-up 1s ease-out 0.12s both;
          }
        `}</style>

        <div className="max-w-7xl mx-auto px-6">
          <div className="flex min-h-[calc(100vh-88px)] flex-col items-center justify-between gap-12 py-16 md:flex-row md:gap-16 md:py-24">
            <div className="animate-fade-up flex w-full max-w-xl flex-col items-start justify-center text-left md:w-[45%]">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1 text-sm font-medium text-purple-600 shadow-sm">
                <Sparkles className="h-4 w-4" />
                Discover amazing opportunities
              </div>

              <div className="mt-6 space-y-5">
              <h1 className="max-w-lg text-5xl font-extrabold leading-tight tracking-[-0.04em] text-slate-900 md:text-6xl lg:text-7xl">
                Discover
                <span className="mt-2 block bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  Hackathons
                </span>
              </h1>

              <p className="mt-2 text-lg font-medium text-slate-700 md:text-xl">
                Build. Compete. Win.
              </p>

              <p className="max-w-lg text-base leading-relaxed text-gray-600 md:text-lg">
                Explore and participate in hackathons from top platforms worldwide.
                Build innovative solutions, connect with fellow developers, and
                turn your next idea into something worth shipping.
              </p>
              </div>

              <div className="mt-6 flex items-center">
                <a
                  href="#hackathons"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition duration-300 hover:scale-105 hover:bg-blue-700"
                >
                  Explore Hackathons
                  <span className="ml-2" aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>

            <div className="animate-fade-up-delayed flex w-full justify-center md:w-[55%] md:justify-end">
              <div className="group relative w-full">
                <div className="absolute inset-y-10 right-0 hidden w-[88%] rounded-full bg-gradient-to-r from-blue-200/40 via-purple-200/40 to-indigo-200/40 blur-3xl md:block" />
                <img
                  src={heroImage}
                  alt="Team collaborating"
                  className="relative h-auto w-full max-w-none object-contain transition duration-300 group-hover:scale-105 md:scale-110 md:translate-x-6 lg:scale-[1.18]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <WhyChooseHackHunt />

      {/* Hackathons List Section */}
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        id="hackathons"
      >
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
