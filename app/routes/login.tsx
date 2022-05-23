import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useState } from "react";
import { Link, useActionData } from "@remix-run/react";
import { getUser, login, register } from "~/utils/auth.server";
import type { Forms } from "~/utils/types.server";
import { validatePassword, validateUserName } from "~/utils/validators.server";
import { ErrorMessage } from "~/components/ErrorMessage";

export const ErrorBoundary = ({ error }: { error: Error }) => {
  return <ErrorMessage error={error} />;
};

export const loader: LoaderFunction = async ({ request }) => {
  return (await getUser(request)) ? redirect("/") : null;
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
    return json({
      errorMessage: `Form not submitted correctly`,
    });
  }
  switch (action) {
    case "login": {
      return await login({ username, password });
    }
    case "register": {
      return await register({ username, password });
    }
    default:
      throw new Error("Unexpected Login Error");
  }
  //return await register({ username, password });
};

export default function Login() {
  const actionData = useActionData();
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
    <div className="flex flex-col justify-center items-center mt-40">
      <button
        onClick={() => setAction(action == "login" ? "register" : "login")}
        className="absolute top-8 right-8 rounded-xl bg-yellow-300 font-semibold text-blue-600 px-3 py-2 transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
      >
        {action === "login" ? "S'inscrire" : "Se connecter"}
      </button>
      {action == "login" ? (
        <h1 className="text-center">Connect and complete your pokedex!</h1>
      ) : (
        <h1 className="text-center">
          Subscribe and we offer you a free pokedex!
        </h1>
      )}
      <form
        method="POST"
        className=" w-1/2 flex flex-col justify-center items-center border-2 p-10 bg-blue-400 rounded-xl mt-10"
      >
        <label htmlFor="username">Username</label>
        <input
          className={`text-center ${
            actionData ? "border-2 border-red-400" : ""
          }`}
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={(e) => handleInputChange(e, "username")}
        />
        <p className="text-white text-sm">
          {actionData?.usernameError ? actionData?.usernameError : null}
        </p>
        <label htmlFor="password">Password</label>
        <input
          className={`text-center ${
            actionData ? "border-2 border-red-400 " : ""
          }`}
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={(e) => handleInputChange(e, "password")}
        />
        <p className="text-white text-sm">
          {actionData?.passwordError ? actionData?.passwordError : null}
        </p>
        <button
          type="submit"
          name="_action"
          value={action}
          className="rounded-xl mt-5 bg-yellow-300 px-3 py-2 text-blue-600 font-semibold transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
        >
          {action == "login" ? "Se connecter" : "S'inscrire"}
        </button>
      </form>
      <Link to={`/`}>I just want to take a look</Link>
    </div>
  );
}
