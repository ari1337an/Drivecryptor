// Core
import {View, Image, Text} from 'react-native';
import React from 'react';
import Header from '../components/Header';
import { ArrowUturnLeftIcon } from 'react-native-heroicons/solid';

const ImageViewScreen = ({navigation, route}) => {
  return (
    <View className="flex-1">
       <View className="flex-row items-center justify-between px-4 py-4 bg-flat_blue2 mb-2">
        <ArrowUturnLeftIcon
          onPress={() => navigation.push('DashboardScreen')}
          color="white"
          fill="white"
          size={30}
        />
        <Text className="font-medium text-white text-2xl">Image Viewer</Text>
      </View>
      <Image
        className="h-full w-full"
        source={{uri: 'file://' + route.params.filePath}}
        resizeMode="contain"
      />
    </View>
  );
};

export default ImageViewScreen;
