import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Menu as MenuIcon, X, LogOut, ShieldCheck, User as UserIcon, LayoutDashboard, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
    setIsOpen(false);
  };

  const navLinks = [
    { name: "Menu", path: "/", icon: <UserIcon size={18} />, show: true },
    { name: "My Orders", path: "/my-orders", icon: <ClipboardList size={18} />, show: true },
    { name: "Admin", path: "/admin", icon: <LayoutDashboard size={18} />, show: isAuthenticated },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-4 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl border border-gray-100 rounded-[2rem] px-8 py-4 shadow-xl flex justify-between items-center">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform">
            <img src="/8575289.png" alt="Logo" className="w-6 h-6" />
          </div>
          <span className="text-xl font-black text-gray-900 tracking-tighter uppercase">
            Dine<span className="text-blue-600">Ease</span>
          </span>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.filter(link => link.show).map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-gray-500 hover:text-blue-600 font-bold text-sm uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              <span className="opacity-50">{link.icon}</span>
              {link.name}
            </Link>
          ))}

          {isAuthenticated ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-6 py-2 bg-red-50/50 text-red-600 rounded-xl font-bold text-sm uppercase tracking-widest border border-red-100 hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogOut size={16} />
              Logout
            </motion.button>
          ) : (
            <Link
              to="/login"
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <ShieldCheck size={16} />
              Admin Login
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-400 p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden mt-4 mx-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-2xl space-y-6"
          >
            {navLinks.filter(link => link.show).map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 text-gray-500 hover:text-blue-600 font-bold text-lg"
              >
                <div className="p-2 bg-gray-50 rounded-lg">{link.icon}</div>
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-50">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 text-red-500 font-bold text-lg"
                >
                  <div className="p-2 bg-red-50 rounded-lg"><LogOut size={20} /></div>
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-4 text-blue-600 font-bold text-lg"
                >
                  <div className="p-2 bg-blue-50 rounded-lg"><ShieldCheck size={20} /></div>
                  Admin Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
