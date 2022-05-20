import axios from "axios";
import { useState } from "react";
import { Link, useLoaderData } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import Logout from "~/components/Logout";
import { getUserId } from "~/utils/auth.server";
import {
  addPokeObjecttoUser,
  getUserName,
  pokemonGet,
  removePokemonFromUser,
} from "~/utils/users.server";
import PokeCard from "~/components/PokeCard";
import MyPokedexButton from "~/components/MyPokedexButton";
import { Menu } from "~/components/Menu";

///////////////////////////////////////////TYPESCRIPT///////////////////////////////////////
type Pokemon = {
  name: string;
  url: string;
  id: number;
  sprite: string | null;
  type: string;
  catchedPokemons: string[] | undefined | null;
  userName: string | null | undefined;
  userId: string;
};
type PokePagination = { offset: string | null; limit: string | null };
type LoaderData = {
  userId: string | null;
  pokemonList: Pokemon[];
  currentPage: String;
  nextContext: PokePagination | null;
  previousContext: PokePagination | null;
  catchedPokemons: string[] | undefined | null;
  userName: string | undefined | null;
};
type PokemonDetailResponse = {
  name: string;
  id: number;
  sprites: {
    front_default: string;
    other: {
      home: { front_default: string };
      dream_world: {
        front_default: string;
      };
    };
  };
  types: [{ type: { name: string } }];
};

/////////////////////////////////////////////////////PAGINATION/////////////////////////////////

const getPaginationInfo = (url: string | null) => {
  if (!url) return null;
  const { searchParams } = new URL(url);
  return {
    offset: searchParams.get("offset"),
    limit: searchParams.get("limit"),
  };
};

//////////////////////////////////////////////LOADER/////////////////////////////////////////

export const loader: LoaderFunction = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  let userId = await getUserId(request);

  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");
  const currentPage = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
  const {
    data: { results, next, previous },
  } = await axios.get(currentPage);
  const pokemonList: Pokemon[] = results;
  let catchedPokemons;
  let userName;
  if (userId) {
    catchedPokemons = await pokemonGet(
      userId,
      pokemonList.map(({ name }) => name)
    );
    userName = await getUserName(userId);
  }

  const nextContext = getPaginationInfo(next);
  const previousContext = getPaginationInfo(previous);

  const data: LoaderData = {
    userId,
    userName,
    currentPage,
    pokemonList,
    nextContext,
    previousContext,
    catchedPokemons,
  };

  return json(data);
};

///////////////////////////////////////////ACTION///////////////////////////////////////

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

export default function Index() {
  const {
    pokemonList,
    nextContext,
    previousContext,
    catchedPokemons,
    userName,
    userId,
  } = useLoaderData<LoaderData>();
  const [search, setSearch] = useState("");

  return (
    <div className=" w-full flex flex-col font-comfortaa font-semibold ">
      <Menu userName={userName} />

      <div className="border-8 border-red-600 rounded-full w-3/4 mx-auto header  bg-orange-200 text-lg mb-3 p-3 mt-5 lg:mt-10">
        {userName ? (
          <h1 className="text-center">
            Hello{" "}
            <div className=" first-letter:uppercase font-pokemon">
              {userName}
            </div>{" "}
            let's complete your Pokedex!
          </h1>
        ) : (
          <h1 className=" text-center  ">
            {" "}
            Hello dear trainer! <br /> Looking for information? <br />
            You can subscribe if you want to get your own pokedex!{" "}
          </h1>
        )}
      </div>
      {/* Ajout d'une barre de recherche */}
      <form className=" text-center mx-auto" action={`/pokedex/${search}`}>
        <input
          className=" text-center mx-auto"
          placeholder="pokemon name or ID"
          onChange={(e) => setSearch(e.target.value)}
        />{" "}
        <br />
        <input type="submit" />
      </form>
      <ul className=" grid grid-cols-12 gap-4 px-2 md:px-4 mt-5">
        {pokemonList.map((p) => (
          <PokeCard
            pokemonName={p.name}
            userId={userId}
            key={p.id}
            catchedPokemons={catchedPokemons}
            pokemonId={null}
          />
        ))}
      </ul>
      <div className="sub_Menu mt-5">
        {previousContext && (
          <div className="menu_Button">
            <Link
              to={`/?offset=${previousContext.offset}&limit=${previousContext.limit}`}
            >
              Précédent
            </Link>
          </div>
        )}

        {nextContext && (
          <div className="menu_Button">
            <Link
              to={`/?offset=${nextContext.offset}&limit=${nextContext.limit}`}
            >
              Suivant
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
