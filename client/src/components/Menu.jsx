import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { menuApi, cartApi } from "../services/api";
import { getSessionId } from "../utils/session";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Search, ShoppingCart, Filter } from "lucide-react";

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [cartMap, setCartMap] = useState({});
  const [addedStatus, setAddedStatus] = useState({});
  const navigate = useNavigate();

  const sessionId = getSessionId();

  const fetchCartCount = async () => {
    try {
      const data = await cartApi.getItems(sessionId);
      setCartCount(Array.isArray(data) ? data.length : 0);
      // build name -> { quantity, ids[] } map for quick lookup
      if (Array.isArray(data)) {
        const map = {};
        data.forEach((it) => {
          const name = it.name;
          if (!map[name]) map[name] = { quantity: 0, ids: [] };
          map[name].quantity += it.quantity || 1;
          map[name].ids.push(it._id);
        });
        setCartMap(map);
      } else {
        setCartMap({});
      }
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

      // refresh cart state
      await fetchCartCount();
      toast.success(`${item.name} added to cart!`);
      setAddedStatus((prev) => ({ ...prev, [item._id]: true }));
      setTimeout(() => setAddedStatus((prev) => ({ ...prev, [item._id]: false })), 1200);
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };

  const handleIncrease = async (item) => {
    await handleAddToCart(item);
  };

  const handleDecrease = async (item) => {
    try {
      // find a cart document id for this item
      const entry = cartMap[item.name];
      if (!entry || entry.ids.length === 0) return;
      const idToRemove = entry.ids[entry.ids.length - 1];
      await cartApi.removeItem(idToRemove, sessionId);
      await fetchCartCount();
      toast.success(`${item.name} quantity decreased`);
    } catch (err) {
      console.error("Error decreasing item:", err);
      toast.error("Failed to decrease item quantity");
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-10 my-30 md:my-10"
    >
      <div className="text-center mb-16">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-5xl font-black text-gray-900 tracking-tight mb-4"
        >
          Explore Our <span className="text-blue-600 underline decoration-blue-200 decoration-8 underline-offset-4">Delicious Menu</span>
        </motion.h2>
        <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">
          Savor the finest cuisines crafted with passion and fresh ingredients. 
          Your culinary journey starts here.
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-lg text-gray-600 font-medium">Preparing the delicacies...</p>
        </div>
      )}
      {error && <p className="text-center text-red-500 font-bold bg-red-100 p-4 rounded-lg">{error}</p>}

      {!loading && !error && (
        <div className="flex flex-col md:flex-row justify-center gap-4 my-8 items-center">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search For Food"
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none capitalize cursor-pointer bg-white appearance-none"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              {sections.map((section, index) => (
                <option key={index} value={section} className="capitalize">
                  {section}
                </option>
              ))}
            </select>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cart py-2 px-6 bg-blue-600 rounded-md flex items-center justify-center cursor-pointer text-white font-semibold text-2xl gap-2 w-full shadow-lg"
            onClick={() => navigate("/cart")}
          >
            <ShoppingCart size={24} />
            <span>({cartCount})</span>
          </motion.div>
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-8 capitalize mx-auto">
          {Object.entries(groupedItems).map(([section, items]) => (
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              key={section} 
              className="w-full mx-auto"
            >
              <h3 className="text-3xl font-bold text-gray-800 mb-2 border-l-4 border-blue-600 pl-4">{section}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      key={item._id}
                      className="flex flex-col border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-shadow overflow-hidden bg-white group"
                    >
                      <div className="w-full h-48 overflow-hidden">
                        <motion.img
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.4 }}
                          src={item.image || "https://via.placeholder.com/300"}
                          alt={item.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="p-5 flex flex-col justify-between grow">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</h4>
                            <span className="text-sm font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-full">{item.cuisine}</span>
                          </div>
                          {item.info && <p className="text-gray-500 italic text-sm mb-4 line-clamp-2">{item.info}</p>}
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-2xl font-bold text-gray-900">₹{item.price}</p>
                          {cartMap[item.name] && cartMap[item.name].quantity > 0 ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDecrease(item)}
                                className="px-3 py-2 bg-gray-100 rounded-full text-gray-700 font-bold"
                                aria-label={`Decrease ${item.name}`}
                              >
                                -
                              </button>
                              <div className="px-4 py-2 bg-gray-50 rounded-xl font-semibold">{cartMap[item.name].quantity}</div>
                              <button
                                onClick={() => handleIncrease(item)}
                                className="px-3 py-2 bg-blue-600 text-white rounded-full font-bold"
                                aria-label={`Increase ${item.name}`}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-4 py-2 cursor-pointer rounded-xl font-semibold transition-colors ${
                                addedStatus[item._id] ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
                              } shadow-md`}
                              onClick={() => handleAddToCart(item)}
                              disabled={addedStatus[item._id]}
                            >
                              {addedStatus[item._id] ? "Added ✅" : "Add To Cart"}
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && !error && filteredItems.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-white rounded-3xl shadow-inner mt-10"
        >
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-xl text-gray-500 font-medium">
            We couldn't find any dishes matching your search.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Menu;
