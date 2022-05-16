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
  getUserName,
  pokemonGet,
  removePokemonFromUser,

} from "~/utils/users.server";

type Pokemon = {
  name: string;
  url: string;
  id: string;
  sprite: string | null;
  type: string;
  catchedPokemons: String[] | undefined | null
  userName : string | null | undefined
};
type PokePagination = { offset: string | null; limit: string | null };
type LoaderData = {
  pokemonList: Pokemon[];
  currentPage: String;
  nextContext: PokePagination | null;
  previousContext: PokePagination | null;
  catchedPokemons: String[] | undefined | null;
  userName: string |undefined |null
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
  const userId= await getUserId(request)
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");
  const currentPage = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
  const {
    data: { results, next, previous },
  } = await axios.get(currentPage);
  const pokemonList: Pokemon[] = results ;
  let catchedPokemons
  let userName
  if(userId){
    catchedPokemons = await pokemonGet(userId, pokemonList.map(({ name }) => name) )
    userName = await getUserName(userId)
  }
  const nextContext = getPaginationInfo(next);
  const previousContext = getPaginationInfo(previous);

  const data: LoaderData = {
    userName,
    currentPage,
    pokemonList,
    nextContext,
    previousContext,
    catchedPokemons
  };

  return json(data);
};

export async function action({ request }: any) {
  
  const userId = await getUserId(request);
  const body = await request.formData();
  const pokemonName = body._fields.pokemonName[0];
  const action = body._fields.action[0];
  
  if (typeof userId !== "string" || typeof pokemonName !== "string") {
    return json(
      { error: "userId or pokemonId is incorrect" },
      { status: 400 }
    );
  }
  switch(action){
    case "delete":{
      return await removePokemonFromUser(userId, pokemonName)
    }
    case "add":{
      return await addPokemonToUser(userId, pokemonName)
    }
    default:{
      throw new Error("Unexpected error happen")
    }
  }
}

const PokemonCard = ({ name, url, catchedPokemons, userName }: Pokemon) => {  
  const fetcher = useFetcher();
  const { data, isLoading } = useQuery(
    ["detail", name],
    (): Promise<{ data: PokemonDetailResponse }> => axios.get(url)
  );
  const res = data?.data;
  const hasBeenCatched = catchedPokemons?.includes(name);
 
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
        <p className=" first-letter:uppercase font-pokemon">{name}</p>
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
      {userName ? 
      
      <div className="gotIt mx-auto my-2">
        <form>
          {/*  onChange={(e) => setSearch(e.target.value)} */}
          
          <button
            className="button"
            type="submit"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              if (!res || !res.name) return
              fetcher.submit(
                { pokemonName: res.name.toString(), action: hasBeenCatched? "delete" : "add"},
                { method: "post"  }
                
              );
            }}
          >
            {hasBeenCatched ? 'Free him' : 'Catch Him'}
          </button>
        </form>
      </div> : null
      }
    </li>
  );
};

//////////////////////////////////////////////MAIN PAGE/////////////////////////////////////////////////////////////

export default function Index() {
  const { pokemonList, nextContext, previousContext, catchedPokemons, userName } =
    useLoaderData<LoaderData>();
  const [search, setSearch] = useState("");
 
  
  return (
    <div className=" w-full flex flex-col font-comfortaa font-semibold ">
      <Logout userName={userName} />

      <div className="border-8 border-red-600 rounded-full w-3/4 mx-auto header  bg-orange-200 text-lg mb-3 p-3 md:mt-10">
        {userName ?
                <h1 className="text-center">Hello <div className=" first-letter:uppercase font-pokemon">{userName}</div> let's complete your Pokedex!</h1> 

         : <h1 className=" text-center  "> Hello dear trainer! <br /> Looking for information? <br />You can subscribe if you want to get your own pokedex! </h1> }
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
          <PokemonCard key={p.name} {...p} catchedPokemons={catchedPokemons} userName={userName} />
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
