import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";

const weekdayMap = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const getNextDueDate = (recurrenceDay, fromDate) => {
  const base = fromDate?.toDate ? fromDate.toDate() : new Date(fromDate);
  base.setHours(0, 0, 0, 0);

  if (recurrenceDay === "daily") {
    const nextDate = new Date(base);
    nextDate.setDate(nextDate.getDate() + 1);
    return nextDate;
  }

  const todayIndex = base.getDay();
  const targetIndex = weekdayMap[recurrenceDay];
  let diff = targetIndex - todayIndex;

  if (diff <= 0) {
    diff += 7;
  }

  const nextDate = new Date(base);
  nextDate.setDate(base.getDate() + diff);
  return nextDate;
};

export const createTask = async (taskData) => {
  // console.log(taskData.recurrence);
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
    const snapShot = await getDoc(taskRef);
    const task = snapShot.data();

    if (!task.approvalNeeded) {
      await approveTask(taskId);
      return;
    }
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
      completedAt: Timestamp.now(),
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

    // update pet's health, happiness, hunger based on task category
    let healthChange = 0;
    let happinessChange = 0;
    let hungerChange = 0;

    switch (task.category) {
      case "Food":
      case "Water":
        hungerChange = 10;
        break;

      case "Exercise":
      case "Hygiene":
        healthChange = 10;
        break;

      case "Learning":
      case "Play":
        happinessChange = 10;
        break;

      default:
        break;
    }

    await updateDoc(childRef, {
      xp: remainingXP,
      coins: increment(task.coins),
      level: newLevel,
      health: increment(healthChange),
      happiness: increment(happinessChange),
      hunger: increment(hungerChange),
    });
    if (task.recurrence) {
      const nextDueDate = getNextDueDate(task.recurrence, task.dueDate);
      await addDoc(collection(db, "Task"), {
        approvalNeeded: task.approvalNeeded,
        approvedBy: null,
        category: task.category,
        childID: task.childID,
        coins: task.coins,
        completedAt: null,
        createdAt: Timestamp.now(),
        description: task.description,
        dueDate: Timestamp.fromDate(nextDueDate),
        recurrence: task.recurrence,
        status: "notdone",
        xp: task.xp,
      });
    }
  } catch (error) {
    console.error("Error approving task:", error);
  }
};

export const editTask = async (taskId, updatedData) => {
  try {
    const taskRef = doc(db, "Task", taskId);

    // get existing task
    const snapshot = await getDoc(taskRef);
    const existingTask = snapshot.data();
    let finalDueDate = existingTask.dueDate;

    // if switching to recurring → calculate new due date
    if (updatedData.recurrence) {
      finalDueDate = Timestamp.fromDate(
        getNextDueDate(updatedData.recurrence, new Date()),
      );
    }

    // if editing normal due date
    else if (updatedData.dueDate !== undefined) {
      if (updatedData.dueDate) {
        const jsDate = updatedData.dueDate.toDate
          ? updatedData.dueDate.toDate()
          : updatedData.dueDate;

        finalDueDate = Timestamp.fromDate(jsDate);
      } else {
        finalDueDate = null;
      }
    }

    await updateDoc(taskRef, {
      description: updatedData.description,

      approvalNeeded: updatedData.approvalNeeded,

      category: updatedData.category,

      coins: updatedData.coins,

      recurrence: updatedData.recurrence || null,

      dueDate: finalDueDate,
    });

    console.log(`Task ${taskId} updated`);
  } catch (error) {
    console.error("Error editing task:", error);
  }
};

export const getCompletedTasks = async (childID) => {
  try {
    const q = query(
      collection(db, "Task"),
      where("childID", "==", childID),
      where("status", "==", "approved"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching completed tasks:", error);
    return [];
  }
};
