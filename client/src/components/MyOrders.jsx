import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { orderApi } from "../services/api";
import { getSessionId } from "../utils/session";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { 
  ArrowLeft, Clock, CreditCard, Hash, Calendar, 
  Package, RefreshCw, CheckCircle2, ClipboardCheck, 
  ChefHat, Bell, Utensils, History 
} from "lucide-react";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();
  const sessionId = getSessionId();

  const fetchOrders = useCallback(async (showToast = false) => {
    if (showToast) setRefreshing(true);
    try {
      const data = await orderApi.getAll(sessionId);
      const sorted = data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      setOrders(sorted);
      if (showToast) toast.success("Order status updated!");
    } catch (err) {
      toast.error(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchOrders();

    if (!showHistory) {
      // Set up auto-polling every 10 seconds for real-time tracking
      const pollInterval = setInterval(() => {
        fetchOrders();
      }, 10000);

      return () => clearInterval(pollInterval);
    }
  }, [fetchOrders, showHistory]);

  const getStatusBannerColor = (status) => {
    switch (status) {
      case "Preparing": return "bg-orange-500";
      case "Ready": return "bg-emerald-600";
      case "Completed": return "bg-gray-500";
      default: return "bg-blue-600";
    }
  };

  const getStatusIndex = (status) => {
    switch (status) {
      case "Preparing": return 1;
      case "Ready": return 2;
      case "Completed": return 3;
      default: return 0;
    }
  };

  const steps = [
    { label: "Placed", statusKey: "Placed", icon: ClipboardCheck },
    { label: "Preparing", statusKey: "Preparing", icon: ChefHat },
    { label: "Ready", statusKey: "Ready", icon: Bell },
    { label: "Served", statusKey: "Completed", icon: Utensils }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredOrders = orders.filter((order) => {
    return showHistory ? order.status === "Completed" : order.status !== "Completed";
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto my-12 p-6 md:p-10"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
        <div>
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold transition-colors cursor-pointer mb-2"
          >
            <ArrowLeft size={20} />
            Back to Menu
          </motion.button>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">
            {showHistory ? (
              <>My Order <span className="text-blue-600">History</span></>
            ) : (
              <>Track <span className="text-blue-600">My Orders</span></>
            )}
          </h2>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all cursor-pointer shadow-sm text-sm ${
              showHistory 
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10" 
                : "bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-200"
            }`}
          >
            {showHistory ? <Clock size={16} /> : <History size={16} />}
            {showHistory ? "Active Tracker" : "Order History"}
          </motion.button>

          {!showHistory && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl font-bold hover:bg-blue-100 transition-colors cursor-pointer disabled:opacity-50 text-sm"
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
              Refresh Status
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {filteredOrders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100"
          >
            {showHistory ? (
              <History size={64} className="mx-auto text-gray-200 mb-4" />
            ) : (
              <Clock size={64} className="mx-auto text-gray-200 mb-4" />
            )}
            <p className="text-xl text-gray-400 font-medium mb-4">
              {showHistory 
                ? "You don't have any completed orders in this session yet." 
                : "You don't have any active orders at the moment."}
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              Go to Menu
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredOrders.map((order, index) => {
              const currentStepIndex = getStatusIndex(order.status);
              
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  key={order._id}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Order ID & Status Banner */}
                    <div className={`${getStatusBannerColor(order.status)} text-white p-6 flex flex-col justify-center items-center md:w-44 text-center transition-colors duration-500`}>
                      <Hash size={20} className="mb-1 opacity-50" />
                      <p className="text-xs font-semibold opacity-85 uppercase tracking-wider">Serial No</p>
                      <p className="text-3xl font-black">{order.serialNumber}</p>
                      <div className="mt-3 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        <Clock size={12} />
                        {order.status || "Placed"}
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 grow flex flex-col justify-between">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                        {/* Customer & Delivery */}
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Patron Details</div>
                          <div>
                            <p className="font-bold text-gray-900">{order.customer.name}</p>
                            <p className="text-sm text-gray-500">{order.customer.contact}</p>
                            <p className="text-xs text-gray-400 italic mt-1">Table/Address: {order.customer.address}</p>
                          </div>
                        </div>

                        {/* Ordered Items */}
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Items Ordered</div>
                          <ul className="space-y-1">
                            {order.items.map((item, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex justify-between">
                                <span>{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                                <span className="font-semibold text-gray-900">₹{item.totalPrice || item.price * item.quantity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Summary & Date */}
                        <div className="space-y-4 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <div className="text-gray-400 text-xs flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(order.orderDate).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                            </div>
                            <div className="text-gray-400 text-xs flex items-center gap-1">
                              <CreditCard size={14} />
                              {order.paymentMethod.split('/')[0]}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-end border-t border-gray-50 pt-2">
                            <div>
                              <p className="text-gray-400 text-[10px] uppercase font-bold tracking-tight">Total Paid (GST Inc.)</p>
                              <p className="text-2xl font-black text-blue-600">₹{order.grandTotal.toFixed(2)}</p>
                            </div>
                            <div className="text-green-500 flex items-center gap-1 text-xs font-bold">
                              <CheckCircle2 size={16} /> Verified
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Visual Stepper tracker */}
                      <div className="border-t border-gray-100 pt-6 mt-2">
                        <div className="flex items-center justify-between w-full max-w-lg mx-auto px-2">
                          {steps.map((step, idx) => {
                            const StepIcon = step.icon;
                            const isCompleted = idx < currentStepIndex;
                            const isActive = idx === currentStepIndex;
                            
                            let iconColorClass = "text-gray-300 bg-gray-50 border-gray-100";
                            if (isCompleted) iconColorClass = "text-white bg-emerald-500 border-emerald-500 shadow-md";
                            else if (isActive) {
                              if (step.statusKey === "Preparing") iconColorClass = "text-white bg-orange-500 border-orange-500 shadow-md animate-pulse";
                              else if (step.statusKey === "Ready") iconColorClass = "text-white bg-emerald-500 border-emerald-500 shadow-md animate-pulse";
                              else iconColorClass = "text-white bg-blue-600 border-blue-600 shadow-md animate-pulse";
                            }
                            
                            return (
                              <div key={idx} className="flex flex-col items-center flex-1 relative">
                                {idx > 0 && (
                                  <div className={`absolute top-5 left-[-50%] right-[50%] h-1 -translate-y-1/2 -z-10 transition-colors duration-500 ${
                                    idx <= currentStepIndex ? "bg-emerald-500" : "bg-gray-100"
                                  }`} />
                                )}
                                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${iconColorClass}`}>
                                  <StepIcon size={18} />
                                </div>
                                <span className={`text-[10px] sm:text-xs font-bold mt-2 transition-colors duration-300 ${
                                  isActive ? "text-gray-900" : isCompleted ? "text-emerald-600" : "text-gray-400"
                                }`}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MyOrders;
