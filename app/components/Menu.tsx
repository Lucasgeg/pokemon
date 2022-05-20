import Logout from "./Logout";
import MyPokedexButton from "./MyPokedexButton";
import PokeballButton from "../assets/pokeballButton.png";
import React, { useState } from "react";
import clsx from "clsx";

type Menu = {
  userName: string | null | undefined;
};

export const Menu = ({ userName }: Menu) => {
  const [toggleOn, setToggleOn] = useState(false);

  const handleClickPokeballButton = (e: React.MouseEvent<HTMLElement>) => {
    setToggleOn(!toggleOn);
    console.log(toggleOn);
  };
  return (
    <nav className="fixed top-1/4 lg:absolute lg:w-full lg:top-0 z-10 lg:flex  ">
      <img
        src={PokeballButton}
        alt="Bouton pokeball"
        className="w-10 mb-2 cursor-pointer lg:hidden"
        onClick={handleClickPokeballButton}
      />
      <div
        className={clsx(` menuLinks w-36  h-fit flex flex-col justify-center  items-center  bg-orange-200 bg-opacity-75 p-3 rounded-r-lg border-y-4 border-r-4 border-red-600 ease-in-out duration-300
        ${toggleOn ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:bg-transparent lg:border-0 lg:flex-row lg:justify-between lg:w-full lg:items-center
        `)}
      >
        <Logout userName={userName} />
        <MyPokedexButton />
      </div>
    </nav>
  );
};
