// ============================================================================
// IRONFORGE - Public Landing Page
// Premium hero design inspired by modern athletic centers: Space Grotesk
// headings, Figtree body prose, subtle diagonal gold ribbon accent, live
// count-up stats from gymService, interactive feature bento, and footer CTA.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Dumbbell,
  Users,
  CreditCard,
  Sparkles,
  FileText,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Flame,
  CheckCircle,
} from 'lucide-react';
import { GYM_CONFIG } from '../config/gymConfig';
import { gymService } from '../services/gymService';
import { CountUp } from '../components/common/CountUp';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import heroGymImage from '../assets/images/hero_ironforge_gym_1790260101142.jpg';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { reduceMotion } = useTheme();

  const [memberCount, setMemberCount] = useState<number>(0);
  const [plansCount, setPlansCount] = useState<number>(0);
  const [statsLoaded, setStatsLoaded] = useState<boolean>(false);
  const [scrollY, setScrollY] = useState<number>(0);

  // Fetch live stats from gymService
  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      try {
        const [members, plans] = await Promise.all([
          gymService.getMembers(),
          gymService.getSavedPlans(),
        ]);
        if (isMounted) {
          setMemberCount(members.length);
          setPlansCount(plans.length);
          setStatsLoaded(true);
        }
      } catch (err) {
        if (isMounted) {
          setMemberCount(0);
          setPlansCount(0);
          setStatsLoaded(true);
        }
      }
    }
    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  // Parallax scroll listener for subtle background ribbon/graphic offset
  useEffect(() => {
    if (reduceMotion) return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [reduceMotion]);

  // Smooth scroll handler for "See How It Works"
  const handleScrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Parallax transform style: clamped subtle shift
  const parallaxOffset = reduceMotion ? 0 : Math.min(scrollY * 0.18, 90);
  const accentOffset = reduceMotion ? 0 : -Math.min(scrollY * 0.12, 60);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.12,
        delayChildren: reduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0.2 : 0.5, ease: 'easeOut' as const },
    },
  };

  const featureCards = [
    {
      icon: Users,
      title: 'Member Records',
      description:
        'Complete athlete roster with biometrics, emergency contacts, registration history, and lightning-fast search.',
      tag: 'Athletes',
    },
    {
      icon: CreditCard,
      title: 'Fee Tracking',
      description:
        'Automated billing cycles, overdue debt detection, and instant PKR cash reconciliation with receipt numbers.',
      tag: 'Ledger',
    },
    {
      icon: Sparkles,
      title: 'Personalized AI Plans',
      description:
        'Bespoke workout regimens and macro targets engineered for Cutting, Bulking, and Standard athletic conditioning.',
      tag: 'Programming',
    },
    {
      icon: FileText,
      title: 'Printable Receipts',
      description:
        'Official receipts and structured training schedules formatted for immediate physical printing or digital sharing.',
      tag: 'Accounting',
    },
  ];

  return (
    <div className="min-h-screen bg-bg text-txt font-sans selection:bg-gold-primary selection:text-black overflow-x-hidden relative flex flex-col">
      {/* ---------------------------------------------------------------------- */}
      {/* 1. Header (Sticky Top Bar Contract)                                    */}
      {/* ---------------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-bg/85 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Zone 1: Single text element wordmark with icon */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-primary text-black flex items-center justify-center font-black shadow-md shadow-gold-primary/20 shrink-0">
              <Dumbbell className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-space font-bold text-xl md:text-2xl tracking-tight text-txt">
              {GYM_CONFIG.name}
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-txt-muted">
            <a
              href="#features"
              onClick={handleScrollToFeatures}
              className="hover:text-txt transition-colors cursor-pointer"
            >
              Capabilities
            </a>
            <a
              href="#stats"
              className="hover:text-txt transition-colors cursor-pointer"
            >
              Registry Proof
            </a>
            <a
              href="#contact"
              className="hover:text-txt transition-colors cursor-pointer"
            >
              Location & Contact
            </a>
          </nav>

          {/* Zone 3: Actions (Theme Toggle & Admin Login) */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              className="px-4.5 py-2.5 rounded-xl bg-gold-primary text-black font-semibold text-xs md:text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-gold-primary/20 shrink-0 cursor-pointer flex items-center gap-2 whitespace-nowrap"
            >
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Admin Login'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------------- */}
      {/* 2. Hero Section with Diagonal Gold Ribbon & Live Stats                 */}
      {/* ---------------------------------------------------------------------- */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Subtle diagonal gold gradient / ribbon behind hero content */}
        <div
          style={{ transform: `translateY(${accentOffset}px) rotate(-7deg)` }}
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-[540px] md:w-[760px] h-[520px] rounded-[64px] bg-gradient-to-tr from-gold-primary/18 via-gold-primary/5 to-transparent border-t border-r border-gold-primary/25 blur-[1px] opacity-75 dark:opacity-90"
        />

        {/* Ambient radial glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gold-primary/8 blur-[120px] rounded-full"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headlines & CTAs */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Eyebrow Tag */}
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-surface border border-gold-primary/30 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-gold-primary animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-txt font-sans">
                  BUILT FOR SERIOUS TRAINING
                </span>
              </motion.div>

              {/* Large Two-Line Headline in Space Grotesk */}
              <motion.h1
                variants={itemVariants}
                className="font-space text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-txt leading-[1.08] text-balance"
              >
                Precision Gym Management.
                <span className="block text-gold-primary mt-1">Forged for Discipline.</span>
              </motion.h1>

              {/* One-Line Supporting Description in Figtree */}
              <motion.p
                variants={itemVariants}
                className="text-base sm:text-lg text-txt-muted max-w-xl leading-relaxed"
              >
                The administrative command center for member registries, automated fee reconciliation, and intelligent workout programming.
              </motion.p>

              {/* Two CTA Buttons */}
              <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                  className="px-6 py-3.5 rounded-xl bg-gold-primary text-black font-semibold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-gold-primary/25 cursor-pointer flex items-center gap-2.5"
                >
                  <span>{isAuthenticated ? 'Open Dashboard' : 'Get Started'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                <a
                  href="#features"
                  onClick={handleScrollToFeatures}
                  className="px-6 py-3.5 rounded-xl bg-surface border border-border hover:border-gold-primary/50 hover:bg-surface-2 text-txt font-semibold text-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>See How It Works</span>
                  <ChevronDown className="w-4 h-4 text-gold-primary" />
                </a>
              </motion.div>

              {/* Trust Subtext */}
              <motion.div variants={itemVariants} className="flex items-center gap-2 text-xs text-txt-muted pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Encrypted local admin database · Zero third-party telemetry</span>
              </motion.div>
            </motion.div>

            {/* Right Column: Hero Visual Graphic with Diagonal Accent Framing */}
            <motion.div
              initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' as const }}
              style={{ transform: `translateY(${parallaxOffset}px)` }}
              className="lg:col-span-5 relative"
            >
              {/* Gold Framing Accent */}
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Diagonal background accent ribbon */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-1.5 bg-gradient-to-tr from-gold-primary/30 to-gold-primary/0 rounded-3xl -rotate-2 blur-xs opacity-70"
                />

                <div className="relative rounded-2xl overflow-hidden border border-border bg-surface shadow-2xl">
                  {/* Hero Graphic Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
                    <img
                      src={heroGymImage}
                      alt="Ironforge Gym Training Facility"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center transform hover:scale-102 transition-transform duration-700"
                      onError={(e) => {
                        // Resilient fallback container if image fails
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {/* Gradient scrim overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-85" />

                    {/* Badge chip over image */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs bg-bg/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-border/80">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-gold-primary" />
                        <span className="font-space font-semibold text-txt text-xs">
                          {GYM_CONFIG.tagline}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-gold-primary">
                        PKR {GYM_CONFIG.defaultMonthlyFee}/mo
                      </span>
                    </div>
                  </div>

                  {/* Micro dashboard card preview snippet */}
                  <div className="p-4 bg-surface/90 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-txt">Dues Engine</p>
                        <p className="text-[11px] text-txt-muted">Automated 1-month rolls</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-surface-2 border border-border text-[11px] font-semibold text-txt-muted">
                      Admin-Only
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* Stats Row of 3 Numbers Pulled Live from gymService                 */}
          {/* ------------------------------------------------------------------ */}
          <div id="stats" className="mt-16 md:mt-24 pt-8 border-t border-border/80">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stat 1: Total Members */}
              <div className="p-6 rounded-2xl bg-surface border border-border hover:border-gold-primary/40 transition-colors group">
                <div className="flex items-center justify-between text-txt-muted mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Athletes</span>
                  <div className="w-8 h-8 rounded-lg bg-surface-2 group-hover:bg-gold-primary/10 text-txt-muted group-hover:text-gold-primary flex items-center justify-center transition-colors">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-space text-4xl md:text-5xl font-bold text-txt">
                  {!statsLoaded ? (
                    '0'
                  ) : (
                    <CountUp end={memberCount} suffix={memberCount > 0 ? '' : ''} />
                  )}
                </div>
                <p className="text-xs text-txt-muted mt-2">
                  {memberCount > 0 ? 'Enrolled in active gym registry' : 'Fresh registry ready for intake'}
                </p>
              </div>

              {/* Stat 2: Plans Generated */}
              <div className="p-6 rounded-2xl bg-surface border border-border hover:border-gold-primary/40 transition-colors group">
                <div className="flex items-center justify-between text-txt-muted mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">AI Plans Generated</span>
                  <div className="w-8 h-8 rounded-lg bg-surface-2 group-hover:bg-gold-primary/10 text-txt-muted group-hover:text-gold-primary flex items-center justify-center transition-colors">
                    <Sparkles className="w-4 h-4 text-gold-primary" />
                  </div>
                </div>
                <div className="font-space text-4xl md:text-5xl font-bold text-gold-primary">
                  {!statsLoaded ? (
                    '0'
                  ) : (
                    <CountUp end={plansCount} suffix={plansCount > 0 ? '' : ''} />
                  )}
                </div>
                <p className="text-xs text-txt-muted mt-2">
                  {plansCount > 0 ? 'Custom workout & diet routines' : 'Zero manual guesswork required'}
                </p>
              </div>

              {/* Stat 3: Programs & Disciplines */}
              <div className="p-6 rounded-2xl bg-surface border border-border hover:border-gold-primary/40 transition-colors group">
                <div className="flex items-center justify-between text-txt-muted mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Core Programs</span>
                  <div className="w-8 h-8 rounded-lg bg-surface-2 group-hover:bg-gold-primary/10 text-txt-muted group-hover:text-gold-primary flex items-center justify-center transition-colors">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-space text-4xl md:text-5xl font-bold text-txt">
                  <CountUp end={3} suffix="" />
                </div>
                <p className="text-xs text-txt-muted mt-2">
                  Regular Access · Cutting · Bulking
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 3. Features Section (Scroll Reveal & Staggered Cards)                  */}
      {/* ---------------------------------------------------------------------- */}
      <section id="features" className="py-20 md:py-28 bg-surface-2/40 border-y border-border relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-primary">
              FACILITY PLATFORM
            </span>
            <h2 className="font-space text-3xl sm:text-4xl font-bold text-txt mt-2 tracking-tight">
              Engineered for seamless gym operations.
            </h2>
            <p className="text-sm sm:text-base text-txt-muted mt-3">
              Eliminate loose paperwork, missed fee payments, and unstructured routines with an integrated system built specifically for strength centers.
            </p>
          </div>

          {/* Staggered Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureCards.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{
                    duration: 0.45,
                    delay: reduceMotion ? 0 : index * 0.1,
                    ease: 'easeOut' as const,
                  }}
                  className="p-6 rounded-2xl bg-surface border border-border hover:border-gold-primary/50 transition-all flex flex-col justify-between group shadow-sm"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-gold-primary/10 text-gold-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-txt-muted">
                        {feat.tag}
                      </span>
                      <h3 className="font-space font-bold text-lg text-txt">
                        {feat.title}
                      </h3>
                      <p className="text-xs text-txt-muted leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border/70 mt-6 flex items-center justify-between text-xs text-txt-muted">
                    <span className="font-mono text-[11px]">0{index + 1}</span>
                    <span className="text-gold-primary font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Ready <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 4. CTA Footer Band & Contact Info from gymConfig                       */}
      {/* ---------------------------------------------------------------------- */}
      <footer id="contact" className="mt-auto bg-surface border-t border-border pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Action Band */}
          <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-r from-surface-2 via-surface to-surface-2 border border-gold-primary/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="font-space text-2xl md:text-3xl font-bold text-txt">
                Ready to manage your facility?
              </h3>
              <p className="text-xs md:text-sm text-txt-muted max-w-lg">
                Authenticate with your gym administrator credentials to access athlete records, reconcile dues, or craft new workout programs.
              </p>
            </div>

            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              className="px-6 py-3.5 rounded-xl bg-gold-primary text-black font-semibold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-gold-primary/25 shrink-0 cursor-pointer flex items-center gap-2"
            >
              <span>{isAuthenticated ? 'Enter Dashboard' : 'Admin Login'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Contact Details & Metadata from gymConfig.ts */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-4 text-xs text-txt-muted">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-txt">
                <div className="w-7 h-7 rounded-lg bg-gold-primary text-black flex items-center justify-center font-bold">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <span className="font-space font-bold text-base tracking-tight">
                  {GYM_CONFIG.name}
                </span>
              </div>
              <p className="text-txt-muted leading-relaxed">
                {GYM_CONFIG.tagline}. High-standard strength culture and disciplined athlete development.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-space font-semibold text-txt text-sm block">Contact</span>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gold-primary" />
                <span>{GYM_CONFIG.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gold-primary" />
                <span>{GYM_CONFIG.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-space font-semibold text-txt text-sm block">Location</span>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-gold-primary shrink-0 mt-0.5" />
                <span className="leading-relaxed">{GYM_CONFIG.address}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-space font-semibold text-txt text-sm block">Fee Structure</span>
              <p className="leading-relaxed">
                Standard Monthly Tier: <strong className="text-txt font-mono">{GYM_CONFIG.currency.symbol} {GYM_CONFIG.defaultMonthlyFee}</strong>
              </p>
              <p className="text-[11px] text-txt-muted">
                Admin credentials configured in gymConfig.ts
              </p>
            </div>
          </div>

          {/* Copyright Bar */}
          <div className="border-t border-border/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-txt-muted">
            <p>© {new Date().getFullYear()} {GYM_CONFIG.name}. All rights reserved.</p>
            <p className="font-mono">Security: Local Admin Console • {GYM_CONFIG.currency.code}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
