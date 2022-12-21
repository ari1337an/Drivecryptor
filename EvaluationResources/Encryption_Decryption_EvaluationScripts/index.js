const fs = require("fs");

const compareTwoFileByteByByte = async (
  file1Location,
  file2Location,
  assertSameSize
) => {
  const readSizeBuf = 1028 * 8;

  const buf1 = Buffer.alloc(readSizeBuf);
  const buf2 = Buffer.alloc(readSizeBuf);

  let file1, file2;

  let totalBytes = 0;
  let matchedBytes = 0;
  let mismatchedBytes = 0;

  try {
    // Read the files
    file1 = await fs.promises.open(file1Location);
    file2 = await fs.promises.open(file2Location);

    const properties1 = await file1.stat();
    const properties2 = await file2.stat();

    let position = 0;
    let remSize = properties1.size;
    while (remSize > 0) {
      totalBytes++;
      let curReadSize = Math.min(readSizeBuf, remSize);

      let read1 = await file1.read(buf1, 0, curReadSize, position);
      let read2 = await file2.read(buf2, 0, curReadSize, position);

      if (read1.bytesRead !== curReadSize || read2.bytesRead !== curReadSize)
        mismatchedBytes++; // Current Byte Did Not Match
      else if (buf1.compare(buf2, 0, curReadSize, 0, curReadSize) != 0)
        mismatchedBytes++; // Current Byte Did Not Match
      else matchedBytes++; // Current Byte Match

      remSize -= curReadSize;
      position += curReadSize;
    }
    return {
      totalByteCount: totalBytes,
      matchedByteCount : matchedBytes,
      mismatchedByteCount: mismatchedBytes
    };
  } catch (error) {
    console.log(error);
  } finally {
    if (file1) await file1.close();
    if (file2) await file2.close();
  }
};

const main = async () => {
  const result1 = await compareTwoFileByteByByte(
    "./files/documentOriginal.docx",
    "./files/encrypted/documentEncrypted",
    false
  );
  console.log("Original Document vs Encrypted Document: ");
  console.log(result1);

  console.log("\n");
  const result2 = await compareTwoFileByteByByte(
    "./files/sampleImage.jpg",
    "./files/encrypted/imageEncrypted",
    false
  );
  console.log("Original Image vs Encrypted Image: ");
  console.log(result2);

  console.log("\n");
  const result3 = await compareTwoFileByteByByte(
    "./files/samplePdf.pdf",
    "./files/encrypted/pdfEncrypted",
    false
  );
  console.log("Original PDF vs Encrypted PDF: ");
  console.log(result3);

  console.log("\n");
  const result4 = await compareTwoFileByteByByte(
    "./files/documentOriginal.docx",
    "./files/decrypted/documentDecrypted.docx",
    false
  );
  console.log("Original Document vs Decrypted Document: ");
  console.log(result4);

  console.log("\n");
  const result5 = await compareTwoFileByteByByte(
    "./files/sampleImage.jpg",
    "./files/decrypted/imageDecrypted.jpg",
    false
  );
  console.log("Original Image vs Decrypted Image: ");
  console.log(result5);

  console.log("\n");
  const result6 = await compareTwoFileByteByByte(
    "./files/samplePdf.pdf",
    "./files/decrypted/pdfDecrypted.pdf",
    false
  );
  console.log("Original PDF vs Decrypted PDF: ");
  console.log(result6);
};
main();
