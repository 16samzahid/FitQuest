import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useMode } from "../context/ModeContext";

import BirthYearScreen from "../screens/BirthYearConfirm";
import ChildNavigator from "./ChildNavigator";
import ParentNavigator from "./ParentNavigator";

const Stack = createNativeStackNavigator();

export default function Navigator() {
  const { mode } = useMode();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {mode === "child" ? (
        <>
          <Stack.Screen name="ChildTabs" component={ChildNavigator} />

          <Stack.Screen
            name="BirthYear"
            component={BirthYearScreen}
            options={{ presentation: "modal" }}
          />
        </>
      ) : (
        <Stack.Screen name="ParentTabs" component={ParentNavigator} />
      )}
    </Stack.Navigator>
  );
}
