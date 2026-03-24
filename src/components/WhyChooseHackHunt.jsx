import React from 'react';
import {
  Compass,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal
} from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'Curated Discovery',
    description:
      'Discover curated hackathons faster with a cleaner, higher-signal feed built for serious builders.',
    accent: 'from-cyan-400 via-blue-500 to-indigo-600',
    surface: 'from-cyan-50 to-blue-50'
  },
  {
    icon: RefreshCw,
    title: 'Real-Time Updates',
    description:
      'Get deadline changes, fresh openings, and newly active events without checking multiple platforms.',
    accent: 'from-violet-400 via-purple-500 to-fuchsia-500',
    surface: 'from-violet-50 to-fuchsia-50'
  },
  {
    icon: SlidersHorizontal,
    title: 'Smarter Filtering',
    description:
      'Filter by domain, prize, and location to zero in on the right opportunities in just a few clicks.',
    accent: 'from-emerald-400 via-teal-500 to-cyan-600',
    surface: 'from-emerald-50 to-cyan-50'
  },
  {
    icon: Compass,
    title: 'Seamless Workflow',
    description:
      'Move from browsing to building with a smoother discovery flow designed to keep momentum high.',
    accent: 'from-orange-400 via-pink-500 to-rose-500',
    surface: 'from-orange-50 to-rose-50'
  }
];

const FeatureCard = ({ feature, index }) => {
  const Icon = feature.icon;

  return (
    <article
      className={`group relative overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-b ${feature.surface} p-7 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_28px_80px_rgba(59,130,246,0.14)]`}
      style={{
        animation: `feature-fade-up 0.6s ease-out ${index * 0.08}s both`
      }}
    >
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-white/70 blur-3xl transition duration-300 group-hover:scale-125" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.68),rgba(255,255,255,0.24))]" />
      <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${feature.accent} opacity-80`} />

      <div className="relative">
        <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.accent} text-white shadow-lg shadow-slate-300/40 ring-1 ring-white/50`}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold tracking-tight text-slate-900">
            {feature.title}
          </h3>
        </div>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          {feature.description}
        </p>
      </div>
    </article>
  );
};

const WhyChooseHackHunt = () => {
  return (
    <section className="relative overflow-hidden py-24 sm:py-28">
      <style jsx>{`
        @keyframes feature-fade-up {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/80 to-white" />
        <div className="absolute left-8 top-12 h-44 w-44 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute right-10 top-16 h-56 w-56 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-indigo-200/25 blur-3xl" />
        <div className="absolute inset-x-0 top-28 mx-auto h-px w-[min(72rem,92vw)] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl">
            Find better hackathons
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              with less noise
            </span>
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseHackHunt;
