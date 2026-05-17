// this component shows the child's progress stats on the parent dashboard
// it uses charts to show completed vs not completed tasks, and task completion over time
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { BarChart, PieChart } from "react-native-gifted-charts";
import PagerView from "react-native-pager-view";
import { db } from "../../config/FirebaseConfig";
import { useAppData } from "../context/AppDataContext";
import { dateInRange, dayIndexFromDate, getWeekStart } from "../timeUtils";

// labels for the weekly bar chart
const weekdayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ProgressStats() {
  // get the current child so the dashboard only shows their task data
  const { child } = useAppData();

  // screen width is used to size the bar chart properly on different devices
  const { width } = useWindowDimensions();

  // stores all tasks fetched from firestore
  const [tasks, setTasks] = useState([]);

  // controls whether the charts show weekly, monthly or yearly data
  const [range, setRange] = useState("week");

  // labels for the yearly bar chart
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // gets the first day of the current month
  const getMonthStart = (date) => {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // gets the last day of the current month
  const getMonthEnd = (date) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  // gets the first day of the current year
  const getYearStart = (date) => {
    const d = new Date(date);
    d.setMonth(0, 1);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // gets the last day of the current year
  const getYearEnd = (date) => {
    const d = new Date(date);
    d.setMonth(11, 31);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  useEffect(() => {
    // if no child profile is loaded, clear the task data
    if (!child?.id) {
      setTasks([]);
      return;
    }

    // listen to all tasks for this child in real time
    // this keeps the dashboard updated when tasks are completed or changed
    const q = query(collection(db, "Task"), where("childID", "==", child.id));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTasks(items);
    });

    // clean up the firestore listener when the child changes or the component unmounts
    return unsubscribe;
  }, [child]);

  const stats = useMemo(() => {
    // calculate the chart data whenever the tasks or selected range changes
    const today = new Date();

    let rangeStart;
    let rangeEnd;
    let barData = [];
    let chartTitle = "";
    let filteredTasks = [];

    if (range === "week") {
      // week view uses the current monday-sunday week
      rangeStart = getWeekStart(today);
      rangeEnd = new Date(rangeStart);
      rangeEnd.setDate(rangeEnd.getDate() + 6);
      rangeEnd.setHours(23, 59, 59, 999);

      // keep tasks that fall within this week
      // completedAt is preferred, but dueDate/createdAt are used as fallbacks
      filteredTasks = tasks.filter((task) => {
        const timestamp = task.completedAt || task.dueDate || task.createdAt;
        if (!timestamp) return false;

        const date = timestamp?.toDate
          ? timestamp.toDate()
          : new Date(timestamp);

        return dateInRange(date, rangeStart, rangeEnd);
      });

      // approved tasks count as completed
      const completed = filteredTasks.filter((t) => t.status === "approved");

      // notdone or missing status counts as not completed
      const notCompleted = filteredTasks.filter(
        (t) => !t.status || t.status === "notdone",
      );

      // one count for each weekday
      const weekCounts = [0, 0, 0, 0, 0, 0, 0];

      // count how many tasks were completed on each day of the week
      completed.forEach((task) => {
        const timestamp = task.completedAt || task.createdAt;
        if (!timestamp) return;

        const date = timestamp?.toDate
          ? timestamp.toDate()
          : new Date(timestamp);

        if (!dateInRange(date, rangeStart, rangeEnd)) return;

        const idx = dayIndexFromDate(date);
        weekCounts[idx] += 1;
      });

      // convert the weekly counts into the format needed by BarChart
      barData = weekdayNames.map((label, i) => ({
        value: weekCounts[i],
        label,
        frontColor: "#302ECC",
      }));

      chartTitle = "Tasks Completed This Week";

      // return all the data needed by both the pie chart and bar chart
      return {
        total: filteredTasks.length,
        completed: completed.length,
        notCompleted: notCompleted.length,
        chartTitle,
        pieData: [
          {
            value: completed.length,
            color: "#4A90E2",
            text: `${completed.length}`,
          },
          {
            value: notCompleted.length,
            color: "#C4C4C4",
            text: `${notCompleted.length}`,
          },
        ],
        barData,
      };
    }

    if (range === "month") {
      // month view uses the current calendar month
      rangeStart = getMonthStart(today);
      rangeEnd = getMonthEnd(today);

      // keep tasks that fall within this month
      filteredTasks = tasks.filter((task) => {
        const timestamp = task.completedAt || task.dueDate || task.createdAt;
        if (!timestamp) return false;

        const date = timestamp?.toDate
          ? timestamp.toDate()
          : new Date(timestamp);

        return dateInRange(date, rangeStart, rangeEnd);
      });

      const completed = filteredTasks.filter((t) => t.status === "approved");
      const notCompleted = filteredTasks.filter(
        (t) => !t.status || t.status === "notdone",
      );

      // split the month into 5 rough week groups
      const weeklyCounts = [0, 0, 0, 0, 0];

      completed.forEach((task) => {
        const timestamp = task.completedAt || task.createdAt;
        if (!timestamp) return;

        const date = timestamp?.toDate
          ? timestamp.toDate()
          : new Date(timestamp);

        if (!dateInRange(date, rangeStart, rangeEnd)) return;

        // place task into week 1-5 based on the day of the month
        const dayOfMonth = date.getDate();
        let weekIndex = Math.floor((dayOfMonth - 1) / 7);
        if (weekIndex > 4) weekIndex = 4;

        weeklyCounts[weekIndex] += 1;
      });

      // convert monthly week groups into bar chart data
      barData = weeklyCounts.map((value, i) => ({
        value,
        label: `W${i + 1}`,
        frontColor: "#302ECC",
      }));

      chartTitle = "Tasks Completed This Month";

      return {
        total: filteredTasks.length,
        completed: completed.length,
        notCompleted: notCompleted.length,
        chartTitle,
        pieData: [
          {
            value: completed.length,
            color: "#4A90E2",
            text: `${completed.length}`,
          },
          {
            value: notCompleted.length,
            color: "#C4C4C4",
            text: `${notCompleted.length}`,
          },
        ],
        barData,
      };
    }

    if (range === "year") {
      // year view uses the current calendar year
      rangeStart = getYearStart(today);
      rangeEnd = getYearEnd(today);

      // keep tasks that fall within this year
      filteredTasks = tasks.filter((task) => {
        const timestamp = task.completedAt || task.dueDate || task.createdAt;
        if (!timestamp) return false;

        const date = timestamp?.toDate
          ? timestamp.toDate()
          : new Date(timestamp);

        return dateInRange(date, rangeStart, rangeEnd);
      });

      const completed = filteredTasks.filter((t) => t.status === "approved");
      const notCompleted = filteredTasks.filter(
        (t) => !t.status || t.status === "notdone",
      );

      // one count for each month
      const monthCounts = new Array(12).fill(0);

      // count completed tasks by month
      completed.forEach((task) => {
        const timestamp = task.completedAt || task.createdAt;
        if (!timestamp) return;

        const date = timestamp?.toDate
          ? timestamp.toDate()
          : new Date(timestamp);

        if (!dateInRange(date, rangeStart, rangeEnd)) return;

        const monthIndex = date.getMonth();
        monthCounts[monthIndex] += 1;
      });

      // convert monthly counts into bar chart data
      barData = monthNames.map((label, i) => ({
        value: monthCounts[i],
        label,
        frontColor: "#302ECC",
      }));

      chartTitle = "Tasks Completed This Year";

      return {
        total: filteredTasks.length,
        completed: completed.length,
        notCompleted: notCompleted.length,
        chartTitle,
        pieData: [
          {
            value: completed.length,
            color: "#4A90E2",
            text: `${completed.length}`,
          },
          {
            value: notCompleted.length,
            color: "#C4C4C4",
            text: `${notCompleted.length}`,
          },
        ],
        barData,
      };
    }

    // fallback if no valid range is selected
    return {
      total: 0,
      completed: 0,
      notCompleted: 0,
      chartTitle: "",
      pieData: [],
      barData: [],
    };
  }, [tasks, range]);

  return (
    <View className="mt-5 bg-[#E6E5FF] rounded-[40px] px-4 shadow-md relative h-[420px] items-center">
      {/* dashboard title using the child's name */}
      <Text className="text-[#150F59] text-[20px] font-bold mt-4">
        {child.name}&apos;s Progress Stats
      </Text>

      <View className="h-[86%] w-full bg-white rounded-[40px] mt-2 shadow-md p-3">
        {/* range selector for week, month and year views */}
        <View className="flex-row justify-center gap-2 mb-2">
          {["week", "month", "year"].map((item) => (
            <Text
              key={item}
              onPress={() => setRange(item)}
              className={`px-4 py-2 rounded-full overflow-hidden text-sm font-medium ${
                range === item
                  ? "bg-[#302ECC] text-white"
                  : "bg-[#E6E5FF] text-[#302ECC]"
              }`}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          ))}
        </View>

        {/* pager lets the parent swipe between the pie chart and bar chart */}
        <PagerView style={{ flex: 1 }} initialPage={0}>
          {/* pie chart shows completed compared with not completed */}
          <View key="1" className="flex-1 items-center justify-center">
            <Text className="text-[#393F74] font-bold text-lg mb-2">
              Completed vs Not Completed
            </Text>

            <PieChart
              data={stats.pieData}
              showText
              donut
              radius={85}
              innerRadius={40}
              textStyle={{
                fontSize: 13,
                color: "#1F2D6D",
              }}
              centerLabelComponent={() => (
                <Text className="text-[#302ECC] text-base font-semibold">
                  {stats.total} total
                </Text>
              )}
            />

            {/* chart legend so the parent understands the colours */}
            <View className="flex-row gap-6 mt-4">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-[#4A90E2] mr-2" />
                <Text className="text-sm">Completed</Text>
              </View>

              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-[#C4C4C4] mr-2" />
                <Text className="text-sm">Not completed</Text>
              </View>
            </View>
          </View>

          {/* bar chart shows completed task counts over time */}
          <View key="2" className="flex-1 items-center justify-center">
            <Text className="text-[#393F74] font-bold text-lg text-center mb-3">
              {stats.chartTitle}
            </Text>

            <BarChart
              data={stats.barData}
              width={width - 80}
              barWidth={24}
              spacing={18}
              initialSpacing={8}
              endSpacing={8}
              barBorderRadius={6}
              fromZero
              hideYAxisText
              yAxisThickness={0}
              xAxisThickness={0}
              // hideRules
              stepValue={0.5}
            />
          </View>
        </PagerView>

        {/* hint for the parent that there is another chart page */}
        <View className="items-center">
          <Text className="text-md text-gray-500">
            {"<"} Swipe for more stats{" >"}
          </Text>
        </View>
      </View>
    </View>
  );
}
