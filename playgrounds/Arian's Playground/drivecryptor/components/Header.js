import { View, Text, Image } from 'react-native'
import React, {useEffect, useState} from 'react'

// Icons
import { ArrowUturnLeftIcon } from 'react-native-heroicons/solid'

// Goog
import LoginUtils from '../utils/LoginUtils'

const Header = ({title, onPress, showGoBack=true}) => {
  const [userPhoto, setUserPhoto] = useState(null)
  useEffect(() => {
    const setStates = async () => {
      try {
        let userInfo = await LoginUtils.getUserInfo()
        setUserPhoto(userInfo.user.photo)
      } catch (error) {
        console.log(error);
      }
    }
    setStates()
  }, [])
  return (
    <View className="flex-row items-center justify-between px-4 py-4 bg-flat_blue2 mb-2">
      {
        showGoBack && (
          <ArrowUturnLeftIcon  onPress={onPress} color="white" fill="white" size={30} />
        )
      }
      <Text className="font-medium text-white text-2xl">{title}</Text>
      {
        userPhoto != null && <Image
        className="h-8 w-8 rounded-full"
        source={{
          uri: userPhoto,
        }}
      />
      }
      
    </View>
  )
}

export default Header