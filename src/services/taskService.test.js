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

// Mock Firestore operations so taskService unit tests focus on behavior
// and do not perform real network or database calls.
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
  // Shared setup for taskService tests: clear mocks and suppress console output.
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
      // Ensure a new task is created in the Firestore Task collection
      // with the data passed into createTask.
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
      // Verify that rejecting a task updates its status to notdone
      // so the child can complete it again.
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
      // Confirm that deleteTask removes the task document
      // from Firestore using the task ID.
      doc.mockReturnValue("mockTaskRef");
      deleteDoc.mockResolvedValue(undefined);

      await deleteTask("123");

      expect(doc).toHaveBeenCalledWith("MOCK_DB", "Task", "123");
      expect(deleteDoc).toHaveBeenCalledWith("mockTaskRef");
    });
  });

  describe("completeTask", () => {
    it("should update task status to pending if approval is needed", async () => {
      // When a task requires parent approval, completing it should
      // set status to pending rather than approved.
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
      // If no approval is required, completing the task should
      // mark it approved and record the completion timestamp.
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
      // Approving a task should set its status to approved and
      // assign the current timestamp to completedAt.
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
      // Verify that editing a task sends the updated fields to Firestore,
      // including changing due date and recurrence settings.
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
