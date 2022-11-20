import {View, Text, Image} from 'react-native';
import React, {useEffect, useState} from 'react';
import FaceSDK, {
  Enum,
  FaceCaptureResponse,
  LivenessResponse,
  MatchFacesResponse,
  MatchFacesRequest,
  MatchFacesImage,
  MatchFacesSimilarityThresholdSplit,
} from '@regulaforensics/react-native-face-api';

import GoogleDriveUtil from '../utils/GoogleDriveUtil';
import LoginUtils from '../utils/LoginUtils';

let image1 = new MatchFacesImage();
let image2 = new MatchFacesImage();

const FaceVerificationScreen = ({navigation, route}) => {
  const [curPic, setCurPic] = useState(null);

  // handle not verified or spoofed case
  const handleError = async () => {
    // await LoginUtils.Signout(navigation);
  };

  const handleSuccess = () => {

  }

  const startFaceVerification = request => {
    FaceSDK.matchFaces(
      JSON.stringify(request),
      response => {
        response = MatchFacesResponse.fromJson(JSON.parse(response));
        FaceSDK.matchFacesSimilarityThresholdSplit(
          JSON.stringify(response.results),
          0.75,
          str => {
            let split = MatchFacesSimilarityThresholdSplit.fromJson(
              JSON.parse(str),
            );

            if (split.matchedFaces.length > 0) {
              let percentage =
                (split.matchedFaces[0].similarity * 100).toFixed(2) + '%';
              console.log('similarity: ', percentage);
            } else {
              console.log("Didn't pass face verification1");
              handleError();
            }
          },
          e => {
            console.log("Didn't pass face verification2");
            handleError();
          },
        );
      },
      e => {
        console.log("Didn't pass face verification3");
        handleError();
      },
    );
  };

  const livenessCheck = async () => {
    FaceSDK.startLiveness(
      result => {
        result = LivenessResponse.fromJson(JSON.parse(result));

        // use result.bitmap to face verify with out picture
        // console.log(result);
        // this.setImage(true, result.bitmap, Enum.ImageType.LIVE);
        if (result.bitmap != null && result['liveness'] == 0) {
          console.log('passes liveness');

          let requestx = new MatchFacesRequest();
          
          // image1.bitmap = result.bitmap; // change this with base64 of ref pic
          // image1.imageType = Enum.ImageType.PRINTED;
          // image1.imageType = Enum.ImageType.LIVE; // use this with state pic
          
          image2.bitmap = result.bitmap;
          image2.imageType = Enum.ImageType.LIVE;
          requestx.images = [image1, image2];

          startFaceVerification(requestx);
        } else {
          console.log("Didn't pass liveness");
          handleError();
        }
      },
      e => {},
    );
  };

  const setImage1 = async () => {
    // Setup the GDrive instance
    const gdrive = await GoogleDriveUtil.getInstance();
    let base64pic = await GoogleDriveUtil.getRefPicBase64(gdrive);
    image1.bitmap = base64pic;
    image1.imageType = Enum.ImageType.PRINTED;
    setCurPic(base64pic)
  };

  // onFocus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      await setImage1();
      console.log(image1.imageType);
      // await livenessCheck();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View className="flex-1 justify-center items-center">
      
      {curPic == null && <Text>Please Wait...</Text>}
      {curPic != null && <Image
      className="h-full w-full"
          source={{uri: 'data:image/png;base64,'+curPic}}
        />}
      
    </View>
  );
};

export default FaceVerificationScreen;
