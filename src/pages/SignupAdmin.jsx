import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiClient } from "../api/client";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

const SignupAdmin = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    adminLevel: "moderator",
    department: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setErrors([]);
    setLoading(true);

    try {
      const response = await apiClient.signup(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.phoneNumber,
        "admin",
        null,
        {
          adminLevel: formData.adminLevel,
          department: formData.department
        }
      );

      if (response.userId) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userId", response.userId);
        localStorage.setItem("userName", formData.firstName);
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("userEmail", formData.email);
        navigate("/admin");
      }
    } catch (err) {
      const errorMessage = err.message || "Signup failed. Please try again.";
      if (Array.isArray(err.errors)) {
        setErrors(err.errors);
      } else {
        setError(errorMessage);
      }
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-600 text-white text-2xl">
            🛡️
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Registration</h1>
          <p className="text-gray-600 mt-2">Platform administrator account</p>
        </div>

        {/* Security Warning */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
          <div className="flex">
            <AlertCircle className="text-yellow-600 mr-3 flex-shrink-0" size={20} />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Admin Access Only</h3>
              <p className="text-xs text-yellow-700 mt-1">
                Admin accounts are restricted to platform administrators only. Unauthorized access attempts are logged.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm space-y-1">
              {errors.map((err, idx) => (
                <div key={idx}>• {err}</div>
              ))}
            </div>
          )}

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              disabled={loading}
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Administrator"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@platform.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              disabled={loading}
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number (10 digits)
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="1234567890"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Level
            </label>
            <select
              name="adminLevel"
              value={formData.adminLevel}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              disabled={loading}
            >
              <option value="moderator">Moderator</option>
              <option value="support">Support</option>
              <option value="super_admin">Super Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Platform Operations"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Min 8 chars with uppercase, lowercase, number & special char (@$!%*?&)
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-2 rounded-lg hover:from-red-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 transition duration-200 font-semibold mt-6"
          >
            {loading ? "Creating Account..." : "Create Admin Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or sign up as</span>
          </div>
        </div>

        {/* Role Links */}
        <div className="space-y-2">
          <Link
            to="/signup-user"
            className="w-full block text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            👤 Sign up as User
          </Link>
          <Link
            to="/signup-organizer"
            className="w-full block text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            ⚙️ Sign up as Organizer
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          Already have an admin account?{" "}
          <Link to="/login-admin" className="text-red-600 hover:text-red-700 font-semibold">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupAdmin;
