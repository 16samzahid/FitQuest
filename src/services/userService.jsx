import { collection, doc, setDoc } from "firebase/firestore";
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
      level: 1,
      name: "childname",
      parentID: parentID,
      pet: {
        colourID: "red_id",
        imageURL:
          "https://firebasestorage.googleapis.com/v0/b/fitquest-c9d82.firebasestorage.app/o/bodies%2Fred.png?alt=media&token=75d0adc9-945d-400f-8a57-f160c0dd6d46",
      },
      xp: 0,
    });
    console.log("Child created and linked to parent ID:", parentID);

    console.log("Parent and child created successfully");
  } catch (error) {
    console.error("Error creating parent/child:", error);
  }
};
