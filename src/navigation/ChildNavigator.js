import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ChildHome from "../screens/child/ChildHome";
import ChildPet from "../screens/child/ChildPet";

const Tab = createBottomTabNavigator();

export default function ChildNavigator() {
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
      })}
    >
      <Tab.Screen name="Home" component={ChildHome} />
      <Tab.Screen name="Pet" component={ChildPet} />
    </Tab.Navigator>
  );
}
