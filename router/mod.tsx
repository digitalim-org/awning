/** @jsxImportSource https://esm.sh/preact */
import {
  createContext,
  ExtendableProps,
  useContext,
  useState,
} from "../deps.ts";

export const RouteContext = createContext({
  url: "",
  setUrl: () => {},
});

interface RouteProps {
  exact?: string;
}

export const Router = ({ children }: ExtendableProps) => {
  const [url, setUrl] = useState(window.location.href);
  return (
    <RouteContext.Provider value={{ url, setUrl }}>
      {children}
    </RouteContext.Provider>
  );
};

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
