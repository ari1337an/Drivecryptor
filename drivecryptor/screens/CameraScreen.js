// Core
import {View, Text, StyleSheet, Alert, Pressable} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';

// Utils
import LoginUtils from '../utils/LoginUtils';
import GoogleDriveUtil from '../utils/GoogleDriveUtil';

// Camera
import {Camera, useCameraDevices} from 'react-native-vision-camera';

// Themes, Icons
import color_theme from '../color-theme';
import {CameraIcon} from 'react-native-heroicons/solid';

const CameraScreen = ({navigation}) => {
  const [uploading, setUploading] = useState(false);
  const devices = useCameraDevices();
  const device = devices.front;
  const camera = useRef(null);

  // onFocus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        let gdrive = await GoogleDriveUtil.getInstance();
        let refPicExists = await GoogleDriveUtil.RefPicExists(gdrive);
        if (refPicExists === true) {
          console.log('found ref pic in cam');
          navigation.navigate('DashboardScreen');
        } else {
          Alert.alert(
            'Hold Still!',
            'Take a picture of your face. This picture will be used later as reference.',
          );
          const newCameraPermission = await Camera.requestCameraPermission();
          if (newCameraPermission !== 'authorized') {
            Alert.alert('Camera Permission Needed!', 'Signing you out!');
            await LoginUtils.Signout(navigation);
          }
        }
      } catch (error) {
        console.log(error);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const handlePhotoClick = async () => {
    setUploading(true);
    const photo = await camera.current.takePhoto();
    console.log(photo.path); // upload this to appDataFolder
    const gdrive = await GoogleDriveUtil.getInstance();
    await GoogleDriveUtil.uploadRefPicToAppDataFolder(gdrive, photo.path);
    Alert.alert('Reference Picture Saved!');
    navigation.push('DashboardScreen');
  };

  if (device == null) {
    return (<View className="w-full h-full bg-black"><Text></Text></View>);
  }
  else if(uploading) return <View className="flex-1 justify-center items-center"><Text>Saving picture in cloud...</Text></View>;
  else {
    return (
      <View className="flex-col justify-center items-center">
        <Camera
          className="w-full h-full"
          device={device}
          isActive={true}
          ref={camera}
          photo={true}
          enableZoomGesture
        />
        <Pressable
          onPress={handlePhotoClick}
          className="absolute bottom-0 mb-5 bg-white h-20 w-20 border-2 border-flat_blue1 border-solid rounded-full"></Pressable>
      </View>
    );
  }
};

export default CameraScreen;
