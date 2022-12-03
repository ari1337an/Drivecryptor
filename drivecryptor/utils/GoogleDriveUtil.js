// Configs
import Config from '../config';

// Dependent Packages
import {
  GDrive,
  ListQueryBuilder,
  MimeTypes,
} from '@robinbobin/react-native-google-drive-api-wrapper';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import 'react-native-get-random-values';
import cryptoJs from 'crypto-js';
import LoginUtils from './LoginUtils';
import base64Encoder from '../utils/base64Encoder';
import ReactNativeBlobUtil from 'react-native-blob-util';

// File System
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DeviceEventEmitter} from 'react-native';

const path = RNFS.CachesDirectoryPath;

const logData = message => {
  // console.log(message);
};

const getInstance = async () => {
  const gdrive = new GDrive();
  gdrive.fetchTimeout = 1000 * Config.GOOGLE_API_TIMEOUT_IN_SEC;
  const currentTokens = await GoogleSignin.getTokens();
  gdrive.accessToken = currentTokens?.accessToken;
  return gdrive;
};

const getInstanceFromToken = async token => {
  const gdrive = new GDrive();
  gdrive.fetchTimeout = 1000 * Config.GOOGLE_API_TIMEOUT_IN_SEC;
  gdrive.accessToken = token;
  return gdrive;
};

const getFilesList = async (instance, folderID) => {
  let filesList = (
    await instance.files.list({
      q: new ListQueryBuilder()
        .in(folderID, 'parents')
        .and()
        .e('trashed', false),
      orderBy: 'folder,name', // sorted by folder first and name later
    })
  ).files;
  return filesList;
};

const fileUpload = async (
  instance,
  fileName,
  fileType,
  fileUri,
  destinationDirectoryID,
) => {
  let fileContent = await RNFS.readFile(fileUri, 'base64');
  // inject encryption here ////////////////////////////////
  let t0 = performance.now();
  logData('Encrypting...');
  const password = 'password-tmp';
  fileContent = await cryptoJs.AES.encrypt(fileContent, password).toString();
  let fileNameEnc;
  fileNameEnc = await cryptoJs.AES.encrypt(fileName, password).toString();
  let t1 = performance.now();
  logData('Encrypting took ' + (t1 - t0) + ' milliseconds.');
  ///////////////////////////////////////////////////////////
  let details = await instance.files
    .newMultipartUploader()
    .setData(fileContent, MimeTypes.BINARY)
    .setRequestBody({
      name: fileNameEnc,
      parents: [destinationDirectoryID],
    })
    .execute();
  await addElementInConfig(instance, details.id);
};

///////////////////// APP DATA ////////////////////////////////////////////

const getFileListInAppData = async instance => {
  let filesList = (await instance.files.list({spaces: 'appDataFolder'})).files;
  return filesList;
};

const checkIfConfigFileIDIsCached = async () => {
  const configFileID = await AsyncStorage.getItem('ConfigFileID');
  if (configFileID != null) {
    return true;
  } else {
    return false;
  }
};

const getConfigFileID = async instance => {
  const status = await checkIfConfigFileIDIsCached();
  if (status === true) {
    // console.log("using cached ");
    return await AsyncStorage.getItem('ConfigFileID');
  } else {
    let allFileInAppData = await getFileListInAppData(instance);
    for (const file of allFileInAppData) {
      if (file.mimeType === MimeTypes.JSON && file.name === 'config') {
        // console.log("using non cached ");
        await AsyncStorage.setItem('ConfigFileID', file.id);
        return file.id;
      }
    }
    // File Do not exists, so lets create one and ten send the config file
    await createConfigFileIfNotExists(instance);
    return await getConfigFileID(instance);
  }
};

const getConfigFileObject = async instance => {
  const configFileID = await getConfigFileID(instance);
  let configJsonObj = await instance.files.getJson(configFileID);
  return configJsonObj;
};

const getConfigFileFileID = async instance => {
  return getConfigFileID(instance);
};

