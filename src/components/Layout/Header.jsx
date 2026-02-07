import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { ChevronDown, Rocket } from 'lucide-react';


const Header = () => {
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [signupDropdownOpen, setSignupDropdownOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo only */}
          <div className="flex items-center">
         <Link to="/" className="flex items-center space-x-2 group">
  <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg group-hover:scale-105 transition-transform duration-200">
    <Rocket className="h-5 w-5 text-white" />
  </div>

  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
    HackHunt
  </span>
</Link>
          </div>

          {/* Right side - Login and Sign up */}
          <nav className="flex items-center space-x-4">
            {/* Login Dropdown */}
            <div className="relative group">
              <button
                onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                className="flex items-center space-x-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                <span>Login</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${loginDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {loginDropdownOpen && (
                <div className="absolute top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 right-0">
                  <Link
                    to="/login-user"
                    onClick={() => setLoginDropdownOpen(false)}
                    className="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-t-lg transition-colors duration-200 border-b border-gray-100"
                  >
                    <span className="font-medium">👤 Login as User</span>
                    <p className="text-xs text-gray-500">Explore and join hackathons</p>
                  </Link>
                  <Link
                    to="/login-organizer"
                    onClick={() => setLoginDropdownOpen(false)}
                    className="block px-4 py-3 text-gray-700 hover:bg-purple-50 transition-colors duration-200 border-b border-gray-100"
                  >
                    <span className="font-medium">⚙️ Login as Organizer</span>
                    <p className="text-xs text-gray-500">Manage your hackathons</p>
                  </Link>
                  <Link
                    to="/login-admin"
                    onClick={() => setLoginDropdownOpen(false)}
                    className="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-b-lg transition-colors duration-200"
                  >
                    <span className="font-medium">🛡️ Login as Admin</span>
                    <p className="text-xs text-gray-500">System administration</p>
                  </Link>
                </div>
              )}
            </div>

            {/* Sign up Dropdown */}
            <div className="relative group">
              <button
                onClick={() => setSignupDropdownOpen(!signupDropdownOpen)}
                className="flex items-center space-x-1 px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors duration-200"
              >
                <span>Sign up</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${signupDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {signupDropdownOpen && (
                <div className="absolute top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 right-0">
                  <Link
                    to="/signup-user"
                    onClick={() => setSignupDropdownOpen(false)}
                    className="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-t-lg transition-colors duration-200 border-b border-gray-100"
                  >
                    <span className="font-medium">👤 Sign up as User</span>
                    <p className="text-xs text-gray-500">Explore and join hackathons</p>
                  </Link>
                  <Link
                    to="/signup-organizer"
                    onClick={() => setSignupDropdownOpen(false)}
                    className="block px-4 py-3 text-gray-700 hover:bg-purple-50 transition-colors duration-200 border-b border-gray-100"
                  >
                    <span className="font-medium">⚙️ Sign up as Organizer</span>
                    <p className="text-xs text-gray-500">Organize hackathons</p>
                  </Link>
                  
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
