import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { menuApi } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { PlusCircle, Trash2, Search, Filter, ClipboardList, LayoutGrid, DollarSign, Image as ImageIcon, UtensilsCrossed } from "lucide-react";

const INITIAL_MENU_DATA = {
  name: "",
  cuisine: "",
  section: "",
  price: "",
  image: "",
  info: "",
};

const Admin = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  const [menuData, setMenuData] = useState(INITIAL_MENU_DATA);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState("All");

  const fetchMenuItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await menuApi.getAll();
      setMenuItems(data);
      setFilteredItems(data);
    } catch {
      toast.error("Error fetching menu items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const handleChange = (e) => {
    setMenuData({ ...menuData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleaned = Object.fromEntries(
      Object.entries(menuData).map(([key, value]) =>
        typeof value === "string" ? [key, value.trim()] : [key, value]
      )
    );

    if (!cleaned.name || !cleaned.cuisine || !cleaned.section || !cleaned.image || isNaN(cleaned.price) || cleaned.price <= 0) {
      toast.error("All fields are required, and price must be valid.");
      return;
    }

    const loadToast = toast.loading("Adding item...");
    setLoading(true);
    try {
      const data = await menuApi.add(cleaned);
      toast.success("Menu item added successfully!", { id: loadToast });
      const newItem = data.newItem;
      setMenuItems((prev) => [...prev, newItem]);
      if (selectedSection === "All" || selectedSection === newItem.section) {
        setFilteredItems((prev) => [...prev, newItem]);
      }
      setMenuData(INITIAL_MENU_DATA);
    } catch (error) {
      toast.error(error.message, { id: loadToast });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (_id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    const delToast = toast.loading("Deleting...");
    try {
      await menuApi.delete(_id);
      toast.success("Item deleted successfully!", { id: delToast });
      setMenuItems((prev) => prev.filter((item) => item._id !== _id));
      setFilteredItems((prev) => prev.filter((item) => item._id !== _id));
    } catch {
      toast.error("Failed to delete item.", { id: delToast });
    }
  };

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

  const sections = [
    "All",
    ...Array.from(
      new Map(
        menuItems.map((item) => [item.section.trim().toLowerCase(), item.section.trim()])
      ).values()
    ),
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto my-12 p-6 md:p-10"
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <h2 className="text-5xl font-black text-gray-900 tracking-tight">Admin <span className="text-blue-600">Dashboard</span></h2>
        <div className="flex gap-4 w-full md:w-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/all-orders")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-2xl font-bold shadow-lg hover:bg-green-700 transition-all w-full md:w-auto cursor-pointer"
          >
            <ClipboardList size={20} />
            Manage Orders
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Add New Item Form */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-24"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <PlusCircle className="text-blue-600" /> Add New Item
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <UtensilsCrossed className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    placeholder="Dish Name"
                    value={menuData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="cuisine"
                    placeholder="Cuisine"
                    value={menuData.cuisine}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    name="section"
                    placeholder="Section"
                    value={menuData.section}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="number"
                    name="price"
                    placeholder="Price (INR)"
                    value={menuData.price}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="image"
                    placeholder="Image URL"
                    value={menuData.image}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <textarea
                  name="info"
                  placeholder="Short Description"
                  value={menuData.info}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none h-24"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-all mt-4 cursor-pointer"
              >
                {loading ? "Adding..." : "Add to Menu"}
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Menu Items Management */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="relative grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border-none focus:ring-0 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 border-l border-gray-100 pl-4">
              <Filter className="text-gray-400" size={18} />
              <select
                value={selectedSection}
                onChange={handleSectionChange}
                className="bg-transparent border-none focus:ring-0 focus:outline-none font-semibold text-gray-600 capitalize cursor-pointer"
              >
                {sections.map((section, index) => (
                  <option key={index} value={section}>{section}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-12">
            <AnimatePresence mode="popLayout">
              {filteredItems.length > 0 ? (
                Object.entries(
                  filteredItems.reduce((acc, item) => {
                    const section = item.section || "Uncategorized";
                    if (!acc[section]) acc[section] = [];
                    acc[section].push(item);
                    return acc;
                  }, {})
                ).map(([section, items]) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={section} 
                    className="space-y-4"
                  >
                    <h3 className="text-2xl font-bold text-gray-800 capitalize flex items-center gap-2">
                      <LayoutGrid className="text-blue-600" size={20} />
                      {section}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {items.map((item) => (
                        <motion.div
                          layout
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          key={item._id}
                          className="flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
                        >
                          <div className="w-24 h-full">
                            <img
                              src={item.image || "https://via.placeholder.com/300"}
                              alt={item.name}
                              className="object-cover h-full w-full"
                            />
                          </div>
                          <div className="p-4 grow flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</h4>
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">₹{item.price}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{item.cuisine}</p>
                            </div>
                            <div className="flex justify-end mt-2">
                              <motion.button
                                whileHover={{ scale: 1.1, color: "#ef4444" }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(item._id)}
                                className="p-2 text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                              >
                                <Trash2 size={18} />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 rounded-3xl border-2 border-dashed border-gray-100">
                  <Search size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-xl text-gray-400 font-medium">No menu items found</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Admin;
