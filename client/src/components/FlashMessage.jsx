import { useEffect } from "react";

const FlashMessage = ({ message, type = "success", onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColor =
    type === "error" ? "bg-red-500" : type === "success" ? "bg-green-500" : "bg-blue-500";

  return (
    <div
      className={`fixed top-5 left-1/2 transform -translate-x-1/2 p-4 rounded-lg text-white shadow-lg z-50 ${bgColor}`}
    >
      {message}
    </div>
  );
};

export default FlashMessage;
