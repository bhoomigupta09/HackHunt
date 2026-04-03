import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiClient } from "../api/client";
import { isValidEmail } from "../utils/validation";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState("user");

  const navigate = useNavigate();

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam) {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!firstName || !email || !password) {
        setError("First name, email, and password are required");
        setLoading(false);
        return;
      }

      // Organization name required for organizers only (admins are created by system)
      if (role === 'organizer' && !organizationName) {
        setError("Organization name is required for organizer signup");
        setLoading(false);
        return;
      }

      // Admin signup requires phone number
      if (role === 'admin' && !phoneNumber) {
        setError("Phone number is required for admin registration");
        setLoading(false);
        return;
      }

      const emailValue = (email || "").trim().toLowerCase();
      if (!isValidEmail(emailValue)) {
        setError("Please provide a valid email address.");
        setLoading(false);
        return;
      }

      const payload = {
        email: emailValue,
        password,
        firstName,
        lastName,
        phoneNumber,
        role
      };
      if (role === "organizer") {
        payload.organizationName = organizationName;
      }
      if (role === "admin") {
        payload.adminLevel = "moderator";
        payload.department = "";
      }

      const response = await apiClient.sendSignupOtp(payload);

      if (response.success) {
        navigate("/verify-signup-otp", {
          state: { email: emailValue, role }
        });
      }
    } catch (err) {
      const errorMessage = err.message || "Signup failed. Please try again.";
      if (Array.isArray(err.errors) && err.errors.length) {
        setError(err.errors.join(" "));
      } else {
        setError(errorMessage);
      }
      console.error("Signup error:", err);
      
      // Log more details for debugging
      if (errorMessage.includes('Failed to connect')) {
        console.error("Backend server might not be running. Please start it with: cd server && npm start");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">

        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white">
            →
          </div>
          <h2 className="text-2xl font-bold">Create Account</h2>
          <p className="text-gray-500 text-sm">
            {role === "organizer" && "Sign up as an organizer"}
            {role === "admin" && "Admin registration for system administrators"}
            {role === "user" && "Sign up to start exploring hackathons"}
          </p>
          <div className="mt-3 p-2 bg-purple-50 rounded-lg">
            <span className="text-xs font-medium text-purple-700">
              {role === "organizer" && "⚙️ Organizer Registration"}
              {role === "admin" && "🛡️ Admin Registration"}
              {role === "user" && "👤 User Registration"}
            </span>
          </div>

          {role === "admin" && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                ℹ️ Admin accounts are for platform administrators only. Please ensure you have proper authorization.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* First Name */}
          <div>
            <label className="text-sm font-medium">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Your first name"
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              disabled={loading}
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="text-sm font-medium">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Your last name"
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              disabled={loading}
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-sm font-medium">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="1234567890"
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              disabled={loading}
            />
          </div>

          {/* Organization Name - Only for Organizers */}
          {role === "organizer" && (
            <div>
              <label className="text-sm font-medium">Organization Name</label>
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Your organization name"
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                disabled={loading}
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Password must contain uppercase, lowercase, number & special character (@$!%*?&)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
          >
            {loading ? "Sending code…" : "Send verification code"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
