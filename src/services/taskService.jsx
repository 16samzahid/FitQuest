import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
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

export const completeTask = async (taskId) => {
  try {
    console.log(`Task ${taskId} completed`);

    const taskRef = doc(db, "Task", taskId);

    await updateDoc(taskRef, {
      status: "pending",
    });
  } catch (error) {
    console.error("Error completing task:", error);
  }
};

export const approveTask = async (taskId) => {
  try {
    console.log(`Task ${taskId} approved`);

    const taskRef = doc(db, "Task", taskId);
    await updateDoc(taskRef, {
      status: "approved",
    });
    // update child's xp and coins
    const taskSnapshot = await getDoc(taskRef);
    const task = taskSnapshot.data();
    const childRef = doc(db, "Child", task.childID);

    const childSnapshot = await getDoc(childRef);
    const child = childSnapshot.data();
    const totalXP = child.xp + task.xp;

    const levelsGained = Math.floor(totalXP / 100);
    const remainingXP = totalXP % 100;

    const newLevel = child.level + levelsGained;

    await updateDoc(childRef, {
      xp: remainingXP,
      coins: increment(task.coins),
      level: newLevel,
    });
  } catch (error) {
    console.error("Error approving task:", error);
  }
};
