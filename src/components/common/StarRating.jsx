import React from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({ rating, count, size = 16, showScore = true }) => {
  return (
    <div className="flex items-center gap-1">
      <Star size={size} className="fill-amber-400 text-amber-400" />
      {showScore && <span className="font-semibold text-slate-800 text-sm">{rating}</span>}
      {count !== undefined && (
        <span className="text-slate-500 text-xs">({count})</span>
      )}
    </div>
  );
};
