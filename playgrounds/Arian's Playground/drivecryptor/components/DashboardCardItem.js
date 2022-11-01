import { View, Text } from 'react-native'
import React from 'react'

const DashboardCardItem = (props) => {
  return (
    <View className="flex-row items-center gap-x-2 bg-flat_blue1 mb-2 mx-4 rounded p-3">
      <View>{props.children}</View>
      <Text className="text-flat_white1 font-medium text-xl py-2">{props.title}</Text>
    </View>
  )
}

export default DashboardCardItem