import Config from "../config"
import { GDrive, ListQueryBuilder } from '@robinbobin/react-native-google-drive-api-wrapper';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import RNFS from "react-native-fs"

const getInstance = async () => {
  const gdrive = new GDrive();
  gdrive.fetchTimeout = 1000 * Config.GOOGLE_API_TIMEOUT_IN_SEC
  const currentTokens = await GoogleSignin.getTokens();
  gdrive.accessToken = currentTokens?.accessToken
  return gdrive;
}

const getFilesList = async (instance, folderID) => {
  let filesList = (await instance.files.list({
    q: new ListQueryBuilder().in(folderID, "parents").and().e("trashed", false),
    orderBy: 'folder,name', // sorted by folder first and name later 
  })).files
  return filesList
}

const fileUpload = async (instance, fileName, fileType, fileUri, destinationDirectoryID) => {
  let fileContent = await RNFS.readFile(fileUri, 'base64');
  await instance.files
    .newMultipartUploader()
    .setData(fileContent, fileType)
    .setIsBase64(true)
    .setRequestBody({
      name: fileName,
      parents: [destinationDirectoryID],
    })
    .execute()
}

const exports = {
  getInstance,
  getFilesList,
  fileUpload
}

export default exports