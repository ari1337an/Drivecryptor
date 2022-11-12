// Core
import {View} from 'react-native';
import React from 'react';

// Doc Viewer
import DocPreview from 'react-native-doc-preview';

const DocViewScreen = ({navigation, route}) => {
  return (
    <View>
      <DocPreview
        filePath={'file://' + route.params.filePath}
      />
    </View>
  );
};

export default DocViewScreen;
