
import React from 'react';
import { BenefitItem } from './BenefitItem';

interface SubscriptionCardProps {
  tier: 'free' | 'pro' | 'ultimate';
  price: string;
  title: string;
  description: string;
  benefits: string[];
  buttonText: string;
  onSubscribe: () => void;
  isDark: boolean;
  isPopular?: boolean;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  tier,
  price,
  title,
  description,
  benefits,
  buttonText,
  onSubscribe,
  isDark,
  isPopular = false
}) => {
  const cardBg = isDark ? 'bg-zinc-900/80' : 'bg-zinc-50';
  const activeText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const mutedText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const buttonStyle = isDark ? 'bg-zinc-100 text-zinc-950 hover:bg-white' : 'bg-zinc-900 text-zinc-50 hover:bg-black';

  const isUltimate = tier === 'ultimate';
  const cardBorder = isUltimate ? 'border-2 border-current' : isPopular ? 'border border-current/20' : 'border border-current/10';
  const cardShadow = isUltimate ? 'shadow-2xl' : isPopular ? 'shadow-2xl' : 'shadow-lg';
  const cardBgOverride = isUltimate ? (isDark ? 'bg-zinc-800' : 'bg-white') : cardBg;

  return (
    <div className={`p-8 rounded-[2.5rem] ${cardBorder} ${cardBgOverride} flex flex-col relative ${cardShadow} ${isPopular ? 'overflow-hidden' : ''}`}>
      {isPopular && (
        <div className="absolute top-6 right-6">
          <span className={`${isDark ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-900 text-zinc-100'} px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest`}>
            POPULER
          </span>
        </div>
      )}
      
      <div className="mb-6">
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${mutedText}`}>{price}</span>
        <h3 className={`text-xl font-black uppercase mt-1 ${activeText}`}>{title}</h3>
      </div>
      
      <p className={`text-xs font-medium leading-relaxed mb-8 flex-1 ${mutedText}`}>
        {description}
      </p>
      
      <div className="space-y-4 mb-10">
        {benefits.map((benefit, index) => (
          <BenefitItem key={index} text={benefit} />
        ))}
      </div>
      
      <button 
        className={`w-full py-4 ${buttonStyle} rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 ${isUltimate ? 'shadow-xl shadow-current/20' : isPopular ? 'shadow-lg shadow-current/10' : ''}`}
        onClick={onSubscribe}
      >
        {buttonText}
      </button>
    </div>
  );
};
