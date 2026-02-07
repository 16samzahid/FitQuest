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
