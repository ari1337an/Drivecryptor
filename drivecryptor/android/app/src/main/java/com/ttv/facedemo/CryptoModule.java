package com.ttv.facedemo;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;

import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.KeyGenerator;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

public class CryptoModule extends ReactContextBaseJavaModule {

    private static final String ALGORITHM = "AES/CBC/PKCS5PADDING";

    public CryptoModule(ReactApplicationContext reactContext) {
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
     * Encrypts the given data using the AES encryption algorithm and returns the resulting
     * ciphertext.
     * @param data The data to encrypt
     * @param key The Base64 representation of the encryption key to use
     */
    @ReactMethod
    public void encrypt(ReadableArray data, String key, Promise promise) {
        final SecretKey secretKey = toSecretKey(key);
        final byte[] plaintext = toByteArray(data);

        // Encrypt `plaintext` into `ciphertext`.
        byte[] ciphertext = null;
        try {
            ciphertext = aesEncrypt(plaintext, secretKey);
        } catch (IllegalBlockSizeException | NoSuchPaddingException | NoSuchAlgorithmException | BadPaddingException e) {
            promise.reject(e);
        } catch (InvalidKeyException e) {
            promise.reject("Invalid encryption key", e);
        }

        if (ciphertext == null) {
            promise.reject("Encryption failed", "No ciphertext was obtained.");
            return;
        }
        promise.resolve(toWritableArray(ciphertext));
    }

    /**
     * Encrypts the data encoded in Base64 by the given string using the AES encryption algorithm
     * and returns a string containing the Base64 representation of the resulting ciphertext.
     * @param data The Base64 representation of the data to encrypt
     * @param key The Base64 representation of the encryption key to use
     */
    @ReactMethod
    public void encrypt(String data, String key, Promise promise) {
        final SecretKey secretKey = toSecretKey(key);
        final byte[] plaintext = toByteArray(data);

        // Encrypt `plaintext` into `ciphertext`.
        byte[] ciphertext = null;
        try {
            ciphertext = aesEncrypt(plaintext, secretKey);
        } catch (IllegalBlockSizeException | NoSuchPaddingException | NoSuchAlgorithmException | BadPaddingException e) {
            promise.reject(e);
        } catch (InvalidKeyException e) {
            promise.reject("Invalid encryption key", e);
        }

        if (ciphertext == null) {
            promise.reject("Encryption failed", "No ciphertext was obtained.");
            return;
        }
        promise.resolve(toBase64String(ciphertext));
    }

    /**
     * Decrypts the given AES-encrypted ciphertext and returns the resulting plaintext.
     * @param encryptedData The ciphertext to be decrypted
     * @param key The Base64 representation of the decryption key to use
     */
    @ReactMethod
    public void decrypt(ReadableArray encryptedData, String key, Promise promise) {
        final SecretKey secretKey = toSecretKey(key);
        final byte[] ciphertext = toByteArray(encryptedData);

        // Decrypt `ciphertext` into `plaintext`.
        byte[] plaintext = null;
        try {
            plaintext = aesDecrypt(ciphertext, secretKey);
        } catch (IllegalBlockSizeException | NoSuchPaddingException | NoSuchAlgorithmException | BadPaddingException e) {
            promise.reject(e);
        } catch (InvalidKeyException e) {
            promise.reject("Invalid decryption key", e);
        }

        if (plaintext == null) {
            promise.reject("Decryption failed", "No plaintext was obtained.");
            return;
        }
        promise.resolve(toWritableArray(plaintext));
    }

    /**
     * Decrypts the AES-encrypted ciphertext represented in Base64 by the given string and returns
     * a string containing the Base64 representation of the decrypted plaintext.
     * @param encryptedData The Base64 representation of the ciphertext to be decrypted
     * @param key The Base64 representation of the decryption key to use
     */
    @ReactMethod
    public void decrypt(String encryptedData, String key, Promise promise) {
        final SecretKey secretKey = toSecretKey(key);
        final byte[] ciphertext = toByteArray(encryptedData);

        // Decrypt `ciphertext` into `plaintext`.
        byte[] plaintext = null;
        try {
            plaintext = aesDecrypt(ciphertext, secretKey);
        } catch (IllegalBlockSizeException | NoSuchPaddingException | NoSuchAlgorithmException | BadPaddingException e) {
            promise.reject(e);
        } catch (InvalidKeyException e) {
            promise.reject("Invalid decryption key", e);
        }

        if (plaintext == null) {
            promise.reject("Decryption failed", "No plaintext was obtained.");
            return;
        }
        promise.resolve(toBase64String(plaintext));
    }

    /**
     * Decodes a Base64-encoded String into a newly allocated byte array.
     * @param base64String The {@link String} containing the Base64 representation of the data to be
     *                     converted
     * @return The byte array resulting from the conversion
     */
    @NonNull
    private byte[] toByteArray(String base64String) {
        return Base64.getDecoder().decode(base64String);
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

    /**
     * Constructs a {@link SecretKey} from the given Base64-string representation.
     * @param src The {@link String} containing the Base64 representation a byte array
     * @return The {@link SecretKey} created from the byte array represented by the given
     * Base64-encoded String
     */
    @NonNull
    private SecretKey toSecretKey(String src) {
        final byte[] decodedKey = Base64.getDecoder().decode(src);
        return new SecretKeySpec(decodedKey, 0, decodedKey.length, "AES");
    }

    /**
     * Converts the given {@link ReadableArray} into a newly allocated byte array.
     * @param readableArray The {@link ReadableArray} to be converted
     * @return The byte array resulting from the conversion
     */
    @NonNull
    private byte[] toByteArray(ReadableArray readableArray) {
        final byte[] bytes = new byte[readableArray.size()];
        for (int i = 0; i < bytes.length; i++)
            bytes[i] = (byte) readableArray.getInt(i);
        return bytes;
    }

    /**
     * Converts the given byte array into a newly allocated {@link WritableArray}.
     * @param bytes The byte array to be converted
     * @return The {@link WritableArray} resulting from the conversion
     */
    @NonNull
    private WritableArray toWritableArray(byte[] bytes) {
        final WritableArray writableArray = new WritableNativeArray();
        for (final byte x : bytes)
            writableArray.pushInt(x);
        return writableArray;
    }

    /**
     * Encrypts the given data using the AES encryption algorithm into a newly allocated buffer and
     * returns the result.
     * @param plaintext The data to be encrypted
     * @param secretKey The {@link SecretKey} to use as the encryption key
     * @return The resulting ciphertext, in a newly allocated byte array
     * @throws IllegalBlockSizeException for bugs in the implementation
     * @throws NoSuchPaddingException for bugs in the implementation
     * @throws NoSuchAlgorithmException for bugs in the implementation
     * @throws BadPaddingException for bugs in the implementation
     * @throws InvalidKeyException if the given key is inappropriate for initializing a cipher,
     * or requires algorithm parameters that cannot be determined from the given key,
     * or if the given key has a keysize that exceeds the maximum allowable keysize.
     */
    @Nullable
    private byte[] aesEncrypt(byte[] plaintext, SecretKey secretKey) throws IllegalBlockSizeException, NoSuchPaddingException, NoSuchAlgorithmException, BadPaddingException, InvalidKeyException {
        final Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        return cipher.doFinal(plaintext);
    }

    /**
     * Decrypts the given AES-encrypted ciphertext into a newly allocated buffer and returns the result.
     * @param ciphertext The ciphertext to be decrypted
     * @param secretKey The {@link SecretKey} to use as the decryption key
     * @return The resulting plaintext, in a newly allocated byte array
     * @throws IllegalBlockSizeException for bugs in the implementation
     * @throws NoSuchPaddingException for bugs in the implementation
     * @throws NoSuchAlgorithmException for bugs in the implementation
     * @throws BadPaddingException for bugs in the implementation
     * @throws InvalidKeyException if the given key is inappropriate for initializing a cipher,
     * or requires algorithm parameters that cannot be determined from the given key,
     * or if the given key has a keysize that exceeds the maximum allowable keysize.
     */
    @Nullable
    private byte[] aesDecrypt(byte[] ciphertext, SecretKey secretKey) throws IllegalBlockSizeException, NoSuchPaddingException, NoSuchAlgorithmException, BadPaddingException, InvalidKeyException {
        final Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
        cipher.init(Cipher.DECRYPT_MODE, secretKey);
        return cipher.doFinal(ciphertext);
    }

    @NonNull
    @Override
    public String getName() {
        return "CryptoModule";
    }
}
