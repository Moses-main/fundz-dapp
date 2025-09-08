import React from 'react';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <Hero />
        <Features />
        {/* We can add more sections here later */}
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
