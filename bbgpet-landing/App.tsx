import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Press from './components/Press';
import Stats from './components/Stats';
import Features from './components/Features';
import Integrations from './components/Integrations';
import Workflow from './components/Workflow';
import Modules from './components/Modules';
import ScreenGallery from './components/ScreenGallery';
import MobileApp from './components/MobileApp';
import DownloadCRM from './components/DownloadCRM';
import Comparison from './components/Comparison';
import OnboardingSteps from './components/OnboardingSteps';
import ProfitCalculator from './components/ProfitCalculator';
import CaseStudies from './components/CaseStudies';
import Security from './components/Security';
import Pricing from './components/Pricing';
import Courses from './components/Courses';
import Roadmap from './components/Roadmap';
import SupportHub from './components/SupportHub';
import Testimonials from './components/Testimonials';
import BlogPreview from './components/BlogPreview';
import LeadGen from './components/LeadGen';
import FAQ from './components/FAQ';
import CTA from './components/CTA';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import BackToTop from './components/BackToTop';
import WhatsAppButton from './components/WhatsAppButton';
import ExitIntent from './components/ExitIntent';
import AdminPanel from './components/AdminPanel';
import Success from './components/Success';
import InteractiveCursor from './components/InteractiveCursor';
import { UserProfile } from './components/UserProfile';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [lpConfig, setLpConfig] = useState<any>(null);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  useEffect(() => {
    fetchLPConfig();

    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const fetchLPConfig = async () => {
    setIsConfigLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('data')
        .eq('id', 'landing_page')
        .single();

      if (data?.data) {
        setLpConfig(data.data);

        // Apply primary color globally via CSS variables
        if (data.data.style?.primaryColor) {
          const color = data.data.style.primaryColor;
          document.documentElement.style.setProperty('--primary', color);
          document.documentElement.style.setProperty('--primary-dark', color); // Fallback to same color
          document.documentElement.style.setProperty('--primary-light', color); // Fallback to same color
        }

        // Handle Dark Mode priority if set in config
        if (data.data.style?.darkMode !== undefined) {
          const shouldBeDark = data.data.style.darkMode;
          setIsDarkMode(shouldBeDark);
          if (shouldBeDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
          } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
          }
        }
      }
    } catch (err) {
      console.error('Error fetching LP config:', err);
    } finally {
      setIsConfigLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Simple Router check
  if (window.location.pathname === '/sucesso') {
    return (
      <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
        <Success />
      </div>
    );
  }

  if (isConfigLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <InteractiveCursor />
      <Header
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />
      {isProfileOpen && <UserProfile onClose={() => setIsProfileOpen(false)} />}
      <main>
        <Hero data={lpConfig?.hero} />
        <Press />
        <Stats />
        <Features data={lpConfig?.benefits} />
        <ScreenGallery />
        <Integrations />
        <Workflow />
        <Modules />
        <MobileApp />
        <DownloadCRM />
        <Comparison />
        <CaseStudies />
        <OnboardingSteps />
        <ProfitCalculator />
        <Security />
        <SupportHub />
        <Pricing />
        <Courses />
        <Roadmap />
        <Testimonials data={lpConfig?.testimonials} />
        <BlogPreview />
        <LeadGen />
        <FAQ />
        <CTA data={lpConfig?.ctaFooter} />
      </main>
      <Footer />
      <CookieBanner />
      <BackToTop />
      <WhatsAppButton />
      <ExitIntent />
      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
};

export default App;