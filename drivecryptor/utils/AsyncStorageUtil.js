import AsyncStorage from "@react-native-async-storage/async-storage";

const getAllKeyOfPrefix = async (prefix) => {
  let keys = await AsyncStorage.getAllKeys();
  let filteredKeys = []
  for (const key of keys) {
    if(key.substr(0,prefix.length) === prefix){
      filteredKeys.push(key);
    }
  }
  return filteredKeys;
}

const getAllPreviewKeys = async () => {
  return getAllKeyOfPrefix("PREVIEW_");
}

const getAllUploadKeys = async () => {
  return getAllKeyOfPrefix("UPLOAD_");
}

const exports = {
  getAllKeyOfPrefix,
  getAllPreviewKeys,
  getAllUploadKeys
}

export default exports;
