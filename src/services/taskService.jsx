import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";

// Map weekday names to JS day indexes for recurring task calculations.
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

export const createTask = async (taskData, docRef = null) => {
  // If a docRef is provided (for recurring tasks with seriesId), use setDoc
  if (docRef) {
    await setDoc(docRef, taskData);
    return docRef;
  }
  // Otherwise use addDoc for one-time tasks
  return await addDoc(collection(db, "Task"), taskData);
};

// Mark a previously pending task as not done so the child can retry it.
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

// Approve a task and update the child's stats, XP, coins, and next recurrence if needed.
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

    const newHealth =
      healthChange > 0
        ? Math.min((child.health ?? 0) + healthChange, 100)
        : (child.health ?? 0);

    const newHappiness =
      happinessChange > 0
        ? Math.min((child.happiness ?? 0) + happinessChange, 100)
        : (child.happiness ?? 0);

    const newHunger =
      hungerChange > 0
        ? Math.min((child.hunger ?? 0) + hungerChange, 100)
        : (child.hunger ?? 0);

    await updateDoc(childRef, {
      xp: remainingXP,
      coins: increment(task.coins),
      level: newLevel,
      health: newHealth,
      happiness: newHappiness,
      hunger: newHunger,
    });

    if (task.recurrence) {
      const nextDueDate = getNextDueDate(task.recurrence, task.dueDate);
      // Preserve seriesId for recurring tasks - use existing seriesId or fall back to current task ID
      const seriesId = task.seriesId || taskId;
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
        seriesId: seriesId,
        status: "notdone",
        xp: task.xp,
      });
    }
  } catch (error) {
    console.error("Error approving task:", error);
  }
};

const getTimestampMillis = (timestamp) => {
  if (!timestamp) return 0;
  if (typeof timestamp.toMillis === "function") return timestamp.toMillis();
  if (typeof timestamp.toDate === "function")
    return timestamp.toDate().getTime();
  return new Date(timestamp).getTime();
};

// Ensure recurring tasks are recreated when their due dates pass.
// This function keeps the child task list up to date by generating the next instance.
export const reconcileRecurringTasks = async (childID) => {
  if (!childID) return;

  try {
    // Fetch all tasks for the child (no composite index needed)
    const q = query(collection(db, "Task"), where("childID", "==", childID));

    const snapshot = await getDocs(q);
    const allTasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter for recurring tasks client-side
    const tasks = allTasks.filter(
      (task) => task.recurrence && task.recurrence !== null,
    );

    const now = new Date();
    const latestBySeries = new Map();

    tasks.forEach((task) => {
      const seriesId = task.seriesId || task.id;
      const existing = latestBySeries.get(seriesId);
      const dueMillis = getTimestampMillis(task.dueDate);

      if (!existing || dueMillis > getTimestampMillis(existing.dueDate)) {
        latestBySeries.set(seriesId, task);
      }
    });

    for (const task of latestBySeries.values()) {
      if (!task.dueDate || task.status === "approved") continue;

      const dueDate = task.dueDate.toDate
        ? task.dueDate.toDate()
        : new Date(task.dueDate);
      if (dueDate >= now) continue;

      const seriesId = task.seriesId || task.id;
      const hasFuture = tasks.some(
        (t) =>
          (t.seriesId || t.id) === seriesId &&
          getTimestampMillis(t.dueDate) > getTimestampMillis(task.dueDate),
      );

      if (hasFuture) continue;

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
        seriesId: seriesId,
        status: "notdone",
        xp: task.xp,
      });
    }
  } catch (error) {
    console.error("Error reconciling recurring tasks:", error);
  }
};

// Edit an existing task, preserving recurrence metadata and updating due dates.
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

    // Preserve seriesId if it exists
    const updatePayload = {
      description: updatedData.description,
      approvalNeeded: updatedData.approvalNeeded,
      category: updatedData.category,
      coins: updatedData.coins,
      recurrence: updatedData.recurrence || null,
      dueDate: finalDueDate,
    };

    // If task has a seriesId, preserve it. If it doesn't but is now recurring, set it to taskId
    if (existingTask.seriesId) {
      updatePayload.seriesId = existingTask.seriesId;
    } else if (updatedData.recurrence) {
      updatePayload.seriesId = taskId;
    }

    await updateDoc(taskRef, updatePayload);

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
// Listen to pending approval tasks for the parent dashboard badge state.
export const listenToPendingTasks = (childID, callback) => {
  if (!childID) return () => {};

  const q = query(
    collection(db, "Task"),
    where("childID", "==", childID),
    where("status", "==", "pending"),
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    callback(!snapshot.empty);
  });

  return unsubscribe;
};
