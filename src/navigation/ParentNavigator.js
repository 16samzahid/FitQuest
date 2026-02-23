import { FontAwesome5 } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ManageTasks from "../screens/parent/ManageTasks";
import ParentDashboard from "../screens/parent/ParentDashboard";
import Settings from "../screens/parent/Settings";

const Tab = createBottomTabNavigator();

export default function ParentNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarStyle: {
          backgroundColor: "#2C7ED0",
          borderTopWidth: 0,
        },

        tabBarIcon: ({ color }) => {
          const icons = {
            Dashboard: "home",
            Tasks: "tasks", // ← FontAwesome5 version
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
      <Tab.Screen name="Dashboard" component={ParentDashboard} />
      <Tab.Screen name="Tasks" component={ManageTasks} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}
