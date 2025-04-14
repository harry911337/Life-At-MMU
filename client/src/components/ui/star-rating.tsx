import { useState } from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  setRating?: (rating: number) => void;
  max?: number;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  setRating,
  max = 5,
  size = "md",
  readOnly = false,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const handleClick = (index: number) => {
    if (!readOnly && setRating) {
      setRating(index);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (!readOnly) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating > 0 ? hoverRating : rating;

  return (
    <div 
      className={cn("flex items-center", className)}
      onMouseLeave={handleMouseLeave}
    >
      {[...Array(max)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={index}
            className={cn(
              sizeClasses[size],
              "cursor-pointer transition-colors",
              starValue <= displayRating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-none text-neutral-300",
              !readOnly && "hover:text-yellow-500"
            )}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
          />
        );
      })}
    </div>
  );
}
