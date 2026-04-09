import {
  dateInRange,
  dayIndexFromDate,
  getNextDueDate,
  getWeekStart,
  isDueToday,
} from "./timeUtils";

describe("getWeekStart", () => {
  it("returns Monday for a midweek date", () => {
    const date = new Date("2024-06-19"); // Wednesday

    const result = getWeekStart(date);

    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(5); // June = 5
    expect(result.getDate()).toBe(17);
  });

  it("returns same date if already Monday", () => {
    const date = new Date("2024-06-17");

    const result = getWeekStart(date);

    expect(result.getDate()).toBe(17);
  });

  it("handles Sunday correctly", () => {
    const date = new Date("2024-06-23"); // Sunday

    const result = getWeekStart(date);

    expect(result.getDate()).toBe(17);
  });
});

describe("dayIndexFromDate", () => {
  it("returns 0 for Sunday", () => {
    const date = new Date("2024-06-23");
    const result = dayIndexFromDate(date);
    expect(result).toBe(6);
  });

  it("returns 1 for Monday", () => {
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
    const date = new Date("2024-06-23");
    const result = dayIndexFromDate(date);
    expect(result).toBe(6);
  });
});

describe("dateInRange", () => {
  it("returns true for date within range", () => {
    const date = new Date("2024-06-19");
    const start = new Date("2024-06-17");
    const end = new Date("2024-06-23");
    expect(dateInRange(date, start, end)).toBe(true);
  });

  it("returns false for date before range", () => {
    const date = new Date("2024-06-16");
    const start = new Date("2024-06-17");
    const end = new Date("2024-06-23");
    expect(dateInRange(date, start, end)).toBe(false);
  });

  it("returns false for date after range", () => {
    const date = new Date("2024-06-24");
    const start = new Date("2024-06-17");
    const end = new Date("2024-06-23");
    expect(dateInRange(date, start, end)).toBe(false);
  });
});

describe("isDueToday", () => {
  it("returns true for task due today", () => {
    const today = new Date();
    const task = {
      dueDate: {
        toDate: () => today,
      },
    };
    expect(isDueToday(task)).toBe(true);
  });

  it("returns false for task due tomorrow", () => {
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
    const task = {};
    expect(isDueToday(task)).toBe(false);
  });
});

describe("getNextDueDate", () => {
  it("returns next Monday when today is Sunday", () => {
    const fromDate = new Date("2024-06-23"); // Sunday
    const result = getNextDueDate("Monday", fromDate);
    expect(result.getDay()).toBe(1);
    expect(result.getDate()).toBe(24);
  });

  it("returns next Tuesday when today is Monday", () => {
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
