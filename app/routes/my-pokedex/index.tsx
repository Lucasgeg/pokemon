import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import PokeCard from "~/components/PokeCard";
import { getUser } from "~/utils/auth.server";

type LoaderData={
    username: string 
    id: string
    pokemonList: string[] 
}

export const loader: LoaderFunction= async({request})=>{
const user = await getUser(request)
if (!user ){
    return json({error: "user not found"})
}
const username= user.username
const id= user.id
const pokemonList = user.pokemonNames
const data: LoaderData={
id,
pokemonList,
username
}
return json(data)
}

//////////////////////////////////////////////MAIN PAGE/////////////////////////////////////////////////////////////
export  default function index(){
const {id,pokemonList,username} = useLoaderData<LoaderData>()
return(
    <div className="bg-red-800  w-full flex flex-col font-comfortaa font-semibold p-3 " >
        Hello {username} Page!
        <ul className=" grid grid-cols-12 gap-4 px-2 md:px-4 mt-5">
        {pokemonList?.map(p=>(   
                <PokeCard pokemonName={p} userId={id} />
        )            
        )}

        </ul>
        
    </div>
)
}