/** @jsxImportSource https://esm.sh/preact */
import { Nav as NavCore } from "../core/mod.ts";
import { ComponentType, RenderableProps, toChildArray } from "../../deps.ts";

interface NavProps {
  logo?: ComponentType;
}

const Nav = ({ logo, children }: RenderableProps<NavProps>) => {
  return (
    <NavCore
      itemsEnd={toChildArray(children)}
    />
  );
};

export default Nav;
