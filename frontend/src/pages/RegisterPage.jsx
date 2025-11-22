import React, { useState } from "react";
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [userLogin, setUserLogin] = useState(""); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    const registerData = {
      userLogin,
      password,
    };

    const API_URL = "http://localhost:8080/api/auth/register"; 

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const responseData = await response.json();

      if (response.ok) {
        setSuccess(responseData.message || "Registration successful! You can now log in.");
        setUserLogin("");
        setPassword("");
        setConfirmPassword("");

      } else {
        const errorMessage = responseData.message || "Registration failed. Please try a different login name.";
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Network or Fetch Error:", err);
      setError("Could not reach the server. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-400 to-red-500 p-4">
      <div className="bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Create Your CodeQuest Account
        </h2>
        
        {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">
                {success}
            </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label
              htmlFor="userLogin"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Login / Username
            </label>
            <input
              id="userLogin"
              type="text"
              value={userLogin}
              onChange={(e) => setUserLogin(e.target.value)}
              required
              className="w-full px-5 py-3 text-lg border-2 border-transparent rounded-2xl shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-300 outline-none transition duration-300 text-gray-900"
              placeholder="Choose a unique login name"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-3 text-lg border-2 border-transparent rounded-2xl shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-300 outline-none transition duration-300 text-gray-900"
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-5 py-3 text-lg border-2 border-transparent rounded-2xl shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-300 outline-none transition duration-300 text-gray-900"
              placeholder="Re-enter your password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 text-lg font-semibold text-white rounded-2xl transition duration-300 shadow-lg flex items-center justify-center space-x-2
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-red-600 hover:to-yellow-500'
              }`}
            disabled={isLoading}
          >
            {isLoading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Registering...</span>
                </>
            ) : (
                <span>Register Account</span>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-pink-600 font-medium hover:underline">
            Log in here
          </a>
        </p>
      </div>
    </div>
  );
}