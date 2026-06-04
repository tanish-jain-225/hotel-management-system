import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderApi } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle, Clock, CreditCard, User, Hash, Calendar, Package, Printer } from "lucide-react";

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printingOrder, setPrintingOrder] = useState(null);
  const navigate = useNavigate();

  const handlePrintReceipt = (order) => {
    setPrintingOrder(order);
  };

  useEffect(() => {
    if (printingOrder) {
      const timer = setTimeout(() => {
        window.print();
        setPrintingOrder(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [printingOrder]);

  const fetchOrders = async () => {
    try {
      const data = await orderApi.getAll();
      const sorted = data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      setOrders(sorted);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderDone = async (order) => {
    if (!window.confirm("Mark this order as completed?")) return;

    const loadToast = toast.loading("Updating status...");
    try {
      await orderApi.complete(order._id);
      setOrders((prev) => prev.filter((o) => o._id !== order._id));
      toast.success("Order marked as completed!", { id: loadToast });
    } catch (err) {
      toast.error(err.message, { id: loadToast });
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
      <div className="flex items-center justify-between mb-10">
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </motion.button>
        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Active <span className="text-blue-600">Orders</span></h2>
      </div>

      <AnimatePresence mode="popLayout">
        {orders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100"
          >
            <Clock size={64} className="mx-auto text-gray-200 mb-4" />
            <p className="text-xl text-gray-400 font-medium">No active orders at the moment.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders.map((order, index) => (
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
                  <div className="bg-blue-600 text-white p-6 flex flex-col justify-center items-center lg:w-48 text-center">
                    <Hash size={24} className="mb-2 opacity-50" />
                    <p className="text-sm font-medium opacity-80 uppercase tracking-widest">Serial No</p>
                    <p className="text-4xl font-black">{order.serialNumber}</p>
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
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400 flex items-center gap-1"><Calendar size={14} /> {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                          onClick={() => handleOrderDone(order)}
                        >
                          <CheckCircle size={20} />
                          Mark as Done
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
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
