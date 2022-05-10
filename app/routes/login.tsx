import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useState } from "react";
import { getUser, login, register } from "~/utils/auth.server";
import type { Forms } from "~/utils/types.server";
import { validatePassword, validateUserName } from "~/utils/validators.server";

export const loader: LoaderFunction = async ({ request }) => {
  return (await getUser(request)) ? redirect("/pokedex") : null;
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const action = form.get("_action");
  const username = form.get("username");
  const password = form.get("password");

  if (
    typeof action !== "string" ||
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    return json({ error: "Invalid Form Data" }, { status: 400 });
  }
  const errors = {
    username: validateUserName(username),
    password: validatePassword(password),
  };
  if (Object.values(errors).some(Boolean))
    return json(
      {
        errors,
        fields: { username, password },
        form: action,
      },
      { status: 400 }
    );
  switch (action) {
    case "login": {
      return login({ username, password });
    }
    case "register": {
      return await register({ username, password });
    }
    default:
      return json({ error: "invalid form data" }, { status: 400 });
  }
  //return await register({ username, password });
};

export default function Login() {
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setFormData((form: Forms) => ({ ...form, [field]: event.target.value }));
  };

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [action, setAction] = useState("login");
  return (
    <div className="main">
      <button
        onClick={() => setAction(action == "login" ? "register" : "login")}
        className="absolute top-8 right-8 rounded-xl bg-yellow-300 font-semibold text-blue-600 px-3 py-2 transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
      >
        {action === "login" ? "S'inscrire" : "Se connecter"}
      </button>
      <h1>Hello login</h1>
      <h2>Subscribe and get your own pokedex!</h2>
      <form method="POST">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={(e) => handleInputChange(e, "username")}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={(e) => handleInputChange(e, "password")}
        />
        <button
          type="submit"
          name="_action"
          value={action}
          className="rounded-xl mt-2 bg-yellow-300 px-3 py-2 text-blue-600 font-semibold transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
        >
          {action == "login" ? "Se connecter" : "S'inscrire"}
        </button>
      </form>
    </div>
  );
}
