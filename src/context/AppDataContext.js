import { doc, getDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../../config/FirebaseConfig";

const AppDataContext = createContext(null);

// TEMP: hardcoded for development
const DEV_CHILD_ID = "OdxfJV1HNkkIzNCMG0cr";

export function AppDataProvider({ children }) {
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchChild = async () => {
    setLoading(true);

    const snap = await getDoc(doc(db, "Child", DEV_CHILD_ID));

    if (snap.exists()) {
      setChild({ id: snap.id, ...snap.data() });
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchChild();
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        child,
        setChild,
        refreshChild: fetchChild,
        loading,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}
