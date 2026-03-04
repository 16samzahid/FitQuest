import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
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

  // fetchData is still useful for initial load/refresh, but child is now real-time
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

      // 2️⃣ The child document will be handled by a live listener below, so we
      //    only load once here to populate things quickly. After that the
      //    snapshot callback will keep state up to date.
      const q = query(
        collection(db, "Child"),
        where("parentID", "==", parentData.id),
      );

      const childSnap = await getDocs(q);

      if (!childSnap.empty) {
        const childDoc = childSnap.docs[0];
        const childData = { id: childDoc.id, ...childDoc.data() };
        setChild(childData);

        // initialize pet too
        const petData = childData.pet;
        if (petData) {
          let imageURL = null;
          if (petData.colourID) {
            const colourSnap = await getDoc(
              doc(db, "Colours", petData.colourID),
            );
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
        }
      }
    } catch (err) {
      console.error("AppData fetch error:", err);
    }

    setLoading(false);
  };

  // 🔑 rerun when user changes
  useEffect(() => {
    fetchData();

    // also start real-time listener for child data so that changes in
    // Firestore propagate automatically. we listen on query by parentID and
    // update state to the first matching child.
    let unsubscribeChild = null;
    if (user) {
      const parentDocRef = doc(db, "Parent", user.uid);
      // we'll listen on Child collection and filter by parentID
      const q = query(
        collection(db, "Child"),
        where("parentID", "==", user.uid),
      );
      unsubscribeChild = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const childDoc = snapshot.docs[0];
          const childData = { id: childDoc.id, ...childDoc.data() };
          setChild(childData);
        } else {
          setChild(null);
        }
      });
    }

    return () => {
      unsubscribeChild && unsubscribeChild();
    };
  }, [user]);

  // 🔍 correct way to log state changes
  useEffect(() => {
    // console.log(user.uid);
    // console.log("PARENT:", parent);
    // console.log("CHILD:", child);
    // console.log("PET:", pet);
  }, [parent, child, pet]);

  // whenever the child object changes (including from the real-time
  // listener) refresh any associated pet data such as images.
  useEffect(() => {
    const loadPetResources = async () => {
      if (!child || !child.pet) {
        setPet(null);
        return;
      }

      const petData = child.pet;
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
    };
    loadPetResources();
  }, [child]);

  return (
    <AppDataContext.Provider
      value={{
        parent,
        child,
        setChild,
        pet,
        setPet,
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
