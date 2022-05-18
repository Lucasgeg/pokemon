const MyPokedexButton = () => {
  return (
    <div className=" w-fit  md:absolute md:right-1 md:top-20 border-2 bg-red-400 p-3 rounded-xl">
      <form action={`/my-pokedex`}>
        <button type="submit" className="first-letter:uppercase font-pokemon">
          My pokedex
        </button>
      </form>
    </div>
  );
};

export default MyPokedexButton;
