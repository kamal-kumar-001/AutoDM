'use client';

import * as React from 'react';
import { MessageSquare, MessageCircle, TrendingUp, Shield, RefreshCw } from 'lucide-react';

export default function DashboardMockup() {
  const barData = [30, 55, 42, 80, 65, 90, 72, 85, 60, 95, 78, 88, 50, 70];

  return (
    <section className="py-16 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            A dashboard that feels <span className="text-primary">alive</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Real-time data, zero configuration. See every DM comment and campaign trigger at a
            glance.
          </p>
        </div>

        {/* Large Mockup Container */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/5 shadow-[0_60px_120px_rgba(0,0,0,0.65)] relative overflow-hidden">
          {/* Ambient light source */}
          <div className="absolute top-[-100px] right-[-100px] w-[350px] h-[350px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: 'Total DMs Sent',
                value: '24,891',
                trend: '+18% this week',
                color: 'text-primary',
              },
              {
                label: 'Success Rate',
                value: '98.4%',
                trend: '+2% health',
                color: 'text-accent-cyan',
              },
              {
                label: 'Active Campaigns',
                value: '7 active',
                trend: '+1 new',
                color: 'text-amber-400',
              },
              {
                label: 'Comments Filtered',
                value: '31,240',
                trend: '+24% comments',
                color: 'text-pink-500',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col justify-between"
              >
                <p className={`text-xl sm:text-2xl font-black ${stat.color} mb-1`}>{stat.value}</p>
                <p className="text-[11px] text-gray-500 font-medium tracking-wide mb-2 uppercase">
                  {stat.label}
                </p>
                <span className="text-[10px] text-primary font-bold">{stat.trend}</span>
              </div>
            ))}
          </div>

          {/* Graph + Live Feeds Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Module (Left Columns) */}
            <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-5 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold text-gray-400">DM Volume — Last 14 Days</span>
                <div className="flex gap-4">
                  {[
                    ['DMs', 'bg-primary'],
                    ['Comments', 'bg-accent-cyan'],
                  ].map(([label, color]) => (
                    <span
                      key={label}
                      className="text-[10px] text-gray-500 flex items-center gap-1.5"
                    >
                      <span className={`w-2 h-2 rounded-full ${color}`} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Graphic Columns */}
              <div className="flex items-end gap-2.5 h-36 pt-4 border-b border-white/5 pb-2">
                {barData.map((val, idx) => (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col gap-1.5 items-center justify-end h-full"
                  >
                    {/* Secondary metric bar */}
                    <div
                      style={{ height: `${val * 0.6}%` }}
                      className="w-full rounded-t bg-accent-cyan/20 hover:bg-accent-cyan/40 transition-colors"
                    />
                    {/* Primary metric bar */}
                    <div
                      style={{ height: `${val}%` }}
                      className="w-full rounded-t bg-primary/45 hover:bg-primary/70 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Live Activity Feeds (Right Column) */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 flex flex-col justify-between">
              <p className="text-xs font-bold text-gray-400 mb-4">Live Activity Streams</p>
              <div className="space-y-3.5">
                {[
                  { icon: MessageSquare, text: '@creator_jane DM sent successfully', ok: true },
                  { icon: MessageCircle, text: '@fit_brand comment keyword matched', ok: true },
                  { icon: TrendingUp, text: 'Campaign "Summer Promo" active', ok: true },
                  { icon: Shield, text: 'Webhook verified & signature matched', ok: true },
                  { icon: RefreshCw, text: 'Rate limit hit, retry job scheduled', ok: false },
                ].map((feed, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        feed.ok ? 'bg-primary/10' : 'bg-red-500/10'
                      }`}
                    >
                      <feed.icon
                        className={`w-4 h-4 ${feed.ok ? 'text-primary' : 'text-red-400'}`}
                      />
                    </div>
                    <span className="text-[11px] text-gray-400 leading-normal">{feed.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
