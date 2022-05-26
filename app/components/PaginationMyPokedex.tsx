type paginationProps = {
  pokemonPerPage: number;
  totalPokemon: number;
  paginate: any;
};

export const Pagination = ({
  pokemonPerPage,
  totalPokemon,
  paginate,
}: paginationProps) => {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalPokemon / pokemonPerPage); i++) {
    pageNumbers.push(i);
  }
  return (
    <>
      <ul className="flex w-full justify-center items-center mx-auto mt-4">
        {pageNumbers.map((number) => (
          <li
            key={number}
            className="bg-yellow-500 rounded-full w-6 mx-1  text-center cursor-pointer justify-center items-center"
          >
            <span className="text-yellow-50" onClick={() => paginate(number)}>
              {number}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
};
