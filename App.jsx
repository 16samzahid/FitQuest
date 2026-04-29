// Polyfill for AbortSignal.any() for React Native compatibility
// This is needed because some versions of React Native do not support AbortSignal.any() natively.
if (typeof AbortSignal !== "undefined" && !AbortSignal.any) {
  AbortSignal.any = function (signals) {
    const controller = new AbortController();
    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort(signal.reason);
        return controller.signal;
      }
      signal.addEventListener("abort", () => {
        controller.abort(signal.reason);
      });
    }
    return controller.signal;
  };
}

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppDataProvider } from "./src/context/AppDataContext";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { ModeProvider } from "./src/context/ModeContext";
import "./src/global.css";
import Navigator from "./src/navigation/Navigator";
import Login from "./src/screens/Login";
import Signup from "./src/screens/Signup";
import Welcome from "./src/screens/Welcome";

const AuthStack = createNativeStackNavigator();

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // or splash

  return (
    <NavigationContainer>
      {user ? (
        <ModeProvider>
          <AppDataProvider>
            <Navigator />
          </AppDataProvider>
        </ModeProvider>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={Login} />
          <AuthStack.Screen name="Signup" component={Signup} />
          <AuthStack.Screen name="Welcome" component={Welcome} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
