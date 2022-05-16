type PropsType={
  userName: string | null | undefined | boolean
}

export function Logout({userName}: PropsType) {
const action = userName ? "logout" : "login"
  return (
    <div className=" w-fit  md:absolute md:right-1 md:top-1 border-2 bg-red-400 p-3 rounded-xl">
      <form action={`/${action}`} method="post">
        <button type="submit" className="first-letter:uppercase font-pokemon">{action == "login"? <span>Connect <br />or <br /> Subscribe</span> : "Disconnect"}</button>
      </form>
    </div>
  );
};

export default Logout;
