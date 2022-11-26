// Core 
import {View, Text, Pressable, Alert} from 'react-native';
import React from 'react';

// Google Drive API
import {MimeTypes} from '@robinbobin/react-native-google-drive-api-wrapper';

// Colors & Icons
import color_theme from '../color-theme';
import {
  FolderIcon,
  DocumentIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  EyeIcon,
} from 'react-native-heroicons/solid';

// File System
import RNFS from 'react-native-fs';

// Utils
import decryptionTaskUtil from '../utils/decryptionTaskUtil';
import mimeTypeData from '../utils/mimeTypeData'

// File Viewer
import FileViewer from "react-native-file-viewer";

const path = RNFS.CachesDirectoryPath;
// const path = RNFS.ExternalCachesDirectoryPath ;

const TaskListCard = ({item, navigation}) => {
  let dataFull = item.item;
  let data = JSON.parse(dataFull[1]);

  const handleFilePress = async () => {
    try {
      if (data.status === 'complete') {
        navigation.push('FaceVerificationScreen', {
          uuid: dataFull[0],
          data: data
        });

        // if (mimeTypeData.isPdfFile(data.mimeType)) {
        //   navigation.push('PDFViewScreen', {
        //     filePath: path + `/${dataFull[0]}.pdf`,
        //   });
        // }else if (mimeTypeData.isImageFile(data.mimeType)) {
        //   navigation.push('ImageViewScreen', {
        //     filePath: path + `/${dataFull[0]}.${data.extension}`,
        //   });
        // }else if (mimeTypeData.isDocFile(data.mimeType)) {
        //   FileViewer.open('file://' + path + `/${dataFull[0]}.${data.extension}`)
        // }
      } else if (data.status === 'processing') {
        // retry the process
        Alert.alert(
          'Retry the process?',
          'Do you want to retry the process?',
          [
            {
              text: 'Yes',
              onPress: async () => {
                try {
                  // start again
                  // await BackgroundService.stop()
                  decryptionTaskUtil.initiateBackgroundDecryptionTask(
                    data,
                    navigation,
                    dataFull[0],
                  );
                  navigation.navigate('DashboardScreen');
                } catch (error) {
                  console.log(error);
                }
              },
              style: 'okay',
            },
            {
              text: 'No',
              onPress: () => {
                // Stop
              },
              style: 'cancel',
            },
          ],
          {
            cancelable: true,
            onDismiss: () => console.log('Did not cancel!'),
          },
        );
      }
    } catch (error) {}
  };

  return (
    <>
      <Pressable
        className="flex-1 flex-row justify-between bg-white shadow m-2 px-2 rounded-lg"
        onPress={() => handleFilePress()}>
        <View className="flex-row items-center justify-begin gap-x-2">
          {data.mimeType === MimeTypes.FOLDER && (
            <FolderIcon
              color={color_theme.flat_yellow1}
              fill={color_theme.flat_yellow1}
              size={28}
            />
          )}
          {data.mimeType === MimeTypes.PDF && (
            <DocumentIcon
              color={color_theme.flat_red1}
              fill={color_theme.flat_red1}
              size={28}
            />
          )}
          {data.mimeType === MimeTypes.TEXT && (
            <DocumentTextIcon
              color={color_theme.flat_gray2}
              fill={color_theme.flat_gray2}
              size={28}
            />
          )}
          {data.mimeType !== MimeTypes.FOLDER &&
            data.mimeType !== MimeTypes.PDF &&
            data.mimeType !== MimeTypes.TEXT && (
              <DocumentIcon
                color={color_theme.flat_gray2}
                fill={color_theme.flat_gray2}
                size={28}
              />
            )}
          {data.name?.length <= 25 && (
            <Text className="text-slate-600 text-lg font-bold p-2 m-2">
              {data.name}
            </Text>
          )}
          {data.name?.length > 25 && (
            <Text className="text-slate-600 text-lg font-bold p-2 m-2">
              {data.name.slice(0, 25)}...
            </Text>
          )}
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
            <EyeIcon
              color={color_theme.flat_gray2}
              fill={color_theme.flat_gray2}
              size={28}
            />
          )}
        </View>
      </Pressable>
    </>
  );
};

export default TaskListCard;
