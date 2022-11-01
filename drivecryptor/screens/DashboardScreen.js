import { View, Text, Pressable, Image } from 'react-native'
import React from 'react'

// Redux
import { useDispatch } from "react-redux";
import { useSelector } from 'react-redux';
import { logout } from "../features/currentUserSlice";

// Google Signin
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Icons
import { Bars3Icon, UserMinusIcon, FolderIcon } from "react-native-heroicons/solid";

// Colors Theme
import color_theme from "../color-theme";

// Components
import DashboardCardItem from "../components/DashboardCardItem";

const DashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(store => store.currentUser.value)

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
    <>
      <View className="flex-row items-center justify-between px-4 py-4 bg-flat_blue2 mb-2">
        <Bars3Icon color="white" fill="white" size={35} />
        <Text className="font-medium text-white text-2xl">DriveCryptor</Text>
        <Image
          className="h-8 w-8 rounded-full"
          source={{
            uri: currentUser?.user?.photo,
          }}
        />
      </View>
      <View>
        <Pressable onPress={() => navigation.navigate("MyFilesScreen")}>
          <DashboardCardItem title="My Files">
            <FolderIcon color="white" fill={color_theme.flat_white1} size={35} />
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