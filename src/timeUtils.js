export const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // Sunday=0
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const dayIndexFromDate = (d) => {
  const day = d.getDay();
  return day === 0 ? 6 : day - 1;
};

export const dateInRange = (date, start, end) => {
  return date >= start && date <= end;
};

export const isDueToday = (task) => {
  const today = new Date();

  // check exact date match
  if (task.dueDate) {
    const due = task.dueDate.toDate();

    const sameExactDate =
      due.getFullYear() === today.getFullYear() &&
      due.getMonth() === today.getMonth() &&
      due.getDate() === today.getDate();

    if (sameExactDate) return true;
  }

  return false;
};

const weekdayMap = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export const getNextDueDate = (recurrenceDay, fromDate) => {
  const base = fromDate?.toDate ? fromDate.toDate() : new Date(fromDate);
  base.setHours(0, 0, 0, 0);
  const todayIndex = base.getDay();
  const targetIndex = weekdayMap[recurrenceDay];
  let diff = targetIndex - todayIndex;

  // move forward at least 1 week
  if (diff <= 0) {
    diff += 7;
  }

  const nextDate = new Date(base);
  nextDate.setDate(base.getDate() + diff);
  return nextDate;
};
