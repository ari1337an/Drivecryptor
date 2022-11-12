// Core 
import {View, Text, Pressable, Alert, ActivityIndicator} from 'react-native';
import React, {useState, useEffect} from 'react';

// Styles, Themes, Icons
import color_theme from '../color-theme';
import {
  ArrowUpTrayIcon,
  PaperClipIcon,
  XCircleIcon,
} from 'react-native-heroicons/solid';

// Components
import Header from '../components/Header';

// Filer Picker
import DocumentPicker, {types} from 'react-native-document-picker';

// Utils
import GoogleDriveUtil from '../utils/GoogleDriveUtil';

const UploadFilesScreen = ({route, navigation}) => {
  const [uploading, setUploading] = useState(false);
  const [filePickResult, setFilePickResult] = useState(null);
  const [directoryID, setDirectoryID] = useState('root'); // initially to root folder
  const [directoryName, setDirectoryName] = useState('/'); // initially to root folder

  // onFocus of current screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const {uploadDirID, uploadDirName, uploadFileInfo} = route.params; // get the folderID
      setDirectoryID(uploadDirID);
      setDirectoryName(uploadDirName);
      setFilePickResult(uploadFileInfo);
    });
    return unsubscribe;
  }, [navigation]);

  const selectFile = async () => {
    try {
      let fileUri = await DocumentPicker.pick({
        type: [types.doc, types.docx, types.pdf, types.images],
      });
      console.log(fileUri[0]);
      setFilePickResult(fileUri[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const handleBrowseDirectory = async () => {
    try {
      // send to myfiles screen to pick
      navigation.push('BrowseDirectoryScreen', {
        folderID: 'root',
        selectedFileInfo: filePickResult,
        folderName: '/',
      });
    } catch (error) {
      console.log(error);
    }
  };

  const executeUpload = async () => {
    setUploading(true);
    try {
      // Setup the GDrive instance
      const gdrive = await GoogleDriveUtil.getInstance();

      // Upload File
      await GoogleDriveUtil.fileUpload(
        gdrive,
        filePickResult.name,
        filePickResult.type,
        filePickResult.uri,
        directoryID,
      );

      Alert.alert('Success', 'Successfully Uploaded!');
      setUploading(false);
    } catch (error) {
      if (error.message === 'Aborted') {
        Alert.alert(
          'Timeout',
          `Check connection, timeout is set to ${secondsToTimeOut} seconds!`,
        );
      }
      console.log(error);
      setUploading(false);
    }
  };

  const startUpload = async () => {
    try {
      if (filePickResult == null) {
        Alert.alert(
          'Incomplete!',
          'You must select which file you want to upload!',
        );
      } else if (directoryID == null) {
        Alert.alert(
          'Incomplete!',
          'You must select the destination directory!',
        );
      } else {
        // run upload task here
        await executeUpload();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Header
        title="Upload Files"
        onPress={() => navigation.push('DashboardScreen')}
      />

      <View className="flex-row items-center gap-x-2 bg-white shadow m-2 px-2 rounded-lg">
        <Text className="text-slate-600 text-lg font-bold py-4 pl-4">
          File:{' '}
        </Text>
        {filePickResult != null && (
          <View className="flex-1">
            <Pressable
              className="flex-row items-center justify-between"
              onPress={() => setFilePickResult(null)}>
              <Text>{(filePickResult?.name).slice(0, 20)}... </Text>
              <XCircleIcon
                color={color_theme.flat_red1}
                fill={color_theme.flat_red1}
                size={28}
              />
            </Pressable>
          </View>
        )}
        {filePickResult == null && (
          <View className="flex-1">
            <Pressable
              onPress={selectFile}
              className="flex-row items-center justify-start gap-x-2">
              <PaperClipIcon
                color={color_theme.flat_green1}
                fill={color_theme.flat_green1}
                size={28}
              />
            </Pressable>
          </View>
        )}
      </View>

      <View className="flex-row items-center bg-white shadow m-2 px-2 rounded-lg">
        <Text className="text-slate-600 text-lg font-bold py-4 pl-4">
          Destination:{' '}
        </Text>
        <Pressable className="flex-1 flex-row items-center justify-between gap-x-2">
          {directoryName === 'root' && <Text>/</Text>}
          {directoryName !== 'root' && directoryName.length < 15 && (
            <Text>{directoryName}</Text>
          )}
          {directoryName !== 'root' && directoryName.length >= 15 && (
            <Text>{directoryName.slice(0, 15)}...</Text>
          )}
          <Text
            className="bg-flat_midnight1 p-2 rounded text-white font-medium"
            onPress={handleBrowseDirectory}>
            Browse
          </Text>
        </Pressable>
        <Pressable></Pressable>
      </View>

      {uploading && (
        <View className="flex-row justify-end mr-4 mt-5">
          <View className="flex-row bg-flat_darkgreen1 font-bold rounded px-5 py-3">
            <ActivityIndicator size="small" color="white" />
            <Text className="text-white ml-2">Uploading</Text>
          </View>
        </View>
      )}
      {!uploading && (
        <Pressable
          className="flex-row justify-end mr-4 mt-5"
          onPress={() => startUpload()}>
          <View className="flex-row items-center justify-center bg-flat_darkgreen1 font-bold rounded px-5 py-3">
            <ArrowUpTrayIcon color="white" fill="white" size={20} />
            <Text className="text-white ml-2 text-md font-medium">Upload</Text>
          </View>
        </Pressable>
      )}
    </>
  );
};

export default UploadFilesScreen;
