import { useQuery } from "react-query";
import clsx from "clsx";
import axios from "axios";
import React, { useState } from "react";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import Logout from "~/components/Logout";
import { getUserId } from "~/utils/auth.server";
import {
  addPokemonToUser,
  removePokemonFromUser,
  userHaveThePokemon,
} from "~/utils/users.server";

type Pokemon = {
  name: string;
  url: string;
  id: number;
  sprite: string | null;
  type: string;
};
type PokePagination = { offset: string | null; limit: string | null };
type LoaderData = {
  pokemonList: Pokemon[];
  currentPage: String;
  nextContext: PokePagination | null;
  previousContext: PokePagination | null;
};
type PokemonDetailResponse = {
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

const getPaginationInfo = (url: string | null) => {
  if (!url) return null;
  const { searchParams } = new URL(url);
  return {
    offset: searchParams.get("offset"),
    limit: searchParams.get("limit"),
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");
  const currentPage = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
  const {
    data: { results, next, previous },
  } = await axios.get(currentPage);
  const pokemonList: Pokemon[] = results;
  /* const promises = [];
  for (const pokemon of pokemonList) {
    promises.push(axios.get(pokemon.url));
  }
  const toto = await Promise.all(promises);
  toto.forEach((element) => {
    const index = pokemonList.findIndex(
      (pokemon) => pokemon.name === element.data.name
    );
    if (index == -1) return;
    pokemonList[index].id = element.data.id;
    pokemonList[index].sprite =
      element.data.sprites.other.dream_world.front_default;
    pokemonList[index].type = element.data.types[0].type.name;
  }); */
  const nextContext = getPaginationInfo(next);
  const previousContext = getPaginationInfo(previous);

  const data: LoaderData = {
    currentPage,
    pokemonList,
    nextContext,
    previousContext,
  };

  return json(data);
};

export async function action({ request }: any) {
  const userId = await getUserId(request);
  const body = await request.formData();
  const pokemonId = body._fields.pokemonId[0];
  if (typeof userId !== "string" || typeof pokemonId !== "string") {
    return json(
      { error: "userId or pokemonId is inconrrect" },
      { status: 400 }
    );
  }
  return await addPokemonToUser(userId, pokemonId);
}

const PokemonCard = ({ name, url }: Pokemon) => {
  const fetcher = useFetcher();
  const { data, isLoading } = useQuery(
    ["detail", name],
    (): Promise<{ data: PokemonDetailResponse }> => axios.get(url)
  );

  const res = data?.data;
  return (
    <li
      key={name}
      className={clsx(
        "rounded-xl border-8 border-white/25 col-span-full md:col-span-6 lg:col-span-2 flex flex-col hover:scale-105 transition duration-150 ease-in-out ",
        res?.types[0].type.name
      )}
    >
      {isLoading ? (
        <div className="picture w-48 h-48"></div>
      ) : (
        <div className="picture mx-auto my-3">
          <img
            src={
              res?.sprites.other.dream_world.front_default
                ? res?.sprites.other.dream_world.front_default
                : res?.sprites.other.home.front_default
            }
            alt={"picture of" + name}
            className="h-48 w-auto p-2"
          />
        </div>
      )}
      <br />
      <div className=" w-3/4 p-2 cardInfo mx-auto text-center bg-slate-300">
        <p className=" text-center">Name:</p>
        <p className=" first-letter:uppercase">{name}</p>
        <br />
        {!isLoading && (
          <>
            <p>Id: </p>
            <span>{res?.id}</span>
            <br />
          </>
        )}
      </div>
      <Link to={`/pokedex/${name}`} className="mx-auto my-2">
        <div className={"button"}> Infos </div>
      </Link>
      <div className="gotIt mx-auto my-2">
        <form method="">
          {/*  onChange={(e) => setSearch(e.target.value)} */}

          <button
            type="submit"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              if (!res || !res.id) return;
              fetcher.submit(
                { pokemonId: res.id.toString() },
                { method: "post" }
              );
            }}
          >
            Catch him
          </button>
        </form>
      </div>
    </li>
  );
};

export default function Index() {
  const { pokemonList, nextContext, previousContext } =
    useLoaderData<LoaderData>();
  const [search, setSearch] = useState("");

  return (
    <div className=" w-full flex flex-col">
      <Logout />
      <h1 className=" text-center my-5 py-1">Index</h1>
      {/* Ajout d'une barre de recherche */}
      <form className=" text-center mx-auto" action={`/pokedex/${search}`}>
        <input
          className=" text-center mx-auto"
          placeholder="Type a pokemon name or ID"
          onChange={(e) => setSearch(e.target.value)}
        />{" "}
        <br />
        <input type="submit" />
      </form>
      <ul className=" grid grid-cols-12 gap-4 px-2 md:px-4 mt-5">
        {pokemonList.map((p) => (
          <PokemonCard key={p.name} {...p} />
        ))}
      </ul>
      <div className="sub_Menu mt-5">
        {previousContext && (
          <div className="menu_Button">
            <Link
              to={`/pokedex?offset=${previousContext.offset}&limit=${previousContext.limit}`}
            >
              Précédent
            </Link>
          </div>
        )}

        {nextContext && (
          <div className="menu_Button">
            <Link
              to={`/pokedex?offset=${nextContext.offset}&limit=${nextContext.limit}`}
            >
              Suivant
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
