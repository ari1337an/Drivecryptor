// Core
import {Pressable, FlatList, Alert, BackHandler, DeviceEventEmitter} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';

// Configs
import Config from '../config';

// Components
import Header from '../components/Header';
import FileListCard from '../components/FileListCard';

// Icons
import {ArrowUpTrayIcon} from 'react-native-heroicons/solid';

// Utils
import GoogleDriveUtil from '../utils/GoogleDriveUtil';
import decryptionTaskUtil from '../utils/decryptionTaskUtil';
import mimeTypeData from '../utils/mimeTypeData';

// Google Drive API
import {MimeTypes} from '@robinbobin/react-native-google-drive-api-wrapper';
import {useFocusEffect} from '@react-navigation/native';

const MyFilesScreen = ({route, navigation}) => {
  const [fileList, setFileList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentFolderID, setCurrentFolderID] = useState('root');
  const [currentFolderName, setCurrentFolderName] = useState('/');

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

      for (const key in allFilesOwnedByUsed) {
        if (Object.hasOwnProperty.call(allFilesOwnedByUsed, key)) {
          const file = allFilesOwnedByUsed[key];
          allFilesOwnedByUsed[key]['isEncrypted'] = false;

          for (const encrypteFileID of configObj) {
            if (file.id === encrypteFileID) {
              let originalName = await decryptionTaskUtil.decryptTaskText(
                file.name,
                'password-tmp',
              );
              allFilesOwnedByUsed[key]['name'] = '[Encrypted] ' + originalName;
              allFilesOwnedByUsed[key]['isEncrypted'] = true;

              // extract ext name
              let extension = originalName
                .substr(originalName.lastIndexOf('.') + 1)
                .toLowerCase();
              allFilesOwnedByUsed[key]['extension'] = extension;
              allFilesOwnedByUsed[key]['mimeType'] =
                mimeTypeData.getMimeTypeFromExt(extension);
              break;
            }
          }

          if (
            mimeTypeData.isSupportedForPreview(
              allFilesOwnedByUsed[key]['mimeType'],
            ) &&
            allFilesOwnedByUsed[key]['isEncrypted'] === false
          ) {
            let extension = allFilesOwnedByUsed[key]['name']
              .substr(allFilesOwnedByUsed[key]['name'].lastIndexOf('.') + 1)
              .toLowerCase();
            allFilesOwnedByUsed[key]['extension'] = extension;
          }
        }
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
      const {folderID, folderName} = route.params; // get the folderID
      setCurrentFolderID(folderID);
      setCurrentFolderName(folderName);
      getListOfDriveFiles(folderID);
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <>
      <Header
        title="My Files"
        onPress={() => DeviceEventEmitter.emit("hardwareBackPress",'')}
      />
      <FlatList
        data={fileList}
        renderItem={item => (
          <FileListCard navigation={navigation} item={item} />
        )}
        // renderItem={FileListCard}
        keyExtractor={item => item.id} // given by google drive api itself
        onRefresh={getListOfDriveFiles}
        refreshing={refreshing}
      />
      <Pressable
        className="absolute bottom-0 right-0 bg-flat_blue1 p-3 mr-5 mb-5 rounded-full"
        onPress={() => {
          navigation.push('UploadFilesScreen', {
            uploadDirID: currentFolderID,
            uploadDirName: currentFolderName,
            uploadFileInfo: null,
          });
        }}>
        <ArrowUpTrayIcon color="white" fill="white" size={30} />
      </Pressable>
    </>
  );
};

export default MyFilesScreen;
