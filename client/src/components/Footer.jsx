import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-10 mt-20">
      <div className="container mx-auto px-4 flex flex-col items-center text-center space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <img src="/8575289.png" alt="Logo" className="w-4 h-4" />
          </div>
          <span className="text-xl font-black text-gray-900 tracking-tighter uppercase">
            Dine<span className="text-blue-600">Ease</span>
          </span>
        </div>
        <p className="text-gray-400 text-sm font-medium">
          &copy; {new Date().getFullYear()} DineEase. All rights reserved.
        </p>
        <p className="text-gray-400 text-xs uppercase tracking-widest font-bold opacity-50">
          Crafting Culinary Excellence
        </p>
      </div>
    </footer>
  );
};

export default Footer;
