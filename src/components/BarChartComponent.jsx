import { View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

export default function BarChartComponent() {
  const data = [
    { value: 50, label: "Jan" },
    { value: 80, label: "Feb" },
    { value: 90, label: "Mar" },
    { value: 70, label: "Apr" },
  ];

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <BarChart
        data={data}
        barWidth={30}
        frontColor="#4A90E2"
        barBorderRadius={6}
        yAxisThickness={0}
        xAxisLabelTextStyle={{ color: "#333" }}
        isAnimated
      />
    </View>
  );
}
