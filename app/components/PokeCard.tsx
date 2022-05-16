import { Link, useFetcher } from "@remix-run/react";
import axios from "axios";
import { useQuery } from "react-query";
import clsx from "clsx";
import { removePokemonFromUser } from "~/utils/users.server";
import { ActionFunction, json, redirect } from "@remix-run/node";
import { getUserId } from "~/utils/auth.server";
type pokemon={
    pokemonName: string
    userId: string 
}

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

  export const action: ActionFunction=async({request}: any)=>{
    const form= await request.formData();
    const pokemonName = form._fields.pokemonName[0]
    const userId= await getUserId(request)
    if (typeof userId !== "string" || typeof pokemonName !== "string") {
        return json(
          { error: "userId or pokemonId is incorrect" },
          { status: 400 }
        );
      }
      console.log( pokemonName);
      
      return await removePokemonFromUser(userId, pokemonName)
  }


const PokeCard = ({pokemonName, userId} :pokemon, ) => {    
    const fetcher = useFetcher();
    const {data, isLoading}= useQuery(
        ["detail", pokemonName],
        ():Promise<{data:PokemonDetailResponse}> => axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    )    
    const res= data?.data
    return (
        <>
        {isLoading ? "Loading in progress" : 
        <li 
        key={pokemonName} 
        className={clsx(
            "rounded-xl border-8 border-white/25 col-span-full md:col-span-6 lg:col-span-2 flex flex-col hover:scale-105 transition duration-150 ease-in-out ",
            res?.types[0].type.name
          )}
        >
            <div className="picture mx-auto my-3">
          <img
            src={
              res?.sprites.other.dream_world.front_default
                ? res?.sprites.other.dream_world.front_default
                : res?.sprites.other.home.front_default
            }
            alt={"picture of" + pokemonName}
            className="h-48 w-auto p-2"
          />
        </div>
      <br />
      <div className=" w-3/4 p-2 cardInfo mx-auto text-center bg-slate-300">
        <p className=" text-center">Name:</p>
        <p className=" first-letter:uppercase font-pokemon">{pokemonName}</p>
        <br />
        {!isLoading && (
          <>
            <p>Id: </p>
            <span>{res?.id}</span>
            <br />
          </>
        )}
      </div>
      <Link to={`/pokedex/${pokemonName}`} className="mx-auto my-2">
        <div className={"button"}> Infos </div>
      </Link>
        <div className="releaseHim mx-auto my-2">
            <form>
                <input type="hidden" name="pokemonName" value={pokemonName} />
                <button
                className="button"
                type="submit"
                 onClick={(e: React.MouseEvent<HTMLButtonElement>)=>{
                    e.preventDefault()
                    fetcher.submit(
                        {pokemonName}, {method: "post"}
                    )
                }}
                
                >
                    Release Him
                </button>
            </form>
        </div>
        </li>
        }
        </>
    );
};

export default PokeCard;