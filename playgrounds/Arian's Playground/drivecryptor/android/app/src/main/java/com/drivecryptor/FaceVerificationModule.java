package com.drivecryptor;

import android.content.Intent;
import android.util.Log;

import androidx.annotation.NonNull;

// import com.drivecryptor.FaceVerificationActivity;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class FaceVerificationModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactApplicationContext;

    FaceVerificationModule(ReactApplicationContext reactContext){
        super(reactContext);
        reactApplicationContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "FaceVerificationModule";
    }

    @ReactMethod
    public void startVerification(String str){
        // Intent intent = new Intent(reactApplicationContext, FaceVerificationActivity.class);
        // getCurrentActivity().startActivity(intent);
    }
}
