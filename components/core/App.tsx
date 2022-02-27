/** @jsxImportSource https://esm.sh/preact */
import { ExtendableProps } from "../../deps.ts";
import { Link, Route, RouteContext } from "../../router/mod.tsx";
import { Nav, NavItem } from "../ez-commerce/mod.ts";
import Index from "../../../components/pages/Index.tsx";
import Shop from "../../../components/pages/Shop.tsx";
import { css } from "../../styling/builder.ts";

interface AppProps {
  url: string;
}

interface NavLinkProps {
  href: string;
}

const { navLink } = css({
  navLink: {
    textDecoration: "none",
    color: "black",
    width: "100%",
  },
});

const NavLink = ({ children, href }: ExtendableProps<NavLinkProps>) => (
  <Link href={href} className={navLink}>
    <NavItem>
      {children}
    </NavItem>
  </Link>
);

const App = ({ url }: ExtendableProps<AppProps>) => {
  return (
    <>
      <RouteContext.Provider value={{ url }}>
        <Nav>
          <NavLink href="/">
            Home
          </NavLink>
          <NavItem>About+</NavItem>
          <NavLink href="/shop">Shop</NavLink>
          <NavItem>Contact</NavItem>
        </Nav>
        <Route exact="/">
          <Index />
        </Route>
        <Route exact="/shop">
          <Shop />
        </Route>
      </RouteContext.Provider>
    </>
  );
};

export default App;
