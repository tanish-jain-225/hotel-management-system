import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// FlashCard Component
const FlashCard = ({ message, onClose, type = "success" }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "error"
      ? "bg-red-500"
      : type === "success"
      ? "bg-green-500"
      : "bg-blue-500";

  return (
    <div
      className={`fixed top-5 left-1/2 transform -translate-x-1/2 p-4 rounded-lg text-white shadow-lg z-50 ${bgColor}`}
    >
      {message}
    </div>
  );
};

const Admin = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Initial States
  const initialMenuData = {
    name: "",
    cuisine: "",
    section: "",
    price: "",
    image: "",
    info: "",
  };

  const [menuData, setMenuData] = useState(initialMenuData);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [flashMessages, setFlashMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState("All");

  // API URL
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch Menu Items
  const fetchMenuItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}`);
      if (!response.ok) throw new Error("Failed to fetch menu items");
      const data = await response.json();
      setMenuItems(data);
      setFilteredItems(data); // Initialize filtered items
    } catch (error) {
      console.error("Error fetching menu:", error);
      addFlashMessage("Error fetching menu items.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  // Flash Message
  const addFlashMessage = (message, type = "success") => {
    setFlashMessages((prev) => [...prev, { message, type }]);
  };

  const removeFlashMessage = (index) => {
    setFlashMessages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Input Change
  const handleChange = (e) => {
    setMenuData({ ...menuData, [e.target.name]: e.target.value });
  };

  const resetMenuData = () => setMenuData(initialMenuData);

  // Submit New Menu Item
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Lowercase all string values
    const lowercasedData = Object.fromEntries(
      Object.entries(menuData).map(([key, value]) =>
        typeof value === "string"
          ? [key, value.trim().toLowerCase()]
          : [key, value]
      )
    );

    // Validation
    if (
      !lowercasedData.name ||
      !lowercasedData.cuisine ||
      !lowercasedData.section ||
      !lowercasedData.image ||
      isNaN(lowercasedData.price) ||
      lowercasedData.price <= 0
    ) {
      addFlashMessage(
        "All fields are required, and price must be valid.",
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lowercasedData),
      });

      if (!response.ok) {
        let errorMessage = "Failed to add item";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Handle non-JSON errors
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      addFlashMessage("Menu item added successfully!");
      const newItem = data.newItem;

      setMenuItems((prev) => [...prev, newItem]);
      if (selectedSection === "All" || selectedSection === newItem.section) {
        setFilteredItems((prev) => [...prev, newItem]);
      }
      resetMenuData();
    } catch (error) {
      console.error("Error:", error);
      addFlashMessage(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete Menu Item
  const handleDelete = async (_id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id }),
      });

      if (!response.ok) throw new Error("Failed to delete item");

      addFlashMessage("Item deleted successfully!");
      setMenuItems((prev) => prev.filter((item) => item._id !== _id));
      setFilteredItems((prev) => prev.filter((item) => item._id !== _id)); // Update filtered items
    } catch (error) {
      console.error("Error deleting item:", error);
      addFlashMessage("Failed to delete item.", "error");
    }
  };

  // Search and Filter
  const filterMenuItems = (search, section) => {
    let filtered = menuItems;

    if (search.trim()) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (section !== "All") {
      filtered = filtered.filter(
        (item) => item.section.trim().toLowerCase() === section.toLowerCase()
      );
    }

    setFilteredItems(filtered);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterMenuItems(term, selectedSection);
  };

  const handleSectionChange = (e) => {
    const section = e.target.value;
    setSelectedSection(section);
    filterMenuItems(searchTerm, section);
  };

  // Extract Unique Sections
  const sections = [
    "All",
    ...Array.from(
      new Map(
        menuItems.map((item) => [
          item.section.trim().toLowerCase(),
          item.section.trim(),
        ])
      ).values()
    ),
  ];

  return (
    <div className="max-w-6xl mx-auto my-12 p-6 md:p-10 flex flex-col gap-10">
      <h2 className="text-4xl font-bold text-center text-blue-600 mb-10">
        Admin Panel
      </h2>

      {/* Flash Messages */}
      {flashMessages.map((msg, index) => (
        <FlashCard
          key={index}
          message={msg.message}
          onClose={() => removeFlashMessage(index)}
          type={msg.type}
        />
      ))}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 border p-6 md:p-8 rounded-lg shadow-md mb-10"
      >
        {["name", "cuisine", "section", "price", "image"].map((field) => (
          <input
            key={field}
            type={field === "price" ? "number" : "text"}
            name={field}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={menuData[field]}
            onChange={handleChange}
            className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        ))}
        <textarea
          name="info"
          placeholder="Additional Info"
          value={menuData.info}
          onChange={handleChange}
          className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
        ></textarea>

        <button
          type="submit"
          className={`p-2 rounded-md text-white font-bold ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Add Menu Item"}
        </button>
      </form>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full mb-10">
        <input
          type="text"
          placeholder="Search For Food"
          value={searchTerm}
          onChange={handleSearch}
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
        />
        <select
          value={selectedSection}
          onChange={handleSectionChange}
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-full capitalize cursor-pointer"
        >
          {sections.map((section, index) => (
            <option
              key={index}
              value={section}
              className="capitalize cursor-pointer"
            >
              {section}
            </option>
          ))}
        </select>

        {/* Orders Button */}
        <button
          onClick={() => navigate("/AllOrders")}
          className="p-3 bg-green-500 text-white rounded-lg transition-all hover:bg-green-600 w-full font-semibold cursor-pointer"
        >
          All Orders
        </button>
      </div>

      {/* Display Menu Items by Section */}
      <div className="flex flex-col gap-10">
        {filteredItems.length > 0 ? (
          Object.keys(
            filteredItems.reduce((acc, item) => {
              const section = item.section || "Uncategorized";
              if (!acc[section]) acc[section] = [];
              acc[section].push(item);
              return acc;
            }, {})
          ).map((section) => (
            <div key={section} className="flex flex-col gap-6 mb-8">
              <h3 className="text-2xl font-bold text-gray-800 capitalize mb-2">
                {section}
              </h3>
              <hr className="mb-4" />
              <div className="flex flex-wrap gap-6 capitalize">
                {filteredItems
                  .filter((item) => item.section === section)
                  .map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-col border border-gray-300 rounded-lg shadow-md w-full md:w-[30%] overflow-hidden mb-4"
                    >
                      <img
                        src={item.image || "https://via.placeholder.com/300"}
                        alt={item.name}
                        className="object-cover w-full h-48"
                      />
                      <div className="flex flex-col p-4 gap-3">
                        <h4 className="text-xl font-bold text-gray-800">
                          {item.name}
                        </h4>
                        <p className="text-gray-700">
                          <span className="font-semibold">Cuisine:</span>{" "}
                          {item.cuisine}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-semibold">Price:</span> ₹
                          {item.price}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-semibold">About:</span>{" "}
                          {item.info || "No additional info available"}
                        </p>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg mt-4 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-lg text-center w-full mt-4">
            No Items Found
          </p>
        )}
      </div>
    </div>
  );
};

export default Admin;
