import {
  Form,
  Link,
  NavLink,
  useLocation,
  useTransition,
} from "@remix-run/react";
import axios from "axios";
import { useQuery } from "react-query";
import clsx from "clsx";
import { PokeballLoading } from "./PokeBallLoading";

type pokemon = {
  pokemonName: string;
  userId: string | null;
  catchedPokemons: string[] | null | undefined;
  pokemonId: number | null;
  currentPage: string;
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

const PokeCard = (
  { pokemonName, userId, catchedPokemons, pokemonId, currentPage }: pokemon,
  key: any
) => {
  const hasBeenCatched = pokemonName
    ? catchedPokemons?.includes(pokemonName)
    : catchedPokemons;

  const { data, isLoading } = useQuery(
    ["detail", pokemonName ? pokemonName : pokemonId],
    (): Promise<{ data: PokemonDetailResponse }> =>
      axios.get(
        `https://pokeapi.co/api/v2/pokemon/${
          pokemonName ? pokemonName : pokemonId
        }`
      )
  );

  const res = data?.data;
  let transition = useTransition();
  let submitting =
    transition.state === "submitting" &&
    transition.submission.formData.get("pokemonName") == `${pokemonName}`;
  return (
    <>
      {isLoading ? (
        <PokeballLoading />
      ) : (
        <li
          key={key}
          className={clsx(
            `rounded-xl border-8 border-white/25 col-span-full md:col-span-6 lg:col-span-2 flex flex-col hover:scale-105 transition duration-150 ease-in-out `,
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
            <p className=" text-center">Name: </p>
            <p className=" first-letter:uppercase font-pokemon">
              {pokemonName}
            </p>
            <br />
            {!isLoading && (
              <>
                <p>Id: </p>
                <span>{res?.id}</span>

                <br />
              </>
            )}
          </div>
          <Link
            to={`/pokedex/${pokemonName ? pokemonName : pokemonId}`}
            className="mx-auto my-2"
          >
            <div className={"button"}> Infos </div>
          </Link>
          {userId ? (
            <div className="releaseHim mx-auto my-2">
              <Form method="post">
                <input type="hidden" name="userId" value={userId} />
                <input type="hidden" name="pokemonId" value={res?.id} />
                <input type="hidden" name="pokemonName" value={pokemonName} />
                <input type="hidden" name="currentPage" value={currentPage} />
                <button
                  name="_action"
                  value={hasBeenCatched ? `remove` : `add`}
                  className={`${submitting ? "button lock" : "button"}`}
                  type="submit"
                  disabled={submitting}
                >
                  {hasBeenCatched ? "Realease him" : "Capture!"}
                </button>
              </Form>
            </div>
          ) : null}
        </li>
      )}
    </>
  );
};

export default PokeCard;
