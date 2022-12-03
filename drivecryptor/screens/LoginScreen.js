// Core
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
  DeviceEventEmitter,
} from 'react-native';

// Config, Color Themes
import Config from '../config';
import color_theme from '../color-theme';

// Google Signin
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import GoogleDriveUtil from '../utils/GoogleDriveUtil';

// Google Drive
import {GDrive} from '@robinbobin/react-native-google-drive-api-wrapper';

import {CheckCircleIcon, CheckIcon} from 'react-native-heroicons/solid';

// Google Signin Configurations
GoogleSignin.configure({
  androidClientId: Config.GOOGLE_OAUTH_ANDROID_CLIENT_ID,
  webClientId: Config.GOOGLE_OAUTH_WEB_CLIENT_ID,
  offlineAccess: false,
  scopes: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.appdata',
  ],
});

const LoginScreen = ({navigation}) => {
  const [focusComplete, setFocusComplete] = useState(false); // 0 -> yet to run 'onScreenFocus', 1-> ran it.
  const [loginStatus, setLoginStatus] = useState(0); // 0 => not logged in, 1 => logged, 2 => processing
  const [foundAppData, setFoundAppData] = useState(false);
  const [eventMessages, setEventMessages] = useState([]);

  useEffect(() => {
    const onLoginScreenEventRun = params => {
      // console.log('Event Emitter [LoginScreenEvents]:', params);
      setEventMessages(current => [...current, params]);
    };
    const subscription = DeviceEventEmitter.addListener(
      'LoginScreenEvents',
      onLoginScreenEventRun,
    );
    return () => subscription.remove();
  }, []);

  // onFocus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      (async () => {
        setFocusComplete(false);
        setEventMessages([]);
        try {
          const isSignedIn = await GoogleSignin.isSignedIn();
          if (isSignedIn === true) {
            setLoginStatus(2);
            await GoogleSignin.signInSilently();
            DeviceEventEmitter.emit(
              'LoginScreenEvents',
              'Successfully Signed In!',
            );
            const token = await GoogleSignin.getTokens();
            await loadAppData(token);
            setLoginStatus(1);
            setFocusComplete(true);
          } else {
            setLoginStatus(0);
            setFocusComplete(true);
          }
        } catch (error) {
          console.log(error);
          setFocusComplete(true);
        }
      })();
    });
    return unsubscribe;
  }, [navigation]);

  // onLoginSuccess
  useEffect(() => {
    if (loginStatus === 1 && foundAppData === true) {
      navigation.navigate('DashboardScreen');
    } else if (loginStatus === 1 && foundAppData === false) {
      navigation.navigate('CameraScreen');
    }
  }, [loginStatus, foundAppData]);

  // loads AppData & Cache them
  const loadAppData = async token => {
    const accessToken = token.accessToken;
    const gdrive = await GoogleDriveUtil.getInstanceFromToken(accessToken);
    const refPicExists = await GoogleDriveUtil.loadAppData(gdrive);
    DeviceEventEmitter.emit('LoginScreenEvents', 'AppData Synced!');
    if (refPicExists === true) setFoundAppData(true);
    else setFoundAppData(false);
  };

  const SignIn = async () => {
    setLoginStatus(2);
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      let token = await GoogleSignin.getTokens();
      DeviceEventEmitter.emit('LoginScreenEvents', 'Successfully Signed In!');
      await loadAppData(token);
      setLoginStatus(1);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED)
        Alert.alert('Failed!', 'User Canceled The Login Flow!');
      else if (error.code === statusCodes.IN_PROGRESS)
        Alert.alert('Ongoing!', 'Signin is in progress!');
      else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE)
        Alert.alert('Failed!', 'Play Services are not available!');
      else Alert.alert('Failed!', error.message);
      setLoginStatus(0);
    }
  };

  return (
    <View className="flex-1 justify-center items-center">
      <Image
        style={{width: '50%', height: 200, resizeMode: 'stretch'}}
        source={require('../images/Google-Drive-w-padlock.png')}
      />
      <Text className="text-slate-600 text-3xl mt-5">Drivecryptor</Text>
      {(focusComplete === false || (focusComplete === true && loginStatus === 2 ))&& (
        <>
          <View className="mt-5">
            {eventMessages.map((item, i) => {
              return (
                <View
                  key={i}
                  className="flex-row gap-x-2 justify-start items-center">
                  <CheckCircleIcon
                    color="black"
                    fill={color_theme.flat_green1}
                    size={35}
                  />
                  <Text>{item}</Text>
                </View>
              );
            })}
            <View className="mt-2 flex-row gap-x-2 justify-center items-center">
              <ActivityIndicator
                size="small"
                color={color_theme.flat_midnight1}
              />
              <Text>Please Wait...</Text>
            </View>
          </View>
        </>
      )}
      {focusComplete === true && (
        <>
          {loginStatus === 0 && (
            <>
              <Text className="mt-10">Welcome, Guest!</Text>
              <Pressable
                onPress={SignIn}
                className="bg-flat_blue1 px-4 py-3 rounded mt-5 flex-row space-x-2">
                <Text className="text-white">Signin using google</Text>
              </Pressable>
            </>
          )}
          {loginStatus === 1 && (
            <>
              <Text className="mt-10">Please wait!</Text>
              <Pressable className="bg-flat_blue1 px-4 py-3 rounded mt-5 flex-row space-x-2">
                <ActivityIndicator
                  size="small"
                  color={color_theme.flat_white1}
                />
                <Text className="text-white">Please wait</Text>
              </Pressable>
            </>
          )}
          {/* {loginStatus === 2 && (
            <>
              <View className="mt-5">
                {eventMessages.map((item, i) => {
                  return (
                    <View
                      key={i}
                      className="flex-row gap-x-2 justify-center items-center">
                      <CheckCircleIcon
                        color="black"
                        fill={color_theme.flat_green1}
                        size={35}
                      />
                      <Text>{item}</Text>
                    </View>
                  );
                })}
                <View className="flex-row gap-x-2 justify-center items-center">
                  <ActivityIndicator
                    size="small"
                    color={color_theme.flat_midnight1}
                  />
                  <Text>Please Wait...</Text>
                </View>
              </View>
            </>
          )} */}
        </>
      )}
    </View>
  );
};

export default LoginScreen;
