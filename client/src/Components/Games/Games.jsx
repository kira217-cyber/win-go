import React, { useState } from "react";
import { IoGameController } from "react-icons/io5";
import { useLanguage } from "../../context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchTheme = async () => {
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/theme-settings`,
    );
    return data;
  } catch (error) {
    return {
      gradientFrom: "#f97316", // orange-500
      gradientTo: "#dc2626", // red-600
      textColor: "#ffffff",
    };
  }
};

const Games = () => {
  const { isBangla } = useLanguage();
  const [showMore, setShowMore] = useState(false);

  const { data: theme } = useQuery({
    queryKey: ["theme-settings"],
    queryFn: fetchTheme,
    staleTime: 10 * 60 * 1000,
  });

  const games = [
    {
      id: 1,
      title: "Aviator",
      img: "https://i.ibb.co.com/MD3yc4rw/Betway-Lucky-Lenny-betgames-500x500.webp",
    },
    {
      id: 2,
      title: "Crazy Time",
      img: "https://i.ibb.co.com/V01ssNTG/jack-in-a-pot-spin-gifts-square-440x440-2025-10-02.webp",
    },
    {
      id: 3,
      title: "Ludobet",
      img: "https://i.ibb.co.com/Q32BZmN2/333-Fat-Frogs-Power-Combo-500x500.webp",
    },
    {
      id: 4,
      title: "Dice",
      img: "https://i.ibb.co.com/twsnhdrf/Tiny-Toads.png",
    },
    {
      id: 5,
      title: "Roulette",
      img: "https://i.ibb.co.com/27VhBkT7/3-Lucky-Hippos-MGS-500x500.webp",
    },
    {
      id: 6,
      title: "Slots",
      img: "https://i.ibb.co.com/LH5vfXr/Mr-Oinksters-Holdand-Win-Booming-500x500.webp",
    },
    {
      id: 7,
      title: "Crash",
      img: "https://i.ibb.co.com/XxDvtDQh/Pig-Farm.png",
    },
    {
      id: 8,
      title: "Spin Wheel",
      img: "https://i.ibb.co.com/ZRxgPqjZ/images.jpg",
    },
    {
      id: 9,
      title: "Poker",
      img: "https://i.ibb.co.com/cS3W7tbv/1b55194385efebaabdeaaccfb1d8999e50be43278db64de55fae23bca408f562.png",
    },
  ];

  const sectionTitle = isBangla ? "সেরা গেমস খেলুন" : "Play the Best Games";
  const buttonText = isBangla ? "আরও দেখুন" : "See More";

  const gradientStyle = {
    background: `linear-gradient(to right, ${theme?.gradientFrom}, ${theme?.gradientVia}, ${theme?.gradientTo})`,
    color: theme?.textColor || "#fff",
  };

  return (
    <div className="w-full px-3 py-2">
      {/* Shine Effect */}
      <style>{`
        .auto-shine { position: relative; overflow: hidden; border-radius: 12px; }
        .shine-layer {
          position: absolute; inset: 0;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.9) 50%, transparent 70%);
          transform: translateX(-150%);
          pointer-events: none;
        }
        .shine-animate .shine-layer {
          animation: shineSwipe 1.4s ease-out infinite;
        }
        @keyframes shineSwipe {
          0% { transform: translateX(-150%) skewX(-15deg); }
          100% { transform: translateX(150%) skewX(-15deg); }
        }
      `}</style>

      {/* SECTION TITLE */}
      <div className="mb-3">
        <h2
          style={gradientStyle}
          className="flex items-center gap-2 w-2/3 md:w-1/2 text-md font-bold px-2 py-2 rounded"
        >
          <IoGameController size={28} />
          {sectionTitle}
        </h2>
      </div>

      {/* GAME GRID */}
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {games.slice(0, showMore ? games.length : 6).map((game) => (
          <div
            key={game.id}
            className="relative auto-shine shine-animate overflow-hidden border-2 border-green-500 shadow-lg cursor-pointer"
          >
            <img
              src={game.img}
              alt={game.title}
              className="w-full h-40 md:h-52 object-cover"
            />
            <div className="shine-layer"></div>
            <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent">
              <span className="text-white text-sm font-bold pb-2">
                {game.title}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* SEE MORE BUTTON */}
      {!showMore && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setShowMore(true)}
            style={gradientStyle}
            className="px-6 py-2 cursor-pointer rounded-full font-semibold shadow-lg active:scale-95 transition-transform"
          >
            {buttonText}
          </button>
        </div>
      )}
    </div>
  );
};

export default Games;
