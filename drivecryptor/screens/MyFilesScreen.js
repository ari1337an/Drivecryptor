import { View, Text, Pressable, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'

// Drive API Wrapper
import { GDrive, ListQueryBuilder } from "@robinbobin/react-native-google-drive-api-wrapper";

// Components
import Header from '../components/Header';
import FileListCard from '../components/FileListCard';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const MyFilesScreen = ({ route, navigation }) => {
  const [fileList, setFileList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentFolderID, setCurrentFolderID] = useState("root")

  const getListOfDriveFiles = async (folderID=currentFolderID) => {
    setRefreshing(true)
    try {
      // Setup the GDrive instance
      const gdrive = new GDrive();
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
      console.log(error);
      navigation.goBack(); // go back
    }
  }

  // Check for current login status when user focuses on the screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const { folderID } = route.params; // get the folderID
      setCurrentFolderID(folderID)
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
    </>

  )
}

export default MyFilesScreen