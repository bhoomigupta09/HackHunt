import React from 'react';
import { Link } from 'react-router-dom';

import { Rocket, User, Settings2, ShieldCheck, UserPlus, Hammer } from 'lucide-react';
import NavbarDropdownButton from '../NavbarDropdownButton';


const Header = () => {
  // prepare menu items for login and signup
  const loginItems = [
    {
      href: '/login-user',
      icon: <User className="h-5 w-5 text-purple-600" />, // user icon
      iconBg: 'bg-purple-100',
      title: 'Login as User',
      description: 'Explore and join hackathons',
    },
    {
      href: '/login-organizer',
      icon: <Settings2 className="h-5 w-5 text-purple-600" />,
      iconBg: 'bg-purple-100',
      title: 'Login as Organizer',
      description: 'Manage your hackathons',
    },
    {
      href: '/login-admin',
      icon: <ShieldCheck className="h-5 w-5 text-purple-600" />,
      iconBg: 'bg-purple-100',
      title: 'Login as Admin',
      description: 'System administration',
    },
  ];

  const signupItems = [
    {
      href: '/signup-user',
      icon: <UserPlus className="h-5 w-5 text-purple-600" />,
      iconBg: 'bg-purple-100',
      title: 'Sign up as User',
      description: 'Explore and join hackathons',
    },
    {
      href: '/signup-organizer',
      icon: <Hammer className="h-5 w-5 text-purple-600" />,
      iconBg: 'bg-purple-100',
      title: 'Sign up as Organizer',
      description: 'Organize hackathons',
    },
  ];

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
          <nav className="flex items-center space-x-4 overflow-visible">
            <NavbarDropdownButton label="Login" items={loginItems} variant="filled" />
            <NavbarDropdownButton label="Sign up" items={signupItems} variant="filled" />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
