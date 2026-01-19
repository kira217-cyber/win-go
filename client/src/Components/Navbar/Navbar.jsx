import React from "react";
import { motion } from "framer-motion";
import { FaSyncAlt } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import { Link } from "react-router";
import { IoLogIn } from "react-icons/io5";
import { FaRegRegistered } from "react-icons/fa";
import { PiHandDepositBold } from "react-icons/pi";
import { PiHandWithdrawBold } from "react-icons/pi";
import useAuth from "../../hook/useAuth";

const Navbar = () => {
  const { user, loading } = useAuth();

  // 🔹 Skeleton Loader
  if (loading) {
    return (
      <div className="w-full h-16 bg-gradient-to-r from-orange-500 via-red-600 to-red-900 px-4 flex items-center justify-between">
        <Skeleton
          width={80}
          height={22}
          baseColor="#7f1d1d"
          highlightColor="#fb923c"
        />
        <Skeleton
          width={110}
          height={32}
          borderRadius={999}
          baseColor="#7f1d1d"
          highlightColor="#fb923c"
        />
        <Skeleton
          width={80}
          height={32}
          borderRadius={10}
          baseColor="#7f1d1d"
          highlightColor="#fb923c"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full h-16 bg-gradient-to-r from-orange-500 via-red-600 to-red-900 px-4 flex items-center justify-between shadow-lg"
    >
      {/* LEFT LOGO */}
      <Link to="/">
        <motion.h1
          whileTap={{ scale: 0.95 }}
          className="text-white font-extrabold text-xl md:text-2xl tracking-wider cursor-pointer select-none"
        >
          WiN GO
        </motion.h1>
      </Link>
      {/* LOGGED IN UI */}
      {user ? (
        <>
          {/* BALANCE */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-black/25 px-4 py-2 rounded-full text-white text-sm font-semibold shadow-md cursor-pointer"
          >
            <span>100 BDT</span>
            <FaSyncAlt className="text-xs opacity-80" />
          </motion.div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3">
            <Link to={'/withdraw'}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                className="bg-orange-500 flex items-center gap-1 font-bold hover:bg-orange-400 text-white text-sm px-2 py-1 md:px-4 md:py-2 rounded-lg shadow-md cursor-pointer"
              >
                <PiHandWithdrawBold size={24} />
                WD
              </motion.button>
            </Link>
            <Link to={'/deposit'}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                className="bg-red-500 flex items-center gap-1 font-bold hover:bg-red-400 text-white text-sm px-2 py-1 md:px-4 md:py-2 rounded-lg shadow-md cursor-pointer"
              >
                <PiHandDepositBold size={24} />
                DP
              </motion.button>
            </Link>
          </div>
        </>
      ) : (
        /* NOT LOGGED IN UI */
        <div className="flex gap-3">
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              className="bg-white flex items-center gap-1 text-red-600 text-sm px-4 py-2 rounded-lg font-bold shadow cursor-pointer"
            >
              <IoLogIn size={24} />
              Login
            </motion.button>
          </Link>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              className="bg-black/30 flex items-center gap-1 text-white text-sm px-4 py-2 rounded-lg font-bold border border-white/30 shadow cursor-pointer"
            >
              <FaRegRegistered size={24} />
              Register
            </motion.button>
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default Navbar;
