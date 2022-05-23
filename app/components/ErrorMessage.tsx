import clsx from "clsx";
import { useState } from "react";
import pikachuError from "~/assets/pikachuError.png";

export const ErrorMessage = ({ error }: { error: Error }) => {
  const [toggleIsOpen, setToggleIsOpen] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    setToggleIsOpen(!toggleIsOpen);
  };

  return (
    <div className="">
      <div className="border-8 border-red-600 rounded-full w-3/4 mx-auto header  bg-orange-200 text-lg mb-3 p-3 mt-5 lg:mt-10 font-comfortaa text-center">
        <h1>Pikachu did a mistake!</h1>
        <p>
          Dear trainer, we have a special mission for you, <br />
          can you please contact the Master Tamer and say him this message
          please?
        </p>
      </div>
      <div className="bg-white w-1/2 mx-auto text-center h-fit">
        <p onClick={handleClick} className="cursor-pointer">
          Secret Message:
        </p>
        <br />
        <span
          className={clsx(
            `errorMessage
            ease-in-out duration-300
            ${
              toggleIsOpen
                ? "relative translate-y-0 z-0"
                : "relative -translate-y-full -z-10"
            }          
            `
          )}
        >
          {error.message}
        </span>
      </div>
      <img
        src={pikachuError}
        alt="Pikachu break the website!"
        className="max-w-2xl -mt-12 mx-auto"
      />
    </div>
  );
};
