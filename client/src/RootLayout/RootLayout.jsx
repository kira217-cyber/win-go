import React from "react";
import { Outlet } from "react-router";
import Navbar from "../Components/Navbar/Navbar";
import BottomNavbar from "../Components/BottomNavbar/BottomNavbar";

const RootLayout = () => {
  return (
    <div
      style={{
        backgroundImage:
          "url('https://i.ibb.co.com/6JsJ9k6Y/riotgames-esports-sportsbetting.png')",
        backgroundSize: "cover",
      }}
      className="h-screen flex justify-center"
    >
      <div className="w-full md:w-[60%] lg:w-[40%] xl:w-[30%] overflow-y-auto [scrollbar-width:none]">
        <Navbar />
        <div
          className=""
          style={{
            backgroundImage: "url('/bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          }}
        >
          <Outlet />
           <BottomNavbar />
        </div>
       
      </div>
    </div>
  );
};

export default RootLayout;
