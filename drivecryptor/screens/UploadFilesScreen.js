import { View, Text, Pressable, FlatList } from 'react-native'
import React from 'react'

// Redux
import { useSelector } from 'react-redux';

// Components
import Header from '../components/Header';

const UploadFilesScreen = ({ navigation }) => {
  
    // Who is currently logged in
    const currentUser = useSelector(store => store.currentUser.value)
  
    
    return (
      <>
        <Header title="Upload Files" onPress={() => navigation.goBack()}/>
        
      </>
  
    )
  }
  
  export default UploadFilesScreen