import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  approveTask,
  completeTask,
  createTask,
  deleteTask,
  editTask,
  rejectTask,
} from "./taskService";

jest.mock("firebase/firestore", () => ({
  addDoc: jest.fn(),
  collection: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  increment: jest.fn((value) => `increment(${value})`),
  Timestamp: {
    now: jest.fn(() => "MOCK_NOW"),
    fromDate: jest.fn((date) => `MOCK_TIMESTAMP(${date})`),
  },
  updateDoc: jest.fn(),
}));

jest.mock("../../config/FirebaseConfig", () => ({
  db: "MOCK_DB",
}));

describe("taskService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createTask", () => {
    it("should call addDoc with correct parameters", async () => {
      const taskData = {
        title: "Test Task",
        description: "This is a test task",
        dueDate: "MOCK_DUE_DATE",
        recurrence: "daily",
      };

      const mockCollectionRef = { id: "mock-task-collection" };
      collection.mockReturnValue(mockCollectionRef);
      addDoc.mockResolvedValue({ id: "123" });

      await createTask(taskData);

      expect(collection).toHaveBeenCalledWith("MOCK_DB", "Task");
      expect(addDoc).toHaveBeenCalledWith(mockCollectionRef, taskData);
    });
  });

  describe("rejectTask", () => {
    it("should update task status to notdone", async () => {
      doc.mockReturnValue("mockTaskRef");
      updateDoc.mockResolvedValue(undefined);

      await rejectTask("123");

      expect(doc).toHaveBeenCalledWith("MOCK_DB", "Task", "123");
      expect(updateDoc).toHaveBeenCalledWith("mockTaskRef", {
        status: "notdone",
      });
    });
  });

  describe("deleteTask", () => {
    it("should delete the task", async () => {
      doc.mockReturnValue("mockTaskRef");
      deleteDoc.mockResolvedValue(undefined);

      await deleteTask("123");

      expect(doc).toHaveBeenCalledWith("MOCK_DB", "Task", "123");
      expect(deleteDoc).toHaveBeenCalledWith("mockTaskRef");
    });
  });

  describe("completeTask", () => {
    it("should update task status to pending if approval is needed", async () => {
      const mockTask = {
        approvalNeeded: true,
      };
      doc.mockReturnValue("mockTaskRef");
      getDoc.mockResolvedValue({ data: () => mockTask });
      updateDoc.mockResolvedValue(undefined);
      await completeTask("123");
      expect(doc).toHaveBeenCalledWith("MOCK_DB", "Task", "123");
      expect(getDoc).toHaveBeenCalledWith("mockTaskRef");
      expect(updateDoc).toHaveBeenCalledWith("mockTaskRef", {
        status: "pending",
      });
    });

    it("should call approveTask if approval is not needed", async () => {
      const mockTask = {
        approvalNeeded: false,
      };
      doc.mockReturnValue("mockTaskRef");
      getDoc.mockResolvedValue({ data: () => mockTask });
      updateDoc.mockResolvedValue(undefined);
      await completeTask("123");
      expect(doc).toHaveBeenCalledWith("MOCK_DB", "Task", "123");
      expect(getDoc).toHaveBeenCalledWith("mockTaskRef");
      expect(updateDoc).toHaveBeenCalledWith("mockTaskRef", {
        status: "approved",
        completedAt: "MOCK_NOW",
      });
    });
  });

  describe("approveTask", () => {
    it("should update task status to approved and set completedAt", async () => {
      const mockTask = {
        coins: 10,
        childID: "child123",
      };
      doc.mockReturnValue("mockTaskRef");
      getDoc.mockResolvedValue({ data: () => mockTask });
      updateDoc.mockResolvedValue(undefined);
      await approveTask("123");
      expect(doc).toHaveBeenCalledWith("MOCK_DB", "Task", "123");
      expect(updateDoc).toHaveBeenCalledWith("mockTaskRef", {
        status: "approved",
        completedAt: "MOCK_NOW",
      });
    });
  });

  describe("editTask", () => {
    it("should update task with edited fields", async () => {
      doc.mockReturnValue("mockTaskRef");
      getDoc.mockResolvedValue({
        data: () => ({
          dueDate: "OLD_DUE_DATE",
        }),
      });
      updateDoc.mockResolvedValue(undefined);

      const updatedData = {
        description: "This is an updated task",
        approvalNeeded: true,
        category: "Exercise",
        coins: 20,
        recurrence: null,
        dueDate: null,
      };

      await editTask("123", updatedData);

      expect(doc).toHaveBeenCalledWith("MOCK_DB", "Task", "123");
      expect(updateDoc).toHaveBeenCalledWith("mockTaskRef", {
        description: "This is an updated task",
        approvalNeeded: true,
        category: "Exercise",
        coins: 20,
        recurrence: null,
        dueDate: null,
      });
    });
  });
});
