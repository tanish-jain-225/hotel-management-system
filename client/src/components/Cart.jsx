import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cartApi, orderApi } from "../services/api";
import { getSessionId } from "../utils/session";
import FlashMessage from "./FlashMessage";

const GST_RATE = 0.05;

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removedStatus, setRemovedStatus] = useState({});
  const [formData, setFormData] = useState({ name: "", contact: "", address: "" });
  const [flash, setFlash] = useState(null);
  const navigate = useNavigate();

  const sessionId = getSessionId();

  const fetchCartItems = async () => {
    try {
      const data = await cartApi.getItems(sessionId);
      setCartItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const handleRemoveFromCart = async (itemId) => {
    try {
      await cartApi.removeItem(itemId, sessionId);
      setRemovedStatus((prev) => ({ ...prev, [itemId]: true }));
      setTimeout(() => {
        setRemovedStatus((prev) => ({ ...prev, [itemId]: false }));
        fetchCartItems();
      }, 1000);
    } catch (err) {
      console.error("Error removing item:", err);
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
      setFlash({ message: "Please fill out all fields before submitting.", type: "error" });
      return;
    }

    const totals = calculateTotals();
    const orderData = {
      sessionId,
      ...formData,
      paymentMethod: "Cash on Counter or UPI or Credit/Debit Card",
      items: groupedOrders,
      subtotal: parseFloat(totals.subtotal.toFixed(2)),
      gstAmount: parseFloat(totals.gstAmount.toFixed(2)),
      grandTotal: parseFloat(totals.grandTotal.toFixed(2)),
    };

    try {
      await orderApi.place(orderData);
      setCartItems([]);
      setFlash({ message: "Order placed successfully!", type: "success" });
      await cartApi.clear(sessionId);
    } catch {
      setFlash({ message: "Failed to place the order. Please try again.", type: "error" });
    }
  };

  return (
    <div className="cart p-6 max-w-full mx-2 bg-white shadow-lg rounded-lg my-30 md:my-10">
      {flash && (
        <FlashMessage
          message={flash.message}
          type={flash.type}
          onClose={() => setFlash(null)}
        />
      )}

      <div>
        <button
          onClick={() => navigate("/")}
          className="bg-red-500 px-4 py-2 rounded-lg text-white cursor-pointer mb-4"
        >
          Back
        </button>
      </div>
      <hr />
      <div className="text-3xl font-bold mb-6">Your Cart ({totalItems})</div>

      {loading && <p className="text-gray-600">Loading Cart...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && groupedOrders.length === 0 && (
        <p className="text-gray-500">Your cart is empty.</p>
      )}

      {!loading && !error && groupedOrders.length > 0 && (
        <div className="flex flex-wrap gap-6 my-4 capitalize">
          {groupedOrders.map((item) => (
            <div
              key={item._id}
              className="flex w-full md:w-[45%] lg:w-[30%] border border-gray-200 rounded-lg shadow-md overflow-hidden md:flex-row flex-col bg-white"
            >
              <div className="w-full md:w-1/3 h-48 md:h-auto">
                <img
                  src={item.image || "https://via.placeholder.com/300"}
                  alt={item.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-4 flex flex-col justify-between grow">
                <h4 className="text-xl font-bold text-gray-900">{item.name}</h4>
                <p className="text-gray-700">
                  Cuisine: <span className="font-semibold">{item.cuisine}</span>
                </p>
                <p className="text-gray-700">
                  Section: <span className="font-semibold">{item.section}</span>
                </p>
                <p className="text-blue-600 font-semibold">
                  Rs. {item.price} x {item.quantity} = Rs. {item.totalPrice}
                </p>
                <button
                  className={`my-2 p-2 cursor-pointer rounded-md w-full ${
                    removedStatus[item._id] ? "bg-gray-400 cursor-not-allowed" : "bg-red-500"
                  } text-white`}
                  onClick={() => handleRemoveFromCart(item._id)}
                  disabled={removedStatus[item._id]}
                >
                  {removedStatus[item._id] ? "Removed" : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && groupedOrders.length > 0 && (
        <form onSubmit={handleOrderSubmit} className="mt-10 p-6 bg-gray-100 rounded-lg capitalize">
          <h2 className="text-2xl font-bold mb-4">Complete Your Order</h2>
          <div className="mb-4">
            <label className="block mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Contact Number</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="my-4">
            Payment Method: <strong>Cash or UPI or Credit/Debit Card</strong>
          </div>
          <button type="submit" className="bg-green-500 text-white p-3 rounded-lg cursor-pointer">
            Place Order
          </button>
        </form>
      )}
    </div>
  );
};

export default Cart;
