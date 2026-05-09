import { createContext, useContext, useState } from "react";

const ModeContext = createContext();

export function ModeProvider({ children }) {
  // Manage whether the app is in child or parent mode
  const [mode, setMode] = useState("child");

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  return useContext(ModeContext);
}
