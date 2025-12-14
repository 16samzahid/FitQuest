import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../screens/Login";
import Welcome from "../screens/Welcome";
import ParentNavigator from "./ParentNavigator";

const Stack = createNativeStackNavigator();

export default function Navigator() {
  const loggedin = true; // Replace with actual authentication logic
  return loggedin ? (
    <ParentNavigator />
  ) : (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Login" component={Login} />
    </Stack.Navigator>
  );
  // <ParentNavigator />
}
