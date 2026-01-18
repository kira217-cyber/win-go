import React, { useState } from "react";

const Games = () => {
  const [showMore, setShowMore] = useState(false);

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

  return (
    <div className="w-full px-3 py-2">
      {/* SECTION TITLE */}
      <div className="mb-3">
        <h2 className="inline-block bg-gradient-to-r from-orange-500 to-red-600 text-white text-lg font-bold px-4 py-2 rounded">
          সেরা গেমস খেলুন
        </h2>
      </div>

      {/* GAME GRID */}
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {games.slice(0, showMore ? games.length : 6).map((game) => (
          <div
            key={game.id}
            className="relative rounded-xl overflow-hidden border-2 border-green-500 shadow-lg cursor-pointer"
          >
            <img
              src={game.img}
              alt={game.title}
              className="w-full h-42 md:h-52 object-cover"
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 flex items-end justify-center">
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
            className="bg-gradient-to-r cursor-pointer from-orange-500 to-red-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg active:scale-95"
          >
            See More
          </button>
        </div>
      )}
    </div>
  );
};

export default Games;
