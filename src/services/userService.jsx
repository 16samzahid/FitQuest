import {
  collection,
  doc,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { Alert } from "react-native";
import { db } from "../../config/FirebaseConfig";

export const createParentAndChild = async (parentID) => {
  console.log("Creating parent and child with parentID:", parentID);
  try {
    // 🔹 Create Parent document
    await setDoc(doc(db, "Parent", parentID), {
      name: "parentname",
      pin: "1234", // default PIN, can be updated later in profile setup
    });
    console.log("Parent created with ID:", parentID);

    // 🔹 Create Child document
    const childRef = doc(collection(db, "Child"));
    const childID = childRef.id;
    await setDoc(childRef, {
      coins: 0,
      happiness: 80,
      health: 80,
      hunger: 80,
      lastStatusUpdate: Timestamp.now(),
      level: 1,
      name: "childname",
      parentID: parentID,
      pet: {
        colourID: "red_id",
        mood: "happy",
      },
      xp: 0,
    });
    console.log("Child created and linked to parent ID:", parentID);

    console.log("Parent and child created successfully");
  } catch (error) {
    console.error("Error creating parent/child:", error);
  }
};

export const editChildName = async (childID, newName) => {
  try {
    await updateDoc(doc(db, "Child", childID), {
      name: newName,
    });
    console.log("Child name updated successfully");
    Alert.alert("Success", "Child name updated successfully");
  } catch (error) {
    console.error("Error updating child name:", error);
  }
};

export const editParentPin = async (parentID, newPin) => {
  try {
    await updateDoc(doc(db, "Parent", parentID), {
      pin: newPin,
    });
    console.log("Parent PIN updated successfully");
  } catch (error) {
    console.error("Error updating parent PIN:", error);
  }
};
