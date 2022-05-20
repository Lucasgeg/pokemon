const MyPokedexButton = () => {
  return (
    <div className=" border-2 bg-red-400 rounded-xl w-32 flex h-[100px] ">
      <form action={`/my-pokedex`} className="m-auto">
        <button type="submit" className="first-letter:uppercase font-pokemon ">
          My <br /> pokedex
        </button>
      </form>
    </div>
  );
};

export default MyPokedexButton;
