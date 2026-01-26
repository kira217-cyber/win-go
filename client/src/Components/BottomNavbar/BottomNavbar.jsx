import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { NavLink, useNavigate } from "react-router";
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
import axios from "axios";

const BottomNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:5007"}/api/bottom-navbar`
        );
        setSettings(res.data);
      } catch (err) {
        console.error("Failed to load bottom navbar settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const defaults = {
    barGradientFrom: "#f97316",
    barGradientVia: "#dc2626",
    barGradientTo: "#7f1d1d",
    activeGradientFrom: "#4ade80",
    activeGradientTo: "#6366f1",
    activeText: "#ffffff",
    activeShadow: "#ef4444",
    normalText: "#ffffff",
    normalHoverText: "#fdba74",
  };

  const colors = settings || defaults;

  const handleLogout = () => {
    logout();
    toast.success("লগআউট সফল হয়েছে!", {
      position: "top-center",
      autoClose: 2000,
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="sticky bottom-0 z-50 h-16 bg-gradient-to-r from-orange-500 via-red-600 to-red-900 animate-pulse" />
    );
  }

  const baseNavClass =
    "flex flex-col items-center gap-1 p-1 text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer";

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed bottom-0 z-50 w-full md:w-[60%] lg:w-[40%] xl:w-[30%]"
    >
      <div className="h-0" />

      <div
        className="flex justify-around items-center backdrop-blur-md border border-red-700/30 shadow-2xl shadow-red-900/50"
        style={{
          background: `linear-gradient(to right, ${colors.barGradientFrom}, ${colors.barGradientVia}, ${colors.barGradientTo})`,
        }}
      >
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${baseNavClass} ${isActive ? "active-nav-item" : ""}`
          }
          style={({ isActive }) => ({
            color: isActive ? undefined : colors.normalText,
          })}
        >
          <FaHome className="text-xl md:text-2xl" />
          Home
        </NavLink>

        <NavLink
          to="/promotion"
          className={({ isActive }) =>
            `${baseNavClass} ${isActive ? "active-nav-item" : ""}`
          }
          style={({ isActive }) => ({
            color: isActive ? undefined : colors.normalText,
          })}
        >
          <FaGift className="text-xl md:text-2xl" />
          Promotion
        </NavLink>

        {user ? (
          <>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `${baseNavClass} ${isActive ? "active-nav-item" : ""}`
              }
              style={({ isActive }) => ({
                color: isActive ? undefined : colors.normalText,
              })}
            >
              <FaUser className="text-xl md:text-2xl" />
              Profile
            </NavLink>

            <button
              onClick={handleLogout}
              className={`${baseNavClass} hover:bg-red-600/40`}
              style={{ color: colors.normalText }}
            >
              <FaSignOutAlt className="text-xl md:text-2xl" />
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `${baseNavClass} ${isActive ? "active-nav-item" : ""}`
              }
              style={({ isActive }) => ({
                color: isActive ? undefined : colors.normalText,
              })}
            >
              <FaUserPlus className="text-xl md:text-2xl" />
              Register
            </NavLink>

            <NavLink
              to="/login"
              className={({ isActive }) =>
                `${baseNavClass} ${isActive ? "active-nav-item" : ""}`
              }
              style={({ isActive }) => ({
                color: isActive ? undefined : colors.normalText,
              })}
            >
              <FaSignInAlt className="text-xl md:text-2xl" />
              Login
            </NavLink>
          </>
        )}
      </div>

      <style>{`
        .active-nav-item {
          background: linear-gradient(
            to right,
            ${colors.activeGradientFrom},
            ${colors.activeGradientTo}
          ) !important;
          color: ${colors.activeText} !important;
          box-shadow: 0 10px 15px -3px ${colors.activeShadow}4d !important;
        }

        .flex.flex-col.items-center:hover:not(.active-nav-item) {
          color: ${colors.normalHoverText} !important;
        }
      `}</style>
    </motion.div>
  );
};

export default BottomNavbar;