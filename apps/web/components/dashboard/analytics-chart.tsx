'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { mockChartData } from '@/lib/mock-data';

export function AnalyticsChart() {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const width = 600;
  const height = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Find max value in dataset to scale chart
  const maxVal = Math.max(...mockChartData.map((d) => Math.max(d.comments, d.messages))) * 1.1;

  // Compute coordinate points
  const points = mockChartData.map((d, i) => {
    const x = paddingLeft + (i / (mockChartData.length - 1)) * chartWidth;
    const yComments = height - paddingBottom - (d.comments / maxVal) * chartHeight;
    const yMessages = height - paddingBottom - (d.messages / maxVal) * chartHeight;
    return { x, yComments, yMessages, ...d };
  });

  // Generate SVG Path definitions
  const generatePath = (valKey: 'yComments' | 'yMessages') => {
    if (points.length === 0) return '';
    return points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p[valKey]}` : `${acc} L ${p.x} ${p[valKey]}`;
    }, '');
  };

  const generateAreaPath = (valKey: 'yComments' | 'yMessages') => {
    if (points.length === 0) return '';
    const linePath = generatePath(valKey);
    const startX = points[0].x;
    const endX = points[points.length - 1].x;
    const baseY = height - paddingBottom;
    return `${linePath} L ${endX} ${baseY} L ${startX} ${baseY} Z`;
  };

  const commentPath = generatePath('yComments');
  const commentArea = generateAreaPath('yComments');

  const messagePath = generatePath('yMessages');
  const messageArea = generateAreaPath('yMessages');

  return (
    <div className="glass-card border-gradient p-5 rounded-xl shadow-glass flex flex-col space-y-4">
      {/* Chart Title & Legend */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-white">Automation Traffic</h3>
          <p className="text-[10px] text-gray-500">Hourly activity stats over the past week</p>
        </div>
        <div className="flex space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-gray-400">Comments</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="h-2 w-2 rounded-full bg-accent-cyan" />
            <span className="text-gray-400">DMs sent</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full h-[220px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="commentsGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00BB88" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00BB88" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="messagesGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
            const y = paddingTop + r * chartHeight;
            const gridVal = Math.round(maxVal * (1 - r));
            return (
              <g key={i} className="opacity-20">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                />
                <text x={paddingLeft - 8} y={y + 4} fill="#9ca3af" fontSize="8" textAnchor="end">
                  {gridVal}
                </text>
              </g>
            );
          })}

          {/* Horizontal X Axis line */}
          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingRight}
            y2={height - paddingBottom}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />

          {/* Areas */}
          <motion.path
            d={commentArea}
            fill="url(#commentsGlow)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          <motion.path
            d={messageArea}
            fill="url(#messagesGlow)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          />

          {/* Lines */}
          <motion.path
            d={commentPath}
            fill="none"
            stroke="#00BB88"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1 }}
          />
          <motion.path
            d={messagePath}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.1 }}
          />

          {/* X Axis Labels */}
          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={height - paddingBottom + 16}
              fill="#9ca3af"
              fontSize="9"
              textAnchor="middle"
              className="opacity-60"
            >
              {p.date}
            </text>
          ))}

          {/* Hover interactive overlay zones */}
          {points.map((p, i) => (
            <g key={i}>
              <rect
                x={p.x - chartWidth / (points.length - 1) / 2}
                y={paddingTop}
                width={chartWidth / (points.length - 1)}
                height={chartHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              />

              {/* Highlight guidelines & points */}
              {hoveredIndex === i && (
                <g>
                  {/* Guideline */}
                  <line
                    x1={p.x}
                    y1={paddingTop}
                    x2={p.x}
                    y2={height - paddingBottom}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                  />
                  {/* Comments node dot */}
                  <circle
                    cx={p.x}
                    cy={p.yComments}
                    r="5"
                    fill="#00BB88"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  {/* Messages node dot */}
                  <circle
                    cx={p.x}
                    cy={p.yMessages}
                    r="5"
                    fill="#06b6d4"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                </g>
              )}
            </g>
          ))}
        </svg>

        {/* Dynamic HTML Tooltip */}
        {hoveredIndex !== null && (
          <div
            className="absolute z-20 glass-card bg-background/95 border border-white/10 p-2 rounded-lg text-[10px] space-y-1 shadow-glass text-white pointer-events-none"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              top: `10%`,
              transform: `translateX(-50%)`,
            }}
          >
            <div className="font-bold border-b border-white/5 pb-0.5 text-center mb-1">
              {points[hoveredIndex].date}
            </div>
            <div className="flex justify-between space-x-4">
              <span className="text-gray-400">Comments:</span>
              <span className="font-bold text-primary">{points[hoveredIndex].comments}</span>
            </div>
            <div className="flex justify-between space-x-4">
              <span className="text-gray-400">DMs sent:</span>
              <span className="font-bold text-accent-cyan">{points[hoveredIndex].messages}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
