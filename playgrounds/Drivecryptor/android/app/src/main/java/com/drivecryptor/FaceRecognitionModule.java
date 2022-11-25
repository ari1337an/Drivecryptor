package com.drivecryptor;

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
import com.facebook.react.bridge.WritableMap;
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

        try {
            Bitmap bitmap = MediaStore.Images.Media.getBitmap(mContext.getContentResolver(), photoUri);

            Log.d("Arian", String.valueOf(bitmap.getWidth()));
            Log.d("Arian", String.valueOf(bitmap.getHeight()));

            FaceEngine fe = FaceEngine.getInstance(mContext.getApplicationContext());
            fe.init(2);
            List<FaceResult> faceResults = fe.detectFace(bitmap);

            promise.resolve(faceResults.size());
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
