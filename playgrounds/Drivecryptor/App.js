import {
  View,
  Text,
  ActivityIndicator,
  PermissionsAndroid,
  NativeModules,
  Button,
  Pressable,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';

import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {faceRecognition} from './frameProcessors/faceRecognitionFrameProcessor';
import ReactNativeBlobUtil from 'react-native-blob-util';

const {FaceRecognitionModule} = NativeModules;

const App = () => {
  const [loading, setLoading] = useState(true);
  const [currentPermission, setCurrentPermission] = useState(null);
  const devices = useCameraDevices();
  const device = devices.front;
  const camera = useRef(null);

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    // const faceRecog = faceRecognition(frame);
    // console.log(faceRecog);
    console.log('ran frame');
  }, []);

  const askForPermission = async () => {
    try {
      const status1 = await Camera.requestCameraPermission();
      const status2 = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      if (
        status1 === 'authorized' &&
        status2 === PermissionsAndroid.RESULTS.GRANTED
      ) {
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

  const handlePhotoClick = async () => {
    try {
      const photo = await camera.current.takePhoto();
      const photoPath = photo.path;
      console.log(photoPath);
      const res = await FaceRecognitionModule.detectAndSaveFace("file://" + photoPath);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  if (loading || device == null) {
    return (
      <View>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  } else {
    return (
      <Pressable 
      onPress={handlePhotoClick}
      style={{justifyContent: 'center', alignItems: 'center'}}>
        <Camera
          style={{width: '100%', height: '100%'}}
          device={device}
          isActive={true}
          ref={camera}
          photo={true}
          // frameProcessor={frameProcessor}
          // frameProcessorFps={0.1}
          preset="cif-352x288"
        />
      </Pressable>

      // <View>
      //   <Text>Loading...</Text>
      // </View>
    );
  }
};

export default App;
