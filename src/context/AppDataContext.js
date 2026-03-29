import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { db } from "../../config/FirebaseConfig";
import { useAuth } from "./AuthContext";

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const { user } = useAuth();

  const [parent, setParent] = useState(null);
  const [child, setChild] = useState(null);
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [childAccessories, setAccessories] = useState([]);

  // fetchData is still useful for initial load/refresh, but child is now real-time
  const fetchData = useCallback(async () => {
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
          // initialising moodURL here as well since it's needed for the Avatar
          let moodImageURL = null;
          if (petData.mood) {
            const moodSnap = await getDoc(doc(db, "Mood", petData.mood));
            if (moodSnap.exists()) {
              moodImageURL = moodSnap.data().imageURL;
            }
          }
          setPet({ ...petData, imageURL, moodImageURL });
        }
        // fetch accessories for shop
        const accessoryQuery = query(
          collection(db, "ChildAccessory"),
          where("childID", "==", childData.id),
        );
        const accessorySnap = await getDocs(accessoryQuery);
        setAccessories(
          accessorySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      }
    } catch (err) {
      console.error("AppData fetch error:", err);
    }

    setLoading(false);
  }, [user]);

  const applyPetStatDecay = async (childData) => {
    if (!childData?.lastStatusUpdate) return;

    const now = new Date();

    const lastUpdate =
      typeof childData.lastStatusUpdate.toDate === "function"
        ? childData.lastStatusUpdate.toDate()
        : new Date(childData.lastStatusUpdate);

    // difference in FULL days
    const daysPassed = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));

    // prevents infinite loop
    if (daysPassed <= 0) return;

    const decreaseAmount = daysPassed * 10;

    console.log("Days passed:", daysPassed);
    console.log("Decrease:", decreaseAmount);

    await updateDoc(doc(db, "Child", childData.id), {
      hunger: Math.max(0, childData.hunger - decreaseAmount),
      happiness: Math.max(0, childData.happiness - decreaseAmount),
      health: Math.max(0, childData.health - decreaseAmount),

      lastStatusUpdate: Timestamp.now(),
    });
  };

  // 🔑 rerun when user changes
  useEffect(() => {
    fetchData();

    // also start real-time listener for child data so that changes in
    // Firestore propagate automatically. we listen on query by parentID and
    // update state to the first matching child.
    let unsubscribeChild = null;
    let unsubscribeParent = null;
    if (user) {
      unsubscribeParent = onSnapshot(
        doc(db, "Parent", user.uid),
        (parentSnap) => {
          if (parentSnap.exists()) {
            setParent({
              id: parentSnap.id,
              ...parentSnap.data(),
            });
          }
        },
      );
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
      unsubscribeParent && unsubscribeParent();
    };
  }, [user, fetchData]);

  // 🔍 correct way to log state changes
  useEffect(() => {
    const loadPetResources = async () => {
      console.log("DECAY CHECK RUNNING");
      console.log("last update:", child?.lastStatusUpdate);
      if (!child || !child.pet) {
        setPet(null);
        return;
      }

      // 🔹 apply stat decay
      const updatedPet = await applyPetStatDecay(child);

      const petData = updatedPet || child.pet;

      // load colour image
      let imageURL = null;
      if (petData.colourID) {
        const colourSnap = await getDoc(doc(db, "Colours", petData.colourID));
        if (colourSnap.exists()) {
          imageURL = colourSnap.data().imageURL;
        }
      }

      // load mood image
      let moodImageURL = null;
      if (petData.mood) {
        const moodSnap = await getDoc(doc(db, "Mood", petData.mood));
        if (moodSnap.exists()) {
          moodImageURL = moodSnap.data().imageURL;
        }
      }

      setPet({
        ...petData,
        imageURL,
        moodImageURL,
      });
    };

    loadPetResources();
  }, [child]);

  // Real-time accessory listener for current child
  useEffect(() => {
    if (!child?.id) {
      setAccessories([]);
      return;
    }

    const accessoryQuery = query(
      collection(db, "ChildAccessory"),
      where("childID", "==", child.id),
    );

    const unsubscribeAccessories = onSnapshot(accessoryQuery, (snapshot) => {
      setAccessories(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    });

    return () => unsubscribeAccessories();
  }, [child?.id]);

  return (
    <AppDataContext.Provider
      value={{
        parent,
        child,
        setChild,
        pet,
        setPet,
        loading,
        childAccessories,
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
