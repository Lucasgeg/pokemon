type PropsType = {
  userName: string | null | undefined | boolean;
};

export function Logout({ userName }: PropsType) {
  const action = userName ? "logout" : "login";
  return (
    <div className="border-2 bg-red-400 p-3 rounded-xl lg:mb-1 w-32 h-[100px] mb-2 flex">
      <form action={`/${action}`} method="post" className="m-auto">
        <button
          type="submit"
          className="first-letter:uppercase font-pokemon m-auto"
        >
          {action == "login" ? (
            <span>
              Connect <br />
              or <br /> Subscribe
            </span>
          ) : (
            <p>Disconnect</p>
          )}
        </button>
      </form>
    </div>
  );
}

export default Logout;
