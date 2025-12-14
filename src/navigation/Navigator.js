import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Details from "../screens/Details";
import Login from "../screens/Login";

const Stack = createNativeStackNavigator();

export default function Navigator() {
  const role = "parent";
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Details" component={Details} />
    </Stack.Navigator>
  );
}
