import React from "react";
import Slider from "../../Components/Slider/Slider";
import NoticeMarquee from "../../Components/NoticeMarquee/NoticeMarquee";
import Slider2 from "../../Components/Slider2/Slider2";
import Games from "../../Components/Games/Games";
import BottomNavbar from "../../Components/BottomNavbar/BottomNavbar";

const Home = () => {
  return (
    <div>
      <Slider />
      <NoticeMarquee />
      <Slider2 />
      <Games />
     
    </div>
  );
};

export default Home;
