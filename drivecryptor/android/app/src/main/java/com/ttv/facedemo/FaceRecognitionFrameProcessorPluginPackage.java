package com.ttv.facedemo;

import androidx.annotation.NonNull;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin;
import com.ttv.face.FaceEngine;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class FaceRecognitionFrameProcessorPluginPackage implements ReactPackage {

    @NonNull
    @Override
    public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactApplicationContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new FaceRecognitionModule(reactApplicationContext));

        FaceRecognitionFrameProcessorPlugin plugin = new FaceRecognitionFrameProcessorPlugin();
        plugin.setContext(reactApplicationContext);
        FrameProcessorPlugin.register(plugin);

        return modules;
    }

    @NonNull
    @Override
    public List<ViewManager> createViewManagers(@NonNull ReactApplicationContext reactApplicationContext) {
        return Collections.emptyList();
    }
}
