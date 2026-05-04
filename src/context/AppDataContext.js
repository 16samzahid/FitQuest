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
import { reconcileRecurringTasks } from "../services/taskService";
import { useAuth } from "./AuthContext";

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const { user } = useAuth();

  const [parent, setParent] = useState(null);
  const [child, setChild] = useState(null);
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [childAccessories, setAccessories] = useState([]);
  const [lastSeenLevel, setLastSeenLevel] = useState(null);
  const [pendingLevelUp, setPendingLevelUp] = useState(null);

  /*
    Mood logic
  */
  const getMoodFromStats = (health, hunger, happiness) => {
    // all high → happy
    if (health >= 60 && hunger >= 60 && happiness >= 60) {
      return "happy";
    }

    // find lowest stat
    const minStat = Math.min(health, hunger, happiness);

    // if lowest is low → show problem
    if (minStat < 40) {
      if (minStat === health) return "sad";

      if (minStat === hunger) return "hungry";

      return "sad"; // low happiness = neutral smile
    }

    // otherwise neutral
    return "smile";
  };

  /*
    initial fetch
  */
  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    try {
      // parent
      const parentSnap = await getDoc(doc(db, "Parent", user.uid));

      if (!parentSnap.exists()) {
        setLoading(false);

        return;
      }

      const parentData = {
        id: parentSnap.id,
        ...parentSnap.data(),
      };

      setParent(parentData);

      // child
      const q = query(
        collection(db, "Child"),
        where("parentID", "==", parentData.id),
      );

      const childSnap = await getDocs(q);

      if (!childSnap.empty) {
        const childDoc = childSnap.docs[0];

        const childData = {
          id: childDoc.id,
          ...childDoc.data(),
        };

        setChild(childData);

        await reconcileRecurringTasks(childData.id);

        // load pet colour image
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
        }

        // accessories (correct childID used)
        const accessoryQuery = query(
          collection(db, "ChildAccessory"),
          where("childID", "==", childData.id),
        );

        const accessorySnap = await getDocs(accessoryQuery);

        setAccessories(
          accessorySnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        );
      }
    } catch (err) {
      console.error("AppData fetch error:", err);
    }

    setLoading(false);
  }, [user]);

  /*
    stat decay
  */
  const applyPetStatDecay = async (childData) => {
    if (!childData?.lastStatusUpdate) return;

    const now = new Date();

    const lastUpdate =
      typeof childData.lastStatusUpdate.toDate === "function"
        ? childData.lastStatusUpdate.toDate()
        : new Date(childData.lastStatusUpdate);

    const daysPassed = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));

    if (daysPassed <= 0) return;

    const decreaseAmount = daysPassed * 10;

    await updateDoc(doc(db, "Child", childData.id), {
      hunger: Math.max(0, childData.hunger - decreaseAmount),

      happiness: Math.max(0, childData.happiness - decreaseAmount),

      health: Math.max(0, childData.health - decreaseAmount),

      lastStatusUpdate: Timestamp.now(),
    });
  };

  /*
    realtime listeners
  */
  useEffect(() => {
    fetchData();

    let unsubscribeChild = null;

    let unsubscribeParent = null;

    if (user) {
      // parent realtime
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

      // child realtime
      const q = query(
        collection(db, "Child"),
        where("parentID", "==", user.uid),
      );

      unsubscribeChild = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const childDoc = snapshot.docs[0];

          const childData = {
            id: childDoc.id,
            ...childDoc.data(),
          };

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

  /*
    update pet images + mood when child changes
  */
  useEffect(() => {
    if (child && lastSeenLevel === null) {
      setLastSeenLevel(child.level ?? 0);
    }

    const currentLevel = child?.level ?? 0;
    if (child && lastSeenLevel != null && currentLevel > lastSeenLevel) {
      setPendingLevelUp(currentLevel);
    }

    const loadPetResources = async () => {
      if (!child || !child.pet) {
        setPet(null);

        return;
      }

      await applyPetStatDecay(child);

      const petData = child.pet;

      // determine correct mood
      const correctMood = getMoodFromStats(
        child.health,
        child.hunger,
        child.happiness,
      );

      // update firestore ONLY if changed
      if (petData.mood !== correctMood) {
        await updateDoc(doc(db, "Child", child.id), {
          "pet.mood": correctMood,
        });

        petData.mood = correctMood;
      }

      // colour image
      let imageURL = null;

      if (petData.colourID) {
        const colourSnap = await getDoc(doc(db, "Colours", petData.colourID));

        if (colourSnap.exists()) {
          imageURL = colourSnap.data().imageURL;
        }
      }

      // mood image
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

  /*
    realtime accessories
  */
  useEffect(() => {
    if (!child?.id) {
      setAccessories([]);

      return;
    }

    const accessoryQuery = query(
      collection(db, "ChildAccessory"),

      where("childID", "==", child.id),
    );

    const unsubscribeAccessories = onSnapshot(
      accessoryQuery,

      (snapshot) => {
        setAccessories(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        );
      },
    );

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
        lastSeenLevel,
        setLastSeenLevel,
        pendingLevelUp,
        setPendingLevelUp,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}
