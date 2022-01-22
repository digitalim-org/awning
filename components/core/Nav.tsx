/** @jsxImportSource https://esm.sh/preact */
import { SessionData } from "../../mod.tsx";
import { ComponentType, JSX, VNode } from "../../deps.ts";
import { css } from "../../styling/builder.ts";

interface NavProps {
  itemsStart?: ComponentType[];
  itemsMiddle?: ComponentType[];
  itemsEnd?: (VNode | string | number)[];
}

const { navbar } = css({
  navbar: {
    display: "flex",
    width: "100%",
  },
});

const Nav = ({ itemsStart, itemsMiddle, itemsEnd }: NavProps) => {
  return (
    <nav className={navbar}>
      <div className="navbar_start">
        {itemsStart?.map((Item) => <Item />)}
      </div>
      <div className="navbar_middle">
        {itemsMiddle?.map((Item) => <Item />)}
      </div>
      <div className="navbar_end">
        {itemsEnd}
      </div>
    </nav>
  );
};

export default Nav;
