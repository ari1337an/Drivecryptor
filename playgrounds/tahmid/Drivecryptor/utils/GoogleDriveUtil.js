const CHUNK_SIZE = 256 * 1024; // 256 KiB
const MAX_ATTEMPTS = 10; // per chunk

import {GDrive} from "@robinbobin/react-native-google-drive-api-wrapper";

/**
 * Splits the file into multiple chunks and performs a resumable upload.
 * @param {GDrive} client GDrive instance
 * @param {Uint8Array | string} content Content of the file
 * @param {string} contentType Content type (MIME type) of the file
 * @param {object} requestBody Request parameters
 * @param {number} maxAttemptsPerChunk Max tries per chunk of the file
 * @param {number} chunkSize Max chunk size
 * @returns {Promise<boolean>} True iff the upload was successful
 */
async function resumableUpload(
  client,
  content,
  contentType,
  requestBody,
  maxAttemptsPerChunk = MAX_ATTEMPTS,
  chunkSize = CHUNK_SIZE,
) {
  const uploader = client.files
    .newResumableUploader()
    .setShouldUseMultipleRequests(true)
    .setDataType(contentType)
    .setContentLength(content.length)
    .setRequestBody(requestBody);

  const sendChunk = async chunk => {
    for (let attempt = 0; attempt < maxAttemptsPerChunk; attempt++) {
      try {
        await uploader.uploadChunk(chunk);
        return true; // Upload succeeded.
      } catch (err) {} // This attempt failed. Retry.
    }
    return false; // Upload failed despite `maxAttemptsPerChunk` attempts.
  };

  for (let offset = 0; offset < content.length; ) {
    const chunkEnd = Math.min(offset + chunkSize, content.length);
    const chunk = content.slice(offset, chunkEnd);
    const sent = await sendChunk(chunk);
    if (!sent) {
      return false;
    }
    offset = chunkEnd;
  }
  return true;
}
