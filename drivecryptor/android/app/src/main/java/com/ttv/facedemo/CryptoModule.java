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
    public CryptoModule(ReactApplicationContext reactContext){
        super(reactContext);
    }

    /**
     * Generates a new 256-bit symmetric encryption key for the AES algorithm and returns its
     * Base64-encoded string representation.
     */
    @ReactMethod
    public void getNewSecretKey(Promise promise) {
        try {
            // Generate a SecretKey.
            final KeyGenerator keygen = KeyGenerator.getInstance("AES");
            keygen.init(256);
            final SecretKey key = keygen.generateKey();

            promise.resolve(toBase64String(key.getEncoded()));
        } catch (NoSuchAlgorithmException e) {
            promise.reject(e);
        }
    }

    /**
     * Encodes the given byte array into a newly allocated String using the Base64 encoding scheme.
     * @param src The byte array to be encoded
     * @return The {@link String} containing the resulting Base64 characters
     */
    @NonNull
    private String toBase64String(byte[] src) {
        return Base64.getEncoder().encodeToString(src);
    }

    @NonNull
    @Override
    public String getName() {
        return "CryptoModule";
    }
}
