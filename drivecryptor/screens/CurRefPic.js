import {View, Image} from 'react-native';
import React from 'react';
import RNFS from 'react-native-fs'
const path = RNFS.CachesDirectoryPath;

const CurRefPic = () => {
  return (
    <View className="flex-1 justify-center items-center">
      <Image
      className="h-full w-full"
          source={{uri: `file://${path}/refPic.png`}}
        />
    </View>
  );
};

export default CurRefPic;
