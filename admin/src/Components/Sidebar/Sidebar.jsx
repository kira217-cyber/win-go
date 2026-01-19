import React, { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router";
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
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  const { logout } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      const nowDesktop = window.innerWidth >= 768;
      setIsDesktop(nowDesktop);

      // Auto-close mobile sidebar drawer when switching to desktop view
      if (nowDesktop) {
        setOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // run once on mount

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { to: "/", icon: <FaHome />, text: "Dashboard", end: true },
    { to: "/all-user", icon: <FaUsers />, text: "All-User" },
    {
      to: "/add-game-provider",
      icon: <BiCategoryAlt />,
      text: "Add Game Provider",
    },
    { to: "/add-game", icon: <IoAppsSharp />, text: "Add Game" },
    { to: "/deposit", icon: <FaHeart />, text: "Deposit" },
    { to: "/withdraw", icon: <FaWallet />, text: "Withdraw" },
  ];

  const promotionSubItems = [
    { to: "/controller/navbar", text: "Navbar Controller" },
    { to: "/controller/banner", text: "Banner Controller" },
    { to: "/controller/notice", text: "Notice Controller" },
    { to: "/controller/favivon-icon-title", text: "Favicon And Title" },
    { to: "/controller/provider", text: "Provider Controller" },
    { to: "/controller/payment-method", text: "Payment Method Controller" },
    { to: "/controller/bottom-navbar", text: "Bottom Navbar Controller" },
  ];

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-red-950 to-black text-gray-100 flex">
      {/* ─── Mobile Top Bar ─── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-600 via-red-700 to-red-900 px-4 py-3.5 flex items-center justify-between shadow-md">
        <button
          onClick={() => setOpen(true)}
          className="p-2.5 rounded-lg hover:bg-red-800/40 transition-colors cursor-pointer"
        >
          <RxHamburgerMenu className="text-2xl text-orange-200" />
        </button>

        <div className="flex items-center gap-5">
          <button className="relative p-1.5 cursor-pointer">
            <FaBell className="text-xl text-orange-200 hover:text-white transition-colors" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-red-600/60"></span>
          </button>
          <FaUserCircle className="text-2xl text-orange-200 hover:text-white transition-colors cursor-pointer" />
        </div>
      </div>

      {/* Mobile Overlay */}
      {open && !isDesktop && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ─── Sidebar ─── */}
      <motion.aside
        initial={false}
        animate={{
          x: open || isDesktop ? 0 : "-100%",
        }}
        transition={{ type: "spring", damping: 25, stiffness: 180 }}
        className="fixed md:static top-0 left-0 z-50 h-screen w-72 bg-gradient-to-b from-orange-950 via-red-950/90 to-black border-r border-red-800/40 shadow-2xl overflow-hidden flex flex-col"
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
      <div className="flex-1 pt-16 md:pt-0">
        {/* Desktop Top Bar */}
        <div className="hidden md:flex items-center justify-between px-6 lg:px-10 py-[25px] border-b border-red-800/50 bg-gradient-to-r from-orange-900/80 via-red-900/70 to-black/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-red-300 text-lg" />
              <input
                type="text"
                placeholder="Search games, users, analytics..."
                className="w-full pl-12 pr-5 py-3 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all cursor-text"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2.5 hover:bg-red-900/40 rounded-xl transition-colors cursor-pointer">
              <FaBell className="text-xl text-orange-200 hover:text-orange-100 transition-colors" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-red-600/40"></span>
            </button>

            <button className="p-1 hover:bg-red-900/40 rounded-full transition-colors cursor-pointer">
              <FaUserCircle className="text-3xl text-orange-200 hover:text-orange-100 transition-colors" />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 md:p-6">
          <div className="bg-black/40 backdrop-blur-sm border border-red-900/30 rounded-2xl shadow-2xl">
            <div className="p-5 md:p-6">
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
      <div className="p-6 border-b border-red-800/50 bg-gradient-to-r from-orange-900/40 to-red-900/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-red-900/60">
            <span className="text-white font-black text-3xl tracking-wider">
              W
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              WiN GO
            </h2>
            <p className="text-sm text-orange-200/80">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Mobile Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2.5 rounded-xl hover:bg-red-900/40 text-orange-300 hover:text-orange-100 md:hidden transition-colors cursor-pointer"
        >
          <FaTimes size={24} />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto [scrollbar-width:none]">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-4 px-5 py-3.5 rounded-xl mb-1.5 text-base font-medium transition-all duration-200 cursor-pointer group ${
                isActive
                  ? "bg-gradient-to-r from-orange-700/80 to-red-700/80 text-white shadow-md shadow-red-900/50"
                  : "text-orange-100 hover:bg-red-950/60 hover:text-orange-50"
              }`
            }
          >
            <span className="text-2xl opacity-90 group-hover:scale-110 transition-transform duration-200">
              {item.icon}
            </span>
            <span>{item.text}</span>
          </NavLink>
        ))}

        {/* Promotions Dropdown */}
        <div className="mt-4">
          <button
            onClick={() => setPromotionsOpen(!promotionsOpen)}
            className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-orange-100 hover:bg-red-950/60 hover:text-orange-50 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">
                <GrAnnounce />
              </span>
              <span className="font-medium">Client-Site-Controller</span>
            </div>
            {promotionsOpen ? (
              <FaChevronUp size={18} />
            ) : (
              <FaChevronDown size={18} />
            )}
          </button>

          {promotionsOpen && (
            <div className="mt-2 pl-14 space-y-1 animate-fadeIn">
              {promotionSubItems.map((sub) => (
                <NavLink
                  key={sub.to}
                  to={sub.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `block px-5 py-3 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-orange-800/50 text-orange-50 font-medium shadow-sm shadow-red-950/40"
                        : "text-orange-200/90 hover:text-orange-100 hover:bg-red-950/50"
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
      <div className="p-5 border-t border-red-800/50 mt-auto">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-5 bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 rounded-xl text-white font-medium transition-all duration-300 shadow-lg shadow-red-900/50 border border-red-600/40 cursor-pointer"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
