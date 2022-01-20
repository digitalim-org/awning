/** @jsxImportSource https://esm.sh/preact */
import { Nav as NavCore } from "../core/mod.ts";
import { ComponentType } from "../../deps.ts";

interface NavProps {
  logo: ComponentType;
}

const Nav = ({ logo }: NavProps) => {
  return (
    <NavCore
      itemsStart={[
        logo,
      ]}
    />
  );
};

export default Nav;
