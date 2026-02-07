import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../../config/FirebaseConfig";
import { useAuth } from "./AuthContext";

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const { user } = useAuth();

  const [parent, setParent] = useState(null);
  const [child, setChild] = useState(null);
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // 1️⃣ Fetch parent
      const parentSnap = await getDoc(doc(db, "Parent", user.uid));

      if (!parentSnap.exists()) {
        setLoading(false);
        return;
      }

      const parentData = { id: parentSnap.id, ...parentSnap.data() };
      setParent(parentData);

      // 2️⃣ Fetch child USING parentData (NOT state)
      const q = query(
        collection(db, "Child"),
        where("parentID", "==", parentData.id),
      );

      const childSnap = await getDocs(q);

      if (childSnap.empty) {
        setLoading(false);
        return;
      }

      const childDoc = childSnap.docs[0];
      const childData = { id: childDoc.id, ...childDoc.data() };
      setChild(childData);

      // 3️⃣ Fetch pet
      // const petSnap = await getDoc(doc(db, "Pet", childData.petID));

      const petData = childData.pet;

      if (!petData) {
        setLoading(false);
        return;
      }

      // 4️⃣ Fetch colour (optional)
      let imageURL = null;

      if (petData.colourID) {
        const colourSnap = await getDoc(doc(db, "Colours", petData.colourID));
        if (colourSnap.exists()) {
          imageURL = colourSnap.data().imageURL;
        }
      }

      let moodImageURL = null;

      if (petData.mood) {
        const moodSnap = await getDoc(doc(db, "Mood", petData.mood));
        if (moodSnap.exists()) {
          moodImageURL = moodSnap.data().imageURL;
        }
      }

      setPet({ ...petData, imageURL, moodImageURL });
    } catch (err) {
      console.error("AppData fetch error:", err);
    }

    setLoading(false);
  };

  // 🔑 rerun when user changes
  useEffect(() => {
    fetchData();
  }, [user]);

  // 🔍 correct way to log state changes
  useEffect(() => {
    console.log(user.uid);
    console.log("PARENT:", parent);
    console.log("CHILD:", child);
    console.log("PET:", pet);
  }, [parent, child, pet]);

  return (
    <AppDataContext.Provider
      value={{
        parent,
        child,
        pet,
        loading,
        refreshData: fetchData,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}
