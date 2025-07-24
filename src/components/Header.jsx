import React from 'react';

function Header() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo/Title */}
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-extrabold text-blue-700 tracking-tight">Private Hotel</span>
        </div>
        {/* Navigation */}
        <nav className="hidden md:flex space-x-8 text-gray-700 font-medium">
          <a href="#" className="hover:text-blue-600 transition">Home</a>
          <a href="#rooms" className="hover:text-blue-600 transition">Rooms</a>
          <a href="#about" className="hover:text-blue-600 transition">About</a>
          <a href="#contact" className="hover:text-blue-600 transition">Contact</a>
        </nav>
        {/* Book Now Button */}
        <a
          href="#book"
          className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow transition"
        >
          Book Now
        </a>
      </div>
    </header>
  );
}

export default Header;