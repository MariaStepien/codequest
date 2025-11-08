import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login attempt:", { email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-500 via-green-400 to-yellow-500 p-4">
      <div className="bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Welcome to CodeQuest
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 text-lg font-semibold text-white rounded-2xl bg-gradient-to-r from-yellow-500 to-green-600 hover:from-purple-600 hover:to-pink-500 transition duration-300 shadow-lg"
          >
            Login
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
