import { ScrollView } from "react-native";
import TaskCard from "./TaskCard";

function Tasks() {
  return (
    <ScrollView
      className="mt-6 space-y-4 rounded-t-3xl px-2 shadow-md bg-white p-5"
      showsVerticalScrollIndicator={false}
    >
      <TaskCard />
      <TaskCard />
      <TaskCard />
      <TaskCard />
      <TaskCard />
      <TaskCard />
      <TaskCard />
      <TaskCard />
      <TaskCard />
      <TaskCard />
      <TaskCard />
      <TaskCard />
    </ScrollView>
  );
}

export default Tasks;
