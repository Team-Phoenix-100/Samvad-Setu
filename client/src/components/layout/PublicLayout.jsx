import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from '../Footer';

export default function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0F1B1E]">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
