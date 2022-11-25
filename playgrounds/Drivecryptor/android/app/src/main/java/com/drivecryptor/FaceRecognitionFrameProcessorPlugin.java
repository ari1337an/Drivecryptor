package com.drivecryptor;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Bitmap;
import android.os.Environment;
import android.util.Log;

import androidx.camera.core.ImageProxy;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableNativeMap;
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin;
import com.ttv.face.FaceEngine;
import com.ttv.face.FaceInfo;
import com.ttv.face.FaceResult;
import com.ttv.face.FaceSDK;
import com.ttv.imageutil.TTVImageFormat;
import com.ttv.imageutil.TTVImageUtil;

import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;


public class FaceRecognitionFrameProcessorPlugin extends FrameProcessorPlugin {

    private ReactApplicationContext context;

    public void setContext(ReactApplicationContext reactContext){
        context = reactContext;
    }

//    public static File saveImage(final Context context, final String imageData) {
//        final byte[] imgBytesData = android.util.Base64.decode(imageData,
//                android.util.Base64.DEFAULT);
//
//        File file = null;
//        try{
//            file = File.createTempFile("image", null, context.getExternalCacheDir());
//        }catch (Exception e){
//            e.printStackTrace();
//        }
//
//        final FileOutputStream fileOutputStream;
//        try {
//            fileOutputStream = new FileOutputStream(file);
//        } catch (FileNotFoundException e) {
//            e.printStackTrace();
//            return null;
//        }
//
//        final BufferedOutputStream bufferedOutputStream = new BufferedOutputStream(
//                fileOutputStream);
//        try {
//            bufferedOutputStream.write(imgBytesData);
//        } catch (IOException e) {
//            e.printStackTrace();
//            return null;
//        } finally {
//            try {
//                bufferedOutputStream.close();
//            } catch (IOException e) {
//                e.printStackTrace();
//            }
//        }
//        return file;
//    }

    @Override
    public Object callback(ImageProxy image, Object[] params) {
        // Convert to Bitmap
        @SuppressLint("UnsafeOptInUsageError")
        Bitmap bm = BitmapUtils.getBitmap(image);
        // ^ until this everything is correct

        // Face On Live Code Here

        return "bitmap got!";
    }

    FaceRecognitionFrameProcessorPlugin() {
        super("faceRecognition");
    }
}
