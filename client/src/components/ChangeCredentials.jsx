import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../services/api";
import FlashMessage from "./FlashMessage";

const ChangeCredentials = () => {
  const [prevUsername, setPrevUsername] = useState("");
  const [prevPassword, setPrevPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFlash(null);

    if (!prevUsername || !prevPassword || !newUsername || !newPassword) {
      setFlash({ message: "All fields are required.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      await adminApi.updateCredentials({
        prevUsername: String(prevUsername),
        prevPassword: String(prevPassword),
        newUsername: String(newUsername),
        newPassword: String(newPassword),
      });

      setFlash({ message: "Credentials updated successfully! Redirecting...", type: "success" });
      setPrevUsername("");
      setPrevPassword("");
      setNewUsername("");
      setNewPassword("");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setFlash({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 my-30 mx-2">
      {flash && (
        <FlashMessage message={flash.message} type={flash.type} onClose={() => setFlash(null)} />
      )}

      <div className="bg-white p-8 shadow-lg rounded-3xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-blue-600 text-center mb-6">
          Change Admin Credentials
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Previous Username</label>
            <input
              type="text"
              placeholder="Enter Previous Username"
              value={prevUsername}
              onChange={(e) => setPrevUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Previous Password</label>
            <input
              type="password"
              placeholder="Enter Previous Password"
              value={prevPassword}
              onChange={(e) => setPrevPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">New Username</label>
            <input
              type="text"
              placeholder="Enter New Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">New Password</label>
            <input
              type="password"
              placeholder="Enter New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-semibold py-3 rounded-xl shadow-md transition text-white ${
              loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Updating..." : "Update Credentials"}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-500">
          <a className="text-blue-500 cursor-pointer hover:underline" href="/login">
            Back to Login
          </a>
          <p className="my-2">Need help? Contact support</p>
        </div>
      </div>
    </div>
  );
};

export default ChangeCredentials;