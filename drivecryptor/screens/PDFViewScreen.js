// Core
import {View, Text, ActivityIndicator} from 'react-native';
import React, {useEffect, useState} from 'react';

// Color Themes
import color_theme from '../color-theme';

// PDF Viewer
import Pdf from 'react-native-pdf';
import { ArrowUturnLeftIcon } from 'react-native-heroicons/solid';

const PDFViewScreen = ({navigation, route}) => {
  const [filePathPDF, setFilePathPDF] = useState(null);
  const [loading, setLoading] = useState(true);

  // onFocus of current screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const {filePath} = route.params; // get the fileID
      setFilePathPDF({uri: 'file://' + filePath});
      console.log({uri: 'file://' + filePath});
      setLoading(false);
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <>
      {loading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={color_theme.flat_blue1} />
          <Text className="font-medium mt-2">Loading</Text>
        </View>
      )}
      {!loading && (
        <View className="flex-1">
          <View className="flex-row items-center justify-between px-4 py-4 bg-flat_blue2 mb-2">
            <ArrowUturnLeftIcon
              onPress={() => navigation.push('DashboardScreen')}
              color="white"
              fill="white"
              size={30}
            />
            <Text className="font-medium text-white text-2xl">
              PDF Viewer
            </Text>
          </View>
          <Pdf
            className="flex-1 w-full h-full"
            source={filePathPDF}
            onLoadComplete={(numberOfPages, filePath) => {
              console.log(`Number of pages: ${numberOfPages}`);
            }}
            onPageChanged={(page, numberOfPages) => {
              console.log(`Current page: ${page}`);
            }}
            onError={error => {
              console.log(error);
            }}
            onPressLink={uri => {
              console.log(`Link pressed: ${uri}`);
            }}
          />
        </View>
      )}
    </>
  );
};

export default PDFViewScreen;
