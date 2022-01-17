import { h, hydrate } from "../../deps.ts";
import Index from "../../../components/Index.tsx";

hydrate(
  <Index session={{ currentRoute: "/" }} />,
  document.querySelector("body")!,
);
