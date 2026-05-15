import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cartApi, orderApi } from "../services/api";
import { getSessionId } from "../utils/session";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Trash2, ArrowLeft, ShoppingBag, CreditCard, MapPin, Phone, User } from "lucide-react";

const GST_RATE = 0.05;

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", contact: "", address: "" });
  const navigate = useNavigate();

  const sessionId = getSessionId();

  const fetchCartItems = async () => {
    try {
      const data = await cartApi.getItems(sessionId);
      setCartItems(data);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load cart items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const handleRemoveFromCart = async (itemId, itemName) => {
    try {
      await cartApi.removeItem(itemId, sessionId);
      toast.success(`${itemName} removed`);
      fetchCartItems();
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const groupedOrders = cartItems.reduce((acc, item) => {
    const existing = acc.find((order) => order.name === item.name);
    if (existing) {
      existing.quantity += item.quantity || 1;
      existing.totalPrice += item.price * (item.quantity || 1);
    } else {
      acc.push({
        ...item,
        quantity: item.quantity || 1,
        totalPrice: item.price * (item.quantity || 1),
      });
    }
    return acc;
  }, []);

  const totalItems = groupedOrders.reduce((sum, item) => sum + item.quantity, 0);

  const calculateTotals = () => {
    const subtotal = groupedOrders.reduce((sum, item) => sum + item.totalPrice, 0);
    const gstAmount = subtotal * GST_RATE;
    const grandTotal = subtotal + gstAmount;
    return { subtotal, gstAmount, grandTotal };
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.contact || !formData.address) {
      toast.error("Please fill out all fields before submitting.");
      return;
    }

    const totals = calculateTotals();
    const orderData = {
      sessionId,
      ...formData,
      paymentMethod: "Pay on Counter / UPI / Card",
      items: groupedOrders,
      subtotal: parseFloat(totals.subtotal.toFixed(2)),
      gstAmount: parseFloat(totals.gstAmount.toFixed(2)),
      grandTotal: parseFloat(totals.grandTotal.toFixed(2)),
    };

    const orderToast = toast.loading("Placing your order...");
    try {
      await orderApi.place(orderData);
      setCartItems([]);
      toast.success("Order placed successfully! 🎉", { id: orderToast });
      await cartApi.clear(sessionId);
      setTimeout(() => navigate("/"), 2000);
    } catch {
      toast.error("Failed to place the order.", { id: orderToast });
    }
  };

  const totals = calculateTotals();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="container mx-auto p-4 md:p-10 my-30 md:my-10 max-w-6xl"
    >
      <div className="flex items-center justify-between mb-8">
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
          Back to Menu
        </motion.button>
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <ShoppingBag className="text-blue-600" />
          Your Cart ({totalItems})
        </h1>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : groupedOrders.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100"
        >
          <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
          <p className="text-2xl text-gray-400 font-medium mb-6">Your cart is feeling a bit light...</p>
          <button 
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all cursor-pointer"
          >
            Start Ordering
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {groupedOrders.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  key={item._id}
                  className="flex flex-col md:flex-row bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow"
                >
                  <div className="w-full md:w-40 h-40">
                    <img
                      src={item.image || "https://via.placeholder.com/300"}
                      alt={item.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-6 flex flex-col justify-between grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-1">{item.name}</h4>
                        <p className="text-sm text-gray-500 uppercase tracking-wider">{item.cuisine} • {item.section}</p>
                      </div>
                      <p className="text-xl font-bold text-blue-600">₹{item.totalPrice}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg">
                        <span className="text-gray-500 text-sm">Qty:</span>
                        <span className="font-bold text-lg">{item.quantity}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, color: "#ef4444" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemoveFromCart(item._id, item.name)}
                        className="p-2 text-gray-400 cursor-pointer"
                      >
                        <Trash2 size={24} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Checkout Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <CreditCard className="text-blue-600" /> Checkout
              </h2>
              
              <form onSubmit={handleOrderSubmit} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    required
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="contact"
                    placeholder="Contact Number"
                    value={formData.contact}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    required
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <textarea
                    name="address"
                    placeholder="Delivery Address / Table No."
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all h-24"
                    required
                  />
                </div>

                <div className="border-t border-dashed border-gray-200 pt-6 mt-6 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>GST (5%)</span>
                    <span className="font-semibold">₹{totals.gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-bold text-gray-900 pt-3 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-blue-600">₹{totals.grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-xl shadow-lg hover:bg-blue-700 transition-all mt-6 cursor-pointer"
                >
                  Confirm Order
                </motion.button>
                <p className="text-center text-xs text-gray-400 mt-4">
                  Secure checkout powered by DineEase
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Cart;
