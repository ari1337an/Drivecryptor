// Core
import {View, Image} from 'react-native';
import React from 'react';

const ImageViewScreen = ({navigation, route}) => {
  return (
    <View className="flex-1 justify-center items-center">
      <Image
        className="h-full w-full "
        source={{uri: 'file://' + route.params.filePath}}
        resizeMode="contain"
      />
    </View>
  );
};

export default ImageViewScreen;
