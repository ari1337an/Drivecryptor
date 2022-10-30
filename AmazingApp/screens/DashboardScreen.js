import { View, Text, Pressable } from 'react-native'
import React from 'react'

// Redux
import { useDispatch } from "react-redux";
import { useSelector } from 'react-redux';
import { logout } from "../features/currentUserSlice";

// Google Signin
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const DashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const Signout = async () => {
    try {
      await GoogleSignin.signOut();
      await dispatch(logout());
      await navigation.navigate('LoginScreen')
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <View classNam="flex-1 justify-center items-center">
      <Text>DashboardScreen</Text>
      <Pressable onPress={Signout} className="bg-flat_red1 px-4 py-3 rounded mt-5 flex-row space-x-2">
        <Text className="text-white">Signout</Text>
      </Pressable>
    </View>
  )
}

export default DashboardScreen