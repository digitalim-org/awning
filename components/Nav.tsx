/** @jsxImportSource https://esm.sh/preact */
import { SessionData } from "../mod.tsx";

interface Item {
  label: string;
  href: string;
}

interface NavProps {
  items: Item[];
  session: SessionData;
}

const Nav = ({ items, session }: NavProps) => (
  <nav class="navbar">
    {items.map(({ label, href }) => (
      <a
        href={href}
        className={`navbar-item${
          session.currentRoute === href ? " active" : ""
        }`}
      >
        {label}
      </a>
    ))}
  </nav>
);

export default Nav;
