import React, { useState } from "react";

const Games = () => {
  const [showMore, setShowMore] = useState(false);

  const games = [
    {
      id: 1,
      title: "Aviator",
      img: "https://i.ibb.co/7bq8p7X/aviator.png",
    },
    {
      id: 2,
      title: "Crazy Time",
      img: "https://i.ibb.co/ZV9L7Vk/crazytime.png",
    },
    {
      id: 3,
      title: "Ludobet",
      img: "https://i.ibb.co/DtP6pJd/ludobet.png",
    },
    {
      id: 4,
      title: "Dice",
      img: "https://i.ibb.co/4d6f7yq/dice.png",
    },
    {
      id: 5,
      title: "Roulette",
      img: "https://i.ibb.co/2jMZQ1N/roulette.png",
    },
    {
      id: 6,
      title: "Slots",
      img: "https://i.ibb.co/yXH9P0R/slot.png",
    },
    {
      id: 7,
      title: "Crash",
      img: "https://i.ibb.co/z5N1d7Z/crash.png",
    },
    {
      id: 8,
      title: "Spin Wheel",
      img: "https://i.ibb.co/q1s4RXk/spin.png",
    },
    {
      id: 9,
      title: "Poker",
      img: "https://i.ibb.co/Gc9x4kz/poker.png",
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
            <div className="absolute inset-0 bg-black/30 flex items-end justify-center">
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
