import { useState } from "../deps.ts";

export const useBreakpoint = (breakpoint: string) => {
  const mqList = window.matchMedia(`(min-width: ${breakpoint})`);
  const [matchesBP, setMatchesBP] = useState(mqList.matches);

  mqList.addEventListener("change", () => {
    setMatchesBP(!matchesBP);
  });

  return matchesBP;
};
