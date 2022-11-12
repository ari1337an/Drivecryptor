// Core 
import {View, Text, FlatList, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';

// Configs
import Config from '../config';

// Utils
import GoogleDriveUtil from '../utils/GoogleDriveUtil';

// Components
import FileListCard from '../components/FileListCard';

// Icons
import {CheckIcon} from 'react-native-heroicons/solid';

const BrowseDirectoryScreen = ({route, navigation}) => {
  const [fileList, setFileList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentFolderID, setCurrentFolderID] = useState('root');
  const [currentFolderName, setCurrentFolderName] = useState('/');
  const [selectedFileToUpload, setSelectedFileToUpload] = useState(null);

  const getListOfDriveFiles = async (folderID = currentFolderID) => {
    setRefreshing(true);
    const secondsToTimeOut = Config.GOOGLE_API_TIMEOUT_IN_SEC;
    try {
      // Setup the GDrive instance
      const gdrive = await GoogleDriveUtil.getInstance();

      // Get All Files List that has "folderID" as parents
      const allFilesOwnedByUsed = await GoogleDriveUtil.getFilesList(
        gdrive,
        folderID,
      );

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
