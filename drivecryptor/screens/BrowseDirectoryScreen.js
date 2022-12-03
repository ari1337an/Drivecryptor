// Core
import {View, Text, FlatList, Alert, BackHandler} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';

// Configs
import Config from '../config';

// Utils
import GoogleDriveUtil from '../utils/GoogleDriveUtil';
import decryptionTaskUtil from '../utils/decryptionTaskUtil';

// Google Drive API
import {MimeTypes} from '@robinbobin/react-native-google-drive-api-wrapper';

// Components
import FileListCard from '../components/FileListCard';

// Icons
import {CheckIcon} from 'react-native-heroicons/solid';
import { useFocusEffect } from '@react-navigation/native';

const BrowseDirectoryScreen = ({route, navigation}) => {
  const [fileList, setFileList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentFolderID, setCurrentFolderID] = useState('root');
  const [currentFolderName, setCurrentFolderName] = useState('/');
  const [selectedFileToUpload, setSelectedFileToUpload] = useState(null);

  // Double Backpress
  const [pressedBackBtn, setPressedBackBtn] = useState(false);
  useEffect(() => {
    if (pressedBackBtn === true) {
      navigation.pop(2);
      setPressedBackBtn(false);
    }
  }, [pressedBackBtn]);
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        setPressedBackBtn(true);
        return true;
      };
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, []),
  );

  const getListOfDriveFiles = async (folderID = currentFolderID) => {
    setRefreshing(true);
    const secondsToTimeOut = Config.GOOGLE_API_TIMEOUT_IN_SEC;
    try {
      // Setup the GDrive instance
      const gdrive = await GoogleDriveUtil.getInstance();

      // Get All Files List that has "folderID" as parents
      let allFilesOwnedByUsed = await GoogleDriveUtil.getFilesList(
        gdrive,
        folderID,
      );

      let configObj = await GoogleDriveUtil.getConfigFileObject(gdrive);
      console.log(configObj);

      for (const key in allFilesOwnedByUsed) {
        if (Object.hasOwnProperty.call(allFilesOwnedByUsed, key)) {
          const file = allFilesOwnedByUsed[key];
          allFilesOwnedByUsed[key]['isEncrypted'] = false;

          for (const encrypteFileID of configObj) {
            if (file.id === encrypteFileID) {
              // console.log("found a encrypted file");
              // console.log("encrypted name: ", file.name);
              let originalName = await decryptionTaskUtil.decryptTaskText(
                file.name,
                'password-tmp',
              );
              // console.log("original name: ", originalName);
              allFilesOwnedByUsed[key]['name'] = '[E]' + originalName;
              allFilesOwnedByUsed[key]['isEncrypted'] = true;

              // extract ext name
              let extension = originalName.substr(
                originalName.lastIndexOf('.') + 1,
              );
              if (extension.toLowerCase() === 'pdf') {
                allFilesOwnedByUsed[key]['mimeType'] = MimeTypes.PDF;
              }
            }
          }
        }
      }

      for (const file of allFilesOwnedByUsed) {
      }

      setFileList(allFilesOwnedByUsed);
      setRefreshing(false);
    } catch (error) {
      if (error.message === 'Aborted') {
        Alert.alert(
          'Timeout',
          `Check connection, timeout is set to ${secondsToTimeOut} seconds!`,
        );
      }
      console.log(error);
      navigation.goBack(); // go back
    }
  };

  // onFocus of current screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const {folderID, selectedFileInfo, folderName} = route.params; // get the folderID
      setCurrentFolderID(folderID);
      setSelectedFileToUpload(selectedFileInfo);
      setCurrentFolderName(folderName);
      getListOfDriveFiles(folderID);
    });
    return unsubscribe;
  }, [navigation]);

  const doneSelecting = () => {
    navigation.push('UploadFilesScreen', {
      uploadDirID: currentFolderID,
      uploadDirName: currentFolderName,
      uploadFileInfo: selectedFileToUpload,
    });
  };

  return (
    <>
      <View className="flex-row items-center justify-between px-4 py-4 bg-flat_blue2 mb-2">
        <Text className="font-medium text-white text-2xl">Select Folder</Text>
        <CheckIcon
          color="white"
          fill="white"
          size={30}
          onPress={doneSelecting}
        />
      </View>
      <FlatList
        data={fileList}
        renderItem={item => (
          <FileListCard
            navigation={navigation}
            item={item}
            redirectScreen="BrowseDirectoryScreen"
            selectedFileToUpload={selectedFileToUpload}
          />
        )}
        // renderItem={FileListCard}
        keyExtractor={item => item.id} // given by google drive api itself
        onRefresh={getListOfDriveFiles}
        refreshing={refreshing}
      />
    </>
  );
};

export default BrowseDirectoryScreen;
