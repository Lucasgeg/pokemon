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

export const getUserName = async(id: string | null )=>{
  if (!id){
    return null 
  }
  const username= await prisma.user.findUnique({
    where: {id}
  })
  return username?.username
}


export const addPokemonToUser = async (userId: string, pokemonName: string) => {
  //update la collection user et connecte le pokemon au user

 // await createPokemon(pokemonId);
   const res= await prisma.user.findUnique({
    where:{id: userId},
    select:{pokemonNames: true}
  });
  //on recupere la propriété pokemon , si res && res.pokemonNames, j'ai au moins un pokemon, donc je fait un nouveau tableau avec
  //ceux que j'avais avant + le nouveau, sinon on initialise un tableau avec celui qu'on viens d'attraper
  const catchedPokemonNamesWithNewOne = res && res.pokemonNames ? [...res.pokemonNames, pokemonName] : [pokemonName];
  //new set du tableau permet de retiré les doublons et ne laisse qu'une liste qu'on transforme en array 
  const uniquePokemonNames = Array.from(new Set(catchedPokemonNamesWithNewOne))
  await prisma.user.update({
    where: {
      id: userId,
    },
    data:{pokemonNames:{set: uniquePokemonNames}}
  });

  return json(
    { message: `pokemon ${pokemonName} succesfully added` },
    { status: 200 }
  );
};

export const removePokemonFromUser = async (userId: string, pokemonName: string) => {
  //update la collection user et connecte le pokemon au user

 // await createPokemon(pokemonId);
   const res= await prisma.user.findUnique({
    where:{id: userId},
    select:{pokemonNames: true}
  });
  //on recupere la propriété pokemon , si res && res.pokemonNames, j'ai au moins un pokemon, donc je fait un nouveau tableau avec
  //ceux que j'avais avant + le nouveau, sinon on initialise un tableau avec celui qu'on viens d'attraper
  const catchedPokemonNamesWithoutOne = res && res.pokemonNames ? res.pokemonNames.filter((p) => p !== pokemonName) : undefined;
  await prisma.user.update({
    where: {
      id: userId,
    },
    data:{pokemonNames:{set: catchedPokemonNamesWithoutOne}}
  });

  return json(
    { message: `pokemon ${pokemonName} succesfully removed` },
    { status: 200 }
  );
};

export const pokemonGet =async (userId:string, pIds:string[]) => {

  const res = await prisma.user.findUnique({
    where:{id: userId},
    select:{
      pokemonNames: true
    }
  })

  if (!res) { 
    return null;
  }

  const { pokemonNames } = res;
  
  return pIds.filter((id) => pokemonNames.includes(id));
}

// export const userHaveThePokemon = async (id: string, pokemonId: string) => {
//   const heHave = await prisma.user.findMany({
//     where: {
//       id: id,
//       AND: { pokemons: { some: { pokemonId } } },
//     },
//   });
//   if (heHave.length > 1) return true;
//   else return false;
// };

// export const removePokemonFromUser = async (id: string, pokemonId: string) => {
//   if (!userHaveThePokemon(id, pokemonId)) {
//     console.log("You don't have this pokemon yet");
//   } else {
//     await prisma.user.update({
//       where: { id: id },
//       data: { pokemons: { disconnect: { pokemonId } } },
//     });
//   }
//   return json({ pokemonRemoved: pokemonId });
// };
