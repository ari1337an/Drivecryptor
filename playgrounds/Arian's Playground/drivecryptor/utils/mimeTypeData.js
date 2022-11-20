const isDocFile = mimeType => {
  if (mimeType === 'application/msword') return true;
  if (
    mimeType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
    return true;
  // if(mimeType === "application/vnd.google-apps.document") return true; // support google doc?
  return false;
};

const isImageFile = mimeType => {
  if (mimeType === 'image/jpeg') return true;
  if (mimeType === 'image/png') return true;
  return false;
};

const isPdfFile = mimeType => {
  if (mimeType === 'application/pdf') return true;
  return false;
};

const isSupportedForPreview = mimeType => {
  if (isDocFile(mimeType) || isImageFile(mimeType) || isPdfFile(mimeType))
    return true;
  return false;
};

const getExtensionFromMimeType = mimeType => {
  if (mimeType === 'application/msword') return 'doc';
  else if (
    extension ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
    return 'docx';
  else if (mimeType === 'image/png') return 'png';
  else if (mimeType === 'image/jpeg') return 'jpeg';
  else if (mimeType === 'application/pdf') return 'pdf';
  else return 'bin';
};

const getMimeTypeFromExt = extension => {
  if (extension === 'doc') return 'application/msword';
  else if (extension === 'docx')
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  else if (extension === 'png') return 'image/png';
  else if (extension === 'jpeg') return 'image/jpeg';
  else if (extension === 'jpg') return 'image/jpeg';
  else if (extension === 'pdf') return 'application/pdf';
  else throw new Error("Unsupported extension!")
};

const exports = {
  isDocFile,
  isImageFile,
  isPdfFile,
  isSupportedForPreview,
  getMimeTypeFromExt,
  getExtensionFromMimeType,
};

export default exports;
