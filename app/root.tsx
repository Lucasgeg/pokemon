import type { MetaFunction } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts } from "@remix-run/react";
import vanillaStyle from "./styles/pokedex.css";
import styles from "./styles/app.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import pikachuError from "./assets/pikachuError.png";
import { ErrorMessage } from "./components/ErrorMessage";

const queryClient = new QueryClient();

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: vanillaStyle },
  ];
}
export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Pokedex! Catch'em all!",
  viewport: "width=device-width,initial-scale=1",
});
function Document({
  children,
  title = "Pokedex, attrapez les tous",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <title>{title}</title>
        <Links />
      </head>
      <body id="body" className={`max-w-7xl mx-auto bg-yellow-400 `}>
        {children}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
export default function App() {
  return (
    <Document>
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document title="Pika?">
      <ErrorMessage error={error} />
    </Document>
  );
}
