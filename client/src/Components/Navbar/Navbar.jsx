import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSyncAlt } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import { Link } from "react-router"; // fixed import (use -dom)
import { IoLogIn } from "react-icons/io5";
import { FaRegRegistered } from "react-icons/fa";
import { PiHandDepositBold, PiHandWithdrawBold } from "react-icons/pi";
import useAuth from "../../hook/useAuth";
import NavHeader from "../NavHeader/NavHeader";
import { useLanguage } from "../../context/LanguageProvider";
import axios from "axios";

const Navbar = () => {
  const { user, loading: authLoading } = useAuth();
  const [langOpen, setLangOpen] = useState(false);
  const { language, changeLanguage } = useLanguage();

  // Settings from DB
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:5007"}/api/navbar`,
        );
        setSettings(res.data);
      } catch (err) {
        console.error("Failed to load navbar settings:", err);
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/logos`,
        );
        setLogo(res.data.websiteLogo);
      } catch (err) {
        console.error("Failed to load logo settings:", err);
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchLogo();
  }, []);

  // Fallback defaults (HEX)
  const defaults = {
    gradientFrom: "#f97316",
    gradientVia: "#dc2626",
    gradientTo: "#7f1d1d",
    textColor: "#ffffff",
    withdrawBg: "#f97316",
    withdrawText: "#ffffff",
    depositBg: "#ef4444",
    depositText: "#ffffff",
  };

  const colors = settings || defaults;

  // Combined loading state
  if (authLoading || settingsLoading) {
    return (
      <div className="w-full h-16 bg-gradient-to-r from-orange-500 via-red-600 to-red-900 px-4 flex items-center justify-between">
        <Skeleton width={80} height={22} />
        <Skeleton width={110} height={32} borderRadius={999} />
        <Skeleton width={80} height={32} borderRadius={10} />
      </div>
    );
  }

  return (
    <>
      <NavHeader />

      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full h-16 px-4 flex items-center justify-between shadow-lg relative"
        style={{
          background: `linear-gradient(to right, ${colors.gradientFrom}, ${colors.gradientVia}, ${colors.gradientTo})`,
        }}
      >
        {/* LEFT LOGO */}
        <Link to="/">
          <img
            className="h-10 md:h-12 w-12 md:w-32"
            src={`${import.meta.env.VITE_API_URL}/${logo}`}
            alt=""
          />
        </Link>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4 relative">
          {/* LANGUAGE BUTTON - remains pure Tailwind */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-2 bg-teal-700 hover:bg-yellow-400 border border-teal-400 px-2 py-2 rounded-lg text-white hover:text-black font-semibold cursor-pointer transition-colors duration-200"
            >
              <img
                src={
                  language === "Bangla"
                    ? "https://flagcdn.com/w20/bd.png"
                    : "https://flagcdn.com/w20/gb.png"
                }
                alt="flag"
                className="w-5 h-4 rounded-sm object-cover"
              />
              <span className="hidden md:block">
                {" "}
                {language === "Bangla" ? "বাংলা" : "English"}
              </span>
            </motion.button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute -right-22 md:right-0 mt-2 w-40 bg-teal-800 rounded-xl shadow-lg overflow-hidden z-50"
                >
                  <button
                    onClick={() => {
                      changeLanguage("Bangla");
                      setLangOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-teal-700 cursor-pointer"
                  >
                    <img
                      src="https://flagcdn.com/w20/bd.png"
                      alt="Bangla flag"
                      className="w-5 h-4 rounded-sm object-cover"
                    />{" "}
                    বাংলা
                  </button>

                  <button
                    onClick={() => {
                      changeLanguage("English");
                      setLangOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-teal-700 cursor-pointer"
                  >
                    <img
                      src="https://flagcdn.com/w20/gb.png"
                      alt="English flag"
                      className="w-5 h-4 rounded-sm object-cover"
                    />{" "}
                    English
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AUTH UI */}
          {user ? (
            <>
              <div className="flex items-center gap-2 bg-black/25 px-4 py-2 rounded-full text-white text-sm font-semibold cursor-pointer">
                <span>100 BDT</span>
                <FaSyncAlt className="text-xs" />
              </div>

              <Link to="/withdraw">
                <button
                  className="px-3 py-2 rounded-lg font-bold cursor-pointer"
                  style={{
                    backgroundColor: colors.withdrawBg,
                    color: colors.withdrawText,
                  }}
                >
                  <PiHandWithdrawBold size={22} />
                </button>
              </Link>

              <Link to="/deposit">
                <button
                  className="px-3 py-2 rounded-lg font-bold cursor-pointer"
                  style={{
                    backgroundColor: colors.depositBg,
                    color: colors.depositText,
                  }}
                >
                  <PiHandDepositBold size={22} />
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold cursor-pointer">
                  <IoLogIn size={20} />
                </button>
              </Link>

              <Link to="/register">
                <button className="bg-black/30 text-white px-4 py-2 rounded-lg font-bold cursor-pointer">
                  <FaRegRegistered size={20} />
                </button>
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default Navbar;
