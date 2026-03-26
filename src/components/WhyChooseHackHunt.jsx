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
      'Discover better hackathons faster with a cleaner, higher-signal experience built for serious participants.',
    accent: 'from-cyan-400 via-blue-500 to-indigo-600'
  },
  {
    icon: RefreshCw,
    title: 'Real-Time Updates',
    description:
      'Track approval changes, fresh openings, and platform activity without jumping across multiple tools.',
    accent: 'from-violet-400 via-purple-500 to-fuchsia-500'
  },
  {
    icon: SlidersHorizontal,
    title: 'Smarter Filtering',
    description:
      'Users can focus on relevant events while organizers and admins keep the system clean behind the scenes.',
    accent: 'from-emerald-400 via-teal-500 to-cyan-600'
  },
  {
    icon: Compass,
    title: 'Seamless Workflow',
    description:
      'Move from discovery to submission with role-based dashboards designed to reduce clutter and keep momentum high.',
    accent: 'from-orange-400 via-pink-500 to-rose-500'
  }
];

const FeatureCard = ({ feature, index }) => {
  const Icon = feature.icon;

  return (
    <article
      className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-7 shadow-[0_18px_55px_rgba(2,6,23,0.28)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_28px_80px_rgba(76,29,149,0.22)]"
      style={{
        animation: `feature-fade-up 0.6s ease-out ${index * 0.08}s both`
      }}
    >
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-white/10 blur-3xl transition duration-300 group-hover:scale-125" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))]" />
      <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${feature.accent} opacity-80`} />

      <div className="relative">
        <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.accent} text-white shadow-lg shadow-slate-950/40 ring-1 ring-white/10`}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold tracking-tight text-white">
            {feature.title}
          </h3>
        </div>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          {feature.description}
        </p>
      </div>
    </article>
  );
};

const WhyChooseHackHunt = () => {
  return (
    <section id="community" className="relative overflow-hidden border-y border-white/8 bg-[#120f22] py-16 sm:py-20">
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_28%),linear-gradient(180deg,#120f22_0%,#0f1020_48%,#120f22_100%)]" />
        <div className="absolute left-12 top-16 h-36 w-36 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute right-16 top-20 h-40 w-40 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:88px_88px] opacity-30" />
        <div className="absolute inset-x-0 top-28 mx-auto h-px w-[min(70rem,90vw)] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-screen-xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-[-0.04em] text-white sm:text-5xl">
            Find better hackathons
            <span className="mt-1 block bg-gradient-to-r from-violet-400 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
              with less noise
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            A cleaner way to discover relevant hackathons, track real updates, and focus on opportunities worth your time.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
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
