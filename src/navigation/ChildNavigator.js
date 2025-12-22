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
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: "home",
            Pet: "paw",
          };

          return (
            <Ionicons name={icons[route.name]} color={color} size={size} />
          );
        },
        headerRight: () => (
          <Ionicons
            name="swap-horizontal"
            size={22}
            className="text-gray-700"
            style={{ marginRight: 15 }}
            onPress={() => {
              setMode("parent");
            }}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={ChildHome} />
      <Tab.Screen name="Pet" component={ChildPet} />
    </Tab.Navigator>
  );
}
