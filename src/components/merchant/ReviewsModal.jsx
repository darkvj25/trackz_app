import React from 'react';
import { Modal } from '../common/Modal';
import { Star, ThumbsUp } from 'lucide-react';

export const ReviewsModal = ({ isOpen, onClose, merchant }) => {
  if (!merchant) return null;

  const mockReviewList = [
    {
      id: 'r1',
      name: 'Maria Santos',
      rating: 5,
      date: '2 days ago',
      comment: 'Super fast delivery! Food arrived piping hot and fresh. Trakz rider was very polite.'
    },
    {
      id: 'r2',
      name: 'Christian Tan',
      rating: 5,
      date: '1 week ago',
      comment: 'Best smash burgers in town! Portions are huge and sauce is amazing.'
    },
    {
      id: 'r3',
      name: 'Angela Reyes',
      rating: 4,
      date: '2 weeks ago',
      comment: 'Great packaging and good food quality. Will order again!'
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${merchant.name} - Reviews`}>
      <div className="space-y-4">
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="text-center">
            <span className="text-3xl font-extrabold text-slate-900 block">{merchant.rating}</span>
            <div className="flex items-center justify-center gap-0.5 text-amber-400">
              <Star size={14} className="fill-amber-400" />
              <Star size={14} className="fill-amber-400" />
              <Star size={14} className="fill-amber-400" />
              <Star size={14} className="fill-amber-400" />
              <Star size={14} className="fill-amber-400" />
            </div>
            <span className="text-xs font-semibold text-slate-400 mt-1 block">
              {merchant.reviewCount} Ratings
            </span>
          </div>

          <div className="flex-1 space-y-1 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <span>5 ★</span>
              <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[85%]" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>4 ★</span>
              <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-[12%]" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>3 ★</span>
              <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 w-[3%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-3 pt-2">
          {mockReviewList.map((rev) => (
            <div key={rev.id} className="p-3 bg-white rounded-2xl border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">{rev.name}</span>
                <span className="text-[10px] text-slate-400 font-medium">{rev.date}</span>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">{rev.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
