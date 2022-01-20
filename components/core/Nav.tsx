/** @jsxImportSource https://esm.sh/preact */
import { SessionData } from "../../mod.tsx";
import { ComponentType, JSX } from "../../deps.ts";
import { Properties } from "https://esm.sh/csstype/index.d.ts";

interface NavProps {
  itemsStart?: ComponentType[];
}

type Styles = Record<string, Properties>;

const styles: Styles = {
  navbar: {
    display: "flex",
    justifyContent: "end",
    marginTop: "20rem",
  },
};

const Nav = ({ itemsStart }: NavProps) => (
  <nav class="navbar" style={styles.navbar as JSX.CSSProperties}>
    <h1>fdieee</h1>
    <h2>food?</h2>
    <div class="navbar_start">
      {itemsStart?.map((Item) => <Item />)}
    </div>
  </nav>
);

export default Nav;
