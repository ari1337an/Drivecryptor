// Utils
import GoogleDriveUtil from "./GoogleDriveUtil"
import { v4 as uuidv4 } from "uuid"
import BackgroundService from 'react-native-background-actions';
import notifee from '@notifee/react-native';
import RNFS from "react-native-fs"
import ReactNativeBlobUtil from "react-native-blob-util"
import base64Encoder from "./base64Encoder"
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import cryptoJs from "crypto-js";

const path = RNFS.ExternalCachesDirectoryPath;


const logData = (uuid, message) => {
  console.log(`Process ${uuid}: ${message}`);
}

const downloadFileContent = async (uuid, fileID, getBinary=false) => {
  // Setup the GDrive instance
  const gdrive = await GoogleDriveUtil.getInstance()

  // Get the File Content
  logData(uuid, "Downloading...");
  let t0 = performance.now()
  let fileContent = (getBinary === true) ? await gdrive.files.getBinary(fileID) : await gdrive.files.getText(fileID) 
  let t1 = performance.now()
  logData(uuid, "Downloading took " + (t1 - t0) + " milliseconds.");
  return fileContent
}

const decryptyFileContent = async (uuid, password, fileContent) => {
  // Convert Uint8Array to base64 encoding 
  logData(uuid, "Decrypting File Content...");
  t0 = performance.now();
  let content = await cryptoJs.AES.decrypt(fileContent, password);
  content = content.toString(cryptoJs.enc.Utf8);
  t1 = performance.now();
  logData(uuid, "Decrypting took " + (t1 - t0) + " milliseconds.");
  return content
}

const encodeFileContent = async (uuid, fileContent) => {
  // Convert Uint8Array to base64 encoding 
  logData(uuid, "Encoding File Content...");
  t0 = performance.now();
  // let b64 = await Buffer.from(fileContent).toString('base64');
  let base64Conent = await base64Encoder(fileContent);
  t1 = performance.now();
  logData(uuid, "Base64 Encoding took " + (t1 - t0) + " milliseconds.");
  return base64Conent
}

const writeFileContent = async (uuid, base64Content) => {
  const fullPathToFile = path + `/${uuid}.pdf`;

  // Save file locally
  logData(uuid, "Writing File...");
  t0 = performance.now();
  await ReactNativeBlobUtil.fs.writeFile(fullPathToFile, base64Content, 'base64')
  t1 = performance.now();
  logData(uuid, "File Writting took " + (t1 - t0) + " milliseconds.");
  return fullPathToFile;
}

const decryptTaskText = async (content, password) => {
  let bytes = await cryptoJs.AES.decrypt(content, password);
  return bytes.toString(cryptoJs.enc.Utf8);
}

const startDownloadTask = async (taskID, fileID, navigation) => {
  try {
    const password = "password-tmp";
    const savedTo = await writeFileContent(
      taskID,
      await encodeFileContent(
        taskID,
        await downloadFileContent(taskID, fileID, true)
      )
    )

    let oldFileDetails = await AsyncStorage.getItem(taskID)
    oldFileDetails = await JSON.parse(oldFileDetails)
    let newDetailsCompleted = { ...oldFileDetails, status: "complete" }
    await AsyncStorage.setItem(taskID, JSON.stringify(newDetailsCompleted))

    // Notify User
    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    // Display a notification
    await notifee.displayNotification({
      title: 'Your request is ready.',
      body: 'Check your file from all queue list!',
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        pressAction: {
          id: 'default'
        },
      },
    });

  } catch (error) {
    console.log(error);
  }
}

// Decorator Pattern 
// taskID has to be unique
const startDecryptionTask = async (taskID, fileID, navigation) => {
  try {
    const password = "password-tmp";
    const savedTo = await writeFileContent(
      taskID,
      await decryptyFileContent(
        taskID,
        password,
        await downloadFileContent(taskID, fileID)
      )
    )

    let oldFileDetails = await AsyncStorage.getItem(taskID)
    oldFileDetails = await JSON.parse(oldFileDetails)
    let newDetailsCompleted = { ...oldFileDetails, status: "complete" }
    await AsyncStorage.setItem(taskID, JSON.stringify(newDetailsCompleted))

    // Notify User
    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    // Display a notification
    await notifee.displayNotification({
      title: 'Your request is ready.',
      body: 'Check your file from all queue list!',
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        pressAction: {
          id: 'default'
        },
      },
    });

  } catch (error) {
    console.log(error);
  }
}

const initiateBackgroundDecryptionTask = async (fileDetails, navigation, taskIDx = null) => {
  try {
    // Brand new taskID to keep track
    let taskID = taskIDx
    if (taskID == null) taskID = uuidv4()

    // Push this into queue
    let newDetails = { ...fileDetails, status: "processing" }
    await AsyncStorage.setItem(taskID, JSON.stringify(newDetails))

    const veryIntensiveTask = async (taskDataArguments) => {
      await new Promise(async (resolve) => {
        if(fileDetails.isEncrypted === true) await startDecryptionTask(taskID, fileDetails.id, navigation);
        else await startDownloadTask(taskID, fileDetails.id, navigation);
        resolve(true)
      });
    };

    const options = {
      taskName: taskID,
      taskTitle: 'Processing!',
      taskDesc: 'Your file is currently being processed...',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      color: '#ff00ff',
      linkingURI: "drivecryptor://app/allqueue",  // deep link
      parameters: {
        delay: 1000,
      },
    };

    await BackgroundService.start(veryIntensiveTask, options);
    // await BackgroundService.stop();
  } catch (error) {
    console.log(error);
  }
}

const exports = {
  initiateBackgroundDecryptionTask,
  decryptTaskText
}

export default exports