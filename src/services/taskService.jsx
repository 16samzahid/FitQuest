import {
    addDoc,
    collection
} from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";

export const createTask = async (taskData) => {
  return await addDoc(collection(db, "Task"), taskData);
};
