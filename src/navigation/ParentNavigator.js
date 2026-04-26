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
  const { child } = useAppData();
  const [hasPendingTasks, setHasPendingTasks] = useState(false);

  useEffect(() => {
    if (!child?.id) return;

    const unsubscribe = listenToPendingTasks(child.id, setHasPendingTasks);

    return () => unsubscribe();
  }, [child?.id]);

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarStyle: {
          backgroundColor: "#302ECC",
          borderTopWidth: 0,
        },

        tabBarIcon: ({ color }) => {
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
