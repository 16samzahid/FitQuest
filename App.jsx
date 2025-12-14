import { NavigationContainer } from '@react-navigation/native';
import './src/global.css';
import Navigator from './src/navigation/Navigator';

const App = () => {
    const role = 'user'
    return (
        <NavigationContainer>
            <Navigator />
        </NavigationContainer>
    )
}

export default App