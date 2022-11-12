// Configs
import Config from '../config';

// Dependent Packages
import {
  GDrive,
  ListQueryBuilder,
  MimeTypes
} from '@robinbobin/react-native-google-drive-api-wrapper';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import 'react-native-get-random-values';
import cryptoJs from 'crypto-js';

// File System
import RNFS from 'react-native-fs';

const logData = message => {
  console.log(message);
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

const getConfigFileObject = async instance => {
  let allFileInAppData = await getFileListInAppData(instance);
  for (const file of allFileInAppData) {
    if (file.mimeType === MimeTypes.JSON && file.name === 'config') {
      let configJsonObj = await instance.files.getJson(file.id);
      return configJsonObj;
    }
  }
  // File Do not exists, so lets create one and ten send the config file
  await createConfigFileIfNotExists(instance);
  return await getConfigFileObject(instance);
};

const getConfigFileFileID = async instance => {
  let allFileInAppData = await getFileListInAppData(instance);
  for (const file of allFileInAppData) {
    if (file.mimeType === MimeTypes.JSON && file.name === 'config') {
      return file.id;
    }
  }
  // File Do not exists, so lets create one and ten send the config file
  await createConfigFileIfNotExists(instance);
  return await getConfigFileFileID(instance);
};

const createConfigFileIfNotExists = async instance => {
  let allFileInAppData = await getFileListInAppData(instance);
  let found = false;
  for (const file of allFileInAppData) {
    console.log(file);
    if (file.mimeType === MimeTypes.JSON && file.name === 'config') {
      found = true;
      console.log('Found config.js, id: ', file.id);
    }
  }
  if (found === false) {
    console.log('Didnot found config.js in appdata, creating one now!');
    // Create config.json file
    let id = await instance.files
      .newMultipartUploader()
      .setData('W10=', MimeTypes.JSON) // "W10=" in base64 means "[]" in text
      .setIsBase64(true)
      .setRequestBody({
        name: 'config',
        parents: ['appDataFolder'],
      })
      .execute();
    console.log('appdata config.js details: ', id.id);
  }
};

const addElementInConfig = async (instance, value) => {
  let configCur = await getConfigFileObject(instance);
  configCur = [...configCur, value];
  let configCurStr = await JSON.stringify(configCur);
  let oldConfigFileID = await getConfigFileFileID(instance);

  // Update the config.json
  let id = await instance.files
    .newMultipartUploader()
    .setData(configCurStr, MimeTypes.JSON) // "W10=" in base64 means "[]" in text
    .setIdOfFileToUpdate(oldConfigFileID)
    .execute();

  // // Delete Old One
  // await instance.delete(oldConfigFileID)
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
};

export default exports;
