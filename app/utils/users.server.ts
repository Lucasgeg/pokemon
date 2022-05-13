import type { Forms } from "./types.server";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma.server";
import { json } from "@remix-run/node";
import { empty } from "@prisma/client/runtime";
import PokemonById from "~/routes/pokedex/$pokemonId";

export const createUser = async (user: Forms) => {
  const passwordHash = await bcrypt.hash(user.password, 10);

  const newUser = await prisma.user.create({
    data: {
      username: user.username,
      password: passwordHash,
    },
  });
  return { id: newUser.id, username: newUser.username };
};

export const createPokemon = async (pokemonId: string) => {
  //creer le pokemon dans la bdd s'il n'y est pas déjà
  const pokemonExist = await prisma.pokemon.count({
    where: { pokemonId },
  });
  if (!pokemonExist) {
    await prisma.pokemon.create({
      data: { pokemonId },
    });
    return json({ message: "Pokemon succesfully added into the DB" });
  }
};

export const addPokemonToUser = async (userId: string, pokemonId: string) => {
  //update la collection user et connecte le pokemon au user

  await createPokemon(pokemonId);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: { pokemons: { connect: { pokemonId } } },
  });

  return json(
    { message: `pokemon number ${pokemonId} succesfully added` },
    { status: 200 }
  );
};

export const userHaveThePokemon = async (id: string, pokemonId: string) => {
  const heHave = await prisma.user.findMany({
    where: {
      id: id,
      AND: { pokemons: { some: { pokemonId } } },
    },
  });
  if (heHave.length > 1) return true;
  else return false;
};

export const removePokemonFromUser = async (id: string, pokemonId: string) => {
  if (!userHaveThePokemon(id, pokemonId)) {
    console.log("You don't have this pokemon yet");
  } else {
    await prisma.user.update({
      where: { id: id },
      data: { pokemons: { disconnect: { pokemonId } } },
    });
  }
  return json({ pokemonRemoved: pokemonId });
};
