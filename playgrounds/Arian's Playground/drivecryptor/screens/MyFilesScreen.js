import { View, Text, Pressable } from 'react-native'
import React from 'react'

const MyFilesScreen = ({navigation}) => {
  return (
    <View>
      <Text>MyFilesScreen</Text>
      <Pressable onPress={() => navigation.navigate("DashboardScreen")}><Text>Go back!</Text></Pressable>
    </View>
  )
}

export default MyFilesScreen