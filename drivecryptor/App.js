import * as React from 'react';

// React Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import MyFilesScreen from './screens/MyFilesScreen';
import BrowseDirectoryScreen from './screens/BrowseDirectoryScreen';
import UploadFilesScreen from './screens/UploadFilesScreen';

// Redux 
import store from './redux/store'
import { Provider } from 'react-redux'

const Stack = createNativeStackNavigator();

function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName='LoginScreen'
          screenOptions={{headerShown: false}}
        >
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
          <Stack.Screen name="MyFilesScreen" component={MyFilesScreen} initialParams={{ folderID: "root" }}/>
          <Stack.Screen name="BrowseDirectoryScreen" component={BrowseDirectoryScreen} initialParams={{ folderID: "root", selectedFileInfo: null, folderName: "/" }}/>
          <Stack.Screen name="UploadFilesScreen" component={UploadFilesScreen} initialParams={{ uploadDirID: "root", uploadDirName: "/", uploadFileInfo: null }}/>
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

export default App;