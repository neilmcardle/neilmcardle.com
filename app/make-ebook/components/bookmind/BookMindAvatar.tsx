'use client';

import React from 'react';
import { motion } from 'motion/react';

interface BookMindAvatarProps {
  expression?: 'neutral' | 'attentive' | 'surprised' | 'excited' | 'happy' | 'laughing' | 'angry' | 'sad' | 'scared' | 'suspicious' | 'confused' | 'curious' | 'proud' | 'shy' | 'unimpressed' | 'sleepy' | 'thinking' | 'listening';
  shape?: 'circle' | 'pebble' | 'squircle' | 'capsule' | 'triangle' | 'hexagon' | 'cloud' | 'droplet';
  size?: 'sm' | 'md' | 'lg';
}

type EyeStyle = {
  leftX: number;
  rightX: number;
  topY: number;
  width: number;
  height: number;
  pupilOffsetX?: number;
  pupilOffsetY?: number;
  mouthOpen?: boolean;
};

const EXPRESSION_EYES: Record<string, EyeStyle> = {
  neutral: { leftX: 35, rightX: 65, topY: 40, width: 4, height: 4 },
  attentive: { leftX: 35, rightX: 65, topY: 38, width: 5, height: 5 },
  surprised: { leftX: 33, rightX: 67, topY: 38, width: 7, height: 8 },
  excited: { leftX: 32, rightX: 68, topY: 36, width: 8, height: 8 },
  happy: { leftX: 35, rightX: 65, topY: 42, width: 6, height: 3 },
  laughing: { leftX: 35, rightX: 65, topY: 42, width: 6, height: 3, mouthOpen: true },
  angry: { leftX: 35, rightX: 65, topY: 40, width: 5, height: 4 },
  sad: { leftX: 35, rightX: 65, topY: 40, width: 5, height: 4 },
  scared: { leftX: 33, rightX: 67, topY: 36, width: 8, height: 10 },
  suspicious: { leftX: 30, rightX: 70, topY: 42, width: 5, height: 2, pupilOffsetX: -2 },
  confused: { leftX: 35, rightX: 65, topY: 42, width: 5, height: 3 },
  curious: { leftX: 35, rightX: 65, topY: 38, width: 6, height: 5 },
  proud: { leftX: 35, rightX: 65, topY: 40, width: 5, height: 3 },
  shy: { leftX: 40, rightX: 60, topY: 42, width: 4, height: 2 },
  unimpressed: { leftX: 35, rightX: 65, topY: 42, width: 6, height: 2 },
  sleepy: { leftX: 35, rightX: 65, topY: 42, width: 6, height: 2 },
  thinking: { leftX: 35, rightX: 65, topY: 40, width: 4, height: 4 },
  listening: { leftX: 35, rightX: 65, topY: 40, width: 5, height: 5 },
};

const SHAPE_RADIUS: Record<string, string> = {
  circle: 'rounded-full',
  pebble: 'rounded-2xl',
  squircle: 'rounded-3xl',
  capsule: 'rounded-full',
  triangle: 'rounded-none',
  hexagon: 'rounded-none',
  cloud: 'rounded-full',
  droplet: 'rounded-full',
};

export default function BookMindAvatar({
  expression = 'neutral',
  shape = 'circle',
  size = 'md',
}: BookMindAvatarProps) {
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const eyeConfig = EXPRESSION_EYES[expression] || EXPRESSION_EYES.neutral;

  const containerVariants = {
    thinking: { scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 2 } },
    happy: { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1.5 } },
    curious: { rotate: [0, -2, 2, 0], transition: { repeat: Infinity, duration: 2.5 } },
  };

  const isAnimated = expression === 'thinking' || expression === 'happy' || expression === 'curious';

  const SVGEyes = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
      {/* Left eye */}
      <ellipse
        cx={eyeConfig.leftX}
        cy={eyeConfig.topY}
        rx={eyeConfig.width}
        ry={eyeConfig.height}
        fill="white"
      />
      {/* Right eye */}
      <ellipse
        cx={eyeConfig.rightX}
        cy={eyeConfig.topY}
        rx={eyeConfig.width}
        ry={eyeConfig.height}
        fill="white"
      />

      {/* Pupils if needed */}
      {!['happy', 'laughing', 'shy', 'unimpressed', 'sleepy'].includes(expression) && (
        <>
          <circle
            cx={eyeConfig.leftX + (eyeConfig.pupilOffsetX || 0)}
            cy={eyeConfig.topY + (eyeConfig.pupilOffsetY || 0)}
            r={Math.max(eyeConfig.width * 0.4, 0.8)}
            fill="currentColor"
          />
          <circle
            cx={eyeConfig.rightX + (eyeConfig.pupilOffsetX || 0)}
            cy={eyeConfig.topY + (eyeConfig.pupilOffsetY || 0)}
            r={Math.max(eyeConfig.width * 0.4, 0.8)}
            fill="currentColor"
          />
        </>
      )}

      {/* Mouth indicators */}
      {expression === 'happy' && (
        <path d="M 35 65 Q 50 70 65 65" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}
      {expression === 'laughing' && (
        <path d="M 30 65 Q 50 75 70 65" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
      {expression === 'sad' && (
        <path d="M 35 70 Q 50 65 65 70" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}
      {expression === 'angry' && (
        <>
          <line x1="30" y1="68" x2="45" y2="65" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="70" y1="68" x2="55" y2="65" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );

  return (
    <motion.div
      className={`${sizeMap[size]} ${SHAPE_RADIUS[shape]} bg-gray-900 dark:bg-white flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      variants={isAnimated ? containerVariants : {}}
      animate={isAnimated ? expression : 'static'}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div className="w-full h-full text-gray-900 dark:text-white">
        <SVGEyes />
      </div>

      {/* Thinking indicator dots */}
      {expression === 'thinking' && (
        <motion.div
          className="absolute bottom-2 flex gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full bg-white dark:bg-gray-900"
              animate={{ y: [0, -4, 0] }}
              transition={{ delay: i * 0.1, repeat: Infinity, duration: 1.2 }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
