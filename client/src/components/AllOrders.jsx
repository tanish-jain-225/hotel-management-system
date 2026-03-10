import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderApi } from "../services/api";
import FlashMessage from "./FlashMessage";

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const data = await orderApi.getAll();
      const sorted = data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      setOrders(sorted);
    } catch (err) {
      setFlash({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderDone = async (order) => {
    if (!window.confirm("Are you sure you want to complete this order?")) return;

    try {
      await orderApi.complete(order._id);
      setOrders((prev) => prev.filter((o) => o._id !== order._id));
      setFlash({ message: "Order marked as completed!", type: "success" });
    } catch (err) {
      setFlash({ message: err.message, type: "error" });
    }
  };

  if (loading) return <p className="text-center p-4">Loading orders...</p>;

  return (
    <div className="max-w-4xl mx-auto my-12 p-6 md:p-10 bg-white rounded-lg shadow-lg">
      {flash && (
        <FlashMessage message={flash.message} type={flash.type} onClose={() => setFlash(null)} />
      )}

      <div className="flex flex-wrap items-center gap-4 mb-8">
        <button
          className="bg-red-600 rounded-md py-2 px-6 text-white font-bold"
          onClick={() => navigate("/admin")}
        >
          Back
        </button>
      </div>
      <hr className="mb-8" />

      {orders.length === 0 ? (
        <p className="text-center text-gray-500 text-lg my-8">No orders available.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {orders.map((order) => (
            <div
              key={order._id}
              className="flex flex-col md:flex-row justify-between p-6 border border-gray-300 rounded-lg shadow-md bg-white gap-6 mb-4"
            >
              <div className="flex flex-col gap-3 w-full md:w-1/3">
                <p className="text-gray-500 text-sm">
                  <span className="font-semibold text-black">Serial No:</span> {order.serialNumber}
                </p>
                <p className="text-gray-500 text-sm">
                  <span className="font-semibold text-black">Name:</span> {order.customer.name}
                </p>
                <p className="text-gray-500 text-sm">
                  <span className="font-semibold text-black">Contact:</span> {order.customer.contact}
                </p>
                <p className="text-gray-500 text-sm">
                  <span className="font-semibold text-black">Payment:</span> {order.paymentMethod}
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-4 md:mt-0 w-full md:w-1/3">
                <p className="text-sm font-semibold">Order Items:</p>
                <ul className="list-disc list-inside text-gray-700">
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} x {item.quantity} - ₹{item.price}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3 mt-4 md:mt-0 w-full md:w-1/3 text-left md:text-right">
                <p className="text-gray-500 text-sm">
                  <span className="font-semibold text-black">Order Date:</span>{" "}
                  {new Date(order.orderDate).toLocaleString()}
                </p>
                <p className="text-gray-700 text-sm">
                  <span className="font-semibold text-black">Grand Total:</span> ₹
                  {order.grandTotal.toFixed(2)}
                </p>
              </div>

              <div className="mt-4 md:mt-0 flex justify-center md:justify-end">
                <button
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-md w-full max-h-10"
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
