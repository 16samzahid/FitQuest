import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { BarChart, PieChart } from "react-native-gifted-charts";
import PagerView from "react-native-pager-view";
import { db } from "../../config/FirebaseConfig";
import { useAppData } from "../context/AppDataContext";
import { dateInRange, dayIndexFromDate, getWeekStart } from "../timeUtils";

const weekdayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ProgressStats() {
  const { child } = useAppData();
  // The chart width is based on the screen width so the bar chart fits nicely.
  const { width } = useWindowDimensions();
  const [tasks, setTasks] = useState([]);
  const [range, setRange] = useState("week");
  // Labels used for the year view bar chart.
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

  // Helper functions to build date ranges for month and year views.
  const getMonthStart = (date) => {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getMonthEnd = (date) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const getYearStart = (date) => {
    const d = new Date(date);
    d.setMonth(0, 1);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getYearEnd = (date) => {
    const d = new Date(date);
    d.setMonth(11, 31);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  useEffect(() => {
    // Subscribe to the current child's task collection and keep local state up to date.
    if (!child?.id) {
      setTasks([]);
      return;
    }

    const q = query(collection(db, "Task"), where("childID", "==", child.id));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(items);
    });

    return unsubscribe;
  }, [child]);

  const stats = useMemo(() => {
    // Compute all chart data for the selected time range at render time.
    const today = new Date();

    let rangeStart;
    let rangeEnd;
    let barData = [];
    let chartTitle = "";
    let filteredTasks = [];

    if (range === "week") {
      // Week view: use the current week and count completed tasks per day.
      rangeStart = getWeekStart(today);
      rangeEnd = new Date(rangeStart);
      rangeEnd.setDate(rangeEnd.getDate() + 6);
      rangeEnd.setHours(23, 59, 59, 999);

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

      const weekCounts = [0, 0, 0, 0, 0, 0, 0];

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

      barData = weekdayNames.map((label, i) => ({
        value: weekCounts[i],
        label,
        frontColor: "#302ECC",
      }));

      chartTitle = "Tasks Completed This Week";

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
      // Month view: show task activity across the current calendar month.
      rangeStart = getMonthStart(today);
      rangeEnd = getMonthEnd(today);

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

      const weeklyCounts = [0, 0, 0, 0, 0];

      completed.forEach((task) => {
        const timestamp = task.completedAt || task.createdAt;
        if (!timestamp) return;

        const date = timestamp?.toDate
          ? timestamp.toDate()
          : new Date(timestamp);
        if (!dateInRange(date, rangeStart, rangeEnd)) return;

        const dayOfMonth = date.getDate();
        let weekIndex = Math.floor((dayOfMonth - 1) / 7);
        if (weekIndex > 4) weekIndex = 4;

        weeklyCounts[weekIndex] += 1;
      });

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
      // Year view: aggregate completed tasks by month for the current year.
      rangeStart = getYearStart(today);
      rangeEnd = getYearEnd(today);

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

      const monthCounts = new Array(12).fill(0);

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
      <Text className="text-[#150F59] text-[20px] font-bold mt-4">
        {child.name}&apos;s Progress Stats
      </Text>

      <View className="h-[86%] w-full bg-white rounded-[40px] mt-2 shadow-md p-3">
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
        <PagerView style={{ flex: 1 }} initialPage={0}>
          {/* PIE CHART */}
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

            {/* LEGEND */}
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

          {/* BAR CHART */}
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
        <View className="items-center">
          <Text className="text-md text-gray-500">
            {"<"} Swipe for more stats{" >"}
          </Text>
        </View>
      </View>
    </View>
  );
}
