import { View, Text, Pressable, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'

// Redux
import { useSelector } from 'react-redux';

// Drive API Wrapper
import { GDrive } from "@robinbobin/react-native-google-drive-api-wrapper";

// Components
import Header from '../components/Header';
import FileListCard from '../components/FileListCard';

const MyFilesScreen = ({ navigation }) => {
  const [fileList, setFileList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Who is currently logged in
  const currentUser = useSelector(store => store.currentUser.value)

  const getListOfDriveFiles = async () => {
    setRefreshing(true)
    try {
      // For manual Run: (Taken from Official API Ref: https://developers.google.com/drive/api/v3/reference/files/list)
      // (API key not required, we need only access token that we got from oauth)
      // GET https://www.googleapis.com/drive/v3/files?orderBy=folder%2C%20name&q=%27root%27%20in%20parents
      // Header : [access_token] as authentication bearer

      // Setup the GDrive instance
      const gdrive = new GDrive();
      gdrive.accessToken = currentUser?.accessToken; // load the access token into the instance

      // Using wrapper
      const allFilesOwnedByUsed = (await gdrive.files.list({
        q: "'root' in parents", // the "my-drive" folder only, without this all "shared" folders/files will get included
        orderBy: 'folder,name', // folder first and name later 
      })).files

      setFileList(allFilesOwnedByUsed)

      // The first file
      console.log(allFilesOwnedByUsed[0]);

      setRefreshing(false)
    } catch (error) {
      console.log(error);
      navigation.goBack(); // go back
    }
  }

  useEffect(()=>{
    getListOfDriveFiles()
  },[])



  return (
    <>
      <Header title="My Files" onPress={() => navigation.goBack()}/>
      <FlatList
        data={fileList}
        renderItem={FileListCard}
        keyExtractor={item => item.id} // given by google drive api itself
        onRefresh={getListOfDriveFiles}
        refreshing={refreshing}
      />
    </>

  )
}

export default MyFilesScreen