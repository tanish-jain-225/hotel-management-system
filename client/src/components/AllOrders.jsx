import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { orderApi } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { 
  ArrowLeft, CheckCircle, Clock, CreditCard, 
  User, Hash, Calendar, Package, Printer, ChefHat, History
} from "lucide-react";

// Web Audio API custom synthesizer chime
const playChime = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    const playNote = (frequency, startTime, duration) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, startTime);
      
      gainNode.gain.setValueAtTime(0.08, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    
    const now = audioCtx.currentTime;
    playNote(523.25, now, 0.15); // C5
    playNote(659.25, now + 0.12, 0.35); // E5
  } catch (e) {
    console.error("Audio chime play failed:", e);
  }
};

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printingOrder, setPrintingOrder] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();
  const knownOrderIds = useRef(new Set());
  const isInitialLoad = useRef(true);

  const fetchOrders = async (silent = false, statusFilter = showHistory ? "Completed" : undefined) => {
    try {
      const data = await orderApi.getAll(null, statusFilter);
      const sorted = data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      
      // Only check for new orders and trigger chime if we are NOT viewing history
      if (!statusFilter) {
        if (!isInitialLoad.current && sorted.length > 0) {
          let hasNewOrder = false;
          sorted.forEach((order) => {
            if (!knownOrderIds.current.has(order._id)) {
              hasNewOrder = true;
              knownOrderIds.current.add(order._id);
            }
          });
          if (hasNewOrder) {
            playChime();
            toast.success("New customer order received! 🔔");
          }
        } else {
          // Build known list on initial load
          sorted.forEach((order) => knownOrderIds.current.add(order._id));
          isInitialLoad.current = false;
        }
      }
      
      setOrders(sorted);
    } catch (err) {
      if (!silent) toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchOrders(false, showHistory ? "Completed" : undefined);

    if (!showHistory) {
      // Auto-poll active orders every 10 seconds for real-time kitchen feed
      const interval = setInterval(() => {
        fetchOrders(true, undefined);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [showHistory]);

  useEffect(() => {
    if (printingOrder) {
      const timer = setTimeout(() => {
        window.print();
        setPrintingOrder(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [printingOrder]);

  const handleStatusTransition = async (order) => {
    let nextStatus = "Preparing";
    let confirmMsg = "Start preparing this order?";
    
    if (order.status === "Preparing") {
      nextStatus = "Ready";
      confirmMsg = "Mark this order as ready for serving?";
    } else if (order.status === "Ready") {
      nextStatus = "Completed";
      confirmMsg = "Mark this order as completed and served?";
    }

    if (!window.confirm(confirmMsg)) return;

    const loadToast = toast.loading("Updating order status...");
    try {
      await orderApi.updateStatus(order._id, nextStatus);
      
      if (nextStatus === "Completed") {
        setOrders((prev) => prev.filter((o) => o._id !== order._id));
        toast.success("Order completed and archived! 🎉", { id: loadToast });
      } else {
        setOrders((prev) => 
          prev.map((o) => o._id === order._id ? { ...o, status: nextStatus } : o)
        );
        toast.success(`Order moved to ${nextStatus}!`, { id: loadToast });
      }
    } catch (err) {
      toast.error(err.message, { id: loadToast });
    }
  };

  const handlePrintReceipt = (order) => {
    setPrintingOrder(order);
  };



  const getStatusBannerColor = (status) => {
    switch (status) {
      case "Preparing": return "bg-orange-600";
      case "Ready": return "bg-emerald-600";
      case "Completed": return "bg-gray-500";
      default: return "bg-blue-600";
    }
  };

  const getActionButtonStyles = (status) => {
    switch (status) {
      case "Preparing":
        return {
          text: "Mark as Ready",
          btnClass: "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20",
          icon: <ChefHat size={20} />
        };
      case "Ready":
        return {
          text: "Mark as Served",
          btnClass: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20",
          icon: <CheckCircle size={20} />
        };
      default:
        return {
          text: "Start Preparing",
          btnClass: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20",
          icon: <Clock size={20} />
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto my-12 p-6 md:p-10"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all text-sm cursor-pointer shadow-sm ${
              showHistory 
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10" 
                : "bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-200"
            }`}
          >
            {showHistory ? <Clock size={16} /> : <History size={16} />}
            {showHistory ? "Active Orders" : "Order History"}
          </motion.button>
        </div>
        
        <h2 className="text-4xl font-black text-gray-900 tracking-tight">
          {showHistory ? (
            <>Order <span className="text-blue-600">History</span></>
          ) : (
            <>Active <span className="text-blue-600">Orders</span></>
          )}
        </h2>
      </div>

      <AnimatePresence mode="popLayout">
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-blue-50 border border-blue-100 text-blue-800 rounded-2xl text-sm font-semibold flex items-center gap-2.5"
          >
            <Clock size={18} className="text-blue-600 flex-shrink-0" />
            <span>Note: Completed orders are automatically archived and removed from history after 24 hours.</span>
          </motion.div>
        )}
        {orders.length === 0 ? (
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
            <p className="text-xl text-gray-400 font-medium">
              {showHistory ? "No order history found." : "No active orders at the moment."}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders.map((order, index) => {
              const actionConfig = getActionButtonStyles(order.status);
              
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  key={order._id}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Order ID & Status */}
                    <div className={`${getStatusBannerColor(order.status)} text-white p-6 flex flex-col justify-center items-center lg:w-48 text-center transition-colors duration-500`}>
                      <Hash size={24} className="mb-2 opacity-50" />
                      <p className="text-sm font-medium opacity-80 uppercase tracking-widest">Serial No</p>
                      <p className="text-4xl font-black">{order.serialNumber}</p>
                      <div className="mt-3 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        <Clock size={12} />
                        {order.status || "Placed"}
                      </div>
                    </div>

                    <div className="p-8 grow grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Customer Info */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider">
                          <User size={16} /> Customer Info
                        </div>
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-gray-900">{order.customer.name}</p>
                          <p className="text-gray-500 flex items-center gap-2 text-sm">
                            {order.customer.contact}
                          </p>
                          <p className="text-gray-400 text-xs italic mt-2">
                            {order.customer.address}
                          </p>
                        </div>
                      </div>

                      {/* Items Info */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider">
                          <Package size={16} /> Items ({order.items.length})
                        </div>
                        <ul className="space-y-1">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="text-gray-700 text-sm flex justify-between">
                              <span>{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                              <span className="font-medium">₹{item.totalPrice || item.price * item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Payment & Actions */}
                      <div className="space-y-6 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start text-sm">
                            <div className="flex flex-col gap-1">
                              <span className="text-gray-400 flex items-center gap-1">
                                <Calendar size={14} /> Placed: {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {order.completedAt && (
                                <span className="text-emerald-600 flex items-center gap-1 font-bold text-xs">
                                  <CheckCircle size={12} /> Served: {new Date(order.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-tighter flex items-center gap-1">
                              <CreditCard size={12} /> {order.paymentMethod.split('/')[0]}
                            </span>
                          </div>
                          <div className="flex justify-between items-end">
                            <p className="text-gray-400 text-xs">Grand Total</p>
                            <p className="text-3xl font-black text-gray-900">₹{order.grandTotal.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-2.5 rounded-2xl border border-gray-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            onClick={() => handlePrintReceipt(order)}
                          >
                            <Printer size={18} />
                            Print Receipt
                          </motion.button>
                          
                          {order.status !== "Completed" && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`w-full text-white font-bold py-2.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${actionConfig.btnClass}`}
                              onClick={() => handleStatusTransition(order)}
                            >
                              {actionConfig.icon}
                              {actionConfig.text}
                            </motion.button>
                          )}
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

      {/* Hidden print-only receipt view */}
      {printingOrder && (
        <div className="hidden print:block print-receipt absolute inset-0 bg-white text-black p-8 z-50">
          <div className="max-w-md mx-auto border border-gray-200 p-6 rounded-3xl">
            <div className="text-center pb-6 border-b border-dashed border-gray-300">
              <h2 className="text-2xl font-black tracking-tight uppercase">DineEase</h2>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1 text-gray-500">Official Order Receipt</p>
              <div className="mt-4 flex justify-between text-xs text-gray-600 text-left">
                <div>
                  <p><span className="font-bold">Order ID:</span> #{printingOrder._id ? printingOrder._id.substring(18) : "N/A"}</p>
                  <p><span className="font-bold">Serial No:</span> {printingOrder.serialNumber}</p>
                </div>
                <div className="text-right">
                  <p>{new Date(printingOrder.orderDate).toLocaleDateString()}</p>
                  <p>{new Date(printingOrder.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </div>

            <div className="py-4 border-b border-dashed border-gray-300 text-sm text-gray-600">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Details</p>
              <p><span className="font-bold">Name:</span> {printingOrder.customer.name}</p>
              <p><span className="font-bold">Phone:</span> {printingOrder.customer.contact}</p>
              <p><span className="font-bold">Table/Address:</span> {printingOrder.customer.address}</p>
            </div>

            <div className="py-4 border-b border-dashed border-gray-300 text-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Items</p>
              <div className="space-y-2">
                {printingOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-gray-800">
                    <span>{item.name} <span className="text-gray-400 text-xs font-semibold">x{item.quantity}</span></span>
                    <span className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="py-4 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">₹{printingOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Amount</span>
                <span className="font-semibold text-gray-800">₹{printingOrder.gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-gray-900 border-t border-dashed border-gray-200 pt-3">
                <span>Grand Total</span>
                <span className="font-bold text-blue-600">₹{printingOrder.grandTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="text-center text-xs text-gray-400 mt-6 pt-4 border-t border-dashed border-gray-200 uppercase tracking-widest font-bold">
              DineEase Kitchen Copy
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AllOrders;
