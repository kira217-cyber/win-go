import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchFloatingLinks = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/floating-social`,
  );
  return data;
};

const FloatingSocial = () => {
  const { data: links = [], isLoading } = useQuery({
    queryKey: ["floating-social"],
    queryFn: fetchFloatingLinks,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  if (isLoading || links.length === 0) return null;

  return (
    <div className="fixed bottom-32 right-4 md:right-172 z-50 flex flex-col gap-3">
      {links.map((item) => (
        <a
          key={item._id}
          href={item.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.name}
          className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full shadow-lg transition-transform transform hover:scale-110 cursor-pointer overflow-hidden"
        >
          <img
            src={`${import.meta.env.VITE_API_URL}${item.imageUrl}`}
            alt={item.name}
            className="w-full h-full object-cover"
            // onError={(e) => {
            //   e.target.src = "/fallback-icon.png"; // optional fallback
            // }}
          />
        </a>
      ))}
    </div>
  );
};

export default FloatingSocial;
