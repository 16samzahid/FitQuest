import { ScrollView, Text, View } from "react-native";
import EditTaskCard from "./EditTaskCard";

export default function TasksSection({ title }) {
  // fixed height (adjust as needed) so multiple sections stack and the
  // parent ScrollView handles overflow
  const sectionHeight = 240; // about 15rem / 240px

  return (
    <View style={{ height: sectionHeight }} className="flex-none">
      <Text className="text-black font-bold text-xl">{title}</Text>
      <ScrollView className="mt-3 flex-1 rounded-[20px] bg-white p-4 shadow-md mb-4">
        <EditTaskCard text="Clean Room" />
        <EditTaskCard text="Do Homework" />
        <EditTaskCard text="Go for a Walk" />
        <EditTaskCard text="Read a Book" />
      </ScrollView>
    </View>
  );
}
