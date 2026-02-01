import { doc, getDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../../config/FirebaseConfig";

const AppDataContext = createContext(null);

// TEMP: hardcoded for development
const DEV_CHILD_ID = "OdxfJV1HNkkIzNCMG0cr";

export function AppDataProvider({ children }) {
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pet, setPet] = useState(null);

  const fetchChild = async () => {
    setLoading(true);

    const snap = await getDoc(doc(db, "Child", DEV_CHILD_ID));

    if (snap.exists()) {
      setChild({ id: snap.id, ...snap.data() });
      const petID = snap.data().petID;
      const petSnap = await getDoc(doc(db, "Pet", petID));
      if (petSnap.exists()) {
        const colourSnap = await getDoc(
          doc(db, "Colours", petSnap.data().colourID),
        );
        let imageURL = petSnap.data().defaultImageURL;
        if (colourSnap.exists()) {
          imageURL = colourSnap.data().imageURL;
        }
        setPet({ id: petSnap.id, ...petSnap.data(), imageURL });
      }
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
        pet,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}
