const Logout = () => {
  return (
    <div className="absolute right-1 top-1 border-2 bg-red-400 p-3 rounded-xl">
      <form action="/logout" method="post">
        <button type="submit">Deconnection</button>
      </form>
    </div>
  );
};

export default Logout;
