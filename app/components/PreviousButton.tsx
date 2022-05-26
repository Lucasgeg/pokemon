type backUrl = {
  backUrl: string;
};
export const PreviousButton = ({ backUrl }: backUrl) => {
  const handlePrev = () => {
    return history.back();
  };
  return (
    <div className="border-2 bg-red-400 p-3 rounded-xl lg:mb-1 w-28 h-[100px] mb-2 flex">
      <button
        type="submit"
        className="first-letter:uppercase font-pokemon m-auto"
        onClick={handlePrev}
      >
        Previous
      </button>
    </div>
  );
};
