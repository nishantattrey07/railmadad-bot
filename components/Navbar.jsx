'use client';
import { Phone } from 'lucide-react';
import useLanguageStore from '../lib/Stores/LanguageStore'; // Import the Zustand store
import { multiLang } from '@/lib/constants';
const Navbar = () => {
  const { language, setLanguage } = useLanguageStore(); // Access language and setLanguage from the store

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value); // Update the global language state
  };

  return (
    <div className="flex items-center justify-between px-6 pt-4 md:pt-0 h-16 md:h-auto">
      <div className="hidden md:flex items-center">
        <img src="/emblem.png" alt="Emblem" className="w-14 h-20" />
        <img src="/logo.png" alt="Logo" className="w-24" />
        <img
          src="/G20_India_2023_logo.svg.png"
          alt="G20 Logo"
          className="w-20 h-14"
        />
      </div>
      <div>
        <a href="/">
          <h1 className="text-[#75002b] text-2xl md:text-5xl font-bold">
            {multiLang[language].NavbarTitle}
          </h1>
        </a>
        <p className="text-gray-500 hidden md:block">
          {multiLang[language].NavbarSubTitle}
        </p>
      </div>
      <div className="flex items-center gap-5">
        <div className="cursor-pointer flex items-center gap-1 bg-orange-500  md:text-3xl text-white font-bold px-2 md:px-4 py-1 md:py-2 rounded-lg">
          <Phone />
          <a href="tel:139">139</a>
        </div>
        <p className="text-base hidden md:block">
          {multiLang[language].NavbarSubTitle2}
        </p>
      </div>
      <div className=" gap-3 hidden md:flex">
        <button className="bg-[#dcdef9] px-8 py-2 rounded-lg ">
          {multiLang[language].NavbarFAQ}
        </button>
        <a href="/search">
          <button className="bg-[#efe4e8] px-6 py-2 rounded-lg">
            {multiLang[language].NavbarSearch}
          </button>
        </a>
      </div>
      <div>
        <select
          name="language"
          id="language"
          value={language} // Bind the select value to the global language state
          onChange={handleLanguageChange} // Update the global state on change
          className="border-[1px] border-gray-300 rounded-lg px-2 py-1"
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="tm">தமிழ்</option>
        </select>
      </div>
    </div>
  );
};

export default Navbar;
