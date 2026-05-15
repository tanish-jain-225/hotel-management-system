import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminApi } from "../services/api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Lock, User, LogIn, ShieldCheck } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error("Please enter both username and password");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Verifying credentials...");
    try {
      const data = await adminApi.login({ username: username.trim(), password: password.trim() });
      login(data.token);
      toast.success("Login successful! Redirecting...", { id: loadingToast });
      setTimeout(() => navigate("/admin"), 1000);
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 sm:p-10 shadow-2xl rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-md border border-gray-100"
      >
        <div className="flex flex-col items-center mb-8 sm:mb-10">
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="p-4 bg-blue-50 rounded-2xl mb-4"
          >
            <ShieldCheck size={40} className="text-blue-600" />
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center tracking-tight">
            Admin <span className="text-blue-600">Login</span>
          </h2>
          <p className="text-gray-400 font-medium text-xs sm:text-sm mt-2 uppercase tracking-widest text-center">Access Restricted Area</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm sm:text-base"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm sm:text-base"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-3.5 sm:py-4 rounded-2xl shadow-xl transition-all text-white flex items-center justify-center gap-2 cursor-pointer ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
            }`}
          >
            <LogIn size={20} />
            {loading ? "Verifying..." : "Sign In"}
          </motion.button>
        </form>

        <div className="mt-8 sm:mt-10 pt-6 border-t border-gray-50 flex flex-col items-center gap-4">
          <button 
            onClick={() => navigate("/change-credentials")}
            className="text-blue-600 font-bold text-sm hover:underline cursor-pointer"
          >
            Reset Credentials?
          </button>
          <p className="text-gray-400 text-[10px] sm:text-xs font-medium uppercase tracking-tighter">
            DineEase Security Systems
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
