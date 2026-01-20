import FontAwesome from "@expo/vector-icons/FontAwesome";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useMode } from "../context/ModeContext";
import ManageTasks from "../screens/parent/ManageTasks";
import ParentDashboard from "../screens/parent/ParentDashboard";
import Settings from "../screens/parent/Settings";

const Tab = createBottomTabNavigator();

export default function ParentNavigator() {
  const { setMode } = useMode();
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Dashboard: "home",
            ManageTasks: "tasks",
            Settings: "cog",
          };

          return (
            <FontAwesome name={icons[route.name]} color={color} size={size} />
          );
        },
        tabBarActiveTintColor: "#101010",
        tabBarInactiveTintColor: "#fffefe",
        tabBarLabelPosition: "below-icon",
        tabBarActiveBackgroundColor: "#d1d5db",
      })}
    >
      <Tab.Screen
        options={{
          tabBarStyle: { backgroundColor: "#2C7ED0" },
        }}
        name="Dashboard"
        component={ParentDashboard}
      />
      <Tab.Screen
        options={{
          tabBarStyle: { backgroundColor: "#2C7ED0" },
        }}
        name="ManageTasks"
        component={ManageTasks}
      />
      <Tab.Screen
        options={{
          tabBarStyle: { backgroundColor: "#2C7ED0" },
        }}
        name="Settings"
        component={Settings}
      />
    </Tab.Navigator>
  );
}
