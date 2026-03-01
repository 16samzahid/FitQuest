import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";

export const createTask = async (taskData) => {
  return await addDoc(collection(db, "Task"), taskData);
};

export const rejectTask = async (taskId) => {
  try {
    console.log(`Task ${taskId} rejected`);

    const taskRef = doc(db, "Task", taskId);

    await updateDoc(taskRef, {
      status: "notdone",
    });

    console.log("Task rejected successfully");
  } catch (error) {
    console.error("Error rejecting task:", error);
  }
};

export const deleteTask = async (taskId) => {
  console.log(`Task ${taskId} deleted`);
  await deleteDoc(doc(db, "Task", taskId));
};
