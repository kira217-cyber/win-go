import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import banner from "../../assets/banner.png";
import "swiper/css";
import "swiper/css/pagination";

const Slider2 = () => {
  const slides = [
    banner,
    "https://i.ibb.co.com/Mytxm3Lt/luck-839037-1280.jpg",
  ];

  return (
    <div className="w-full p-2">
      <Swiper
        modules={[Pagination, Autoplay]}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        className="w-full h-32 rounded-lg overflow-hidden border-4 border-green-500"
      >
        {slides.map((img, index) => (
          <SwiperSlide key={index}>
            <img
              src={img}
              alt={`slide-${index}`}
              className="w-full h-32 object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Slider2;
