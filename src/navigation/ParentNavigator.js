import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
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
        headerRight: () => (
          <Ionicons
            name="swap-horizontal"
            size={22}
            className="text-gray-700"
            style={{ marginRight: 15 }}
            onPress={() => {
              setMode("child");
            }}
          />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={ParentDashboard} />
      <Tab.Screen name="ManageTasks" component={ManageTasks} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}
