// Utils
import GoogleDriveUtil from './GoogleDriveUtil';
import base64Encoder from './base64Encoder';

// Dependend Packages
import {v4 as uuidv4} from 'uuid';
import 'react-native-get-random-values';
import cryptoJs from 'crypto-js';

// Background Actions, Notification Handlers
import BackgroundService from 'react-native-background-actions';
import notifee from '@notifee/react-native';

// File and Storage
import RNFS from 'react-native-fs';
import ReactNativeBlobUtil from 'react-native-blob-util';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {MimeTypes} from '@robinbobin/react-native-google-drive-api-wrapper';
import { NativeModules } from 'react-native';

const path = RNFS.CachesDirectoryPath;
// const path = RNFS.ExternalCachesDirectoryPath;

const logData = (uuid, message) => {
  console.log(`Process ${uuid}: ${message}`);
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

  // let t0 = performance.now();
  // logData('Encrypting...');
  // const password = 'password-tmp';
  // // fileContent = await NativeModules.CryptoModule.encrypt(fileContent, password);
  // let fileNameEnc;
  // fileNameEnc = await NativeModules.CryptoModule.encryptText(fileName, password);
  // let t1 = performance.now();
  // logData('Encrypting took ' + (t1 - t0) + ' milliseconds.');

  // console.log("Encoded File Name: ", fileNameEnc);

  ///////////////////////////////////////////////////////////
  let details = await instance.files
    .newMultipartUploader()
    .setData(fileContent, MimeTypes.BINARY)
    .setRequestBody({
      name: fileNameEnc,
      parents: [destinationDirectoryID],
    })
    .execute();
  await GoogleDriveUtil.addElementInConfig(instance, details.id);
};

const startEncryption = async (
  fileDetails,
  destination,
  navigation,
  taskID,
) => {
  try {
    // Setup the GDrive instance
    const gdrive = await GoogleDriveUtil.getInstance();

    // console.log(fileDetails);

    // Upload File
    await fileUpload(
      gdrive,
      fileDetails.fileName,
      fileDetails.fileType,
      fileDetails.fileUri,
      destination,
    );

    let oldFileDetails = await AsyncStorage.getItem(taskID);
    oldFileDetails = await JSON.parse(oldFileDetails);
    let newDetailsCompleted = {...oldFileDetails, status: 'complete'};
    await AsyncStorage.setItem(taskID, JSON.stringify(newDetailsCompleted));

    // Notify User
    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    // Display a notification
    await notifee.displayNotification({
      title: 'Your file is uploaded!',
      body: 'Your file is Successfully uploaded to Drive!',
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        pressAction: {
          id: 'default',
        },
      },
    });
  } catch (error) {
    console.log(error);
  }
};

const initiateEncryptionTask = async (
  fileDetails,
  destination,
  navigation,
  taskIDx = null,
) => {
  try {
    // Brand new taskID to keep track
    let taskID = taskIDx;
    if (taskID == null) taskID = uuidv4();
    taskID = "UPLOAD_"+taskID;

    // Push this into queue
    let newDetails = {
      fileDetails: fileDetails,
      destination: destination,
      status: 'processing',
    };
    await AsyncStorage.setItem(taskID, JSON.stringify(newDetails));

    const veryIntensiveTask = async taskDataArguments => {
      await new Promise(async resolve => {
        // encrypt and upload
        await startEncryption(fileDetails, destination, navigation, taskID);
        resolve(true);
      });
    };

    const options = {
      taskName: taskID,
      taskTitle: 'Uploading!',
      taskDesc: 'Your file is being uploaded...',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      color: '#ff00ff',
      // linkingURI: 'drivecryptor://app/allqueue', // deep link
      parameters: {
        delay: 1000,
      },
    };

    await BackgroundService.start(veryIntensiveTask, options);
  } catch (error) {
    console.log(error);
  }
};

const exports = {
  initiateEncryptionTask,
};

export default exports;
