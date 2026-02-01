import { ScrollView } from "react-native";
import TaskCard from "./TaskCard";

function Tasks() {
  // will instead take tasks from the parent and display using v-for
  const colors = [
    "bg-red",
    "bg-green",
    "bg-blue",
    "bg-lightBlue",
    "bg-orange",
    "bg-red",
    "bg-green",
    "bg-blue",
    "bg-lightBlue",
    "bg-orange",
    "bg-red",
    "bg-green",
  ];

  return (
    <ScrollView
      className="mt-6 space-y-4 rounded-t-3xl px-2 shadow-md bg-white p-5"
      showsVerticalScrollIndicator={false}
    >
      {colors.map((color, index) => (
        <TaskCard key={index} color={color} />
      ))}
    </ScrollView>
  );
}

export default Tasks;
