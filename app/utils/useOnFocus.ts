import { useEffect } from "react";

export const useOnFocus = (onFocus: () => void) => {
  useEffect(() => {
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [onFocus]);
};
