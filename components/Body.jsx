import React from 'react';
import SideButtons from './SideButtons';

const Body = () => {
  return (
    <div className="relative">
      <img
        src="https://railmadad.indianrailways.gov.in/madad/final/images/body-bg.jpg"
        alt=""
        className="w-full h-screen object-cover hidden md:block"
      />
      <SideButtons />
    </div>
  );
};

export default Body;
