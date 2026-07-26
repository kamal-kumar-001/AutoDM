'use client';

import * as React from 'react';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, HelpCircle, Loader2, ShieldCheck, Zap } from 'lucide-react';
import { apiRequest, API_BASE_URL } from '@/lib/api-client';
import { BillingPlan, PromoSettings, PricingPromoResponse } from '@/types';
import { DEFAULT_PRICING_DATA, COMPARISON_SPECIFICATIONS } from '@/lib/pricing-data';

export default function PricingPage() {
  const [data, setData] = React.useState<PricingPromoResponse>(DEFAULT_PRICING_DATA);
  const [isAnnual, setIsAnnual] = React.useState(false);

  React.useEffect(() => {
    fetch(`${API_BASE_URL}/pricing-promo`)
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

  // Helper to calculate discounted price
  const calculatePrice = (plan: BillingPlan, annual: boolean) => {
    const basePrice = annual ? plan.priceYearly / 12 : plan.priceMonthly;
    if (plan.key === 'FREE') return 0;
    if (plan.key === 'ENTERPRISE') return null;

    if (promo.enabled && promo.discountPercent > 0) {
      return Math.round(basePrice * (1 - promo.discountPercent / 100));
    }
    return basePrice;
  };

  const getOriginalPrice = (plan: BillingPlan, annual: boolean) => {
    return annual ? plan.priceYearly / 12 : plan.priceMonthly;
  };

  return (
    <div className="bg-[#030712] min-h-screen text-white antialiased selection:bg-primary/30 selection:text-white overflow-x-hidden">
      {/* Promo Banner */}
      {false && promo.enabled && promo.text && (
        <div className="bg-gradient-to-r from-primary/20 via-primary/30 to-accent-cyan/15 border-b border-primary/10 text-center py-2.5 px-4 text-[10px] font-black text-white flex items-center justify-center space-x-2 relative z-50 uppercase tracking-widest animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0 animate-bounce" />
          <span>{promo.text}</span>
        </div>
      )}

      {/* Background Mesh Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-cyan/5 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-12 text-center max-w-4xl mx-auto px-6 space-y-4">
          <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-black tracking-widest text-primary uppercase inline-block">
            Pricing Plans
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Simple, Transparent Plans <br />
            Built to Scale Your Instagram
          </h1>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            Choose the plan that matches your creator size. Toggle between monthly and annual plans
            to claim additional discounts.
          </p>

          {/* Billing Switcher Toggle */}
          <div className="flex items-center justify-center gap-3 pt-6">
            <span
              className={`text-xs font-bold uppercase transition-colors ${!isAnnual ? 'text-white' : 'text-gray-500'}`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-white/10 transition-colors duration-200 ease-in-out focus:outline-none"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-primary shadow transition duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`text-xs font-bold uppercase transition-colors flex items-center gap-1.5 ${isAnnual ? 'text-primary' : 'text-gray-500'}`}
            >
              Annually
              <span className="text-[9px] bg-primary/15 border border-primary/25 text-primary px-1.5 py-0.5 rounded font-black">
                SAVE 20%
              </span>
            </span>
          </div>
        </section>

        {/* Pricing Cards Grid */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-6 pb-6 md:grid md:grid-cols-3 md:gap-8 md:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {plans.map((plan) => {
              const discountedPrice = calculatePrice(plan, isAnnual);
              const originalPrice = getOriginalPrice(plan, isAnnual);
              const isPopular = plan.key === 'PRO';

              return (
                <div
                  key={plan.id}
                  className={`glass-card border-gradient rounded-2xl p-6 shadow-glass relative flex flex-col justify-between overflow-hidden transition-all duration-300 hover:translate-y-[-4px] snap-align-center min-w-[85vw] sm:min-w-[320px] flex-shrink-0 md:min-w-0 md:flex-shrink ${
                    isPopular ? 'border-primary/30 shadow-[0_0_30px_rgba(0,187,136,0.1)]' : ''
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-4 right-4 bg-primary text-black text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest shadow-md">
                      POPULAR
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-extrabold text-white capitalize">{plan.name}</h3>
                      <p className="text-[11px] text-gray-500 mt-1">{plan.description}</p>
                    </div>

                    {/* Price display */}
                    <div className="flex items-baseline space-x-2">
                      {plan.key === 'ENTERPRISE' ? (
                        <span className="text-3xl font-black text-white">Custom</span>
                      ) : (
                        <>
                          <span className="text-3xl font-black text-white">
                            ₹{(discountedPrice ?? originalPrice).toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500 font-bold">/ month</span>
                          {discountedPrice !== originalPrice && (
                            <span className="text-xs text-red-400 line-through">
                              ₹{originalPrice.toLocaleString()}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <div className="border-t border-white/5 pt-4 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-xs text-gray-300">
                          {plan.key === 'FREE'
                            ? '1 Instagram Account'
                            : plan.key === 'PRO'
                              ? '3 Instagram Accounts'
                              : 'Unlimited Instagram Accounts'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-xs text-gray-300">
                          {plan.key === 'ENTERPRISE'
                            ? 'Unlimited Active Campaigns'
                            : `${plan.campaignLimit} Active Campaigns`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-xs text-gray-300">
                          {plan.key === 'ENTERPRISE'
                            ? 'Unlimited Automated DMs'
                            : `${plan.dmLimitMonthly.toLocaleString()} DMs / month`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-xs text-gray-300">
                          {plan.key === 'FREE'
                            ? '2 Campaign Options (Comment, Keyword)'
                            : 'All 5 Campaign Options Enabled'}
                        </span>
                      </div>
                      {plan.key !== 'FREE' && (
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-xs text-gray-300">
                            {plan.key === 'PRO'
                              ? 'Follow Gate & Webhook Log pausing'
                              : 'API Access, Webhooks & Custom Flows'}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-xs text-gray-300">
                          {plan.key === 'FREE'
                            ? 'Standard Support'
                            : plan.key === 'PRO'
                              ? 'Priority Support'
                              : '24/7 Dedicated Support'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4">
                    <Link
                      href={
                        plan.key === 'ENTERPRISE'
                          ? '/contact'
                          : `/checkout?plan=${plan.key}&cycle=${isAnnual ? 'yearly' : 'monthly'}`
                      }
                      className={`block w-full py-3 rounded-xl font-black uppercase text-center text-xs tracking-wider transition-all border ${
                        isPopular
                          ? 'bg-gradient-to-r from-primary to-accent-cyan text-white border-transparent shadow-[0_0_15px_rgba(0,187,136,0.25)] hover:shadow-[0_0_20px_rgba(0,187,136,0.4)]'
                          : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {plan.key === 'FREE'
                        ? 'Get Started'
                        : plan.key === 'ENTERPRISE'
                          ? 'Contact Sales'
                          : 'Upgrade Now'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Feature Comparison Matrix Section */}
        <section className="max-w-7xl mx-auto px-6 py-16 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
              Plan Comparison
            </h2>
            <p className="text-xs text-gray-500">
              Every feature analyzed side-by-side. Dynamic synced states.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 shadow-glass overflow-x-auto scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                {/* Limits Category Header */}
                <tr className="bg-white/[0.01]">
                  <td
                    colSpan={4}
                    className="py-2.5 px-3 text-[10px] font-black text-primary uppercase tracking-widest"
                  >
                    Limits & Volumes
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-3 text-xs font-semibold text-gray-300">
                    Instagram Accounts Connected
                  </td>
                  {plans.map((p) => (
                    <td
                      key={p.id}
                      className={`py-3.5 text-center text-xs font-bold ${p.key === 'ENTERPRISE' ? 'text-primary' : 'text-gray-400'}`}
                    >
                      {COMPARISON_SPECIFICATIONS.accounts[
                        p.key as keyof typeof COMPARISON_SPECIFICATIONS.accounts
                      ] || `${p.key} Accounts`}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-3 text-xs font-semibold text-gray-300">
                    Active Automations Limit
                  </td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-3.5 text-center text-xs text-gray-400 font-bold">
                      {p.key === 'ENTERPRISE' ? 'Unlimited' : `${p.campaignLimit} Campaigns`}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-3 text-xs font-semibold text-gray-300">
                    Keyword Triggers Allowed
                  </td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-3.5 text-center text-xs text-gray-400 font-bold">
                      {p.key === 'ENTERPRISE' ? 'Unlimited' : `${p.keywordLimit} Keywords`}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-3 text-xs font-semibold text-gray-300">
                    Monthly DM Volume
                  </td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-3.5 text-center text-xs text-gray-400 font-bold">
                      {p.key === 'ENTERPRISE'
                        ? 'Unlimited'
                        : `${p.dmLimitMonthly.toLocaleString()} DMs`}
                    </td>
                  ))}
                </tr>

                {/* Capabilities Category Header */}
                <tr className="bg-white/[0.01]">
                  <td
                    colSpan={4}
                    className="py-2.5 px-3 text-[10px] font-black text-primary uppercase tracking-widest"
                  >
                    Automation Capabilities
                  </td>
                </tr>

                {/* Dynamically Synced Feature Flags Rows */}
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
          <div className="inline-flex items-center gap-2 p-3 bg-white/5 rounded-2xl border border-white/5">
            <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              Verification Lock: Features synced directly from active Meta Graph endpoints &
              database controls.
            </span>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
