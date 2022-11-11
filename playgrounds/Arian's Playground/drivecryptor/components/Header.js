import { View, Text, Image } from 'react-native'
import React from 'react'

// Redux
import { useSelector } from 'react-redux';

// Icons
import { ArrowUturnLeftIcon } from 'react-native-heroicons/solid'

const Header = ({title, onPress, showGoBack=true}) => {
  const currentUser = useSelector(store => store.currentUser.value)
  return (
    <View className="flex-row items-center justify-between px-4 py-4 bg-flat_blue2 mb-2">
      {
        showGoBack && (
          <ArrowUturnLeftIcon  onPress={onPress} color="white" fill="white" size={30} />
        )
      }
      <Text className="font-medium text-white text-2xl">{title}</Text>
      <Image
        className="h-8 w-8 rounded-full"
        source={{
          uri: currentUser?.user?.photo,
        }}
      />
    </View>
  )
}

export default Header