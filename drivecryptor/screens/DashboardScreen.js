// Core 
import {View, Pressable, Linking} from 'react-native';
import React,{useEffect} from 'react';

// Themes, Icons
import color_theme from '../color-theme';
import {
  UserMinusIcon,
  FolderIcon,
  ArrowUpOnSquareStackIcon,
  CameraIcon,
  QueueListIcon,
} from 'react-native-heroicons/solid';

// Components
import DashboardCardItem from '../components/DashboardCardItem';
import Header from '../components/Header';

// Utils
import LoginUtils from '../utils/LoginUtils';
import GoogleDriveUtil from '../utils/GoogleDriveUtil';

const DashboardScreen = ({navigation}) => {

  // onFocus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        let gdrive = await GoogleDriveUtil.getInstance();
        let refPicExists = await GoogleDriveUtil.RefPicExists(gdrive);
        if (refPicExists === false) {
          navigation.navigate("CameraScreen");
        }
      } catch (error) {
        console.log(error);
      }
    });
    return unsubscribe;
  }, [navigation]);


  return (
    <>
      <Header
        title="Dashboard"
        onPress={() => navigation.goBack()}
        showGoBack={false}
      />
      <View>
        <Pressable onPress={() => navigation.push('MyFilesScreen')}>
          <DashboardCardItem title="My Files">
            <FolderIcon
              color="white"
              fill={color_theme.flat_white1}
              size={35}
            />
          </DashboardCardItem>
        </Pressable>
        <Pressable onPress={() => navigation.push('UploadFilesScreen')}>
          <DashboardCardItem title="Upload Files">
            <ArrowUpOnSquareStackIcon
              color="white"
              fill={color_theme.flat_white1}
              size={35}
            />
          </DashboardCardItem>
        </Pressable>
        <Pressable
          onPress={() => navigation.push('QueueTask')}>
          <DashboardCardItem title="Preview(s)">
            <QueueListIcon
              color="white"
              fill={color_theme.flat_white1}
              size={35}
            />
          </DashboardCardItem>
        </Pressable>
        <Pressable onPress={() => LoginUtils.Signout(navigation)}>
          <DashboardCardItem title="Logout">
            <UserMinusIcon
              color="white"
              fill={color_theme.flat_white1}
              size={35}
            />
          </DashboardCardItem>
        </Pressable>
        {/* <Pressable
          className="flex-row justify-end mr-10 mt-5"
          onPress={() => navigation.navigate('CameraScreen')}>
          <View className="flex-row bg-flat_blue1 font-bold rounded-full px-5 py-5">
            <CameraIcon
              color="white"
              fill={color_theme.flat_white1}
              size={35}
            />
          </View>
        </Pressable> */}
      </View>
    </>
  );
};

export default DashboardScreen;
