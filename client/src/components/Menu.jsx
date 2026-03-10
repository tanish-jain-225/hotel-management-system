import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { menuApi, cartApi } from "../services/api";
import { getSessionId } from "../utils/session";

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [addedStatus, setAddedStatus] = useState({});
  const navigate = useNavigate();

  const sessionId = getSessionId();

  const fetchCartCount = async () => {
    try {
      const data = await cartApi.getItems(sessionId);
      setCartCount(Array.isArray(data) ? data.length : 0);
    } catch {
      setCartCount(0);
    }
  };

  const handleAddToCart = async (item) => {
    try {
      await cartApi.addItem({
        sessionId,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image,
        cuisine: item.cuisine,
        section: item.section,
      });

      fetchCartCount();
      setAddedStatus((prev) => ({ ...prev, [item._id]: true }));
      setTimeout(() => setAddedStatus((prev) => ({ ...prev, [item._id]: false })), 2000);
    } catch (error) {
      console.error("Error adding item to cart:", error);
      alert("Failed to add item to cart. Please try again.");
    }
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await menuApi.getAll();
        setMenuItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
    fetchCartCount();
  }, []);

  const sections = useMemo(() => {
    const unique = {};
    menuItems.forEach((item) => {
      const normalized = item.section.trim().toLowerCase();
      if (!unique[normalized]) unique[normalized] = item.section.trim();
    });
    return ["All", ...Object.values(unique)];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedSection === "All" ||
          item.section.trim().toLowerCase() === selectedSection.toLowerCase())
    );
  }, [menuItems, searchTerm, selectedSection]);

  const groupedItems = useMemo(() => {
    const grouped = {};
    filteredItems.forEach((item) => {
      const section = item.section.trim();
      if (!grouped[section]) grouped[section] = [];
      grouped[section].push(item);
    });
    return grouped;
  }, [filteredItems]);

  return (
    <div className="container mx-auto px-4 py-10 bg-gray-100 my-30 md:my-10">
      <h2 className="text-4xl font-bold text-center text-blue-600 mb-8">
        Explore Our Delicious Menu
      </h2>

      {loading && <p className="text-center text-lg text-gray-600">Loading Menu...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="flex flex-col md:flex-row justify-center gap-4 my-8 items-center">
          <input
            type="text"
            placeholder="Search For Food"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none capitalize cursor-pointer"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            {sections.map((section, index) => (
              <option key={index} value={section} className="capitalize cursor-pointer">
                {section}
              </option>
            ))}
          </select>

          <div
            className="cart py-2 px-6 bg-blue-600 rounded-md flex items-center justify-center cursor-pointer text-white font-semibold text-2xl gap-2 w-full"
            onClick={() => navigate("/cart")}
          >
            <span className="md:hidden font-bold">Cart</span>
            <img
              src="https://cdn-icons-png.flaticon.com/128/3514/3514491.png"
              alt="cart"
              className="w-[30px] invert"
            />
            ({cartCount})
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-4 capitalize mx-auto">
          {Object.entries(groupedItems).map(([section, items]) => (
            <div key={section} className="w-full mx-auto">
              <h3 className="text-3xl font-bold text-gray-700 mb-1">{section}</h3>
              <hr />
              <div className="flex flex-wrap gap-6 my-4 mx-auto">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="flex w-full md:w-[40%] lg:w-[30%] border border-gray-200 rounded-lg shadow-md overflow-hidden md:flex-row flex-col bg-white"
                  >
                    <div className="w-full md:w-1/3 h-48 md:h-auto flex">
                      <img
                        src={item.image || "https://via.placeholder.com/300"}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="p-4 flex flex-col justify-between grow">
                      <h4 className="text-xl font-bold text-gray-900">{item.name}</h4>
                      <p className="text-gray-700">
                        Cuisine: <span className="text-gray-800 font-semibold">{item.cuisine}</span>
                      </p>
                      <p className="text-blue-600 font-semibold">₹{item.price}</p>
                      {item.info && <p className="text-gray-500 italic">Info: {item.info}</p>}
                      <button
                        className={`my-2 p-2 cursor-pointer rounded-md w-full ${
                          addedStatus[item._id] ? "bg-green-500" : "bg-blue-600"
                        } text-white`}
                        onClick={() => handleAddToCart(item)}
                        disabled={addedStatus[item._id]}
                      >
                        {addedStatus[item._id] ? "Added" : "Add To Cart"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filteredItems.length === 0 && (
        <p className="text-center text-lg text-gray-600">
          No items available for the selected section or search term.
        </p>
      )}
    </div>
  );
};

export default Menu;
