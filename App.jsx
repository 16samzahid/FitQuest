import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppDataProvider } from "./src/context/AppDataContext";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { ModeProvider } from "./src/context/ModeContext";
import "./src/global.css";
import Navigator from "./src/navigation/Navigator";
import Login from "./src/screens/Login";

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // or splash

  return user ? (
    <ModeProvider>
      <AppDataProvider>
        <NavigationContainer>
          <Navigator />
        </NavigationContainer>
      </AppDataProvider>
    </ModeProvider>
  ) : (
    <Login />
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
