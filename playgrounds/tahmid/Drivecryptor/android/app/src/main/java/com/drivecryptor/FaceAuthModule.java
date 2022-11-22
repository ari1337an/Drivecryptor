package com.drivecryptor;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.ttv.face.FaceEngine;
import com.ttv.face.FaceFeatureInfo;
import com.ttv.face.FaceResult;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Rect;
import android.net.Uri;
import android.util.Log;

import java.util.List;

public class FaceAuthModule extends ReactContextBaseJavaModule {
    FaceAuthModule(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "FaceAuthModule";
    }

    @ReactMethod
    public void createFaceDetectionEvent(String name, String location) {
        Log.d("CalendarModule", "Create event called with name: " + name
                + " and location: " + location);
    }

    @ReactMethod
    public void detectAndSaveFace(Uri photoUri, Promise promise) {
        final Context context = getCurrentActivity();
        if (context == null) {
            promise.reject("Context is null", "");
            return;
        }

        FaceEngine.getInstance(context).setActivation("");
        FaceEngine.getInstance(context).init(1);

        try {
            final Bitmap bitmap = ImageRotator.getCorrectlyOrientedImage(context, photoUri);
            final List<FaceResult> faceResults = FaceEngine.getInstance(context).detectFace(bitmap);
            if (faceResults.size() == 1) {
                final Rect cropRect = Utils.getBestRect(bitmap.getWidth(), bitmap.getHeight(), faceResults.get(0).rect);
                final Bitmap headImg = Utils.crop(bitmap, cropRect.left, cropRect.top, cropRect.width(), cropRect.height(), 120, 120);
                FaceEngine.getInstance(context).extractFeature(bitmap, true, faceResults);
                final FaceFeatureInfo faceFeatureInfo = new FaceFeatureInfo(0, faceResults.get(0).feature);
                FaceEngine.getInstance(context).registerFaceFeature(faceFeatureInfo);
            }
            promise.resolve(faceResults.size());
        } catch (Exception e) {
            promise.reject("Error detecting face", e);
        }
    }
}
