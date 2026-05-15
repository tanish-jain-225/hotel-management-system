import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../services/api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ShieldAlert, ArrowLeft, Key, User, Save } from "lucide-react";

const ChangeCredentials = () => {
  const [prevUsername, setPrevUsername] = useState("");
  const [prevPassword, setPrevPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prevUsername || !prevPassword || !newUsername || !newPassword) {
      toast.error("All fields are required.");
      return;
    }

    const loadToast = toast.loading("Updating credentials...");
    setLoading(true);
    try {
      await adminApi.updateCredentials({
        prevUsername: String(prevUsername),
        prevPassword: String(prevPassword),
        newUsername: String(newUsername),
        newPassword: String(newPassword),
      });

      toast.success("Credentials updated successfully! 🎉", { id: loadToast });
      setPrevUsername("");
      setPrevPassword("");
      setNewUsername("");
      setNewPassword("");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.message, { id: loadToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 shadow-2xl rounded-[2rem] w-full max-w-lg border border-gray-100"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-blue-50 rounded-full mb-4">
            <ShieldAlert size={40} className="text-blue-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 text-center">
            Security <span className="text-blue-600">Settings</span>
          </h2>
          <p className="text-gray-400 text-sm mt-2 font-medium uppercase tracking-widest">Update Admin Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Previous Admin</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-gray-300" size={18} />
                <input
                  type="text"
                  placeholder="Old Username"
                  value={prevUsername}
                  onChange={(e) => setPrevUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Current Secret</label>
              <div className="relative">
                <Key className="absolute left-3 top-3.5 text-gray-300" size={18} />
                <input
                  type="password"
                  placeholder="Old Password"
                  value={prevPassword}
                  onChange={(e) => setPrevPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 my-8"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-blue-600 uppercase ml-1">New Identity</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-blue-200" size={18} />
                <input
                  type="text"
                  placeholder="New Username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-blue-50/30 border border-blue-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-blue-600 uppercase ml-1">New Secret</label>
              <div className="relative">
                <Key className="absolute left-3 top-3.5 text-blue-200" size={18} />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-blue-50/30 border border-blue-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-4 rounded-2xl shadow-xl transition-all text-white flex items-center justify-center gap-2 mt-4 cursor-pointer ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <Save size={20} />
            {loading ? "Updating..." : "Save New Credentials"}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => navigate("/login")}
            className="text-blue-500 font-bold text-sm flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <ArrowLeft size={16} />
            Return to Login
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ChangeCredentials;