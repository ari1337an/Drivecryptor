import { View, Text } from 'react-native'
import React from 'react'

// Drive API Wrapper
import { MimeTypes } from "@robinbobin/react-native-google-drive-api-wrapper";

// Color Theme
import color_theme from "../color-theme";

// Icons
import { FolderIcon, DocumentIcon, DocumentTextIcon } from 'react-native-heroicons/solid';


const FileListCard = (props) => {
  return (
    <View className="flex-row items-center gap-x-2 bg-white shadow m-2 px-2 rounded-lg">
      {
        props.item.mimeType === MimeTypes.FOLDER && (
          <FolderIcon color={color_theme.flat_yellow1} fill={color_theme.flat_yellow1} size={28} />
        )
      }
      {
        props.item.mimeType === MimeTypes.PDF && (
          <DocumentIcon color={color_theme.flat_red1} fill={color_theme.flat_red1} size={28} />
        )
      }
      {
        props.item.mimeType === MimeTypes.TEXT && (
          <DocumentTextIcon color={color_theme.flat_midnight1} fill={color_theme.flat_white1} size={28} />
        )
      }
      {
        props.item.mimeType !== MimeTypes.FOLDER && props.item.mimeType !== MimeTypes.PDF && props.item.mimeType !== MimeTypes.TEXT &&(
          <DocumentIcon color={color_theme.flat_white1} fill={color_theme.flat_white1} size={28} />
        )
      }
      <Text className="text-slate-600 text-lg font-bold p-4">{props.item.name}</Text>
    </View>
  )
}

export default FileListCard