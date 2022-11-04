import { View, Text,Pressable } from 'react-native'
import React from 'react'

// Drive API Wrapper
import { MimeTypes } from "@robinbobin/react-native-google-drive-api-wrapper";

// Color Theme
import color_theme from "../color-theme";

// Icons
import { FolderIcon, DocumentIcon, DocumentTextIcon } from 'react-native-heroicons/solid';

const FileListCard = ({item, navigation}) => {
  const data = item.item
  const handleFilePress = async () => {
    try {
      if(data.mimeType === MimeTypes.FOLDER){
        // Handle Folder Press
        // Navigate to that folder 
        navigation.push("MyFilesScreen", {
          folderID: data.id
        })
      }
    } catch (error) {
      console.log(error);
    }
    
  }

  return (
    <Pressable className="flex-row items-center gap-x-2 bg-white shadow m-2 px-2 rounded-lg" onPress={() => handleFilePress()}>
      {
        data.mimeType === MimeTypes.FOLDER && (
          <FolderIcon color={color_theme.flat_yellow1} fill={color_theme.flat_yellow1} size={28} />
        )
      }
      {
        data.mimeType === MimeTypes.PDF && (
          <DocumentIcon color={color_theme.flat_red1} fill={color_theme.flat_red1} size={28} />
        )
      }
      {
        data.mimeType === MimeTypes.TEXT && (
          <DocumentTextIcon color={color_theme.flat_midnight1} fill={color_theme.flat_white1} size={28} />
        )
      }
      {
        data.mimeType !== MimeTypes.FOLDER && data.mimeType !== MimeTypes.PDF && data.mimeType !== MimeTypes.TEXT &&(
          <DocumentIcon color={color_theme.flat_white1} fill={color_theme.flat_white1} size={28} />
        )
      }
      <Text className="text-slate-600 text-lg font-bold p-4">{data.name}</Text>
    </Pressable>
  )
}

export default FileListCard