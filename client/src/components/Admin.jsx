import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { menuApi, settingsApi, adminApi } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { 
  PlusCircle, Trash2, Search, Filter, ClipboardList, 
  LayoutGrid, IndianRupee, Image as ImageIcon, 
  UtensilsCrossed, Edit, XCircle, Percent 
} from "lucide-react";

const INITIAL_MENU_DATA = {
  name: "",
  cuisine: "",
  section: "",
  price: "",
  image: "",
  info: "",
  available: true,
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
  const [editingId, setEditingId] = useState(null);

  // Settings States
  const [gstRateInput, setGstRateInput] = useState("5");
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Analytics State
  const [analytics, setAnalytics] = useState({ activeOrders: 0, completedToday: 0, revenueToday: 0 });

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

  const fetchSettings = useCallback(async () => {
    try {
      const data = await settingsApi.get();
      setGstRateInput(String(data.gstRate));
    } catch {
      toast.error("Failed to load GST settings.");
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const data = await adminApi.getAnalytics();
      setAnalytics(data);
    } catch {
      console.error("Failed to load analytics.");
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
    fetchSettings();
    fetchAnalytics();
  }, [fetchMenuItems, fetchSettings, fetchAnalytics]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const rate = parseFloat(gstRateInput);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error("Please enter a valid percentage between 0 and 100");
      return;
    }

    setSettingsLoading(true);
    const loadToast = toast.loading("Updating GST Rate...");
    try {
      await settingsApi.update({ gstRate: rate });
      toast.success("GST rate updated successfully! 🎉", { id: loadToast });
      fetchAnalytics(); // Refresh analytics in case total shifts
    } catch (err) {
      toast.error(err.message || "Failed to update settings", { id: loadToast });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleChange = (e) => {
    setMenuData({ ...menuData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (item) => {
    setEditingId(item._id);
    setMenuData({
      name: item.name,
      cuisine: item.cuisine,
      section: item.section,
      price: item.price,
      image: item.image,
      info: item.info || "",
      available: item.available !== false,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setMenuData(INITIAL_MENU_DATA);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleaned = {
      name: menuData.name.trim(),
      cuisine: menuData.cuisine.trim(),
      section: menuData.section.trim(),
      price: parseFloat(menuData.price),
      image: menuData.image.trim(),
      info: menuData.info.trim(),
      available: menuData.available !== false,
    };

    if (!cleaned.name || !cleaned.cuisine || !cleaned.section || !cleaned.image || isNaN(cleaned.price) || cleaned.price <= 0) {
      toast.error("All fields are required, and price must be a valid positive number.");
      return;
    }

    const isEditing = !!editingId;
    const loadToast = toast.loading(isEditing ? "Updating item..." : "Adding item...");
    setLoading(true);
    try {
      if (isEditing) {
        const data = await menuApi.update(editingId, cleaned);
        toast.success("Menu item updated successfully!", { id: loadToast });
        const updated = data.updatedItem;
        setMenuItems((prev) => prev.map((item) => (item._id === editingId ? updated : item)));
        setFilteredItems((prev) => prev.map((item) => (item._id === editingId ? updated : item)));
        setEditingId(null);
      } else {
        const data = await menuApi.add(cleaned);
        toast.success("Menu item added successfully!", { id: loadToast });
        const newItem = data.newItem;
        setMenuItems((prev) => [...prev, newItem]);
        if (selectedSection === "All" || selectedSection === newItem.section) {
          setFilteredItems((prev) => [...prev, newItem]);
        }
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

  const handleToggleAvailability = async (item) => {
    const nextAvailable = item.available === false ? true : false;
    const loadToast = toast.loading("Updating stock availability...");
    try {
      const updatedItem = {
        name: item.name,
        cuisine: item.cuisine,
        section: item.section,
        price: item.price,
        image: item.image,
        info: item.info || "",
        available: nextAvailable
      };
      const data = await menuApi.update(item._id, updatedItem);
      const updated = data.updatedItem;
      
      setMenuItems((prev) => prev.map((it) => (it._id === item._id ? updated : it)));
      setFilteredItems((prev) => prev.map((it) => (it._id === item._id ? updated : it)));
      
      toast.success(`${item.name} is now ${nextAvailable ? "In Stock" : "Out of Stock"}!`, { id: loadToast });
    } catch (err) {
      toast.error(err.message || "Failed to update availability", { id: loadToast });
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

      {/* Analytics Dashboard Panel */}
      <div className="flex flex-col md:flex-row gap-6 mb-3">
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 transition-shadow duration-300 flex-1 w-full"
        >
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <ClipboardList size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Orders</p>
            <h4 className="text-3xl font-black text-gray-900 mt-1">{analytics.activeOrders}</h4>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 transition-shadow duration-300 flex-1 w-full"
        >
          <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl">
            <UtensilsCrossed size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed (24h)</p>
            <h4 className="text-3xl font-black text-gray-900 mt-1">{analytics.completedToday}</h4>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 transition-shadow duration-300 flex-1 w-full"
        >
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <IndianRupee size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Revenue (24h)</p>
            <h4 className="text-3xl font-black text-emerald-600 mt-1">₹{analytics.revenueToday.toFixed(2)}</h4>
          </div>
        </motion.div>
      </div>
      <div className="text-left md:text-right text-xs font-bold text-gray-400 italic mb-12 ml-2 md:mr-2">
        * Metrics reflect a rolling 24-hour window irrespective of timezone. Completed orders automatically clear after 24 hours.
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left Column: Form & Settings */}
        <div className="w-full lg:w-1/3">
          <div className="flex flex-col gap-8">
            {/* Add/Edit Form */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {editingId ? <Edit className="text-blue-600" /> : <PlusCircle className="text-blue-600" />}
                  {editingId ? "Edit Menu Item" : "Add New Item"}
                </span>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <XCircle size={16} /> Cancel
                  </button>
                )}
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-800"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      name="cuisine"
                      placeholder="Cuisine"
                      value={menuData.cuisine}
                      onChange={handleChange}
                      className="flex-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-800"
                    />
                    <input
                      type="text"
                      name="section"
                      placeholder="Section"
                      value={menuData.section}
                      onChange={handleChange}
                      className="flex-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-800"
                    />
                  </div>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input
                      type="number"
                      step="any"
                      name="price"
                      placeholder="Price (INR)"
                      value={menuData.price}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-800"
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-800"
                    />
                  </div>
                  <textarea
                    name="info"
                    placeholder="Short Description"
                    value={menuData.info}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none h-24 bg-white text-gray-800"
                  />
                  <div className="flex items-center gap-2 px-1 py-1">
                    <input
                      type="checkbox"
                      name="available"
                      id="avail-checkbox"
                      checked={menuData.available !== false}
                      onChange={(e) => setMenuData({ ...menuData, available: e.target.checked })}
                      className="w-4.5 h-4.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="avail-checkbox" className="text-sm font-semibold text-gray-600 cursor-pointer select-none">
                      Item Available / In Stock
                    </label>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-all mt-4 cursor-pointer"
                >
                  {loading ? "Saving..." : (editingId ? "Save Changes" : "Add to Menu")}
                </motion.button>
              </form>
            </motion.div>

            {/* GST Config */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Percent className="text-blue-600" size={20} /> GST Configuration
              </h3>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">GST Rate (%)</label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 5"
                      value={gstRateInput}
                      onChange={(e) => setGstRateInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-800"
                      required
                    />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={settingsLoading}
                  className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-bold shadow-md hover:bg-blue-700 transition-all cursor-pointer"
                >
                  {settingsLoading ? "Saving..." : "Save GST Rate"}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>

        {/* Menu Management */}
        <div className="w-full lg:w-2/3 space-y-8">
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
                    <div className="flex flex-col md:flex-row flex-wrap gap-6">
                      {items.map((item) => (
                        <motion.div
                          layout
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          key={item._id}
                          className={`flex w-full md:w-[calc(50%-0.75rem)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group ${
                            item.available === false ? "opacity-60 border-red-100" : ""
                          }`}
                        >
                          <div className="w-24 flex-shrink-0 relative">
                            {item.available === false && (
                              <div className="absolute inset-0 bg-red-600/10 z-10" />
                            )}
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
                              {item.info && (
                                <p className="text-xs text-gray-400 mt-2 line-clamp-2 italic">
                                  {item.info}
                                </p>
                              )}
                            </div>
                            <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-50">
                              {/* Stock Toggler Checkbox */}
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="checkbox"
                                  id={`avail-${item._id}`}
                                  checked={item.available !== false}
                                  onChange={() => handleToggleAvailability(item)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <label 
                                  htmlFor={`avail-${item._id}`} 
                                  className={`text-[10px] font-extrabold uppercase cursor-pointer select-none ${
                                    item.available !== false ? "text-green-600" : "text-red-500"
                                  }`}
                                >
                                  {item.available !== false ? "In Stock" : "Out of Stock"}
                                </label>
                              </div>

                              <div className="flex gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1, color: "#2563eb" }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleEditClick(item)}
                                  className="p-1.5 text-gray-300 hover:text-blue-600 transition-colors cursor-pointer"
                                >
                                  <Edit size={18} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1, color: "#ef4444" }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDelete(item._id)}
                                  className="p-1.5 text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                                >
                                  <Trash2 size={18} />
                                </motion.button>
                              </div>
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
