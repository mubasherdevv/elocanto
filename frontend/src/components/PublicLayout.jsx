import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileNav from './MobileNav';
import SeoContentSection from './SeoContentSection';

export default function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen pb-[70px] sm:pb-0">
      <Navbar />
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
      <SeoContentSection />
      <Footer />
      <MobileNav />
    </div>
  );
}
