import {
  View,
  Text,
  ActivityIndicator,
  PermissionsAndroid,
  Button,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';

import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {faceRecognition} from '../frameProcessors/faceRecognitionFrameProcessor';
import {runOnJS} from 'react-native-reanimated';
import mimeTypeData from '../utils/mimeTypeData';
// File System
import RNFS from 'react-native-fs';

import ReactNativeBlobUtil from 'react-native-blob-util';
// File Viewer
import FileViewer from 'react-native-file-viewer';

import GoogleDriveUtil from '../utils/GoogleDriveUtil';

const path = RNFS.CachesDirectoryPath;

const FaceRecognitionScreen = ({navigation, route}) => {
  const [loadedRef, setLoadedRef] = useState(true);
  const [refPicPath, setRefPicPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [curStat, setCurStat] = useState('Processing...');
  const [currentPermission, setCurrentPermission] = useState(null);
  const [verified, setVerified] = useState(false);
  const devices = useCameraDevices();
  const device = devices.front;
  const camera = useRef(null);

  useEffect(() => {
    if(curStat === "VERIFIED"){
      const {screenName, parameters} = route.params;
      navigation.push(screenName, parameters);
    }
  },[curStat]);

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    const result = faceRecognition(frame);
    runOnJS(setCurStat)(result);
  }, []);

  const askForPermission = async () => {
    try {
      const status1 = await Camera.requestCameraPermission();
      if (status1 === 'authorized') {
        setCurrentPermission('authorized');
      } else {
        throw new Error('');
      }
    } catch (error) {
      await askForPermission();
    }
  };

  useEffect(() => {
    askForPermission();
  }, []);

  useEffect(() => {
    if (currentPermission === 'authorized') {
      setLoading(false);
    }
  }, [currentPermission]);

  const renderOverlay = () => {
    return (
      <TouchableOpacity
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          backgroundColor: 'white',
          padding: 8,
          borderRadius: 6,
        }}>
        <Text
          style={{
            fontSize: 25,
            justifyContent: 'center',
            textAlign: 'center',
          }}>
          {curStat}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading || device == null || loadedRef === false) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text>Fetching Reference Picture...</Text>
      </View>
    );
  } else {
    return (
      <>
        <Camera
          style={[StyleSheet.absoluteFill]}
          device={device}
          isActive={true}
          ref={camera}
          frameProcessor={frameProcessor}
          frameProcessorFps={1} // Change this later
          preset="cif-352x288"
        />
        {renderOverlay()}
      </>
    );
  }
};

export default FaceRecognitionScreen;
