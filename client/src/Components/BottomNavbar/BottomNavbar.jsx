import React from "react";
import { NavLink } from "react-router";
import {
  FaHome,
  FaGift,
  FaUserPlus,
  FaSignInAlt,
  FaUser,
} from "react-icons/fa";
import useAuth from "../../hook/useAuth";

const BottomNavbar = () => {
  const { user } = useAuth();

  const activeClass =
    "bg-gradient-to-r from-green-400 to-red-500 text-white shadow-md";

  const normalClass = "text-white";

  return (
    <div className="sticky bottom-0 z-40 ">
      {/* padding for scroll gap */}
      <div className="h-20 relative">
        <div className="absolute bottom-2 left-0 right-0 px-3">
          <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-md rounded-2xl shadow-xl py-2 px-3 flex justify-between items-center">
            {/* HOME */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive ? activeClass : normalClass
                }`
              }
            >
              <FaHome className="text-lg" />
              Home
            </NavLink>

            {/* PROMOTION */}
            <NavLink
              to="/promotion"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive ? activeClass : normalClass
                }`
              }
            >
              <FaGift className="text-lg" />
              Promotion
            </NavLink>

            {/* AUTH BASED */}
            {user ? (
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive ? activeClass : normalClass
                  }`
                }
              >
                <FaUser className="text-lg" />
                Profile
              </NavLink>
            ) : (
              <>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive ? activeClass : normalClass
                    }`
                  }
                >
                  <FaUserPlus className="text-lg" />
                  Register
                </NavLink>

                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive ? activeClass : normalClass
                    }`
                  }
                >
                  <FaSignInAlt className="text-lg" />
                  Login
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomNavbar;
