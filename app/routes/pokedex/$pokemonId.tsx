import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import axios from "axios";
import clsx from "clsx";

import { ErrorMessage } from "~/components/ErrorMessage";
import { Menu } from "~/components/Menu";
import { getUserId } from "~/utils/auth.server";
import { getUserName } from "~/utils/users.server";

type Pokemon = {
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
  abilities: [{ ability: { name: string } }];
  height: number;
  weight: number;
};

type LoaderData = {
  url: string;
  pokemonDetail: Pokemon;
  userName: string | null | undefined;
};
export const loader: LoaderFunction = async ({ params, request }) => {
  const url = new URL(request.url).pathname;
  const userId = await getUserId(request);
  const userName = await getUserName(userId);
  const res = await axios.get(
    `https://pokeapi.co/api/v2/pokemon/${params.pokemonId}`
  );

  const pokemonDetail: Pokemon = res.data;
  const data: LoaderData = {
    url,
    pokemonDetail,
    userName,
  };
  return json(data);
};

export default function PokemonById() {
  const { pokemonDetail, userName, url } = useLoaderData<LoaderData>();
  const numberOfTypes = pokemonDetail.types.length;
  const numberOfAbilities = pokemonDetail.abilities.length;
  return (
    <div className="flex-col">
      <Menu userName={userName} url={url} />
      <div className="border-8 border-red-600 rounded-full w-3/4 mx-auto header  bg-orange-200 text-lg mb-3 p-3 md:mt-10">
        <h1 className="text-center ">
          Individual page of : <br />
          <span
            className={
              "font-bold text-2xl name" + pokemonDetail.types[0].type.name
            }
          >
            <p className=" first-letter:uppercase">{pokemonDetail.name}</p>
          </span>
        </h1>
      </div>
      {/* Carte du Pokemon */}
      <div
        className={clsx(
          "card rounded-3xl border-[10px] border-white/25 grid grid-cols-12 p-3 m-3 mt-20 ",
          pokemonDetail.types[0].type.name
        )}
      >
        <img
          src={
            pokemonDetail.sprites.other.home.front_default
              ? pokemonDetail.sprites.other.home.front_default
              : pokemonDetail.sprites.other.dream_world.front_default
          }
          alt={"Picture of " + pokemonDetail.name}
          className="col-span-12 mx-auto md:col-span-4 my-auto"
        />

        <table className="col-span-12 sm:col-start-1 sm:col-span-4 sm:mb-6 md:col-span-3 ">
          <thead className="">
            <tr className="exeption">
              <th colSpan={2} className=" h-14">
                Specific Informations
              </th>
            </tr>
          </thead>
          <tbody className="  ">
            <tr className="">
              <th>ID:</th>
              <td>{pokemonDetail.id}</td>
            </tr>
            {pokemonDetail.types.map((type, index) => (
              <tr key={index}>
                <th>Type {numberOfTypes > 1 ? index + 1 : ""}:</th>
                <td className="first-letter:uppercase">{type.type.name}</td>
              </tr>
            ))}
            <tr>
              <th>Heigh:</th>
              <td>{pokemonDetail.height}</td>
            </tr>
            <tr>
              <th>Weight</th>
              <td>{pokemonDetail.weight}</td>
            </tr>
          </tbody>
        </table>
        <table className="col-span-12 sm:col-end-13 sm:col-span-4 md:col-span-3 md:col-end-13">
          <thead className="">
            <tr className="exeption ">
              <th colSpan={2} className="h-14">
                Basic Abilities
              </th>
            </tr>
          </thead>
          <tbody>
            {pokemonDetail.abilities.map((ability, index) => (
              <tr key={index}>
                <th>Ability {numberOfAbilities > 1 ? index + 1 : ""}</th>
                <td className="first-letter:uppercase">
                  {ability.ability.name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
/* export function ErrorBoundary() {
  const params = useParams();

  const [search, setSearch] = useState("");
  return (
    <div className="error-container flex flex-col justify-center w-full">
      <h1 className=" border-8 border-red-600 rounded-full w-3/4 mx-auto header  bg-orange-200 text-lg mb-3 p-3 mt-5 lg:mt-10 text-center font-comfortaa">
        {`Error ! We didn't find pokemon number "${params.pokemonId}", try an other one please `}
      </h1>

      <form className=" text-center mx-auto " action={`/pokedex/${search}`}>
        <input
          className=" text-center mx-auto my-5"
          placeholder="Pokemon name or ID"
          onChange={(e) => setSearch(e.target.value)}
        />{" "}
        <br />
        <input type="submit" className="my-5 button" value={"Search"} />
        <NavLink to={"/"} className="button">
          {" "}
          Home{" "}
        </NavLink>
        <img
          src={pikachuSearch}
          alt="picture of pikachu searching"
          className="max-w-md"
        />
      </form>
    </div>
  );
} */
export const ErrorBoundary = ({ error }: { error: Error }) => {
  return <ErrorMessage error={error} />;
};
