import React from "react";
import { Outlet } from "react-router";
import Navbar from "../Components/Navbar/Navbar";

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
      <div className="w-full md:w-[60%] lg:w-[40%] xl:w-[30%] bg-white overflow-y-auto">
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
};

export default RootLayout;
