import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { BarChart, PieChart } from "react-native-gifted-charts";
import PagerView from "react-native-pager-view";
import { db } from "../../config/FirebaseConfig";
import { useAppData } from "../context/AppDataContext";

const weekdayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // Sunday=0
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset);
  d.setHours(0, 0, 0, 0);
  return d;
};

const dayIndexFromDate = (d) => {
  const day = d.getDay();
  return day === 0 ? 6 : day - 1;
};

const dateInRange = (date, start, end) => {
  return date >= start && date <= end;
};

export default function ProgressStats() {
  const { child } = useAppData();
  const { width } = useWindowDimensions();
  const [tasks, setTasks] = useState([]);
  const data = [{ value: 50 }, { value: 80 }, { value: 90 }, { value: 70 }];

  useEffect(() => {
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
    const completed = tasks.filter((t) => t.status && t.status !== "notdone");

    const notCompleted = tasks.filter(
      (t) => !t.status || t.status === "notdone",
    );

    const today = new Date();
    const weekStart = getWeekStart(today);
    const weekEnd = new Date(weekStart);

    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekCounts = [0, 0, 0, 0, 0, 0, 0];

    completed.forEach((task) => {
      const timestamp = task.completedAt || task.createdAt;

      if (!timestamp) {
        console.log("NO TIMESTAMP:", task);
        return;
      }

      let date;

      if (timestamp?.toDate) {
        date = timestamp.toDate();
      } else {
        date = new Date(timestamp);
      }

      // DEBUG LOGS
      console.log("completedAt raw:", task.completedAt);
      console.log("converted date:", date);
      console.log("weekStart:", weekStart);
      console.log("weekEnd:", weekEnd);

      if (!dateInRange(date, weekStart, weekEnd)) {
        console.log("OUTSIDE WEEK RANGE");
        return;
      }

      const idx = dayIndexFromDate(date);

      console.log("DAY INDEX:", idx);

      weekCounts[idx] += 1;
      console.log("date:", date);
      console.log("day index:", idx);
    });

    return {
      total: tasks.length,
      completed: completed.length,
      notCompleted: notCompleted.length,

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

      barData: weekdayNames.map((label, i) => ({
        value: weekCounts[i],
        label,
        frontColor: "#302ECC",
      })),
      // barData: [
      //   { value: 0, label: "Mon", frontColor: "#302ECC" },
      //   { value: 0, label: "Tue", frontColor: "#302ECC" },
      //   { value: 0, label: "Wed", frontColor: "#302ECC" },
      //   { value: 0, label: "Thu", frontColor: "#302ECC" },
      //   { value: 0, label: "Fri", frontColor: "#302ECC" },
      //   { value: 3, label: "Sat", frontColor: "#302ECC" },
      //   { value: 0, label: "Sun", frontColor: "#302ECC" },
      // ],
    };
  }, [tasks]);

  return (
    <View className="mt-5 bg-[#E6E5FF] rounded-[40px] px-4 shadow-md relative h-[420px] items-center">
      <Text className="text-[#150F59] text-[20px] font-bold mt-4">
        {child.name}&apos;s Progress Stats
      </Text>

      <View className="h-[86%] w-full bg-white rounded-[40px] mt-2 shadow-md p-3">
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
              Tasks Completed This Week
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
