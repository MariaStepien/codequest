import React, { useState } from "react";
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [userLogin, setUserLogin] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const loginData = {
      userLogin,
      password,
    };

    const API_URL = "http://localhost:8080/api/auth/login"; 

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const responseData = await response.json();

      if (response.ok) {
        localStorage.setItem('token', responseData.token); 
        localStorage.setItem('userId', responseData.userId); 
        
        const userRole = responseData.role;
        localStorage.setItem('role', userRole);

        if (userRole === 'ADMIN') {
            window.location.href = '/admin-dashboard';
        } else {
            window.location.href = '/dashboard';
        }
        
      } else {
        const errorMessage = responseData.message || "Invalid login or password.";
        setError(errorMessage);
        alertMessage(errorMessage, "error");
      }
    } catch (err) {
      setError("Could not reach the server. Please check your connection.");
      alertMessage("Could not reach the server. Try again later.", "error");
    } finally {
      setIsLoading(false);
    }
  };
  
  const alertMessage = (message, type) => {
    const alertBox = document.getElementById('custom-alert');
    if (alertBox) {
        alertBox.textContent = message;
        alertBox.className = `p-4 rounded-lg text-black font-semibold mb-4 transition-opacity duration-300 ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } opacity-100`;
        setTimeout(() => {
            alertBox.className = alertBox.className.replace('opacity-100', 'opacity-0');
        }, 3000);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-1000 p-4">
      <div className="bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Welcome to CodeQuest
        </h2>
        
        <div id="custom-alert" className="opacity-0 transition-opacity duration-300"></div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
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
              className="w-full px-5 py-3 text-lg border-2 border-transparent rounded-2xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-cyan-300 outline-none transition duration-300 placeholder-gray-700 text-gray-900"
              placeholder="Enter your login name"
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
              className="w-full px-5 py-3 text-lg border-2 border-transparent rounded-2xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-cyan-300 outline-none transition duration-300 placeholder-gray-700 text-gray-900"
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 text-lg font-semibold text-black rounded-2xl transition duration-300 shadow-lg flex items-center justify-center space-x-2
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-blue-700 hover:to-cyan-800'
              }`}
            disabled={isLoading}
          >
            {isLoading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Logging In...</span>
                </>
            ) : (
                <span>Login</span>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <a href="/register" className="text-pink-600 font-medium hover:underline">
            Sign up
          </a>
        </p>
        <p className="text-center text-sm text-gray-600 mt-2">
            Or {" "}
            <a href="/course/1/level/1" className= "text-pink-600 font-medium hover:underline">
            try the app without loginning in
            </a>
        </p>
      </div>
    </div>
  );
}