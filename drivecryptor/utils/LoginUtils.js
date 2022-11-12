import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { StackActions } from '@react-navigation/native';

const Signout = async (navigation) => {
  try {
    await GoogleSignin.signOut();
    navigation.dispatch(StackActions.popToTop());
  } catch (error) {
    console.error(error);
  }
}

const getUserInfo = async () => {
  let userInfo = await GoogleSignin.getCurrentUser()
  return userInfo
}

const exports = {
  Signout,
  getUserInfo
}

export default exports