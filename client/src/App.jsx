import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import Login from "./components/Login";
import Admin from "./components/Admin";
import AllOrders from "./components/AllOrders";
import ChangeCredentials from "./components/ChangeCredentials";
import "./App.css";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-gray-100">
          <Navbar />
          <div className="grow pt-16">
            <Routes>
              <Route path="/" element={<Menu />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/all-orders" element={<AllOrders />} />
              <Route path="/change-credentials" element={<ChangeCredentials />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;