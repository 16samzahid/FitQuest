import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useMode } from "../context/ModeContext";
import ChildHome from "../screens/child/ChildHome";
import ChildPet from "../screens/child/ChildPet";

const Tab = createBottomTabNavigator();

export default function ChildNavigator() {
  const { setMode } = useMode();
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: "home",
            Pet: "paw",
          };

          return <Ionicons name={icons[route.name]} color={color} size={32} />;
        },
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#b8b9ba",
        tabBarLabelPosition: "below-icon",
      })}
    >
      <Tab.Screen
        options={{
          tabBarStyle: { backgroundColor: "#393EA6" },
        }}
        name="Home"
        component={ChildHome}
      />
      <Tab.Screen
        options={{
          tabBarStyle: { backgroundColor: "#D02C2C" },
        }}
        name="Pet"
        component={ChildPet}
      />
    </Tab.Navigator>
  );
}
