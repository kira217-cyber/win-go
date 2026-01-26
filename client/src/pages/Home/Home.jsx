import React from "react";
import Slider from "../../Components/Slider/Slider";
import NoticeMarquee from "../../Components/NoticeMarquee/NoticeMarquee";
import Slider2 from "../../Components/Slider2/Slider2";
import Games from "../../Components/Games/Games";
import Provider from "../../Components/Provider/Provider";
import PaymentMethod from "../../Components/PaymentMethod/PaymentMethod";
import Footer from "../../Components/Footer/Footer";
import Button from "../../Components/Button/Button";

const Home = () => {
  return (
    <div>
      <Slider />
      <NoticeMarquee />
      {/* <Slider2 /> */}
      <Button />
      <Games />
      <Provider />
      <PaymentMethod />
      <Footer />
    </div>
  );
};

export default Home;
