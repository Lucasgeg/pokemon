type PropsType = {
  userName: string | null | undefined | boolean;
};

export function Logout({ userName }: PropsType) {
  const action = userName ? "logout" : "login";
  return (
    <div className="border-2 bg-red-400 p-3 rounded-xl lg:mb-1 w-32 mb-2 text-center">
      <form action={`/${action}`} method="post">
        <button type="submit" className="first-letter:uppercase font-pokemon">
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
