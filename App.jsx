import { NavigationContainer } from "@react-navigation/native";
import { AppDataProvider } from "./src/context/AppDataContext";
import { ModeProvider } from "./src/context/ModeContext";
import "./src/global.css";
import Navigator from "./src/navigation/Navigator";

const App = () => {
  return (
    <ModeProvider>
      <AppDataProvider>
        <NavigationContainer>
          <Navigator />
        </NavigationContainer>
      </AppDataProvider>
    </ModeProvider>
  );
};

export default App;