const createConfigFileIfNotExists = async instance => {
  let allFileInAppData = await getFileListInAppData(instance);
  let found = false;
  for (const file of allFileInAppData) {
    if (file.mimeType === MimeTypes.JSON && file.name === 'config') {
      found = true;
    }
  }
  if (found === false) {
    let id = await instance.files
      .newMultipartUploader()
      .setData('W10=', MimeTypes.JSON) // "W10=" in base64 means "[]" in text
      .setIsBase64(true)
      .setRequestBody({
        name: 'config',
        parents: ['appDataFolder'],
      })
      .execute();
  }
};

const addElementInConfig = async (instance, value) => {
  let configCur = await getConfigFileObject(instance);
  configCur = [...configCur, value];
  let configCurStr = await JSON.stringify(configCur);
  let oldConfigFileID = await getConfigFileFileID(instance);
  let id = await instance.files
    .newMultipartUploader()
    .setData(configCurStr, MimeTypes.JSON) // "W10=" in base64 means "[]" in text
    .setIdOfFileToUpdate(oldConfigFileID)
    .execute();
};

const RefPicExists = async instance => {
  let allFileInAppData = await getFileListInAppData(instance);
  let found = false;
  for (const file of allFileInAppData) {
    if (file.mimeType === 'image/jpeg' && file.name === 'refPic') {
      found = true;
    }
  }
  return found;
};

const getRefPicFileID = async instance => {
  let allFileInAppData = await getFileListInAppData(instance);
  for (const file of allFileInAppData) {
    if (file.mimeType === 'image/jpeg' && file.name === 'refPic') {
      return file.id;
    }
  }
};

const getRefPicBase64 = async instance => {
  let allFileInAppData = await getFileListInAppData(instance);
  for (const file of allFileInAppData) {
    if (file.mimeType === 'image/jpeg' && file.name === 'refPic') {
      let fileContent = await instance.files.getBinary(file.id);
      let base64Conent = await base64Encoder(fileContent);
      return base64Conent;
    }
  }
};

const uploadRefPicToAppDataFolder = async (instance, filePath) => {
  if (RefPicExists(instance) === true) {
  } else {
    let fileContent = await RNFS.readFile(filePath, 'base64');
    let details = await instance.files
      .newMultipartUploader()
      .setData(fileContent, 'image/jpeg')
      .setIsBase64(true)
      .setRequestBody({
        name: 'refPic',
        parents: ['appDataFolder'],
      })
      .execute();
  }
};

const loadAppData = async instance => {
  function wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  // Create config.json in appdata space If Not Already Created
  await createConfigFileIfNotExists(instance);
  DeviceEventEmitter.emit('LoginScreenEvents', 'Configurations Synced!');

  // Check if refPic Exists
  const refPicExists = await RefPicExists(instance);

  // Cache The Photo Locally
  if (refPicExists === true) {
    let base64pic = await getRefPicBase64(instance);
    DeviceEventEmitter.emit('LoginScreenEvents', 'Reference Picture Synced!');

    await ReactNativeBlobUtil.fs.writeFile(
      path + '/refPic.png',
      base64pic,
      'base64',
    );
  }
  DeviceEventEmitter.emit('LoginScreenEvents', 'Reference Picture Cached!');

  // await wait(5000);

  // Return If RefPicExists or Not
  return refPicExists;
};

const resetAppData = async (navigation = null) => {
  try {
    let instance = await getInstance();
    let allFileInAppData = await getFileListInAppData(instance);
    for (const file of allFileInAppData) {
      if (file.mimeType === 'image/jpeg' && file.name === 'refPic') {
        await instance.files.delete(file.id);
      }
    }
    await LoginUtils.Signout(navigation);
  } catch (error) {
    console.log(error);
  }
};

const exports = {
  getInstance,
  getFilesList,
  fileUpload,
  getFileListInAppData,
  getInstanceFromToken,
  createConfigFileIfNotExists,
  getConfigFileObject,
  addElementInConfig,
  uploadRefPicToAppDataFolder,
  RefPicExists,
  getRefPicFileID,
  resetAppData,
  getRefPicBase64,
  loadAppData,
};

export default exports;
