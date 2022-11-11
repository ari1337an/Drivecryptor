import React, { useEffect, useLayoutEffect, useState } from 'react'
import { View, Text, Pressable, Alert, ActivityIndicator, Image } from 'react-native'

// Config, Theme
import Config from "../config";
import color_theme from "../color-theme";

// Google Signin
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import GoogleDriveUtil from "../utils/GoogleDriveUtil"

// Google Drive
import { GDrive, MimeTypes } from "@robinbobin/react-native-google-drive-api-wrapper";

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
  ]
});

const LoginScreen = ({ navigation }) => {
  const [focusComplete, setFocusComplete] = useState(false); // 0 -> yet to run 'onScreenFocus', 1-> ran it.
  const [loginStatus, setLoginStatus] = useState(0); // 0 => not logged in, 1 => logged, 2 => processing

  const handleSigninUserInfo = async (userInfoParam) => {
    try {
      const tokens = await GoogleSignin.getTokens(); // retrieve the access token
      let userInfo = userInfoParam

      // Make manipulations
      delete userInfo.idToken; // For now, idToken is not required
      userInfo["accessToken"] = tokens?.accessToken; // populate the access_token once

    } catch (error) {
      console.log(error);
    }
  }

  const onScreenFocus = async () => {
    setFocusComplete(false);
    // Current screen is focused
    try {
      // Check if User is already signed in
      const isSignedIn = await GoogleSignin.isSignedIn();

      if (isSignedIn === true) { // Acknowledge the past signed in user
        setLoginStatus(2)
        const userInfo = await GoogleSignin.signInSilently(); // login to play service silently
        handleSigninUserInfo(userInfo)
        setLoginStatus(1)
        setFocusComplete(true);
        navigation.navigate('DashboardScreen')
      } else {
        setLoginStatus(0);
        setFocusComplete(true);
      }
    } catch (error) {
      console.log(error);
      setFocusComplete(true);
    }
  }

  // Check for current login status when user focuses on the screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onScreenFocus();
    });
    return unsubscribe;
  }, [navigation])

  const SignIn = async () => {
    setLoginStatus(2);
    try {
      await GoogleSignin.hasPlayServices();
      let userInfo = await GoogleSignin.signIn();
      let token = await GoogleSignin.getTokens()
      handleSigninUserInfo(userInfo)
      setLoginStatus(1);

      // Create config.json in appdata space If Not Already Created
      const gdrive = await GoogleDriveUtil.getInstanceFromToken(token.accessToken)
      await GoogleDriveUtil.createConfigFileIfNotExists(gdrive)

      Alert.alert("Success!", `Signed in using ${userInfo.user.email}`)
      navigation.navigate('DashboardScreen')
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) Alert.alert("Failed!", "User Canceled The Login Flow!")
      else if (error.code === statusCodes.IN_PROGRESS) Alert.alert("Ongoing!", "Signin is in progress!")
      else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) Alert.alert("Failed!", "Play Services are not available!")
      else Alert.alert("Failed!", error.message)
      setLoginStatus(0);
    }
  }

  const hasPreviousAccount = async () => {
    const gdrive = new GDrive();
    const currentTokens = await GoogleSignin.getTokens();
    gdrive.accessToken = currentTokens?.accessToken;

    const res = await gdrive.files.list({ spaces: 'appDataFolder' });
    return res.files.length > 0;
  };

  return (
    <View className="flex-1 justify-center items-center">
      <Image
        style={{ width: '50%', height: 200, resizeMode: 'stretch' }}
        source={require('../images/Google-Drive-w-padlock.png')}
      />
      {/*<LockClosedIcon
        color="black" fill="black" size={50}
      />*/}
      <Text className="text-slate-600 text-3xl mt-5">Drivecryptor</Text>
      {
        focusComplete === false && (
          <ActivityIndicator className="mt-10" size="large" color={color_theme.flat_blue1} />
        )
      }
      {
        focusComplete === true && (
          <>
            {
              loginStatus === 0 && (
                <>
                  <Text className="mt-10">Welcome, Guest!</Text>
                  <Pressable onPress={SignIn} className="bg-flat_blue1 px-4 py-3 rounded mt-5 flex-row space-x-2">
                    <Text className="text-white">Signin using google</Text>
                  </Pressable>
                </>
              )
            }
            {
              loginStatus === 1 && (
                <>
                  <Text className="mt-10">Welcome back!</Text>
                  <Pressable onPress={() => navigation.navigate('DashboardScreen')} className="bg-flat_blue1 px-4 py-3 rounded mt-5 flex-row space-x-2">
                    <Text className="text-white">Go to Dashboard</Text>
                  </Pressable>
                </>
              )
            }
            {
              loginStatus === 2 && (
                <>
                  <Text className="mt-10">Please wait!</Text>
                  <Pressable className="bg-flat_blue1 px-4 py-3 rounded mt-5 flex-row space-x-2">
                    <ActivityIndicator size="small" color={color_theme.flat_white1} />
                    <Text className="text-white">Signing in</Text>
                  </Pressable>
                </>
              )
            }
            {/* <>
        <Pressable onPress={() => console.log(currentUser)} className="bg-flat_blue1 px-4 py-3 rounded mt-5 flex-row space-x-2">
          <Text className="text-white">See State</Text>
        </Pressable>
      </> */}
          </>
        )
      }
    </View>
  )
}

export default LoginScreen