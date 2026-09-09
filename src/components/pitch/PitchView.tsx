import React from 'react';
import { FORMATION_COORDS, FormationType } from '../../constants/formations';

interface PitchViewProps {
  homeTla: string;
  awayTla: string;
  homeFormation?: FormationType;
  awayFormation?: FormationType;
  homeStarters: string[];
  awayStarters: string[];
  homeColor?: string;
  awayColor?: string;
  mode?: 'both' | 'home' | 'away';
}

export const PitchView: React.FC<PitchViewProps> = ({
  homeTla,
  awayTla,
  homeFormation = '4-3-3',
  awayFormation = '4-2-3-1',
  homeStarters,
  awayStarters,
  homeColor = '#EF0107',
  awayColor = '#034694',
  mode = 'both',
}) => {
  const homeCoords = FORMATION_COORDS[homeFormation] || FORMATION_COORDS['4-3-3'];
  const awayCoords = FORMATION_COORDS[awayFormation] || FORMATION_COORDS['4-2-3-1'];

  // Dimensions for SVG pitch: 500 wide, 700 tall
  const width = 500;
  const height = 700;

  return (
    <div className="relative w-full max-w-lg mx-auto bg-[#1b3d1f] rounded-2xl overflow-hidden border-2 border-[#2b592f] shadow-2xl select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e4623" />
            <stop offset="100%" stopColor="#17381b" />
          </linearGradient>
          <pattern id="stripes" width="500" height="70" patternUnits="userSpaceOnUse">
            <rect width="500" height="35" fill="#1b4020" opacity="0.35" />
          </pattern>
        </defs>

        {/* Grass background & stripes */}
        <rect width={width} height={height} fill="url(#grass)" />
        <rect width={width} height={height} fill="url(#stripes)" />

        {/* Pitch boundary line */}
        <rect
          x="25"
          y="25"
          width="450"
          height="650"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
        />

        {/* Halfway line */}
        <line
          x1="25"
          y1="350"
          x2="475"
          y2="350"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
        />

        {/* Center circle & spot */}
        <circle
          cx="250"
          cy="350"
          r="60"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
        />
        <circle cx="250" cy="350" r="3.5" fill="rgba(255,255,255,0.7)" />

        {/* Top Penalty Area (Away) */}
        <rect
          x="125"
          y="25"
          width="250"
          height="115"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
        />
        {/* Top Goal Area */}
        <rect
          x="175"
          y="25"
          width="150"
          height="45"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
        />
        {/* Top Penalty Arc */}
        <path
          d="M 200 140 A 50 50 0 0 0 300 140"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
        />
        <circle cx="250" cy="90" r="3" fill="rgba(255,255,255,0.7)" />

        {/* Bottom Penalty Area (Home) */}
        <rect
          x="125"
          y="560"
          width="250"
          height="115"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
        />
        {/* Bottom Goal Area */}
        <rect
          x="175"
          y="630"
          width="150"
          height="45"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
        />
        {/* Bottom Penalty Arc */}
        <path
          d="M 200 560 A 50 50 0 0 1 300 560"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
        />
        <circle cx="250" cy="610" r="3" fill="rgba(255,255,255,0.7)" />

        {/* Render Home Players (attacking upward, GK at bottom) */}
        {(mode === 'both' || mode === 'home') &&
          homeCoords.map(([rx, ry], idx) => {
            // Compress home coordinates into the lower half (or full pitch if mode='home')
            const scaleY = mode === 'both' ? 0.45 : 0.85;
            const offsetY = mode === 'both' ? 0.52 : 0.08;
            const px = 25 + rx * 450;
            const py = (ry * scaleY + offsetY) * height;
            const playerName = homeStarters[idx] || `Player ${idx + 1}`;
            const shortName = playerName.replace(/\s*\([^)]*\)/, '').split(' ').pop() || playerName;

            return (
              <g key={`home-${idx}`} className="transition-transform hover:scale-110 cursor-pointer">
                <circle
                  cx={px}
                  cy={py}
                  r="14"
                  fill={homeColor}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                />
                <text
                  x={px}
                  y={py + 4}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {idx === 0 ? '1' : idx + 1}
                </text>
                <text
                  x={px}
                  y={py + 25}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="9.5"
                  fontWeight="600"
                  filter="drop-shadow(0 1px 2px rgba(0,0,0,0.9))"
                  className="tracking-tight"
                >
                  {shortName}
                </text>
              </g>
            );
          })}

        {/* Render Away Players (GK at top, attacks downward) */}
        {(mode === 'both' || mode === 'away') &&
          awayCoords.map(([rx, ry], idx) => {
            // Mirror Y: pitchY = 1.0 - y
            const mirrorRy = 1.0 - ry;
            const scaleY = mode === 'both' ? 0.45 : 0.85;
            const offsetY = mode === 'both' ? 0.03 : 0.08;
            const px = 25 + rx * 450;
            const py = (mirrorRy * scaleY + offsetY) * height;
            const playerName = awayStarters[idx] || `Player ${idx + 1}`;
            const shortName = playerName.replace(/\s*\([^)]*\)/, '').split(' ').pop() || playerName;

            return (
              <g key={`away-${idx}`} className="transition-transform hover:scale-110 cursor-pointer">
                <circle
                  cx={px}
                  cy={py}
                  r="14"
                  fill={awayColor}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                />
                <text
                  x={px}
                  y={py + 4}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {idx === 0 ? '1' : idx + 1}
                </text>
                <text
                  x={px}
                  y={py - 16}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="9.5"
                  fontWeight="600"
                  filter="drop-shadow(0 1px 2px rgba(0,0,0,0.9))"
                  className="tracking-tight"
                >
                  {shortName}
                </text>
              </g>
            );
          })}
      </svg>

      {/* Floating formation legends */}
      <div className="absolute top-2 left-3 right-3 flex items-center justify-between text-[11px] font-bold text-white/90 bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-sm pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border border-white" style={{ backgroundColor: awayColor }} />
          <span>{awayTla} ({awayFormation})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>{homeTla} ({homeFormation})</span>
          <span className="w-2.5 h-2.5 rounded-full border border-white" style={{ backgroundColor: homeColor }} />
        </div>
      </div>
    </div>
  );
};
