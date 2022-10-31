import React, { useEffect, useState } from 'react'
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native'

// Configs
import Config from "../config";
import color_theme from "../color-theme";

// Google Signin
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// Redux
import { useDispatch } from "react-redux";
import { useSelector } from 'react-redux';
import { login } from "../features/currentUserSlice";


// Icons
import { LockClosedIcon } from "react-native-heroicons/solid";

// Google Signin Configurations
GoogleSignin.configure({
  androidClientId: Config.GOOGLE_OAUTH_ANDROID_CLIENT_ID,
  webClientId: Config.GOOGLE_OAUTH_WEB_CLIENT_ID,
  offlineAccess: true,
  scopes: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/drive']
});

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(store => store.currentUser.value)
  const [loginStatus, setLoginStatus] = useState( Number(currentUser != null) ); // 0 => not logged in, 1 => logged, 2 => processing

  // If Logged in, then redirect to Dashboard
  useEffect(() => {
    if(currentUser == null) setLoginStatus(0)
    if(loginStatus === 1) navigation.navigate('DashboardScreen')
  })
  

  const SignIn = async () => {
    setLoginStatus(2);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      

      //////////////////////////////////////////////
      console.log(userInfo); // TODO: remove this in future
      const token = userInfo; // TODO: change this later into some token/key/something 
      //////////////////////////////////////////////
      
      dispatch(login(token));
      Alert.alert("Success!", `Signed in using ${userInfo.user.email}`)
      setLoginStatus(1);
      navigation.navigate('DashboardScreen')
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) Alert.alert("Failed!", "User Canceled The Login Flow!")
      else if (error.code === statusCodes.IN_PROGRESS) Alert.alert("Ongoing!", "Signin is in progress!")
      else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) Alert.alert("Failed!", "Play Services are not available!")
      else Alert.alert("Failed!", error.message)
      setLoginStatus(0);
    }
  }

  return (
    <View className="flex-1 justify-center items-center">
      <LockClosedIcon
        color="black" fill="black" size={50}
      />
      <Text className="text-slate-600 text-3xl mt-5">Drivecryptor</Text>
      <Text className="mt-10">Welcome, Guest!</Text>
      {
        loginStatus === 0 && (
          <Pressable onPress={SignIn} className="bg-flat_darkgreen2 px-4 py-3 rounded mt-5 flex-row space-x-2">
            <Text className="text-white">Signin using google</Text>
          </Pressable>
        )
      }
      {
        loginStatus === 2 && (
          <Pressable onPress={SignIn} className="bg-flat_darkgreen2 px-4 py-3 rounded mt-5 flex-row space-x-2">
            <ActivityIndicator size="small" color={color_theme.flat_white1} />
            <Text className="text-white">Signing in</Text>
          </Pressable>
        )
      }
    </View>
  )
}

export default LoginScreen