package com.ttv.facedemo;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Rect;
import android.net.Uri;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Log;

import androidx.camera.core.ImageProxy;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableNativeMap;
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin;
import com.ttv.face.FaceEngine;
import com.ttv.face.FaceFeature;
import com.ttv.face.FaceFeatureInfo;
import com.ttv.face.FaceInfo;
import com.ttv.face.FaceResult;
import com.ttv.face.FaceSDK;
import com.ttv.face.SearchResult;
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
    private Context context;
    private FaceEngine faceEngine;
    private List<FaceResult> faceResults = new ArrayList<>();
    private String pathToRefPic = new String();

    public void setContext(ReactApplicationContext reactContext){
        context = reactContext.getApplicationContext();

        // Also set the FaceEngine
        faceEngine = FaceEngine.getInstance(context);
        faceEngine.setActivation("");
        faceEngine.init(1);
    }

    public int detectAndRegisterFace(Bitmap bitmap) {
        try {
            List<FaceResult> faceResultsx = faceEngine.detectFace(bitmap);
            if (faceResultsx.size() == 1) {
                faceEngine.extractFeature(bitmap,true,faceResultsx);
                faceEngine.registerFaceFeature(new FaceFeatureInfo(0, faceResultsx.get(0).feature));
            }
            return faceResultsx.size();
        } catch (Exception e) {
            return 0;
        }
    }

    @Override
    public Object callback(ImageProxy image, Object[] params) {
        // Receive Proper Params
        if (params[0] instanceof String) pathToRefPic = (String) params[0];
        else return "Please provide a string type filepath e.g. file:///";

        Log.d("Arian", pathToRefPic);
        Log.d("Arianx", context.getCacheDir() + "/refPic.png");

        try{
            Uri photoUri = Uri.parse("file://"+ context.getCacheDir() + "/refPic.png");
            Bitmap bitmap2 = MediaStore.Images.Media.getBitmap(context.getContentResolver(), photoUri);
            detectAndRegisterFace(bitmap2);



            // Convert to Bitmap
            @SuppressLint("UnsafeOptInUsageError")
            Bitmap bitmap = BitmapUtils.getBitmap(image);

            // Detect Face
            faceResults = faceEngine.detectFace(bitmap);

            if(faceResults.size() == 1){
                faceEngine.livenessProcess(bitmap, faceResults); // run spoof check
                if(faceResults.get(0).liveness == 1){
                    // Face Recognition
                    faceEngine.extractFeature(bitmap, false, faceResults);
                    SearchResult result = faceEngine.searchFaceFeature(new FaceFeature(faceResults.get(0).feature));
                    if(result.getMaxSimilar() > 0.82f){
                        return "VERIFIED";
                    }else{
                        return "NOT_RECOGNIZED";
                    }
                }else{
                    return "NOT_GENUINE";
                }
            }else{
                return "NOT_DETECTED";
            }
        }catch (Exception e){
            e.printStackTrace();
            return e.getMessage();
        }

    }

    FaceRecognitionFrameProcessorPlugin() {
        super("faceRecognition");
    }
}
