// Core
import React from 'react';
import {Text, Pressable, Alert, PermissionsAndroid} from 'react-native';

// Drive API Wrapper
import {MimeTypes} from '@robinbobin/react-native-google-drive-api-wrapper';

// Color Theme
import color_theme from '../color-theme';

// Icons
import {
  FolderIcon,
  DocumentIcon,
  DocumentTextIcon,
  PhotoIcon,
} from 'react-native-heroicons/solid';

// Utils
import decryptionTaskUtil from '../utils/decryptionTaskUtil';
import mimeTypeData from '../utils/mimeTypeData';

const FileListCard = ({
  item,
  navigation,
  redirectScreen = 'MyFilesScreen',
  selectedFileToUpload = null,
}) => {
  const data = item.item;

  const requestReadWriteExternalPermission = async () => {
    const granted1 = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    );
    const granted2 = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
    if (
      granted1 === PermissionsAndroid.RESULTS.GRANTED &&
      granted2 === PermissionsAndroid.RESULTS.GRANTED
    ) {
      console.log('External Granted');
    } else {
      throw new Error('To preview files, app needs storage permission.');
    }
  };

  const handleFilePress = async () => {
    try {
      if (data.mimeType === MimeTypes.FOLDER) {
        // Handle Folder Press
        // Navigate to that folder
        if (redirectScreen === 'BrowseDirectoryScreen') {
          // console.log("ran this");
          navigation.push('FaceVerificationNavigationInterrupt', {
            screenName: redirectScreen,
            parameters: {
              folderID: data.id,
              selectedFileInfo: selectedFileToUpload,
              folderName: data.name,
            }
          })

          // navigation.push(redirectScreen, {
          //   folderID: data.id,
          //   selectedFileInfo: selectedFileToUpload,
          //   folderName: data.name,
          // });
        } else if (redirectScreen === 'MyFilesScreen') {

          navigation.push('FaceVerificationNavigationInterrupt', {
            screenName: redirectScreen,
            parameters: {
              folderID: data.id,
              folderName: data.name,
            }
          })

          // navigation.push(redirectScreen, {
          //   folderID: data.id,
          //   folderName: data.name,
          // });
        }
      } else if (mimeTypeData.isSupportedForPreview(data.mimeType)) {
        // Request Permission
        // await requestReadWriteExternalPermission();

        // Prompt the user that we have started the background process
        Alert.alert('Processing...', 'File has been queued for processing.');

        decryptionTaskUtil.initiateBackgroundDecryptionTask(data, navigation);

        navigation.push('DashboardScreen');
      }
    } catch (error) {
      Alert.alert('Attention', error.message);
    }
  };

  return (
    <>
      <Pressable
        className="flex-row items-center gap-x-2 bg-white shadow m-2 px-2 rounded-lg"
        onPress={() => handleFilePress()}>
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
        {mimeTypeData.isImageFile(data.mimeType) && (
          <PhotoIcon
            color={color_theme.flat_gray2}
            fill={color_theme.flat_gray2}
            size={28}
          />
        )}
        {data.mimeType !== MimeTypes.FOLDER &&
          data.mimeType !== MimeTypes.PDF &&
          data.mimeType !== MimeTypes.TEXT &&
          !mimeTypeData.isImageFile(data.mimeType) && (
            <DocumentIcon
              color={color_theme.flat_gray2}
              fill={color_theme.flat_gray2}
              size={28}
            />
          )}
        <Text className="text-slate-600 text-lg font-bold p-4 mr-5">
          {data.name}
        </Text>
      </Pressable>
    </>
  );
};

export default FileListCard;
