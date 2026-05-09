import { FontAwesome5 } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import { useAppData } from "../context/AppDataContext";
import ManageTasks from "../screens/parent/ManageTasks";
import ParentDashboard from "../screens/parent/ParentDashboard";
import Settings from "../screens/parent/Settings";
import { listenToPendingTasks } from "../services/taskService";

const Tab = createBottomTabNavigator();

export default function ParentNavigator() {
  // Bottom tab navigator for parent mode with Dashboard, Tasks, and Settings
  const { child } = useAppData();
  const [hasPendingTasks, setHasPendingTasks] = useState(false);

  useEffect(() => {
    // Keep the parent tab route aware of pending tasks for this child.
    // This hook updates the badge state when the child's pending task count changes.
    if (!child?.id) return;

    const unsubscribe = listenToPendingTasks(child.id, setHasPendingTasks);

    return () => unsubscribe();
  }, [child?.id]);

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        // Hide the native header because the tab navigator handles top-level layout.
        headerShown: false,

        // Style the tab bar consistently across parent screens.
        tabBarStyle: {
          backgroundColor: "#302ECC",
          borderTopWidth: 0,
        },

        tabBarIcon: ({ color }) => {
          // Map each parent tab route to a FontAwesome icon name.
          const icons = {
            Dashboard: "home",
            Tasks: "tasks",
            Settings: "cog",
          };

          return (
            <FontAwesome5
              name={icons[route.name]}
              color={color}
              size={24}
              solid
            />
          );
        },

        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "rgba(255,255,255,0.5)",
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={ParentDashboard}
        options={{
          // Show a red badge if there are pending tasks
          tabBarBadge: hasPendingTasks ? "" : undefined,
          tabBarBadgeStyle: {
            backgroundColor: "#FF0000",
          },
        }}
      />

      <Tab.Screen name="Tasks" component={ManageTasks} />

      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}
