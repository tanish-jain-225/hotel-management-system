import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const handleOrderDone = async (order) => {
    if (!window.confirm("Are you sure you want to complete this order?")) return;

    try {
      const deleteResponse = await fetch(`${API_URL}/place-order/${order._id}`, {
        method: "DELETE",
      });
      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.message || "Failed to delete order");
      }

      // Step: Update UI
      setOrders((prev) => prev.filter((o) => o._id !== order._id));
      setSuccessMsg("Order marked as completed!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err.message);
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/place-order`);
      if (!response.ok) throw new Error("Failed to fetch orders");

      const data = await response.json();
      // Sort orders by orderDate descending (most recent first)
      const sortedOrders = data.sort(
        (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
      );
      setOrders(sortedOrders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p className="text-center p-4">Loading orders...</p>;

  return (
    <div className="max-w-4xl mx-auto my-12 p-6 md:p-10 bg-white rounded-lg shadow-lg">
      {/* Navigation Buttons */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <button
          className="bg-red-600 rounded-md py-2 px-6 text-white font-bold"
          onClick={() => navigate("/admin")}
        >
          Back
        </button>
      </div>
      <hr className="mb-8" />

      {/* Messages */}
      {successMsg && (
        <p className="text-green-600 text-center font-semibold mb-4">
          {successMsg}
        </p>
      )}
      {error && (
        <p className="text-red-600 text-center font-semibold mb-4">{error}</p>
      )}

      {orders.length === 0 ? (
        <p className="text-center text-gray-500 text-lg my-8">
          No orders available.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {orders.map((order, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row justify-between p-6 border border-gray-300 rounded-lg shadow-md bg-white gap-6 mb-4"
            >
              {/* Customer Info */}
              <div className="flex flex-col gap-3 w-full md:w-1/3">
                <p className="text-gray-500 text-sm">
                  <span className="font-semibold text-black">Serial No:</span>{" "}
                  {order.serialNumber}
                </p>
                <p className="text-gray-500 text-sm">
                  <span className="font-semibold text-black">Name:</span>{" "}
                  {order.customer.name}
                </p>
                <p className="text-gray-500 text-sm">
                  <span className="font-semibold text-black">Contact:</span>{" "}
                  {order.customer.contact}
                </p>
                <p className="text-gray-500 text-sm">
                  <span className="font-semibold text-black">Payment:</span>{" "}
                  {order.paymentMethod}
                </p>
              </div>

              {/* Order Items */}
              <div className="flex flex-col gap-2 mt-4 md:mt-0 w-full md:w-1/3">
                <p className="text-sm font-semibold">Order Items:</p>
                <ul className="list-disc list-inside text-gray-700">
                  {order.items.map((item, index) => (
                    <li key={index}>
                      {item.name} x {item.quantity} - ₹{item.price}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Total and Date */}
              <div className="flex flex-col gap-3 mt-4 md:mt-0 w-full md:w-1/3 text-left md:text-right">
                <p className="text-gray-500 text-sm">
                  <span className="font-semibold text-black">Order Date:</span>{" "}
                  {new Date(order.orderDate).toLocaleString()}
                </p>
                <p className="text-gray-700 text-sm">
                  <span className="font-semibold text-black">Grand Total:</span>{" "}
                  ₹{order.grandTotal.toFixed(2)}
                </p>
              </div>

              {/* Done Button */}
              <div className="mt-4 md:mt-0 flex justify-center md:justify-end">
                <button
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-md w-full max-h-[40px]"
                  onClick={() => handleOrderDone(order)}
                >
                  Done
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllOrders;
