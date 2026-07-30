'use client';

import * as React from 'react';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, ShieldCheck, Zap, Flame, Users, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api-client';
import { BillingPlan, PricingPromoResponse } from '@/types';
import {
  DEFAULT_PRICING_DATA,
  COMPARISON_SPECIFICATIONS,
  FOUNDING_MEMBER_STATS,
  AGENCY_SEAT_OPTIONS,
} from '@/lib/pricing-data';

export default function PricingPage() {
  const [data, setData] = React.useState<PricingPromoResponse>(DEFAULT_PRICING_DATA);
  const [isAnnual, setIsAnnual] = React.useState(true); // Default to Annual for 50% OFF
  const [agencySeatsIdx, setAgencySeatsIdx] = React.useState(0);

  React.useEffect(() => {
    fetch(API_BASE_URL + '/pricing-promo')
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson && resJson.success && resJson.data) {
          setData(resJson.data);
        }
      })
      .catch((err) =>
        console.error('Failed to load pricing configurations, using fallback data:', err),
      );
  }, []);

  const { plans, promo, featureFlags } = data;

  const currentAgencySeats = AGENCY_SEAT_OPTIONS[agencySeatsIdx];

  return (
    <div className="bg-[#030712] min-h-screen text-white antialiased selection:bg-primary/30 selection:text-white overflow-x-hidden">
      {/* 1. FOUNDING MEMBER TICKER BANNER */}
      <div className="bg-gradient-to-r from-emerald-500/20 via-primary/30 to-accent-cyan/20 border-b border-primary/20 text-center py-2.5 px-4 text-xs font-bold text-white relative z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-[11px] sm:text-xs">
            <Flame className="w-4 h-4 text-amber-400 animate-bounce flex-shrink-0" />
            <span className="font-black uppercase tracking-wider text-amber-300">
              Founding Member Pricing
            </span>
            <span className="hidden sm:inline text-gray-400">•</span>
            <span className="text-gray-200">Limited to first 1,000 users, locked in forever!</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-primary">
                {FOUNDING_MEMBER_STATS.claimed} / {FOUNDING_MEMBER_STATS.total}
              </span>
              <span className="text-gray-400">spots claimed</span>
            </div>
            <div className="w-20 bg-white/10 rounded-full h-2 overflow-hidden border border-white/10">
              <div className="bg-gradient-to-r from-primary to-emerald-400 h-full w-[95%] rounded-full" />
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase">
              {FOUNDING_MEMBER_STATS.remaining} spots left
            </span>
          </div>
        </div>
      </div>

      {/* Background Mesh Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-cyan/5 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-10 text-center max-w-4xl mx-auto px-6 space-y-4">
          <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-black tracking-widest text-primary uppercase inline-block">
            Transparent Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            Built for Creators, D2C Brands & Agencies <br />
            <span className="bg-gradient-to-r from-primary via-emerald-400 to-accent-cyan bg-clip-text text-transparent">
              Scale Without Account Limits
            </span>
          </h1>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            No hidden setup fees. Upgrade or cancel anytime. Backed by our 100% Account Restriction
            Refund Guarantee.
          </p>

          {/* Billing Switcher Toggle */}
          <div className="flex items-center justify-center gap-3 pt-6">
            <span
              className={
                !isAnnual
                  ? 'text-white text-xs font-bold uppercase'
                  : 'text-gray-500 text-xs font-bold uppercase'
              }
            >
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-white/10 transition-colors duration-200 ease-in-out focus:outline-none"
            >
              <span
                className={
                  isAnnual
                    ? 'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-primary shadow transition duration-200 ease-in-out translate-x-5'
                    : 'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-primary shadow transition duration-200 ease-in-out translate-x-0'
                }
              />
            </button>
            <span
              className={
                isAnnual
                  ? 'text-primary text-xs font-bold uppercase flex items-center gap-1.5'
                  : 'text-gray-500 text-xs font-bold uppercase flex items-center gap-1.5'
              }
            >
              Annual (SAVE ₹2,400)
              <span className="text-[9px] bg-primary/20 border border-primary/30 text-primary px-2 py-0.5 rounded font-black uppercase animate-pulse">
                50% OFF
              </span>
            </span>
          </div>
        </section>

        {/* 2. PRICING CARDS GRID */}
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* CARD 1: FREE PLAN */}
            <div className="glass-card border-gradient rounded-3xl p-7 shadow-glass relative flex flex-col justify-between space-y-6 hover:translate-y-[-4px] transition-transform">
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-black text-white">Free</h3>
                  <p className="text-xs text-gray-400 mt-1">Ideal for trying smart DM automation</p>
                </div>

                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-black text-white">₹0</span>
                  <span className="text-xs text-gray-400 font-bold">/ month</span>
                </div>

                <div className="border-t border-white/5 pt-5 space-y-3 text-xs text-gray-300">
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>
                      <strong>200 DMs</strong> / month
                    </span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>
                      AI powered DMs in <strong>regional language</strong>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Story reply automation</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Reply Desk AI query filter</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Email + phone lead capture</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>WhatsApp support</span>
                  </div>
                  <div className="flex items-center space-x-2.5 opacity-50">
                    <X className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <span className="line-through">Remove AutoDM branding</span>
                  </div>
                  <div className="flex items-center space-x-2.5 opacity-50">
                    <X className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <span className="line-through">Follow to Unlock</span>
                  </div>
                </div>
              </div>

              <Link
                href="/register"
                className="block w-full py-3.5 rounded-xl font-black uppercase text-center text-xs tracking-wider bg-white/5 text-gray-200 border border-white/10 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <span>Choose Free →</span>
              </Link>
            </div>

            {/* CARD 2: PRO PLAN (MOST POPULAR) */}
            <div className="glass-card border-gradient rounded-3xl p-7 shadow-glass relative flex flex-col justify-between space-y-6 border-primary/40 shadow-[0_0_40px_rgba(0,187,136,0.15)] hover:translate-y-[-4px] transition-transform">
              <div className="absolute top-4 right-4 bg-gradient-to-r from-primary to-accent-cyan text-black text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-black" />
                MOST POPULAR
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <span>Pro</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      50% OFF
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Unlimited everything for serious creators & D2C brands
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-black text-white">
                      ₹{isAnnual ? '999' : '1,990'}
                    </span>
                    <span className="text-xs text-gray-400 font-bold">/ month</span>
                    {isAnnual && (
                      <span className="text-xs text-red-400 line-through font-bold">₹1,990</span>
                    )}
                  </div>
                  {isAnnual && (
                    <div className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider">
                      SAVE ₹2,400 • Billed Annually
                    </div>
                  )}
                </div>

                <div className="border-t border-white/5 pt-5 space-y-3 text-xs text-gray-200">
                  <div className="flex items-center space-x-2.5 font-bold text-white">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>
                      <strong>Unlimited DMs</strong> & Automations
                    </span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>
                      AI powered DMs in <strong>regional language</strong>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>
                      <strong>No AutoDM branding</strong>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>
                      <strong>Follow to Unlock</strong> (Follow Gate)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Email + phone lead capture</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Priority WhatsApp support</span>
                  </div>

                  {/* 100% Refund Guarantee Badge */}
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center space-x-2 mt-4 shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>100% Refund if Your Account Gets Restricted</span>
                  </div>
                </div>
              </div>

              <Link
                href={
                  isAnnual ? '/checkout?plan=PRO&cycle=yearly' : '/checkout?plan=PRO&cycle=monthly'
                }
                className="block w-full py-3.5 rounded-xl font-black uppercase text-center text-xs tracking-wider bg-gradient-to-r from-primary to-accent-cyan text-black shadow-[0_0_20px_rgba(0,187,136,0.3)] hover:shadow-[0_0_25px_rgba(0,187,136,0.5)] transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Choose Pro →</span>
              </Link>
            </div>

            {/* CARD 3: AGENCY PLAN */}
            <div className="glass-card border-gradient rounded-3xl p-7 shadow-glass relative flex flex-col justify-between space-y-6 hover:translate-y-[-4px] transition-transform">
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-black text-white">Agency Plan</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Everything in Pro, built for agencies managing multiple creators
                  </p>
                </div>

                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-black text-white">₹3,990</span>
                  <span className="text-xs text-gray-400 font-bold">/ month</span>
                </div>

                {/* Team Size Selector */}
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-300">
                    <span className="uppercase tracking-wider text-[10px] text-gray-400">
                      Team Size / Accounts
                    </span>
                    <span className="text-primary font-black">{currentAgencySeats.label}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {AGENCY_SEAT_OPTIONS.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setAgencySeatsIdx(idx)}
                        className={
                          agencySeatsIdx === idx
                            ? 'py-1 rounded-lg text-xs font-black border transition-all bg-primary text-black border-primary'
                            : 'py-1 rounded-lg text-xs font-black border transition-all bg-white/5 text-gray-400 border-white/10 hover:text-white'
                        }
                      >
                        {opt.seats} Seats
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-3 text-xs text-gray-300">
                  <div className="flex items-center space-x-2.5 font-bold text-white">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Everything in Pro included</span>
                  </div>
                  <div className="flex items-center space-x-2.5 font-bold text-primary">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>
                      <strong>{currentAgencySeats.seats} seats</strong> for your team
                    </span>
                  </div>
                  <div className="flex items-center space-x-2.5 font-bold text-primary">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>
                      Manage{' '}
                      <strong>{currentAgencySeats.clientAccounts} client Instagram accounts</strong>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Dedicated relationship manager</span>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                  <span>Trusted by agencies managing top creator rosters</span>
                </div>
              </div>

              <Link
                href={'/checkout?plan=ENTERPRISE&seats=' + currentAgencySeats.seats}
                className="block w-full py-3.5 rounded-xl font-black uppercase text-center text-xs tracking-wider bg-white/10 text-white border border-white/15 hover:bg-white/20 transition-all flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <span>Choose Agency →</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 3. FEATURE COMPARISON MATRIX */}
        <section className="max-w-7xl mx-auto px-6 py-16 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
              Plan Feature Matrix
            </h2>
            <p className="text-xs text-gray-500">
              Synced live with system feature flags and account limits.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 shadow-glass overflow-x-auto scrollbar-none">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/5 text-gray-400">
                  <th className="text-left pb-4 text-xs font-black uppercase tracking-widest w-1/3">
                    Feature Details
                  </th>
                  {plans.map((p) => (
                    <th
                      key={p.id}
                      className="pb-4 text-center text-xs font-black uppercase tracking-widest text-white w-1/5"
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="bg-white/[0.01]">
                  <td
                    colSpan={4}
                    className="py-2.5 px-3 text-[10px] font-black text-primary uppercase tracking-widest"
                  >
                    Limits & Connections
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-3 text-xs font-semibold text-gray-300">
                    Instagram Accounts Connected
                  </td>
                  {plans.map((p) => (
                    <td
                      key={p.id}
                      className={
                        p.key === 'ENTERPRISE'
                          ? 'py-3.5 text-center text-xs font-bold text-primary'
                          : 'py-3.5 text-center text-xs font-bold text-gray-400'
                      }
                    >
                      {COMPARISON_SPECIFICATIONS.accounts[
                        p.key as keyof typeof COMPARISON_SPECIFICATIONS.accounts
                      ] || p.key + ' Accounts'}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-3 text-xs font-semibold text-gray-300">
                    Active Automations Limit
                  </td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-3.5 text-center text-xs text-gray-400 font-bold">
                      {p.key === 'FREE' ? '2 Campaigns' : 'Unlimited Campaigns'}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-3 text-xs font-semibold text-gray-300">
                    Monthly DM Volume
                  </td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-3.5 text-center text-xs text-gray-400 font-bold">
                      {p.key === 'FREE' ? '200 DMs' : 'Unlimited DMs'}
                    </td>
                  ))}
                </tr>

                <tr className="bg-white/[0.01]">
                  <td
                    colSpan={4}
                    className="py-2.5 px-3 text-[10px] font-black text-primary uppercase tracking-widest"
                  >
                    Innovations & Capabilities
                  </td>
                </tr>

                {featureFlags.map((flag) => {
                  const enabledList = flag.enabledForPlans.split(',');

                  return (
                    <tr key={flag.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-3 text-xs font-semibold text-gray-300 flex flex-col">
                        <span>{flag.description || flag.key.replace(/_/g, ' ')}</span>
                        <span className="text-[9px] text-gray-500 font-normal lowercase tracking-wide mt-0.5">
                          Key: {flag.key}
                        </span>
                      </td>
                      {plans.map((p) => {
                        const isEnabled = enabledList.includes(p.key) && flag.isEnabled;
                        return (
                          <td key={p.id} className="py-3.5 text-center">
                            <div className="flex justify-center">
                              {isEnabled ? (
                                <Check className="w-4 h-4 text-primary" />
                              ) : (
                                <X className="w-4 h-4 text-gray-600" />
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Feature Sync Guarantee Section */}
        <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
          <div className="inline-flex items-center gap-2 p-3.5 bg-white/5 rounded-2xl border border-white/10">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="text-[11px] text-gray-300 font-bold">
              100% Restriction Refund Guarantee: Built strictly on official Meta Graph APIs with
              rotating DM variants & viral surge pacing.
            </span>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
