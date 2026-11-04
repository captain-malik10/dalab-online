import React from 'react';
import lines from '../assets/images/lines.png';
import lines_2 from '../assets/images/lines-2.png';
import bag from '../assets/images/bag.png';
import kids from '../assets/images/kid.png';
import women from '../assets/images/woman.png';

function HeroGrid() {
  return (
    <div className="grid grid-cols-3 grid-rows-2 gap-6 h-[450px]">
      <div className="relative row-span-2 overflow-hidden col-span-2 bg-[var(--color-primary)] p-8 flex flex-col justify-between text-white">
        <p className="text-6xl font-bold w-11/12 mt-10">
          For a great start to the school year, it's better to be well-equipped!
        </p>
        <div className="absolute bottom-0 translate-y-20 translate-x-4 z-10 justify-end flex w-full">
          <img src={bag} alt="bag" className="w-72" />
        </div>
        <img src={lines} alt="lines" className="w-full h-full absolute top-0 left-0 opacity-10" />
      </div>
      <div className="relative overflow-hidden col-span-1 bg-[var(--color-accent)] p-8 flex flex-col justify-between items-start text-white">
        <p className="text-2xl font-bold">The best for your kids, from toys to clothing.</p>
        <img src={lines} alt="lines" className="w-full h-full absolute top-0 left-0 opacity-10" />
        <div className="absolute bottom-0 translate-y-28 z-10 justify-end flex w-full">
          <img src={kids} alt="kids" className="w-72" />
        </div>
      </div>

      <div className="relative col-span-1 bg-[var(--color-secondary)] p-8 flex overflow-hidden flex-col items-start text-white">
        <p className="text-2xl font-bold w-11/12">Discover the latest trends in women's fashion.</p>
        <img src={lines_2} alt="lines" className="w-full h-full absolute top-0 left-0 opacity-10" />
        <div className="absolute bottom-0 z-10 justify-end flex w-full">
          <img src={women} alt="woman" className="w-36" />
        </div>
      </div>
    </div>
  );
}

export default HeroGrid;
