"use client";

import { motion, useReducedMotion } from "motion/react";

/** MediaPipe hand topology: 21 landmarks, real connection graph. A nod to the palmprint work. */
const points: ReadonlyArray<readonly [number, number]> = [
  [50, 95], // 0 wrist
  [38, 85], [28, 74], [21, 64], [16, 55], // thumb
  [38, 62], [35, 46], [33, 35], [32, 25], // index
  [48, 60], [47, 42], [46, 30], [45, 18], // middle
  [58, 61], [60, 44], [61, 33], [62, 23], // ring
  [68, 66], [72, 52], [74, 43], [76, 34], // pinky
];

const connections: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

export function HandLandmarks({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <motion.svg
      viewBox="0 0 100 110"
      className={className}
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : 1.4, delay: reduced ? 0 : 1.2 }}
    >
      {connections.map(([a, b], i) => (
        <motion.line
          key={`c-${i}`}
          x1={points[a][0]}
          y1={points[a][1]}
          x2={points[b][0]}
          y2={points[b][1]}
          stroke="var(--acc)"
          strokeOpacity="0.28"
          strokeWidth="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 1.3 + i * 0.045 }}
        />
      ))}
      {points.map(([x, y], i) => (
        <motion.circle
          key={`p-${i}`}
          cx={x}
          cy={y}
          r="1.1"
          fill="var(--acc)"
          fillOpacity="0.75"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: reduced ? 0 : 0.3, delay: reduced ? 0 : 1.25 + i * 0.04 }}
        />
      ))}
      <text x="50" y="106" textAnchor="middle" fill="var(--faint)" fontSize="3.2" fontFamily="var(--font-mono)">
        hand_landmarks · 21 pts
      </text>
    </motion.svg>
  );
}
