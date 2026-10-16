import React, { useState } from 'react';

export const TrakzEmblemLogo = ({
  size = 'md',
  className = '',
  alt = 'TRAKZ DELIVERIES',
  animated = false,
  showGalaxyHalo = null
}) => {
  const [useFallback, setUseFallback] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [isBoosting, setIsBoosting] = useState(false);

  const shouldShowHalo = showGalaxyHalo !== null ? showGalaxyHalo : size !== 'sm';

  // Dimensions map based on size parameter
  const dimensionMap = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-36 h-36',
    xl: 'w-52 h-52 sm:w-64 sm:h-64',
    '2xl': 'w-72 h-72'
  };

  const badgeSizeMap = {
    sm: 'w-7 h-5',
    md: 'w-11 h-8',
    lg: 'w-16 h-12',
    xl: 'w-20 h-15 sm:w-24 sm:h-18',
    '2xl': 'w-24 h-18 sm:w-28 sm:h-21'
  };

  const containerSize = dimensionMap[size] || dimensionMap.md;
  const badgeSize = badgeSizeMap[size] || badgeSizeMap.md;

  const handleReplay = () => {
    if (animated) {
      setIsBoosting(true);
      setAnimKey((prev) => prev + 1);
      setTimeout(() => {
        setIsBoosting(false);
      }, 3500);
    }
  };

  return (
    <div
      onClick={handleReplay}
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none ${containerSize} ${className} ${
        animated ? 'cursor-pointer' : ''
      }`}
      title={animated ? 'Click to boost motorcycle galaxy orbit' : alt}
    >
      {/* Outer Galaxy Nebula Aura & Celestial Orbit Ring (Outside Circle of Logo) */}
      {shouldShowHalo && (
        <div className="absolute inset-[-18%] pointer-events-none rounded-full flex items-center justify-center overflow-visible z-10">
          {/* Galaxy Glowing Radial Gradient Background */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#ffb100]/30 via-purple-600/25 via-cyan-500/20 to-[#ffb100]/25 blur-xl animate-galaxy-ring" />

          {/* Galaxy Outer Dashed Orbit Path */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#ffb100]/60 animate-galaxy-dust" />

          {/* Galaxy Mid Dotted Orbit Ring */}
          <div className="absolute inset-3 rounded-full border border-dotted border-purple-400/50 animate-spin" style={{ animationDuration: '14s' }} />

          {/* Sparkling Stars & Stardust Particles Outside the Logo Circle */}
          <div className="absolute inset-0 animate-galaxy-dust pointer-events-none">
            {/* Top Glowing Gold Star */}
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-[#ffb100] rounded-full shadow-[0_0_12px_#ffb100] animate-ping" />
            {/* Right Purple Celestial Star */}
            <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-purple-400 rounded-full shadow-[0_0_10px_#c084fc]" />
            {/* Bottom Cyan Cosmic Sparkle */}
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-cyan-400 rounded-full shadow-[0_0_12px_#22d3ee]" />
            {/* Left Pink Nebula Particle */}
            <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-pink-400 rounded-full shadow-[0_0_8px_#f472b6]" />
          </div>

          {/* Continuously Orbiting Trakz Delivery Rider in Galaxy Outside */}
          <div
            key={animKey}
            className={`absolute inset-0 flex items-center justify-center ${
              isBoosting ? 'animate-galaxy-boost-orbit' : 'animate-galaxy-continuous-orbit'
            }`}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative flex items-center justify-center">
                {/* Galaxy Stardust Wind Trail behind rider */}
                <div className="absolute -left-6 sm:-left-10 flex flex-col gap-0.5 opacity-90 transform -rotate-6">
                  <div className="w-5 sm:w-10 h-1.5 bg-[#ffb100] rounded-full shadow-[0_0_10px_#ffb100] animate-pulse" />
                  <div className="w-7 sm:w-12 h-1 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]" />
                  <div className="w-4 sm:w-8 h-1 bg-cyan-400 rounded-full shadow-[0_0_6px_#22d3ee]" />
                </div>

                {/* Trakz Delivery Rider Graphic matching uploaded image */}
                <div className={`${badgeSize} flex items-center justify-center transform hover:scale-110 transition-transform filter drop-shadow-[0_0_12px_#ffb100]`}>
                  <svg viewBox="0 0 120 90" className="w-full h-full">
                    {/* Speed Wind Dashes behind Rear Wheel */}
                    <g fill="#ffb100">
                      <rect x="2" y="52" width="14" height="3" rx="1.5" />
                      <rect x="8" y="58" width="12" height="3" rx="1.5" />
                      <rect x="0" y="64" width="16" height="3" rx="1.5" />
                    </g>

                    {/* Back Wheel */}
                    <circle cx="28" cy="68" r="13" fill="#0a1c36" stroke="#ffb100" strokeWidth="2.5" />
                    <circle cx="28" cy="68" r="8" fill="#ffffff" />
                    <circle cx="28" cy="68" r="4" fill="#0a1c36" />

                    {/* Front Wheel */}
                    <circle cx="86" cy="68" r="13" fill="#0a1c36" stroke="#ffb100" strokeWidth="2.5" />
                    <circle cx="86" cy="68" r="8" fill="#ffffff" />
                    <circle cx="86" cy="68" r="4" fill="#0a1c36" />

                    {/* Mudguards & Body Fairings */}
                    <path
                      d="M 14 66 C 14 52 38 52 44 62 L 72 62 C 78 52 100 52 100 66 C 94 70 82 70 78 60 L 46 60 C 40 70 20 70 14 66 Z"
                      fill="#0a1c36"
                      stroke="#ffb100"
                      strokeWidth="1.2"
                    />

                    {/* Body Chassis / Leg Shield */}
                    <path
                      d="M 34 62 L 52 62 L 64 38 L 78 32 L 76 25 L 58 32 L 46 50 L 34 50 Z"
                      fill="#0a1c36"
                    />

                    {/* Front Scooter Shield */}
                    <path
                      d="M 72 36 L 82 36 C 88 42 88 56 84 64 L 76 60 C 80 52 78 44 72 36 Z"
                      fill="#0a1c36"
                      stroke="#ffb100"
                      strokeWidth="1"
                    />

                    {/* Headlight */}
                    <circle cx="80" cy="30" r="4" fill="#ffb100" stroke="#0a1c36" strokeWidth="1" />

                    {/* Yellow Delivery Box with Infinity Symbol */}
                    <rect x="8" y="20" width="28" height="24" rx="4" fill="#ffb100" stroke="#0a1c36" strokeWidth="2" />
                    {/* Infinity Symbol (∞) on Delivery Box */}
                    <path
                      d="M 16 32 C 13 28 11 36 16 36 C 19 36 22 28 25 28 C 30 28 28 36 25 36 C 22 36 19 28 16 32 Z"
                      fill="none"
                      stroke="#0a1c36"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Rider Figure (Navy Body) */}
                    <path
                      d="M 36 48 C 34 34 46 18 54 18 C 60 18 64 26 62 34 L 52 48 Z"
                      fill="#0a1c36"
                    />
                    <path
                      d="M 52 24 C 62 26 72 32 78 31 C 76 34 68 34 58 30 Z"
                      fill="#0a1c36"
                    />

                    {/* Helmet with Yellow Visor */}
                    <circle cx="54" cy="12" r="9" fill="#0a1c36" stroke="#ffb100" strokeWidth="1" />
                    <path
                      d="M 56 8 C 62 8 64 12 61 15 C 57 15 55 12 56 8 Z"
                      fill="#ffb100"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Primary: Image Emblem */}
      {!useFallback ? (
        <div className={`relative z-20 w-full h-full rounded-full overflow-hidden ${animated ? 'animate-galaxy-flash' : ''}`}>
          <img
            src="/trackz_logo.png"
            alt={alt}
            className="w-full h-full object-cover rounded-full transform scale-[1.04] transition-transform duration-200"
            onError={() => setUseFallback(true)}
          />
        </div>
      ) : (
        /* Secondary Vector SVG Fallback */
        <div className={`relative z-20 w-full h-full rounded-full overflow-hidden ${animated ? 'animate-galaxy-flash' : ''}`}>
          <svg
            viewBox="0 0 300 300"
            className="w-full h-full drop-shadow-xl select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffc107" />
                <stop offset="100%" stopColor="#ff9800" />
              </linearGradient>

              <path
                id="textArcPath"
                d="M 50 185 A 110 110 0 0 0 250 185"
                fill="none"
              />
            </defs>

            {/* Outer Circle Ring */}
            <circle cx="150" cy="150" r="142" fill="#FFFFFF" stroke="#0a1c36" strokeWidth="6" />
            <circle cx="150" cy="150" r="136" fill="none" stroke="#ffb100" strokeWidth="3" />
            <circle cx="150" cy="150" r="132" fill="none" stroke="#0a1c36" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />

            {/* Infinity Road Loop Symbol (∞) */}
            <g transform="translate(0, -10)">
              <path
                d="M 100 95 C 65 55 45 125 100 125 C 150 125 150 55 200 55 C 255 55 235 125 200 125 C 150 125 150 55 100 95 Z"
                fill="none"
                stroke="#0a1c36"
                strokeWidth="20"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 100 95 C 65 55 45 125 100 125 C 150 125 150 55 200 55 C 255 55 235 125 200 125 C 150 125 150 55 100 95 Z"
                fill="none"
                stroke="#ffb100"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                strokeLinecap="round"
              />

              {/* Yellow Map Pin */}
              <g transform="translate(210, 42)">
                <path
                  d="M 12 0 C 5.37 0 0 5.37 0 12 C 0 21 12 30 12 30 C 12 30 24 21 24 12 C 24 5.37 18.63 0 12 0 Z"
                  fill="url(#yellowGrad)"
                  stroke="#0a1c36"
                  strokeWidth="2"
                />
                <circle cx="12" cy="11" r="4.5" fill="#0a1c36" />
              </g>

              {/* Scooter Rider Graphic */}
              <g transform="translate(112, 60)">
                <path d="M -22 25 L -8 25 M -26 31 L -12 31 M -18 37 L -6 37" stroke="#ffb100" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="10" cy="38" r="8" fill="#0a1c36" stroke="#ffb100" strokeWidth="2.5" />
                <circle cx="48" cy="38" r="8" fill="#0a1c36" stroke="#ffb100" strokeWidth="2.5" />
                <path d="M 10 38 L 22 38 L 32 30 L 44 20 L 48 38" fill="none" stroke="#0a1c36" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 38 18 L 46 14" stroke="#0a1c36" strokeWidth="3" strokeLinecap="round" />
                <path d="M 22 28 L 28 16 L 38 18" fill="none" stroke="#0a1c36" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="28" cy="12" r="6" fill="#ffb100" stroke="#0a1c36" strokeWidth="2" />
                <path d="M 30 11 L 33 13" stroke="#0a1c36" strokeWidth="2" strokeLinecap="round" />
                <rect x="-2" y="12" width="16" height="16" rx="3" fill="#ffb100" stroke="#0a1c36" strokeWidth="2" />
              </g>
            </g>

            {/* Typography - TRAKZ DELIVERIES */}
            <g transform="translate(150, 168)">
              <text
                x="0"
                y="0"
                textAnchor="middle"
                fill="#0a1c36"
                fontSize="32"
                fontWeight="900"
                fontFamily="'Plus Jakarta Sans', 'Arial Black', sans-serif"
                letterSpacing="-1"
              >
                TRAK<tspan fill="#ffb100">Z</tspan>
              </text>

              <g transform="translate(0, 18)">
                <line x1="-88" y1="-4" x2="-60" y2="-4" stroke="#ffb100" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="-88" y1="1" x2="-60" y2="1" stroke="#0a1c36" strokeWidth="2.5" strokeLinecap="round" />
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  fill="#0a1c36"
                  fontSize="12"
                  fontWeight="900"
                  fontFamily="'Plus Jakarta Sans', 'Arial Black', sans-serif"
                  letterSpacing="3"
                >
                  DELIVERIES
                </text>
                <line x1="60" y1="-4" x2="88" y2="-4" stroke="#ffb100" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="60" y1="1" x2="88" y2="1" stroke="#0a1c36" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            </g>

            {/* Feature Badges */}
            <g transform="translate(150, 218)">
              <line x1="-30" y1="-10" x2="-30" y2="10" stroke="#0a1c36" strokeWidth="1" opacity="0.3" />
              <line x1="30" y1="-10" x2="30" y2="10" stroke="#0a1c36" strokeWidth="1" opacity="0.3" />

              <g transform="translate(-62, 0)">
                <circle cx="0" cy="0" r="11" fill="#FFFFFF" stroke="#0a1c36" strokeWidth="1.5" />
                <path d="M 0 -5 C -3 -5 -5 -3 -5 0 C -5 4 0 8 0 8 C 0 8 5 4 5 0 C 5 -3 3 -5 0 -5 Z" fill="#ffb100" stroke="#0a1c36" strokeWidth="0.8" />
                <circle cx="0" cy="-0.5" r="1.5" fill="#0a1c36" />
              </g>

              <g transform="translate(0, 0)">
                <circle cx="0" cy="0" r="11" fill="#FFFFFF" stroke="#0a1c36" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="6" fill="none" stroke="#0a1c36" strokeWidth="1.2" />
                <path d="M 0 -4 L 0 0 L 3 2" fill="none" stroke="#ffb100" strokeWidth="1.5" strokeLinecap="round" />
              </g>

              <g transform="translate(62, 0)">
                <circle cx="0" cy="0" r="11" fill="#FFFFFF" stroke="#0a1c36" strokeWidth="1.5" />
                <path d="M -4 -4 L 4 -4 L 4 0 C 4 3 0 6 0 6 C 0 6 -4 3 -4 0 Z" fill="#ffb100" stroke="#0a1c36" strokeWidth="1" />
                <path d="M -1.5 0 L -0.5 1.5 L 2 -1" fill="none" stroke="#0a1c36" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>

            {/* Curved Tagline Arc */}
            <text
              fill="#0a1c36"
              fontSize="9.5"
              fontWeight="800"
              fontFamily="'Plus Jakarta Sans', sans-serif"
              letterSpacing="2.2"
            >
              <textPath href="#textArcPath" startOffset="50%" textAnchor="middle">
                DELIVERING MORE. EVERY DAY.
              </textPath>
            </text>
          </svg>
        </div>
      )}
    </div>
  );
};
