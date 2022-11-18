import React from 'react';
import { NativeModules, Button } from 'react-native';

const FaceDetectionScreen = () => {
  const { FaceDetection } = NativeModules;
  const onPress = () => {
    FaceDetection.createFaceDetectionEvent('testName', 'testLocation');
  };

  return (
    <Button
      title="Click to invoke your native module!"
      color="#841584"
      onPress={onPress}
    />
  );
};

export default FaceDetectionScreen;