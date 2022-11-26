// Core
import React from 'react';

// React Navigation
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Screens
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import MyFilesScreen from './screens/MyFilesScreen';
import BrowseDirectoryScreen from './screens/BrowseDirectoryScreen';
import UploadFilesScreen from './screens/UploadFilesScreen';
import CameraScreen from './screens/CameraScreen';
import QueueTask from './screens/QueueTask';
import FaceVerificationScreen from './screens/FaceVerificationScreen';
import FaceVerificationTest from './screens/FaceVerificationTest';
import FaceVerificationNavigationInterrupt from './screens/FaceVerificationNavigationInterrupt';
import CurRefPic from './screens/CurRefPic';
import ImageViewScreen from './screens/ImageViewScreen';
import PDFViewScreen from './screens/PDFViewScreen';

// Notification Handler
import notifee from '@notifee/react-native';

const Stack = createNativeStackNavigator();

const config = {
  screens: {
    QueueTask: 'allqueue',
  },
};

function App() {
  // Notificaion on Background
  notifee.onBackgroundEvent(async () => {});
  
  return (
    <NavigationContainer
      linking={{
        prefixes: ['drivecryptor://app'],
        config,
      }}>
      <Stack.Navigator
        initialRouteName="LoginScreen"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="QueueTask" component={QueueTask} />
        <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
        <Stack.Screen name="CameraScreen" component={CameraScreen} />
        <Stack.Screen
          name="MyFilesScreen"
          component={MyFilesScreen}
          initialParams={{folderID: 'root', folderName: '/'}}
        />
        <Stack.Screen
          name="BrowseDirectoryScreen"
          component={BrowseDirectoryScreen}
          initialParams={{
            folderID: 'root',
            selectedFileInfo: null,
            folderName: '/',
          }}
        />
        <Stack.Screen
          name="UploadFilesScreen"
          component={UploadFilesScreen}
          initialParams={{
            uploadDirID: 'root',
            uploadDirName: '/',
            uploadFileInfo: null,
          }}
        />
        <Stack.Screen
          name="FaceVerificationScreen"
          component={FaceVerificationScreen}
          initialParams={{
            uuid: null,
            data: null,
          }}
        />
        <Stack.Screen
          name="FaceVerificationNavigationInterrupt"
          component={FaceVerificationNavigationInterrupt}
          initialParams={{
            screenName: null,
            parameters: null,
          }}
        />
        <Stack.Screen
          name="FaceVerificationTest"
          component={FaceVerificationTest}
        />
        <Stack.Screen
          name="CurRefPic"
          component={CurRefPic}
        />
        <Stack.Screen
          name="PDFViewScreen"
          component={PDFViewScreen}
          initialParams={{filePath: null}}
        />
        <Stack.Screen
          name="ImageViewScreen"
          component={ImageViewScreen}
          initialParams={{filePath: null}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
