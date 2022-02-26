/** @jsxImportSource https://esm.sh/preact */
import { createContext, ExtendableProps, useContext } from "../deps.ts";

export const RouteContext = createContext({
  url: "",
});

interface RouteProps {
  exact?: string;
}

export const Route = ({ children, exact }: ExtendableProps<RouteProps>) => {
  const { url } = useContext(RouteContext);
  if (exact && url === exact) {
    return (
      <>
        {children}
      </>
    );
  }
  return null;
};

interface LinkProps {
  href: string;
}

export const Link = (
  { href, children, className }: ExtendableProps<LinkProps>,
) => (
  <a
    href={href}
    onClick={(evt) => {
      evt.preventDefault();
      history.pushState(null, "", href);
    }}
    className={className}
  >
    {children}
  </a>
);
