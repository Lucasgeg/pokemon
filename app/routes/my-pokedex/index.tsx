import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { ErrorMessage } from "~/components/ErrorMessage";
import { Menu } from "~/components/Menu";
import { Pagination } from "~/components/PaginationMyPokedex";
import PokeCard from "~/components/PokeCard";
import { getUser } from "~/utils/auth.server";
import {
  addPokeObjecttoUser,
  getPokemonList,
  removePokemonFromUser,
} from "~/utils/users.server";

type LoaderData = {
  username: string;
  userId: string;
  pokemonIdList: number[];
  pokemonNameList: string[];
  url: string;
};
//////////////////////////////////////////////LOADER/////////////////////////////////////////////////////////
export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  if (!user) {
    return json({ error: "user not found" });
  }
  const url = new URL(request.url).pathname;
  const username = user.username;
  const userId = user.id;

  const pokemonList = await getPokemonList(userId);

  if (!pokemonList) {
    return false;
  }
  const pokemonIdList = pokemonList[0].pokemonIds.sort((a, b) => a - b);
  const pokemonNameList = pokemonList[0].pokemonNames;

  const data: LoaderData = {
    userId,
    pokemonIdList,
    pokemonNameList,
    username,
    url,
  };
  return json(data);
};
/////////////////////////////////////////////ERROR BOUNDARY/////////////////////////////////////////////////////////
export const ErrorBoundary = ({ error }: { error: Error }) => {
  return <ErrorMessage error={error} />;
};
/////////////////////////////////////////////ACTION/////////////////////////////////////////////////////////////////
export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const userId = form.get("userId");
  const pokemonId = Number(form.get("pokemonId"));
  const pokemonName = form.get("pokemonName");
  const action = form.get("_action");

  if (
    typeof userId !== "string" ||
    typeof pokemonId !== "number" ||
    typeof pokemonName !== "string"
  ) {
    return false;
  }
  switch (action) {
    case "add": {
      return await addPokeObjecttoUser(userId, pokemonName, pokemonId);
    }
    case "remove": {
      return await removePokemonFromUser(userId, pokemonId, pokemonName);
    }
    default:
      throw new Error("Error on the action switch");
  }
};

//////////////////////////////////////////////MAIN PAGE/////////////////////////////////////////////////////////////
export default function index() {
  const { username, userId, pokemonIdList, pokemonNameList, url } =
    useLoaderData<LoaderData>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pokemonPerPage, setPokemonPerPage] = useState(12);
  const nextPage = () => setCurrentPage(currentPage + 1);
  const previousPage = () => setCurrentPage(currentPage - 1);
  const indexOfLastPokemon = currentPage * pokemonPerPage;
  const indexOfFirstPokemon = indexOfLastPokemon - pokemonPerPage;
  const currentPokemon = pokemonIdList.slice(
    indexOfFirstPokemon,
    indexOfLastPokemon
  );
  if (!currentPokemon.length && currentPage != 1) {
    setCurrentPage(currentPage - 1);
  }
  const maxPage = Math.ceil(pokemonIdList.length / pokemonPerPage);
  console.log(maxPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  return (
    <div className=" w-full flex flex-col font-comfortaa font-semibold mb-4">
      <Menu userName={username} url={url} />
      <div className="border-8 border-red-600 rounded-full w-3/4 mx-auto header  bg-orange-200 text-lg mb-3 p-3 mt-5 lg:mt-10 text-center">
        Hello <span className="font-pokemon">{username}</span> Page! <br />
        {pokemonIdList.length
          ? `You already find ${pokemonIdList.length} pokemons! Continue like this!`
          : "There is no pokemon yet! Let's catch your first pokemon!"}
      </div>
      <ul className=" grid grid-cols-12 gap-4 px-2 md:px-4 mt-5 ">
        {currentPokemon.map((i) => (
          <PokeCard
            pokemonName=""
            catchedPokemons={pokemonNameList}
            userId={userId}
            pokemonId={i}
            currentPage={""}
            key={i}
          />
        ))}
      </ul>
      {/* //////////////////////////////////////////////PAGINATION//////////////////////////////// */}
      <Pagination
        pokemonPerPage={pokemonPerPage}
        totalPokemon={pokemonIdList.length}
        paginate={paginate}
      />
      <div className="flex w-full justify-center items-center mx-auto mt-1">
        {currentPage > 1 ? (
          <div
            className="w-28 text-center bg-blue-400 hover:bg-blue-600 rounded-xl border-2 border-yellow-50 border-opacity-50 p-2 mx-1 cursor-pointer"
            onClick={previousPage}
          >
            Previous
          </div>
        ) : null}
        {currentPage == maxPage || maxPage == 0 ? null : (
          <div
            className="w-28 text-center bg-red-400 hover:bg-red-600 rounded-xl border-2 border-yellow-50 border-opacity-50 p-2 mx-1 cursor-pointer"
            onClick={nextPage}
          >
            Next
          </div>
        )}
      </div>
    </div>
  );
}
