import { View, Text, Pressable, Image } from 'react-native'
import React from 'react'

// Redux
import { useDispatch } from "react-redux";
import { useSelector } from 'react-redux';
import { logout } from "../features/currentUserSlice";

// Google Signin
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Icons
import { UserMinusIcon, FolderIcon, ArrowUpOnSquareStackIcon } from "react-native-heroicons/solid";

// Colors Theme
import color_theme from "../color-theme";

// Components
import DashboardCardItem from "../components/DashboardCardItem";
import Header from '../components/Header';

const DashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(store => store.currentUser.value)

  const Signout = async () => {
    try {
      await GoogleSignin.signOut();
      dispatch(logout());
      navigation.navigate('LoginScreen')
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <Header title="Dashboard" onPress={() => navigation.goBack()}/>
      <View>
        <Pressable onPress={() => navigation.navigate("MyFilesScreen")}>
          <DashboardCardItem title="My Files">
            <FolderIcon color="white" fill={color_theme.flat_white1} size={35} />
          </DashboardCardItem>
        </Pressable>
        <Pressable onPress={() => navigation.navigate("UploadFilesScreen")}>
          <DashboardCardItem title="Upload Files">
            <ArrowUpOnSquareStackIcon color="white" fill={color_theme.flat_white1} size={35} />
          </DashboardCardItem>
        </Pressable>
        <Pressable onPress={Signout}>
          <DashboardCardItem title="Logout" >
            <UserMinusIcon color="white" fill={color_theme.flat_white1} size={35} />
          </DashboardCardItem>
        </Pressable>
      </View>
    </>

  )
}

export default DashboardScreen