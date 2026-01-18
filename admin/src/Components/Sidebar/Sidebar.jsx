import React, { useState } from "react";
import { NavLink, Outlet } from "react-router"; // fixed import (react-router → react-router-dom)
import {
  FaHome,
  FaBell,
  FaHeart,
  FaWallet,
  FaChartLine,
  FaSignOutAlt,
  FaSearch,
  FaUsers,
  FaUserCircle,
  FaUpload,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { BiCategoryAlt } from "react-icons/bi";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoAppsSharp } from "react-icons/io5";
import { GrAnnounce } from "react-icons/gr";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import useAuth from "../../hook/useAuth";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [promotionsOpen, setPromotionsOpen] = useState(false);
  const { logout } = useAuth();

  const menuItems = [
    { to: "/", icon: <FaHome />, text: "Dashboard", end: true },
    { to: "/revenue", icon: <FaChartLine />, text: "Revenue" },
    { to: "/all-developer", icon: <FaUsers />, text: "Developers" },
    { to: "/add-category", icon: <BiCategoryAlt />, text: "Categories" },
    { to: "/notifications", icon: <FaBell />, text: "Notifications" },
    { to: "/all-apk", icon: <IoAppsSharp />, text: "All Apps" },
    { to: "/analytics", icon: <FaChartLine />, text: "Analytics" },
    { to: "/likes", icon: <FaHeart />, text: "Likes" },
    { to: "/wallets", icon: <FaWallet />, text: "Wallets" },
  ];

  const promotionSubItems = [
    { to: "/promotions/banner", text: "Banner Promotion" },
    { to: "/promotions/popular", text: "Popular Promotion" },
    { to: "/promotions/ads-one", text: "Ads One" },
    { to: "/promotions/ads-two", text: "Ads Two" },
    { to: "/promotions/badge-app", text: "Badge App" },
    { to: "/promotions/most-download", text: "Most Downloaded" },
    { to: "/promotions/ratings-reviews", text: "Ratings & Reviews" },
  ];

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/70 to-slate-950 text-gray-100 flex">
      {/* ─── Mobile Top Bar ─── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-indigo-900/40">
        <div className="flex items-center justify-between px-4 py-3.5">
          <button
            onClick={() => setOpen(true)}
            className="p-2.5 rounded-xl hover:bg-indigo-950/60 transition-colors"
          >
            <RxHamburgerMenu className="text-2xl text-cyan-400" />
          </button>

          <div className="flex items-center gap-5">
            <button className="relative p-1.5">
              <FaBell className="text-xl text-slate-300 hover:text-cyan-400 transition-colors" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-rose-500/40"></span>
            </button>
            <FaUserCircle className="text-2xl text-slate-300 hover:text-cyan-400 transition-colors" />
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ─── Sidebar ─── */}
      <motion.aside
        initial={false}
        animate={{
          x: open || window.innerWidth >= 768 ? 0 : "-100%",
        }}
        transition={{ type: "spring", damping: 24, stiffness: 160 }}
        className="fixed md:static top-0 left-0 z-50 h-screen w-72 bg-gradient-to-b from-slate-950 via-indigo-950/60 to-slate-950 border-r border-indigo-900/40 shadow-2xl overflow-hidden flex flex-col"
      >
        <SidebarContent
          menuItems={menuItems}
          promotionSubItems={promotionSubItems}
          promotionsOpen={promotionsOpen}
          setPromotionsOpen={setPromotionsOpen}
          onClose={() => setOpen(false)}
          onLogout={handleLogout}
        />
      </motion.aside>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1  pt-16 md:pt-0">
        {/* Desktop Top Bar */}
        <div className="hidden md:flex items-center justify-between px-6 lg:px-10 py-4 border-b border-indigo-900/40 bg-slate-950/75 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input
                type="text"
                placeholder="Search apps, developers, analytics..."
                className="w-full pl-12 pr-5 py-3 bg-slate-900/70 border border-indigo-900/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/30 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2.5 hover:bg-indigo-950/60 rounded-xl transition-colors">
              <FaBell className="text-xl text-slate-300 hover:text-cyan-400 transition-colors" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-rose-500/30"></span>
            </button>

            <button className="p-1 hover:bg-indigo-950/60 rounded-full transition-colors">
              <FaUserCircle className="text-3xl text-slate-300 hover:text-cyan-400 transition-colors" />
            </button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-cyan-900/40 transition-all"
            >
              <FaUpload className="text-lg" />
              Upload APK
            </motion.button>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-2 mt-2">
          <div className="bg-slate-950/50 backdrop-blur-lg border border-indigo-900/30 rounded-2xl shadow-2xl">
            <div className="p-4">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────
// Sidebar Content
// ──────────────────────────────────────────────
const SidebarContent = ({
  menuItems,
  promotionSubItems,
  promotionsOpen,
  setPromotionsOpen,
  onClose,
  onLogout,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header / Logo */}
      <div className="p-6 border-b border-indigo-900/40">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-900/50">
            <span className="text-white font-black text-2xl tracking-wider">
              A
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Admin Panel
            </h2>
            <p className="text-xs text-slate-400">App & Promotion Management</p>
          </div>
        </div>
      </div>

      {/* Mobile Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2.5 rounded-xl hover:bg-indigo-950/60 text-slate-400 hover:text-cyan-300 md:hidden transition-colors"
        >
          <FaTimes size={22} />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-800 scrollbar-track-slate-950 hide-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3.5 rounded-xl mb-1.5 text-base font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-gradient-to-r from-cyan-700/70 to-teal-700/70 text-white shadow-md shadow-cyan-900/40"
                  : "text-slate-300 hover:bg-indigo-950/50 hover:text-cyan-200"
              }`
            }
          >
            <span className="text-xl opacity-90 group-hover:scale-110 transition-transform duration-200">
              {item.icon}
            </span>
            <span>{item.text}</span>
          </NavLink>
        ))}

        {/* Promotions Dropdown */}
        <div className="mt-5">
          <button
            onClick={() => setPromotionsOpen(!promotionsOpen)}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-slate-300 hover:bg-indigo-950/50 hover:text-cyan-200 transition-all duration-200"
          >
            <div className="flex items-center gap-3.5">
              <span className="text-xl">
                <GrAnnounce />
              </span>
              <span className="font-medium">Promotions</span>
            </div>
            {promotionsOpen ? (
              <FaChevronUp size={16} />
            ) : (
              <FaChevronDown size={16} />
            )}
          </button>

          {promotionsOpen && (
            <div className="mt-2 pl-12 space-y-1.5 animate-fadeIn">
              {promotionSubItems.map((sub) => (
                <NavLink
                  key={sub.to}
                  to={sub.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-cyan-900/40 text-cyan-100 font-medium shadow-sm shadow-cyan-950/30"
                        : "text-slate-400 hover:text-cyan-200 hover:bg-indigo-950/40"
                    }`
                  }
                >
                  {sub.text}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-5 border-t border-indigo-900/40 mt-auto">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-5 bg-gradient-to-r from-purple-900/80 to-rose-900/80 hover:from-purple-800 hover:to-rose-800 rounded-xl text-white font-medium transition-all duration-300 shadow-lg shadow-purple-950/40 border border-purple-800/30"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
