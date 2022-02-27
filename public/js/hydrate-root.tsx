import { h, hydrate } from "../../deps.ts";
import App from "../../components/core/App.tsx";

hydrate(
  <App url={window.location.pathname} />,
  document.querySelector("body")!,
);
