import { NavigationContainer } from '@react-navigation/native';
import { ModeProvider } from './src/context/ModeContext';
import './src/global.css';
import Navigator from './src/navigation/Navigator';

const App = () => {
    const role = 'user'
    return (
        <ModeProvider>
            <NavigationContainer>
                <Navigator />
            </NavigationContainer>
        </ModeProvider>
    )
}

export default App