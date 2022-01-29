/** @jsxImportSource https://esm.sh/preact */
import { Nav as NavCore } from "../core/mod.ts";
import {
  ComponentType,
  ExtendableProps,
  toChildArray,
  useState,
} from "../../deps.ts";
import { css, media, STATE } from "../../styling/builder.ts";

interface NavProps {
  logo?: ComponentType;
}

interface IconButtonProps {
  src: string;
  onClick: () => void;
}

const {
  navItems,
  icon,
  iconButton,
  navModal,
  closeButton,
  navItem,
  navModalOpen,
  navModalClose,
} = css({
  navItem: {
    textTransform: "uppercase",
    fontWeight: 200,
    padding: "0.5rem 0",
    width: "100%",
    textAlign: "center",
    [STATE.HOVER]: {
      backgroundColor: "rgba(0,0,0,0.05)",
    },
  },
  closeButton: {
    alignSelf: "flex-end",
  },
  navModal: {
    display: "flex",
    top: 0,
    backgroundColor: "white",
    position: "absolute",
    width: "100%",
    alignItems: "center",
    flexDirection: "column",
    transition: "height 1s, bottom 1s",
    overflow: "hidden",
  },
  navModalOpen: {
    bottom: 0,
    height: "100vh",
  },
  navModalClose: {
    bottom: "100vh",
    height: 0,
  },
  navItems: {
    display: "none",
  },
  icon: {
    height: "3rem",
    width: "2.5rem",
  },
  iconButton: {
    border: "0",
    backgroundColor: "transparent",
    cursor: "pointer",
  },
});

const IconButton = (
  { src, onClick, className }: ExtendableProps<IconButtonProps>,
) => (
  <button
    className={`${iconButton} ${className}`}
    onClick={onClick}
    type="button"
  >
    <img className={icon} src={src} />
  </button>
);

export const NavItem = ({ children }: ExtendableProps<{}>) => (
  <div className={navItem}>
    {children}
  </div>
);

const Nav = ({ className, children }: ExtendableProps<NavProps>) => {
  const [openHamburger, setOpenHamburger] = useState(false);
  return (
    <>
      <NavCore
        itemsEnd={[
          <div className={navItems}>
            {children}
          </div>,
          <IconButton
            onClick={() => setOpenHamburger(true)}
            src="/awning/public/icons/glyphs_fyi/hamburger.svg"
          />,
        ]}
      />
      <div
        className={`${navModal} ${
          openHamburger ? navModalOpen : navModalClose
        }`}
      >
        <IconButton
          className={closeButton}
          onClick={() => setOpenHamburger(false)}
          src="/awning/public/icons/glyphs_fyi/close.svg"
        />
        {children}
      </div>
    </>
  );
};

export default Nav;
