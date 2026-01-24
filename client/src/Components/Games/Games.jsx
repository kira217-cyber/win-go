import React, { useState } from "react";
import { IoGameController } from "react-icons/io5";
import { useLanguage } from "../../context/LanguageProvider";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import useAuth from "../../hook/useAuth";
import { toast } from "react-toastify";
import { FaTimes, FaSpinner } from "react-icons/fa";

const fetchActiveGames = async () => {
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/games/active`,
    );
    return data;
  } catch (error) {
    console.error("Failed to fetch active games:", error);
    return [];
  }
};

const fetchTheme = async () => {
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/theme-settings`,
    );
    return data;
  } catch (error) {
    return {
      gradientFrom: "#f97316",
      gradientTo: "#dc2626",
      textColor: "#ffffff",
    };
  }
};

const fetchProfile = async (userId) => {
  if (!userId) throw new Error("User not logged in");
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/user/${userId}`,
  );
  return data;
};

const Games = () => {
  const { isBangla } = useLanguage();
  const { userId } = useAuth();
  const [showMore, setShowMore] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [gameUrl, setGameUrl] = useState(null);

  // Theme
  const { data: theme } = useQuery({
    queryKey: ["theme-settings"],
    queryFn: fetchTheme,
    staleTime: 10 * 60 * 1000,
  });

  // Active Games
  const { data: games = [], isLoading: gamesLoading } = useQuery({
    queryKey: ["active-games"],
    queryFn: fetchActiveGames,
    staleTime: 5 * 60 * 1000,
  });

  // User Profile
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => fetchProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // Play Game Mutation
  const playGameMutation = useMutation({
    mutationFn: ({ gameID }) =>
      axios.post(`${import.meta.env.VITE_API_URL}/api/games/playgame`, {
        gameID, // ← এখানে gameID পাঠানো হচ্ছে
        username: user.username,
        money: user.balance,
      }),
    onSuccess: (response) => {
      const url = response.data.gameUrl;
      if (url) {
        setGameUrl(url);
        setShowGameModal(true);
      } else {
        toast.error("No game URL received");
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to start game");
    },
  });

  const handleGameClick = (game) => {
    if (!userId) {
      toast.error(isBangla ? "খেলতে লগইন করুন" : "Please login to play");
      return;
    }

    if (userLoading) {
      toast.info(isBangla ? "লোড হচ্ছে..." : "Loading user data...");
      return;
    }

    if (!user?.username || user.balance === undefined) {
      toast.error(
        isBangla ? "ব্যবহারকারী তথ্য পাওয়া যায়নি" : "User data not found",
      );
      return;
    }

    // এখানে আপনার ডাটাবেসের ফিল্ড অনুযায়ী game.gameId ব্যবহার করা হচ্ছে
    playGameMutation.mutate({ gameID: game.gameId });
  };

  const sectionTitle = isBangla ? "সেরা গেমস খেলুন" : "Play the Best Games";
  const buttonText = isBangla ? "আরও দেখুন" : "See More";

  const gradientStyle = {
    background: `linear-gradient(to right, ${theme?.gradientFrom}, ${theme?.gradientVia}, ${theme?.gradientTo})`,
    color: theme?.textColor || "#fff",
  };

  if (gamesLoading) {
    return (
      <div className="w-full px-3 py-6 text-center text-gray-400">
        Loading games...
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="w-full px-3 py-6 text-center text-gray-500">
        {isBangla
          ? "কোনো সক্রিয় গেম পাওয়া যায়নি"
          : "No active games available"}
      </div>
    );
  }

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
            key={game._id}
            onClick={() => handleGameClick(game)}
            className="relative auto-shine shine-animate overflow-hidden border-2 border-green-500 shadow-lg cursor-pointer group"
          >
            <img
              src={`${import.meta.env.VITE_API_URL}${game.image}`}
              alt={game.title}
              className="w-full h-40 md:h-52 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="shine-layer"></div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-white text-xl md:text-2xl font-bold tracking-wide drop-shadow-lg">
                {isBangla ? "খেলুন" : "Play"}
              </span>
            </div>
            <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
              <span className="text-white text-sm md:text-base font-bold pb-2 drop-shadow-md">
                {game.title}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* SEE MORE BUTTON */}
      {games.length > 6 && !showMore && (
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

      {/* Game Iframe Modal */}
      {showGameModal && gameUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative w-full max-w-4xl h-[90vh] bg-white rounded-lg overflow-hidden">
            <button
              onClick={() => {
                setShowGameModal(false);
                setGameUrl(null);
              }}
              className="absolute top-4 right-4 z-10 text-white bg-red-600 hover:bg-red-700 p-2 rounded-full cursor-pointer"
            >
              <FaTimes size={20} />
            </button>

            {playGameMutation.isPending ? (
              <div className="flex items-center justify-center h-full">
                <FaSpinner className="animate-spin text-4xl text-gray-500" />
              </div>
            ) : (
              <iframe
                src={gameUrl}
                className="w-full h-full border-0"
                title="Game"
                allowFullScreen
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Games;
