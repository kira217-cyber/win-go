import React from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router";
import {
  FaHome,
  FaGift,
  FaUserPlus,
  FaSignInAlt,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import useAuth from "../../hook/useAuth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

const BottomNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const activeClass =
    "bg-gradient-to-r from-green-400 to-indigo-500 text-white shadow-lg shadow-red-500/30";

  const normalClass = "text-white hover:text-orange-300";

  const handleLogout = () => {
    logout();
    toast.success("লগআউট সফল হয়েছে!", {
      position: "top-center",
      autoClose: 2000,
    });
    navigate("/");
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky bottom-0 z-50 "
    >
      {/* Padding for content above bottom bar */}
      <div className="h-6" />

      {/* Main Bottom Bar */}
      <div className="bg-gradient-to-r from-orange-500 via-red-600 to-red-900  shadow-2xl shadow-red-900/50 py-[0.5] flex justify-around items-center backdrop-blur-md border border-red-700/30">
        {/* Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-1  text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer ${
              isActive ? activeClass : normalClass
            }`
          }
        >
          <FaHome className="text-xl md:text-2xl" />
          Home
        </NavLink>

        {/* Promotion */}
        <NavLink
          to="/promotion"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-1  text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer ${
              isActive ? activeClass : normalClass
            }`
          }
        >
          <FaGift className="text-xl md:text-2xl" />
          Promotion
        </NavLink>

        {/* Auth-based items */}
        {user ? (
          <>
            {/* Profile */}
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-1  text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer ${
                  isActive ? activeClass : normalClass
                }`
              }
            >
              <FaUser className="text-xl md:text-2xl" />
              Profile
            </NavLink>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`flex flex-col items-center gap-1 p-1  text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer ${normalClass} hover:bg-red-600/40`}
            >
              <FaSignOutAlt className="text-xl md:text-2xl" />
              Logout
            </button>
          </>
        ) : (
          <>
            {/* Register */}
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-1  text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer ${
                  isActive ? activeClass : normalClass
                }`
              }
            >
              <FaUserPlus className="text-xl md:text-2xl" />
              Register
            </NavLink>

            {/* Login */}
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-1  text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer ${
                  isActive ? activeClass : normalClass
                }`
              }
            >
              <FaSignInAlt className="text-xl md:text-2xl" />
              Login
            </NavLink>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default BottomNavbar;
