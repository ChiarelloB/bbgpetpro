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

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
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
        <Hero />
        <Press />
        <Stats />
        <Features />
        <ScreenGallery />
        <Integrations />
        <Workflow />
        <Modules />
        <MobileApp />
        <Comparison />
        <CaseStudies />
        <OnboardingSteps />
        <ProfitCalculator />
        <Security />
        <SupportHub />
        <Pricing />
        <Courses />
        <Roadmap />
        <Testimonials />
        <BlogPreview />
        <LeadGen />
        <FAQ />
        <CTA />
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