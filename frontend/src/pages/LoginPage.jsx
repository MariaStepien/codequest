import React, { useState } from "react";
import { Loader2 } from 'lucide-react'; // Import for loading spinner

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle the login attempt
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const loginData = {
      email,
      password,
    };

    // Replace this URL with your actual Spring Boot backend address
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
        // --- SUCCESS ---
        console.log("Login successful!", responseData);
        
        // 1. Store the JWT Token (e.g., in localStorage or a state manager)
        // Note: In a real app, you would secure this token carefully.
        // localStorage.setItem('token', responseData.token); 

        // 2. Redirect the user to the dashboard or profile page
        // window.location.href = '/dashboard'; 
        // We'll simulate a redirect and show a success message:
        alertMessage("Login Successful! Welcome.", "success");

      } else {
        // --- FAILURE ---
        const errorMessage = responseData.message || "Invalid email or password.";
        setError(errorMessage);
        alertMessage(errorMessage, "error");
      }
    } catch (err) {
      // --- NETWORK ERROR ---
      console.error("Network or Fetch Error:", err);
      setError("Could not reach the server. Please check your connection.");
      alertMessage("Could not reach the server. Try again later.", "error");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Custom alert/message box function to replace window.alert()
  const alertMessage = (message, type) => {
    const alertBox = document.getElementById('custom-alert');
    if (alertBox) {
        alertBox.textContent = message;
        alertBox.className = `p-4 rounded-lg text-black font-semibold mb-4 transition-opacity duration-300 ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } opacity-100`;
        // Hide after 3 seconds
        setTimeout(() => {
            alertBox.className = alertBox.className.replace('opacity-100', 'opacity-0');
        }, 3000);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-500 via-green-400 to-yellow-500 p-4">
      <div className="bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Welcome to CodeQuest
        </h2>
        
        {/* Custom Alert Box */}
        <div id="custom-alert" className="opacity-0 transition-opacity duration-300"></div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-3 text-lg border-2 border-transparent rounded-2xl shadow-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-300 outline-none transition duration-300"
              placeholder="Enter your email"
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
              className="w-full px-5 py-3 text-lg border-2 border-transparent rounded-2xl shadow-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-300 outline-none transition duration-300"
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 text-lg font-semibold text-white rounded-2xl transition duration-300 shadow-lg flex items-center justify-center space-x-2
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-yellow-500 to-green-600 hover:from-purple-600 hover:to-pink-500'
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
          <a href="/signup" className="text-pink-600 font-medium hover:underline">
            Sign up
          </a>
        </p>
        <p className="text-center text-sm text-gray-600 mt-2">
            Or {" "}
            <a href="/test" className= "text-pink-600 font-medium hover:underline">
            try the app without loginning in
            </a>
        </p>
      </div>
    </div>
  );
}