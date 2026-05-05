import {
  dateInRange,
  dayIndexFromDate,
  getNextDueDate,
  getWeekStart,
  isDueToday,
} from "./timeUtils";

// Unit tests for date helpers used by task scheduling and weekly behavior.
describe("getWeekStart", () => {
  it("returns Monday for a midweek date", () => {
    // A Wednesday should be normalized to the Monday start of that week.
    const date = new Date("2024-06-19"); // Wednesday

    const result = getWeekStart(date);

    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(5); // June = 5
    expect(result.getDate()).toBe(17);
  });

  it("returns same date if already Monday", () => {
    // If the date is already Monday, the result should be unchanged.
    const date = new Date("2024-06-17");

    const result = getWeekStart(date);

    expect(result.getDate()).toBe(17);
  });

  it("handles Sunday correctly", () => {
    // Sunday should map back to the Monday of the same week.
    const date = new Date("2024-06-23"); // Sunday

    const result = getWeekStart(date);

    expect(result.getDate()).toBe(17);
  });
});

describe("dayIndexFromDate", () => {
  // Verify mapping from JS date to the custom app weekday index.
  it("returns 0 for Sunday", () => {
    // Sunday is mapped to index 6 because the app week begins on Monday.
    const date = new Date("2024-06-23");
    const result = dayIndexFromDate(date);
    expect(result).toBe(6);
  });

  it("returns 1 for Monday", () => {
    // Monday should be returned as the first active index in the app.
    const date = new Date("2024-06-17");
    const result = dayIndexFromDate(date);
    expect(result).toBe(0);
  });

  it("returns 2 for Tuesday", () => {
    const date = new Date("2024-06-18");
    const result = dayIndexFromDate(date);
    expect(result).toBe(1);
  });

  it("returns 3 for Wednesday", () => {
    const date = new Date("2024-06-19");
    const result = dayIndexFromDate(date);
    expect(result).toBe(2);
  });

  it("returns 4 for Thursday", () => {
    const date = new Date("2024-06-20");
    const result = dayIndexFromDate(date);
    expect(result).toBe(3);
  });

  it("returns 5 for Friday", () => {
    const date = new Date("2024-06-21");
    const result = dayIndexFromDate(date);
    expect(result).toBe(4);
  });

  it("returns 6 for Saturday", () => {
    const date = new Date("2024-06-22");
    const result = dayIndexFromDate(date);
    expect(result).toBe(5);
  });

  it("handles edge case of Sunday correctly", () => {
    // Sunday should still come back as the last index in the week mapping.
    const date = new Date("2024-06-23");
    const result = dayIndexFromDate(date);
    expect(result).toBe(6);
  });
});

describe("dateInRange", () => {
  // Validate whether a given date falls inside a week range.
  it("returns true for date within range", () => {
    // A date inside the boundaries should return true.
    const date = new Date("2024-06-19");
    const start = new Date("2024-06-17");
    const end = new Date("2024-06-23");
    expect(dateInRange(date, start, end)).toBe(true);
  });

  it("returns false for date before range", () => {
    // A date before the start boundary should return false.
    const date = new Date("2024-06-16");
    const start = new Date("2024-06-17");
    const end = new Date("2024-06-23");
    expect(dateInRange(date, start, end)).toBe(false);
  });

  it("returns false for date after range", () => {
    // A date after the end boundary should return false.
    const date = new Date("2024-06-24");
    const start = new Date("2024-06-17");
    const end = new Date("2024-06-23");
    expect(dateInRange(date, start, end)).toBe(false);
  });
});

describe("isDueToday", () => {
  // Confirm due date detection for tasks shown in the UI.
  it("returns true for task due today", () => {
    // A task with the current day as its due date should return true.
    const today = new Date();
    const task = {
      dueDate: {
        toDate: () => today,
      },
    };
    expect(isDueToday(task)).toBe(true);
  });

  it("returns false for task due tomorrow", () => {
    // A task due tomorrow should not be considered due today.
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const task = {
      dueDate: {
        toDate: () => tomorrow,
      },
    };
    expect(isDueToday(task)).toBe(false);
  });

  it("returns false for task due yesterday", () => {
    // A task due before today should return false.
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const task = {
      dueDate: {
        toDate: () => yesterday,
      },
    };
    expect(isDueToday(task)).toBe(false);
  });

  it("returns false for task with no due date", () => {
    // If there is no dueDate field, the task is not due today.
    const task = {};
    expect(isDueToday(task)).toBe(false);
  });
});

describe("getNextDueDate", () => {
  // Ensure recurring due dates advance to the next expected weekday.
  it("returns next Monday when today is Sunday", () => {
    // From Sunday, the next Monday should be the following day.
    const fromDate = new Date("2024-06-23"); // Sunday
    const result = getNextDueDate("Monday", fromDate);
    expect(result.getDay()).toBe(1);
    expect(result.getDate()).toBe(24);
  });

  it("returns next Tuesday when today is Monday", () => {
    // From Monday, the next Tuesday should be the next calendar day.
    const fromDate = new Date("2024-06-17"); // Monday
    const result = getNextDueDate("Tuesday", fromDate);
    expect(result.getDay()).toBe(2);
    expect(result.getDate()).toBe(18);
  });

  it("returns next Wednesday when today is Tuesday", () => {
    const fromDate = new Date("2024-06-18");
    const result = getNextDueDate("Wednesday", fromDate);
    expect(result.getDay()).toBe(3);
    expect(result.getDate()).toBe(19);
  });

  it("returns next Thursday when today is Wednesday", () => {
    const fromDate = new Date("2024-06-19");
    const result = getNextDueDate("Thursday", fromDate);
    expect(result.getDay()).toBe(4);
    expect(result.getDate()).toBe(20);
  });

  it("returns next Friday when today is Thursday", () => {
    const fromDate = new Date("2024-06-20");
    const result = getNextDueDate("Friday", fromDate);
    expect(result.getDay()).toBe(5);
    expect(result.getDate()).toBe(21);
  });

  it("returns next Saturday when today is Friday", () => {
    const fromDate = new Date("2024-06-21");
    const result = getNextDueDate("Saturday", fromDate);
    expect(result.getDay()).toBe(6);
    expect(result.getDate()).toBe(22);
  });
});
