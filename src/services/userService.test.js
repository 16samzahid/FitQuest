import { addDoc, collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { Alert } from "react-native";
import {
  createParentAndChild,
  editChildName,
  editParentPin,
} from "./userService";

// Mock React Native and Firestore dependencies so userService tests remain isolated.
jest.mock("react-native", () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock("firebase/firestore", () => ({
  addDoc: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  Timestamp: {
    now: jest.fn(() => "MOCK_NOW"),
  },
  updateDoc: jest.fn(),
}));

jest.mock("../../config/FirebaseConfig", () => ({
  db: "MOCK_DB",
}));

jest.spyOn(Alert, "alert").mockImplementation(() => {});

describe("userService", () => {
  // Shared setup for userService tests: clear mocks and avoid console noise.
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createParentAndChild", () => {
    it("creates parent, child and three default tasks", async () => {
      // Verify that creating a new parent record also creates
      // a child profile and three default tasks in Firestore.
      const parentID = "parent123";

      doc.mockImplementation((...args) => {
        if (args.length === 3) return `doc-${args[1]}-${args[2]}`;

        return {
          id: "child123",
          path: "Child/child123",
        };
      });

      collection.mockImplementation((db, collectionName) => {
        return `collection-${collectionName}`;
      });

      setDoc.mockResolvedValue(undefined);
      addDoc.mockResolvedValue({ id: "task123" });

      await createParentAndChild(parentID);

      expect(doc).toHaveBeenCalledWith("MOCK_DB", "Parent", "parent123");

      expect(setDoc).toHaveBeenCalledWith("doc-Parent-parent123", {
        name: "parentname",
        pin: "1234",
      });

      expect(collection).toHaveBeenCalledWith("MOCK_DB", "Child");

      expect(setDoc).toHaveBeenCalledWith(
        {
          id: "child123",
          path: "Child/child123",
        },
        expect.objectContaining({
          coins: 0,
          happiness: 80,
          health: 80,
          hunger: 80,
          level: 1,
          name: "childname",
          parentID: "parent123",
          xp: 0,
          pet: {
            colourID: "red_id",
            mood: "happy",
          },
        }),
      );

      expect(addDoc).toHaveBeenCalledTimes(3);

      expect(addDoc).toHaveBeenCalledWith(
        "collection-Task",
        expect.objectContaining({
          category: "Water",
          childID: "child123",
          description: "Drink a glass of water",
          recurrence: "daily",
          status: "notdone",
        }),
      );

      expect(addDoc).toHaveBeenCalledWith(
        "collection-Task",
        expect.objectContaining({
          category: "Food",
          childID: "child123",
          description: "Eat a piece of fruit",
        }),
      );

      expect(addDoc).toHaveBeenCalledWith(
        "collection-Task",
        expect.objectContaining({
          category: "Exercise",
          childID: "child123",
          description: "Do 5 star jumps",
        }),
      );
    });
  });

  describe("editChildName", () => {
    it("updates child name", async () => {
      // Ensure editing a child name updates the Child record
      // and triggers a success alert.
      doc.mockReturnValue("mockChildRef");
      updateDoc.mockResolvedValue(undefined);

      await editChildName("child123", "New Name");

      expect(doc).toHaveBeenCalledWith("MOCK_DB", "Child", "child123");

      expect(updateDoc).toHaveBeenCalledWith("mockChildRef", {
        name: "New Name",
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "Success",
        "Child name updated successfully",
      );
    });
  });

  describe("editParentPin", () => {
    it("updates parent PIN", async () => {
      // Confirm that changing the parent's PIN updates the Parent document.
      doc.mockReturnValue("mockParentRef");
      updateDoc.mockResolvedValue(undefined);

      await editParentPin("parent123", "5678");

      expect(doc).toHaveBeenCalledWith("MOCK_DB", "Parent", "parent123");

      expect(updateDoc).toHaveBeenCalledWith("mockParentRef", {
        pin: "5678",
      });
    });
  });
});
