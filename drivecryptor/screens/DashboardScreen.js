// Core
import {
  View,
  Pressable,
  BackHandler,
  Alert,
  ActivityIndicator,
  Text,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';

// Themes, Icons
import color_theme from '../color-theme';
import {
  UserMinusIcon,
  FolderIcon,
  ArrowUpOnSquareStackIcon,
  CameraIcon,
  QueueListIcon,
  TrashIcon,
  FolderArrowDownIcon,
  ArrowUpOnSquareIcon,
} from 'react-native-heroicons/solid';

// Components
import DashboardCardItem from '../components/DashboardCardItem';
import Header from '../components/Header';

// Utils
import LoginUtils from '../utils/LoginUtils';
import GoogleDriveUtil from '../utils/GoogleDriveUtil';
import {useFocusEffect} from '@react-navigation/native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

const DashboardScreen = ({navigation}) => {
  // Double Backpress
  const [resetting, setResetting] = useState(false);
  const [pressedBackBtn, setPressedBackBtn] = useState(false);
  useEffect(() => {
    if (pressedBackBtn === true) {
      LoginUtils.Signout(navigation);
      setPressedBackBtn(false);
    }
  }, [pressedBackBtn]);
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert('Are you sure?', 'Are you sure you want to logout?', [
          {text: 'No', style: 'cancel', onPress: () => {}},
          {
            text: 'Yes',
            style: 'destructive',
            // If the user confirmed, then we dispatch the action we blocked earlier
            // This will continue the action that had triggered the removal of the screen
            onPress: () => setPressedBackBtn(true),
          },
        ]);

        return true;
      };
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, []),
  );

  useEffect(() => {
    if (resetting === true) GoogleDriveUtil.resetAppData(navigation);
  }, [resetting]);

  // onFocus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        let gdrive = await GoogleDriveUtil.getInstance();
        let refPicExists = await GoogleDriveUtil.RefPicExists(gdrive);
        if (refPicExists === false) {
          navigation.navigate('CameraScreen');
        }
      } catch (error) {
        console.log(error);
      }
    });
    return unsubscribe;
  }, [navigation]);

  if (resetting) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text>Please Wait...</Text>
      </View>
    );
  } else {
    return (
      <>
        <Header
          title="Dashboard"
          onPress={() => navigation.goBack()}
          showGoBack={false}
        />
        <View>
          <Pressable
            onPress={() =>
              navigation.push('FaceVerificationNavigationInterrupt', {
                screenName: 'MyFilesScreen',
              })
            }>
            <DashboardCardItem title="My Drive">
              <FolderIcon
                color="white"
                fill={color_theme.flat_white1}
                size={35}
              />
            </DashboardCardItem>
          </Pressable>
          <Pressable
            onPress={() =>
              navigation.push('FaceVerificationNavigationInterrupt', {
                screenName: 'UploadFilesScreen',
              })
            }>
            <DashboardCardItem title="Upload Files">
              <ArrowUpOnSquareIcon
                color="white"
                fill={color_theme.flat_white1}
                size={35}
              />
            </DashboardCardItem>
          </Pressable>
          <Pressable
            onPress={() =>
              navigation.push('FaceVerificationNavigationInterrupt', {
                screenName: 'UploadingTasks',
              })
            }>
            <DashboardCardItem title="Upload Task(s)">
              <ArrowUpOnSquareStackIcon
                color="white"
                fill={color_theme.flat_white1}
                size={35}
              />
            </DashboardCardItem>
          </Pressable>
          <Pressable
            onPress={() =>
              navigation.push('FaceVerificationNavigationInterrupt', {
                screenName: 'QueueTask',
              })
            }>
            <DashboardCardItem title="Download Task(s)">
              <FolderArrowDownIcon
                color="white"
                fill={color_theme.flat_white1}
                size={35}
              />
            </DashboardCardItem>
          </Pressable>
          <Pressable onPress={() => navigation.push('FaceVerificationTest')}>
            <DashboardCardItem title="Face Verification Test">
              <QueueListIcon
                color="white"
                fill={color_theme.flat_white1}
                size={35}
              />
            </DashboardCardItem>
          </Pressable>
          {/* <Pressable onPress={() => navigation.push('CurRefPic')}>
            <DashboardCardItem title="View Reference Picture">
              <QueueListIcon
                color="white"
                fill={color_theme.flat_white1}
                size={35}
              />
            </DashboardCardItem>
          </Pressable> */}
          <Pressable onPress={() => setResetting(true)}>
            <DashboardCardItem title="Reset AppData">
              <TrashIcon
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
        </View>
      </>
    );
  }
};

export default DashboardScreen;
