import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
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
};
//////////////////////////////////////////////LOADER/////////////////////////////////////////////////////////
export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  if (!user) {
    return json({ error: "user not found" });
  }
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
  };
  return json(data);
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
  const { username, userId, pokemonIdList, pokemonNameList } =
    useLoaderData<LoaderData>();
  return (
    <div className="w-full flex flex-col font-comfortaa font-semibold p-3 ">
      Hello {username} Page!
      <ul className=" grid grid-cols-12 gap-4 px-2 md:px-4 mt-5 ">
        {pokemonIdList.map((i) => (
          <PokeCard
            pokemonName=""
            catchedPokemons={pokemonNameList}
            userId={userId}
            pokemonId={i}
          />
        ))}
      </ul>
    </div>
  );
}
