import { View, Text, Pressable, Image, Button } from 'react-native'
import React from 'react'
import { StackActions } from '@react-navigation/native';

// Redux
import { useDispatch } from "react-redux";
import { useSelector } from 'react-redux';
import { logout } from "../features/currentUserSlice";

// Google Signin
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Icons
import { UserMinusIcon, FolderIcon, ArrowUpOnSquareStackIcon, CameraIcon } from "react-native-heroicons/solid";

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
      navigation.dispatch(StackActions.popToTop());
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <Header title="Dashboard" onPress={() => navigation.goBack()} showGoBack={false}/>
      <View>
        <Pressable onPress={() => navigation.push("MyFilesScreen")}>
          <DashboardCardItem title="My Files">
            <FolderIcon color="white" fill={color_theme.flat_white1} size={35} />
          </DashboardCardItem>
        </Pressable>
        <Pressable onPress={() => navigation.push("UploadFilesScreen")}>
          <DashboardCardItem title="Upload Files">
            <ArrowUpOnSquareStackIcon color="white" fill={color_theme.flat_white1} size={35} />
          </DashboardCardItem>
        </Pressable>
        <Pressable onPress={Signout}>
          <DashboardCardItem title="Logout" >
            <UserMinusIcon color="white" fill={color_theme.flat_white1} size={35} />
          </DashboardCardItem>
        </Pressable>
        <Pressable className="flex-row justify-end mr-10 mt-5" onPress={() => navigation.navigate("CameraScreen")}>
            <View className="flex-row bg-flat_blue1 font-bold rounded-full px-5 py-5">
              <CameraIcon color="white" fill={color_theme.flat_white1} size={35}/>
            </View>
          </Pressable>
      </View>
    </>

  )
}

export default DashboardScreen