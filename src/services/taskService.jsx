// this service keeps all task-related firestore logic in one place
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

// maps weekday names to javascript day numbers, so weekly recurring tasks can be calculated
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
  // convert firestore timestamps or normal dates into a javascript date
  const base = fromDate?.toDate ? fromDate.toDate() : new Date(fromDate);
  base.setHours(0, 0, 0, 0);

  // daily tasks are simply moved to the next day
  if (recurrenceDay === "daily") {
    const nextDate = new Date(base);
    nextDate.setDate(nextDate.getDate() + 1);
    return nextDate;
  }

  // weekly tasks use the weekday map to find the next matching day
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

const formatDateId = (date) => {
  // formats a date as yyyy-mm-dd so it can be used in a predictable task id
  const jsDate = date?.toDate ? date.toDate() : new Date(date);

  const year = jsDate.getFullYear();
  const month = String(jsDate.getMonth() + 1).padStart(2, "0");
  const day = String(jsDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const createTask = async (taskData, docRef = null) => {
  // use setDoc when a fixed document id is needed, such as for recurring tasks
  if (docRef) {
    await setDoc(docRef, taskData);
    return docRef;
  }

  // otherwise create a normal task with an automatically generated id
  return await addDoc(collection(db, "Task"), taskData);
};

export const rejectTask = async (taskId) => {
  try {
    console.log(`Task ${taskId} rejected`);

    const taskRef = doc(db, "Task", taskId);

    // send the task back to not done so the child can try again
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

  // remove the task document from firestore
  await deleteDoc(doc(db, "Task", taskId));
};

export const completeTask = async (taskId) => {
  try {
    console.log(`Task ${taskId} completed`);

    const taskRef = doc(db, "Task", taskId);
    const snapShot = await getDoc(taskRef);
    const task = snapShot.data();

    // if the task does not need approval, approve it straight away
    if (!task.approvalNeeded) {
      await approveTask(taskId);
      return;
    }

    // otherwise mark it as pending so the parent can review it
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

    // mark the task as approved and store the completion time
    await updateDoc(taskRef, {
      status: "approved",
      completedAt: Timestamp.now(),
    });

    // fetch the task and linked child so rewards can be applied
    const taskSnapshot = await getDoc(taskRef);
    const task = taskSnapshot.data();
    const childRef = doc(db, "Child", task.childID);

    const childSnapshot = await getDoc(childRef);
    const child = childSnapshot.data();
    const totalXP = child.xp + task.xp;

    // every 100 xp increases the child's level, with leftover xp carried forward
    const levelsGained = Math.floor(totalXP / 100);
    const remainingXP = totalXP % 100;

    const newLevel = child.level + levelsGained;

    // decide which pet stat should improve based on the task category
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

    // cap each pet stat at 100 so values cannot go too high
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

    // update the child with their new rewards and pet stats
    await updateDoc(childRef, {
      xp: remainingXP,
      coins: increment(task.coins),
      level: newLevel,
      health: newHealth,
      happiness: newHappiness,
      hunger: newHunger,
    });

    // this older recurrence approach was left commented out because recurring tasks
    // are now handled by reconcileRecurringTasks instead
    // if (task.recurrence) {
    //   const nextDueDate = getNextDueDate(task.recurrence, task.dueDate);
    //   // Preserve seriesId for recurring tasks - use existing seriesId or fall back to current task ID
    //   const seriesId = task.seriesId || taskId;
    //   await addDoc(collection(db, "Task"), {
    //     approvalNeeded: task.approvalNeeded,
    //     approvedBy: null,
    //     category: task.category,
    //     childID: task.childID,
    //     coins: task.coins,
    //     completedAt: null,
    //     createdAt: Timestamp.now(),
    //     description: task.description,
    //     dueDate: Timestamp.fromDate(nextDueDate),
    //     recurrence: task.recurrence,
    //     seriesId: seriesId,
    //     status: "notdone",
    //     xp: task.xp,
    //   });
    // }
  } catch (error) {
    console.error("Error approving task:", error);
  }
};

const getTimestampMillis = (timestamp) => {
  // normalise firestore timestamps and normal dates so they can be compared
  if (!timestamp) return 0;
  if (typeof timestamp.toMillis === "function") return timestamp.toMillis();
  if (typeof timestamp.toDate === "function")
    return timestamp.toDate().getTime();
  return new Date(timestamp).getTime();
};

const isSameDay = (dateA, dateB) => {
  // checks whether two dates are on the same calendar day
  if (!dateA || !dateB) return false;

  const a = dateA?.toDate ? dateA.toDate() : new Date(dateA);
  const b = dateB?.toDate ? dateB.toDate() : new Date(dateB);

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

// ensure recurring tasks are recreated when their due dates pass
// this works for both daily tasks and weekly tasks
// if the app has not been opened for a while, it creates all missed task records
// this helps the dashboard count missed tasks as "not completed"
export const reconcileRecurringTasks = async (childID) => {
  if (!childID) return;

  try {
    // get all tasks for this child
    const q = query(collection(db, "Task"), where("childID", "==", childID));

    const snapshot = await getDocs(q);

    const allTasks = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    // only tasks with a recurrence and due date need to be checked
    const recurringTasks = allTasks.filter(
      (task) => task.recurrence && task.dueDate,
    );

    const latestBySeries = new Map();

    // group recurring tasks by seriesId and keep the latest task in each series
    recurringTasks.forEach((task) => {
      const seriesId = task.seriesId || task.id;
      const existingTask = latestBySeries.get(seriesId);

      if (
        !existingTask ||
        getTimestampMillis(task.dueDate) >
          getTimestampMillis(existingTask.dueDate)
      ) {
        latestBySeries.set(seriesId, task);
      }
    });

    // today at midnight, so comparisons are based on the date only
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // loop through each recurring task series
    for (const task of latestBySeries.values()) {
      if (!task.dueDate) continue;

      const dueDate = task.dueDate.toDate
        ? task.dueDate.toDate()
        : new Date(task.dueDate);

      dueDate.setHours(0, 0, 0, 0);

      // if the latest task is today or in the future, nothing needs to be created
      if (dueDate >= today) continue;

      const seriesId = task.seriesId || task.id;

      // start from the next due date after the latest task
      let nextDueDate = getNextDueDate(task.recurrence, task.dueDate);
      nextDueDate.setHours(0, 0, 0, 0);

      // create every missed occurrence up to and including today
      // example: if last task was monday and today is friday, this creates tuesday-friday
      while (nextDueDate <= today) {
        // check if this task already exists in the same recurring series
        const alreadyExists = recurringTasks.some((existingTask) => {
          const sameSeries =
            (existingTask.seriesId || existingTask.id) === seriesId;

          return sameSeries && isSameDay(existingTask.dueDate, nextDueDate);
        });

        if (!alreadyExists) {
          const nextDateId = formatDateId(nextDueDate);

          // fixed id prevents duplicates if this function runs more than once
          // example: series123_2026-05-17
          const newTaskId = `${seriesId}_${nextDateId}`;
          const newTaskRef = doc(db, "Task", newTaskId);

          const existingNextTask = await getDoc(newTaskRef);

          // only create the task if the exact document does not already exist
          if (!existingNextTask.exists()) {
            await setDoc(newTaskRef, {
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
        }

        // move to the next occurrence in the series
        // daily moves by 1 day, weekly moves to the next selected weekday
        nextDueDate = getNextDueDate(task.recurrence, nextDueDate);
        nextDueDate.setHours(0, 0, 0, 0);
      }
    }
  } catch (error) {
    console.error("Error reconciling recurring tasks:", error);
  }
};

export const editTask = async (taskId, updatedData) => {
  try {
    const taskRef = doc(db, "Task", taskId);

    // get the existing task so the current due date and seriesId can be preserved if needed
    const snapshot = await getDoc(taskRef);
    const existingTask = snapshot.data();
    let finalDueDate = existingTask.dueDate;

    // if the task is being made recurring, calculate its next due date
    if (updatedData.recurrence) {
      finalDueDate = Timestamp.fromDate(
        getNextDueDate(updatedData.recurrence, new Date()),
      );
    }

    // if it is not recurring, use the edited due date or clear it
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

    // build the data that will be saved back to firestore
    const updatePayload = {
      description: updatedData.description,
      approvalNeeded: updatedData.approvalNeeded,
      category: updatedData.category,
      coins: updatedData.coins,
      recurrence: updatedData.recurrence || null,
      dueDate: finalDueDate,
    };

    // keep the same seriesId so existing recurring tasks stay linked together
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
    // fetch approved tasks, which are treated as completed tasks
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

export const listenToPendingTasks = (childID, callback) => {
  // used by the parent navigator/dashboard to show a badge when approval is needed
  if (!childID) return () => {};

  const q = query(
    collection(db, "Task"),
    where("childID", "==", childID),
    where("status", "==", "pending"),
  );

  // listen in real time and tell the UI whether any pending tasks exist
  const unsubscribe = onSnapshot(q, (snapshot) => {
    callback(!snapshot.empty);
  });

  return unsubscribe;
};
