import {
  addDoc,
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
    // Create Parent document
    await setDoc(doc(db, "Parent", parentID), {
      name: "parentname",
      pin: "1234",
    });
    console.log("Parent created with ID:", parentID);

    // Create Child document
    const childRef = doc(collection(db, "Child"));
    const childID = childRef.id;

    await setDoc(childRef, {
      hasSeenWelcomeMessage: false,
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

    // Create default daily tasks
    await addDoc(collection(db, "Task"), {
      approvalNeeded: true,
      approvedBy: null,
      category: "Water",
      childID: childID,
      coins: 5,
      completedAt: null,
      createdAt: Timestamp.now(),
      description: "Drink a glass of water",
      dueDate: Timestamp.now(),
      recurrence: "daily",
      status: "notdone",
      xp: 5,
    });

    await addDoc(collection(db, "Task"), {
      approvalNeeded: true,
      approvedBy: null,
      category: "Food",
      childID: childID,
      coins: 5,
      completedAt: null,
      createdAt: Timestamp.now(),
      description: "Eat a piece of fruit",
      dueDate: Timestamp.now(),
      recurrence: "daily",
      status: "notdone",
      xp: 5,
    });

    await addDoc(collection(db, "Task"), {
      approvalNeeded: true,
      approvedBy: null,
      category: "Exercise",
      childID: childID,
      coins: 5,
      completedAt: null,
      createdAt: Timestamp.now(),
      description: "Do 5 star jumps",
      dueDate: Timestamp.now(),
      recurrence: "daily",
      status: "notdone",
      xp: 5,
    });

    console.log("Parent, child, and default tasks created successfully");
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
