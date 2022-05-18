import type { Forms } from "./types.server";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma.server";
import { json } from "@remix-run/node";

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

export const getUserName = async (id: string | null) => {
  if (!id) {
    return null;
  }
  const username = await prisma.user.findUnique({
    where: { id },
  });
  return username?.username;
};

export const getPokemonList = async (userId: string) => {
  if (!userId) {
    return null;
  }
  const pokemonList = await prisma.user.findMany({
    orderBy: { pokemonIds: "asc" },
    where: { id: userId },
    select: { pokemonIds: true, pokemonNames: true },
  });
  return pokemonList;
};
export const userHaveThePokemon = async (
  userId: string,
  pokemonName: string
) => {
  if (!userId || !pokemonName) return null;
  const inTheList = await prisma.user.findMany({
    where: { id: userId, AND: { pokemonNames: { has: pokemonName } } },
  });
  return inTheList.length;
};

export const addPokeObjecttoUser = async (
  userId: string,
  pokemonName: string,
  pokemonId: number
) => {
  if (!userId || !pokemonName || !pokemonId) {
    return null;
  }
  if (await userHaveThePokemon(userId, pokemonName))
    return json({ message: "Pokemon allready in the DB" });
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  user?.pokemonNames.push(pokemonName);
  user?.pokemonIds.push(pokemonId);

  return await prisma.user.update({
    where: { id: userId },
    data: {
      pokemonNames: user?.pokemonNames,
      pokemonIds: user?.pokemonIds,
    },
  });
};
/* export const addPokemonToUser = async (
  userId: string,
  pokemonId: string,
  pokemonName: string
) => {
  const res = await prisma.user.findUnique({
    where: { id: userId },
    select: { pokemonIds: true },
  });
  //on recupere la propriété pokemon , si res && res.pokemonNames, j'ai au moins un pokemon, donc je fait un nouveau tableau avec
  //ceux que j'avais avant + le nouveau, sinon on initialise un tableau avec celui qu'on viens d'attraper
  const catchedPokemonIdsWithNewOne =
    res && res.pokemonIds
      ? [...res.pokemonIds, pokemonId + pokemonName]
      : [pokemonId + pokemonName];
  //new set du tableau permet de retiré les doublons et ne laisse qu'une liste qu'on transforme en array
  const uniquePokemonIds = Array.from(new Set(catchedPokemonIdsWithNewOne));
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: { pokemonIds: { set: uniquePokemonIds } },
  });

  return json(
    { message: `pokemon n°: ${pokemonId} succesfully added` },
    { status: 200 }
  );
}; */

export const removePokemonFromUser = async (
  userId: string,
  pokemonId: number,
  pokemonName: string
) => {
  const resId = await prisma.user.findUnique({
    where: { id: userId },
    select: { pokemonIds: true },
  });
  const resName = await prisma.user.findUnique({
    where: { id: userId },
    select: { pokemonNames: true },
  });
  //on recupere la propriété pokemon , si res && res.pokemonIds, j'ai au moins un pokemon, donc je fait un nouveau tableau avec
  //ceux que j'avais avant + le nouveau, sinon on initialise un tableau avec celui qu'on viens d'attraper

  const catchedpokemonIdsWithoutId =
    resId && resId.pokemonIds
      ? resId.pokemonIds.filter((p) => p !== pokemonId)
      : undefined;
  const catchedpokemonIdsWithoutName =
    resName && resName.pokemonNames
      ? resName.pokemonNames.filter((p) => p !== pokemonName)
      : undefined;
  await prisma.user.updateMany({
    where: {
      id: userId,
    },
    data: {
      pokemonIds: { set: catchedpokemonIdsWithoutId },
      pokemonNames: { set: catchedpokemonIdsWithoutName },
    },
  });

  return json(
    { message: `pokemon n°: ${pokemonId} succesfully removed` },
    { status: 200 }
  );
};

export const pokemonGet = async (userId: string, pIds: string[]) => {
  const res = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      pokemonNames: true,
    },
  });

  if (!res) {
    return null;
  }

  const { pokemonNames } = res;

  return pIds.filter((id) => pokemonNames.includes(id));
};
