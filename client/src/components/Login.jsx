import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminApi } from "../services/api";
import FlashMessage from "./FlashMessage";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const showFlash = (message, type = "error") => {
    setFlash({ message, type });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      showFlash("Please enter both username and password", "error");
      return;
    }

    setLoading(true);
    try {
      await adminApi.login({ username: username.trim(), password: password.trim() });
      login();
      showFlash("Login successful! Redirecting...", "success");
      setTimeout(() => navigate("/admin"), 1000);
    } catch (error) {
      showFlash(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {flash && (
        <FlashMessage
          message={flash.message}
          type={flash.type}
          onClose={() => setFlash(null)}
        />
      )}

      <div className="bg-white p-8 shadow-lg rounded-3xl w-full max-w-md my-30 mx-2">
        <h2 className="text-4xl font-bold text-blue-600 text-center mb-6">
          Admin Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Username</label>
            <input
              type="text"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-semibold py-3 rounded-xl shadow-md cursor-pointer text-white ${
              loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-500">
          <a className="text-blue-500 cursor-pointer hover:underline" href="/change-credentials">
            Change Credentials
          </a>
          <p className="my-2">Need help? Contact support</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
