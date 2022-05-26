type props = {
  backUrl: string;
};

const MyPokedexButton = ({ backUrl }: props) => {
  const urlPage = backUrl;
  return (
    <div className=" border-2 bg-red-400 rounded-xl w-28 flex h-[100px] ">
      {urlPage.includes("my-pokedex") ? (
        <form action={`/`} className="m-auto">
          <button type="submit" className="font-pokemon ">
            Home
          </button>
        </form>
      ) : (
        <form action={`/my-pokedex`} className="m-auto">
          <button type="submit" className="font-pokemon ">
            My <br /> pokedex
          </button>
        </form>
      )}
    </div>
  );
};

export default MyPokedexButton;
