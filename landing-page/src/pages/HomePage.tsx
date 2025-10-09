import React from 'react';
import HeroScanner from '../components/HeroScanner';
import AppShowcase from '../components/AppShowcase';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';

const HomePage: React.FC = () => {
  return (
    <>
      <HeroScanner />
      <AppShowcase />
      <Testimonials />
      <Pricing />
    </>
  );
};

export default HomePage;
