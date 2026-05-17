// this service handles parent and child setup, plus simple profile updates
import {
  collection,
  doc,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { Alert } from "react-native";
import { db } from "../../config/FirebaseConfig";

// create a new parent account with a linked child profile and starter daily tasks
export const createParentAndChild = async (parentID) => {
  console.log("Creating parent and child with parentID:", parentID);

  try {
    // create the parent document using the firebase auth user id
    await setDoc(doc(db, "Parent", parentID), {
      name: "parentname",
      pin: "1234",
    });

    console.log("Parent created with ID:", parentID);

    // create a new child document with an automatically generated id
    const childRef = doc(collection(db, "Child"));
    const childID = childRef.id;

    // set up the child's default profile, stats, pet and progress values
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

    // create the first default daily task for drinking water
    // the seriesId links future repeated versions of this task together
    const task1Ref = doc(collection(db, "Task"));
    await setDoc(task1Ref, {
      approvalNeeded: true,
      approvedBy: null,
      category: "Water",
      childID: childID,
      coins: 5,
      completedAt: null,
      createdAt: Timestamp.now(),
      description: "Drink A Glass Of Water",
      dueDate: Timestamp.now(),
      recurrence: "daily",
      seriesId: task1Ref.id,
      status: "notdone",
      xp: 5,
    });

    // create the second default daily task for eating fruit
    const task2Ref = doc(collection(db, "Task"));
    await setDoc(task2Ref, {
      approvalNeeded: true,
      approvedBy: null,
      category: "Food",
      childID: childID,
      coins: 5,
      completedAt: null,
      createdAt: Timestamp.now(),
      description: "Eat A Piece Of Fruit",
      dueDate: Timestamp.now(),
      recurrence: "daily",
      seriesId: task2Ref.id,
      status: "notdone",
      xp: 5,
    });

    // create the third default daily task for exercise
    const task3Ref = doc(collection(db, "Task"));
    await setDoc(task3Ref, {
      approvalNeeded: true,
      approvedBy: null,
      category: "Exercise",
      childID: childID,
      coins: 5,
      completedAt: null,
      createdAt: Timestamp.now(),
      description: "Do 5 Star Jumps",
      dueDate: Timestamp.now(),
      recurrence: "daily",
      seriesId: task3Ref.id,
      status: "notdone",
      xp: 5,
    });

    console.log("Parent, child, and default tasks created successfully");
  } catch (error) {
    console.error("Error creating parent/child:", error);
  }
};

// update the child's display name in firestore
export const editChildName = async (childID, newName) => {
  try {
    await updateDoc(doc(db, "Child", childID), {
      name: newName,
    });

    console.log("Child name updated successfully");

    // show feedback so the parent knows the change worked
    Alert.alert("Success", "Child name updated successfully");
  } catch (error) {
    console.error("Error updating child name:", error);
  }
};

// update the parent's pin used to access parent mode
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
