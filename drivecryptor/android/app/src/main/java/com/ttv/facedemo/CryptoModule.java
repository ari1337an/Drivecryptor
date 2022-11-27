package com.ttv.facedemo;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.security.NoSuchAlgorithmException;
import java.util.Base64;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

public class CryptoModule extends ReactContextBaseJavaModule {
    private ReactApplicationContext mContext;

    public CryptoModule(ReactApplicationContext reactContext){
        super(reactContext);
        mContext = reactContext;
    }

    @ReactMethod
    public void getNewSecretKey(Promise promise) {
        try {
            // Generate a SecretKey.
            KeyGenerator keygen = KeyGenerator.getInstance("AES");
            keygen.init(256);
            SecretKey key = keygen.generateKey();

            // Convert the SecretKey to base64-encoded String.
            byte[] rawData = key.getEncoded();
            String keyBase64 = Base64.getEncoder().encodeToString(rawData);

            promise.resolve(keyBase64);
        } catch (NoSuchAlgorithmException e) {
            promise.reject(e);
        }
    }

    @NonNull
    @Override
    public String getName() {
        return "CryptoModule";
    }
}
