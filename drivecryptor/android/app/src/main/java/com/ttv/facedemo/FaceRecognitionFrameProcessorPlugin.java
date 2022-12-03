package com.ttv.facedemo;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Bitmap;
import android.net.Uri;
import android.provider.MediaStore;


import androidx.camera.core.ImageProxy;

import com.facebook.react.bridge.ReactApplicationContext;
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin;
import com.ttv.face.FaceEngine;
import com.ttv.face.FaceFeature;
import com.ttv.face.FaceFeatureInfo;
import com.ttv.face.FaceResult;
import com.ttv.face.SearchResult;

import java.util.ArrayList;
import java.util.List;


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