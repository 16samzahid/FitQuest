import { ScrollView, Text, View } from "react-native";
import EditTaskCard from "./EditTaskCard";

export default function TasksSection({ title }) {
  // fixed height (adjust as needed) so multiple sections stack and the
  // parent ScrollView handles overflow
  const sectionHeight = 280; // about 15rem / 240px

  return (
    <View style={{ height: sectionHeight }} className="flex-none">
      <Text className="text-black font-bold text-xl">{title}</Text>
      <ScrollView className="mt-3 flex-1 rounded-[20px] bg-white p-4 mb-4 shadow-md">
        <EditTaskCard text="Clean Room" title={title} />
        <EditTaskCard text="Do Homework" title={title} />
        <EditTaskCard text="Go for a Walk" title={title} />
        <EditTaskCard text="Read a Book" title={title} />
      </ScrollView>
    </View>
  );
}
