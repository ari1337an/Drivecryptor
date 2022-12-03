import {View, Text} from 'react-native';
import React from 'react';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  EyeIcon,
} from 'react-native-heroicons/solid';

import color_theme from '../color-theme';

const UploadingTaskCard = ({item, navigation}) => {
  let dataFull = item.item;
  let data = JSON.parse(dataFull[1]);

  console.log(data);

  return (
    <>
      <View className="flex-1 flex-row justify-between bg-white shadow m-2 px-2 rounded-lg">
        <View className="flex-row items-center justify-begin gap-x-2">
          <DocumentTextIcon
            color={color_theme.flat_gray2}
            fill={color_theme.flat_gray2}
            size={28}
          />
          <Text className="text-slate-600 text-lg font-bold p-2 m-2">
            {data.fileDetails.fileName.substr(0,20)}...
          </Text>
        </View>
        <View className="flex-row items-center justify-end">
          {data.status === 'processing' && (
            <ArrowPathIcon
              color={color_theme.flat_gray2}
              fill={color_theme.flat_gray2}
              size={28}
            />
          )}
          {data.status === 'complete' && (
            <CheckCircleIcon
              color={color_theme.flat_gray2}
              fill={color_theme.flat_gray2}
              size={28}
            />
          )}
        </View>
      </View>
    </>
  );
};

export default UploadingTaskCard;
