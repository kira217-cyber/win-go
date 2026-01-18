import React from "react";
import { motion } from "framer-motion";
import { FaSyncAlt } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import useAuth from "../../hook/useAuth";
import { Link } from "react-router";

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
      <motion.h1
        whileTap={{ scale: 0.95 }}
        className="text-white font-extrabold text-2xl tracking-wider cursor-pointer select-none"
      >
        WiN GO
      </motion.h1>

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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              className="bg-orange-500 font-bold hover:bg-orange-400 text-white text-sm px-4 py-2 rounded-lg shadow-md cursor-pointer"
            >
              WD
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              className="bg-red-500 font-bold hover:bg-red-400 text-white text-sm px-4 py-2 rounded-lg shadow-md cursor-pointer"
            >
              DP
            </motion.button>
          </div>
        </>
      ) : (
        /* NOT LOGGED IN UI */
        <div className="flex gap-3">
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              className="bg-white text-red-600 text-sm px-4 py-2 rounded-lg font-bold shadow cursor-pointer"
            >
              Login
            </motion.button>
          </Link>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              className="bg-black/30 text-white text-sm px-4 py-2 rounded-lg font-bold border border-white/30 shadow cursor-pointer"
            >
              Register
            </motion.button>
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default Navbar;
