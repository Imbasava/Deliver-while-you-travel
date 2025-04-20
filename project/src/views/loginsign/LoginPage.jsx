import React, { useState, useEffect } from 'react'; // Import useEffect
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  // State for email and password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State for error/success messages
  const [message, setMessage] = useState(''); // Using 'message' for feedback

  // Navigation hook
  const navigate = useNavigate();

  // --- useEffect to clear localStorage on component mount ---
  useEffect(() => {
    // This code runs only once when the component mounts
    console.log("LoginPage mounted. Clearing localStorage...");
    localStorage.clear(); // Clear all items from localStorage
  }, []); // Empty dependency array ensures it runs only on mount

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form behavior
    setMessage(''); // Clear previous messages

    // Backend URL (redundant variable, using string directly below)
    // const apiUrl = 'http://localhost:8080/api/users/login';

    try {
      const response = await fetch("http://localhost:8080/api/users/login", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
          // Login successful
          console.log("Login successful. Saving data to localStorage:", data);
          // Save the token and other necessary info
          localStorage.setItem("token", data.token);
          localStorage.setItem("firstName", data.firstName);
          localStorage.setItem("userId", data.id); // Save userId (important for SenderChatPage)

          // NOTE: travelerId and senderId are NOT set here.
          // travelerId should likely be set from the user profile fetch later.
          // senderId should be set based on travelerId lookup (like in ProfilePage).

          alert("Login successful!"); // Consider replacing alert with a message state update
          navigate("/"); // Redirect to home or dashboard page (adjust as needed)

      } else {
          // Login failed - Set error message from response or a default one
          console.error("Login failed:", data);
          setMessage(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login request failed:', error);
      setMessage('An error occurred during login. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-sky-600 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-lg text-gray-800">
        <h2 className="text-3xl font-bold text-center text-sky-600">Login</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-600" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required // Add required attribute
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-sky-500 focus:outline-none"
              placeholder="Enter your email"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-600" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required // Add required attribute
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-sky-500 focus:outline-none"
              placeholder="Enter your password"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 focus:ring focus:ring-sky-400 focus:outline-none"
          >
            Login
          </button>
        </form>

        {/* Display Messages */}
        {message && (
          // Added padding and different color for error vs success (though only error is handled here)
          <div className="mt-4 p-2 text-center text-sm font-medium text-red-600 bg-red-100 rounded-md">{message}</div>
        )}

        {/* Links */}
        <div className="text-center">
          <p className="text-sm">
            <a href="/signup" className="text-sky-600 hover:underline">
              Sign Up
            </a>{' '}
            |{' '}
            <a href="/forgot-password" className="text-sky-600 hover:underline ml-1">
              Forgot Password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};