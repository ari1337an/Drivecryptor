import { View, Text, Pressable, Alert, PermissionsAndroid } from 'react-native'
import React from 'react'
import Config from "../config"

// Drive API Wrapper
import { MimeTypes } from "@robinbobin/react-native-google-drive-api-wrapper";

// Color Theme
import color_theme from "../color-theme";

// Icons
import { FolderIcon, DocumentIcon, DocumentTextIcon } from 'react-native-heroicons/solid';

// Google Apis
import { GDrive } from '@robinbobin/react-native-google-drive-api-wrapper';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// File System
import RNFS from "react-native-fs"
import ReactNativeBlobUtil from "react-native-blob-util"
import * as cppBase64 from 'react-native-quick-base64'

const FileListCard = ({ item, navigation, redirectScreen = "MyFilesScreen", selectedFileToUpload = null }) => {
  const data = item.item
  const secondsToTimeOut = Config.GOOGLE_API_TIMEOUT_IN_SEC;

  const requestReadWriteExternalPermission = async () => {
    const granted1 = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    const granted2 = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    if (granted1 === PermissionsAndroid.RESULTS.GRANTED && granted2 === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("External Granted");
    } else {
      throw new Error("To preview files, app needs storage permission.")
    }
  }

  const handleFilePress = async () => {
    console.log(data.mimeType);
    try {
      if (data.mimeType === MimeTypes.FOLDER) {
        // Handle Folder Press
        // Navigate to that folder 
        if (redirectScreen === "BrowseDirectoryScreen") {
          navigation.push(redirectScreen, {
            folderID: data.id,
            selectedFileInfo: selectedFileToUpload,
            folderName: data.name
          })
        } else if (redirectScreen === "MyFilesScreen") {
          navigation.push(redirectScreen, {
            folderID: data.id,
            folderName: data.name
          })
        }

      } else if (data.mimeType === MimeTypes.PDF) {

        Alert.alert("Starting Download", "File has been queued for preview in background, feel free to do your work.")
        // Setup the GDrive instance
        const gdrive = new GDrive();
        gdrive.fetchTimeout = 1000 * secondsToTimeOut
        const currentTokens = await GoogleSignin.getTokens();
        gdrive.accessToken = currentTokens?.accessToken

        // Request Permission
        await requestReadWriteExternalPermission()
        let path = RNFS.ExternalCachesDirectoryPath;


        // Get the File Content
        console.log("Downloading...");
        let t0 = performance.now()
        let fileContent = await gdrive.files.getBinary(data.id) // return an Uint8Array
        let t1 = performance.now()
        console.log("Downloading took " + (t1 - t0) + " milliseconds.")


        // Convert Uint8Array to base64 encoding 
        console.log("Encoding...");
        t0 = performance.now();
        let b64 = await cppBase64.fromByteArray(fileContent)
        t1 = performance.now();
        console.log("Base64 Encoding took " + (t1 - t0) + " milliseconds.")

        // Save file locally
        console.log("Writting...");
        t0 = performance.now();
        await ReactNativeBlobUtil.fs.writeFile(path + "/temp.pdf", b64, 'base64')
        t1 = performance.now();
        console.log("File Writting took " + (t1 - t0) + " milliseconds.")

        // Alert.alert("Success", "File has been written!");

        // Let react-native-pdf handle it
        navigation.push("PDFViewScreen", {
          filePath: path + "/temp.pdf"
        })
      }
    } catch (error) {
      Alert.alert("Attention", error.message)
    }
  }

  return (
    <>
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
            <DocumentTextIcon color={color_theme.flat_gray2} fill={color_theme.flat_gray2} size={28} />
          )
        }
        {
          data.mimeType !== MimeTypes.FOLDER && data.mimeType !== MimeTypes.PDF && data.mimeType !== MimeTypes.TEXT && (
            <DocumentIcon color={color_theme.flat_gray2} fill={color_theme.flat_gray2} size={28} />
          )
        }
        <Text className="text-slate-600 text-lg font-bold p-4 mr-5">{data.name}</Text>
      </Pressable>
    </>
  )
}

export default FileListCard