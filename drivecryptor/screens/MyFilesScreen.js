import { View, Text, Pressable, FlatList, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import Config from '../config';

// Drive API Wrapper
import { GDrive, ListQueryBuilder } from "@robinbobin/react-native-google-drive-api-wrapper";

// Components
import Header from '../components/Header';
import FileListCard from '../components/FileListCard';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Icons
import { ArrowUpTrayIcon, PlusIcon } from 'react-native-heroicons/solid';

const MyFilesScreen = ({ route, navigation }) => {
  const [fileList, setFileList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentFolderID, setCurrentFolderID] = useState("root")
  const [currentFolderName, setCurrentFolderName] = useState("/")

  const getListOfDriveFiles = async (folderID=currentFolderID) => {
    setRefreshing(true)
    const secondsToTimeOut = Config.GOOGLE_API_TIMEOUT_IN_SEC; 
    try {
      // Setup the GDrive instance
      const gdrive = new GDrive();
      gdrive.fetchTimeout = 1000*secondsToTimeOut 
      const currentTokens = await GoogleSignin.getTokens();
      gdrive.accessToken = currentTokens?.accessToken

      // Get All Files List that has "currentFolderID" as parents
      const allFilesOwnedByUsed = (await gdrive.files.list({
        q: new ListQueryBuilder().in(folderID, "parents").and().e("trashed",false), // the root 
        orderBy: 'folder,name', // folder first and name later 
      })).files

      setFileList(allFilesOwnedByUsed)
      setRefreshing(false)
    } catch (error) {
      if(error.message === "Aborted"){
        Alert.alert("Timeout", `Check connection, timeout is set to ${secondsToTimeOut} seconds!`)
      }
      console.log(error);
      navigation.goBack(); // go back
    }
  }
  
  // onFocus of current screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const { folderID, folderName } = route.params; // get the folderID
      setCurrentFolderID(folderID)
      setCurrentFolderName(folderName)
      getListOfDriveFiles(folderID)
    });
    return unsubscribe;
  }, [navigation])

  return (
    <>
      <Header title="My Files" onPress={() => navigation.goBack()}/>
      <FlatList
        data={fileList}
        renderItem={(item) => <FileListCard navigation={navigation} item={item}/>}
        // renderItem={FileListCard}
        keyExtractor={item => item.id} // given by google drive api itself
        onRefresh={getListOfDriveFiles}
        refreshing={refreshing}
      />
      <Pressable className="absolute bottom-0 right-0 bg-flat_blue1 p-3 mr-5 mb-5 rounded-full" onPress={() => {
        navigation.push("UploadFilesScreen", {
          uploadDirID: currentFolderID,
          uploadDirName: currentFolderName,
          uploadFileInfo: null
        })
      }}>
        <ArrowUpTrayIcon color="white" fill="white" size={30}/>
      </Pressable>
    </>

  )
}

export default MyFilesScreen