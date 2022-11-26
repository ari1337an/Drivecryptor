package com.ttv.facedemo;

import android.annotation.SuppressLint;
import android.content.ContentResolver;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.ImageDecoder;
import android.graphics.Rect;
import android.net.Uri;
import android.provider.MediaStore;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.camera.core.ImageProxy;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.ttv.face.FaceEngine;
import com.ttv.face.FaceResult;

import java.util.List;

public class FaceRecognitionModule extends ReactContextBaseJavaModule {
    private ReactApplicationContext mContext;

    public FaceRecognitionModule(ReactApplicationContext reactContext){
        super(reactContext);
        mContext = reactContext;
    }

    @ReactMethod
    public void detectAndSaveFace(String photoUriStr, Promise promise) {
        Uri photoUri = Uri.parse(photoUriStr);
        Context context = mContext.getApplicationContext();

        WritableNativeMap map = new WritableNativeMap();

        try {
            Bitmap bitmap = MediaStore.Images.Media.getBitmap(mContext.getContentResolver(), photoUri);

            // Detect Face
            FaceEngine.getInstance(context).setActivation("");
            FaceEngine.getInstance(context).init(1);
            List<FaceResult> faceResults = FaceEngine.getInstance(context).detectFace(bitmap);

            // use that face
            map.putString("howMany?", String.valueOf(faceResults.size()));
            if(faceResults.size() == 1){
                // Detected the face
                map.putString("gender", String.valueOf(faceResults.get(0).gender));
                map.putString("age", String.valueOf(faceResults.get(0).age));
                map.putString("liveness", String.valueOf(faceResults.get(0).liveness));
                map.putString("faceID", String.valueOf(faceResults.get(0).faceId));
            }

            promise.resolve(map);
        } catch (Exception e) {
            promise.reject("Error detecting face", e);
        }
    }

    @NonNull
    @Override
    public String getName() {
        return "FaceRecognitionModule";
    }
}
