import { View, Text, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import Config from '../config';
import color_theme from "../color-theme"

// Google Apis
import { GDrive } from '@robinbobin/react-native-google-drive-api-wrapper';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// File System
import {encode} from 'base-64'
import Pdf from 'react-native-pdf';

// Components
import Header from '../components/Header';

const PDFViewScreen = ({ navigation, route }) => {
  const [filePathPDF, setFilePathPDF] = useState(null)
  const [loading, setLoading] = useState(true);
  // const [fileContent, setFileContent] = useState(null);
  // const [status, setStatus] = useState("Downloading");

  // const fetchFileContent = async (fileID) => {
  //   try {
  //     // Setup GDrive
  //     const gdrive = new GDrive();
  //     gdrive.fetchTimeout = 1000 * Config.GOOGLE_API_TIMEOUT_IN_SEC
  //     const currentTokens = await GoogleSignin.getTokens();
  //     gdrive.accessToken = currentTokens?.accessToken

  //     let fileContentUint8Arr
  //     fileContentUint8Arr = await gdrive.files.getBinary(fileID) // returns an Uint8Array
  //     fileContentUint8Arr = cppBase64.fromByteArray(fileContentUint8Arr)
  //     fileContentUint8Arr = "data:application/pdf;base64," + fileContentUint8Arr
  //     setFileContent({ uri: fileContentUint8Arr })
  //     setLoading(false);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // onFocus of current screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const { filePath } = route.params; // get the fileID
      setFilePathPDF({uri: "file://"+filePath})
      console.log({uri: "file://"+filePath});
      setLoading(false);
      // fetchFileContent(fileID)
    });
    return unsubscribe;
  }, [navigation])

  return (
    <>
      <Header title="Preview" onPress={() => navigation.goBack()} />
      {
        loading && (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={color_theme.flat_blue1} />
            <Text className="font-medium mt-2">Loading</Text>
          </View>
        )
      }
      {
        !loading && (
          <View className="flex-1 justify-start items-center mt-0">
            <Pdf
              className="flex-1 w-full h-full"
              source={filePathPDF}
              onLoadComplete={(numberOfPages, filePath) => {
                console.log(`Number of pages: ${numberOfPages}`);
              }}
              onPageChanged={(page, numberOfPages) => {
                console.log(`Current page: ${page}`);
              }}
              onError={(error) => {
                console.log(error);
              }}
              onPressLink={(uri) => {
                console.log(`Link pressed: ${uri}`);
              }}
            />
          </View>
        )
      }
    </>
  )
}

export default PDFViewScreen