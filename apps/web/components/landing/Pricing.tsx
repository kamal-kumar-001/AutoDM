'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Check, Sparkles } from 'lucide-react';
import { PRICING_CONTENT } from '@/lib/landing-data';

export default function Pricing() {
  const { data: session } = useSession();
  const router = useRouter();

  // State for billing cycle: true = annual (20% off), false = monthly
  const [isAnnual, setIsAnnual] = React.useState(false);

  // State for selected plan: 'Free' | 'Pro' | 'Enterprise'
  const [selectedPlan, setSelectedPlan] = React.useState<string>('Pro');

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);
  };

  const handleProceed = (planName: string) => {
    const billing = isAnnual ? 'annually' : 'monthly';
    const destination = `/checkout?plan=${planName}&billing=${billing}`;
    router.push(destination);
  };

  return (
    <section id="pricing" className="py-24 sm:py-32 relative bg-[#00BB88]/[0.01]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Simple, transparent <span className="text-primary">pricing</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            {PRICING_CONTENT.description}
          </p>

          {/* Monthly / Annually Interactive Toggle */}
          <div className="flex items-center justify-center gap-3 pt-6">
            <span
              className={`text-xs font-semibold ${!isAnnual ? 'text-white' : 'text-gray-500'} transition-colors`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-12 h-6 rounded-full bg-white/5 border border-white/10 transition-colors"
              aria-label="Toggle billing cycle"
            >
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-primary transition-transform duration-300 ${
                  isAnnual ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`text-xs font-semibold flex items-center gap-1.5 ${isAnnual ? 'text-white' : 'text-gray-500'} transition-colors`}
            >
              Annually
              <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase">
                20% OFF
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start max-w-6xl mx-auto">
          {PRICING_CONTENT.plans.map((plan) => {
            const isSelected = selectedPlan === plan.name;

            // Calculate dynamic price based on cycle
            let displayPrice = plan.price;
            if (plan.name === 'Pro') {
              displayPrice = isAnnual ? '₹799' : '₹999';
            }

            return (
              <div
                key={plan.name}
                onClick={() => handleSelectPlan(plan.name)}
                className={`glass-card rounded-3xl p-8 relative transition-all duration-300 border cursor-pointer ${
                  isSelected
                    ? 'border-primary/50 bg-[#0a0f1e]/40 shadow-[0_0_30px_rgba(0,187,136,0.1)] lg:scale-[1.03] lg:-translate-y-2 z-10'
                    : 'border-white/5 shadow-glass hover:border-white/10'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-[9px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(0,187,136,0.3)]">
                    Most Popular
                  </div>
                )}

                {/* Plan Metadata */}
                <div className="mb-8">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                      {plan.name}
                    </p>
                    {isSelected && (
                      <span className="text-[10px] text-primary font-black uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                      {displayPrice}
                    </span>
                    <span className="text-sm text-gray-500 font-medium">
                      {plan.name === 'Enterprise'
                        ? ''
                        : isAnnual
                          ? '/month (billed annually)'
                          : '/month'}
                    </span>
                  </div>
                </div>

                {/* Features Checklist */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3.5">
                      <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Action - Gradient with reduced glow */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProceed(plan.name);
                  }}
                  className={`w-full py-3.5 text-center rounded-2xl text-sm font-bold transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${
                    isSelected
                      ? 'bg-gradient-to-r from-primary to-accent-cyan text-white shadow-md hover:shadow-lg'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
                  }`}
                >
                  {plan.name === 'Enterprise'
                    ? 'Contact Sales'
                    : isSelected
                      ? 'Choose Plan & Continue'
                      : 'Select Plan'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
