import { View, Text, FlatList } from 'react-native'
import React, {useEffect,useState} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import TaskListCard from '../components/TaskListCard'
import { ArrowUturnLeftIcon, TrashIcon } from 'react-native-heroicons/solid';

const QueueTask = ({ navigation, route }) => {
  const [taskList, setTaskList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCurrentTasksStatus = async () => {
    setRefreshing(true)
    let keys = []
    let values = []
    try {
      keys = await AsyncStorage.getAllKeys()
      values = await AsyncStorage.multiGet(keys)

      // console.log(values);
      setTaskList(values)
      setRefreshing(false)
    } catch(e) {
      console.log(e);
      setRefreshing(false)
    }
  }

  const handleClearAsyncStorage = async () => {
    try {
      await AsyncStorage.clear()
      navigation.push("QueueTask");
    } catch (error) {
      console.log(error);
    }
  }

  // onFocus of current screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchCurrentTasksStatus()
    });
    return unsubscribe;
  }, [navigation])

  return (
    <>
      <View className="flex-row items-center justify-between px-4 py-4 bg-flat_blue2 mb-2">
        <ArrowUturnLeftIcon  onPress={() => navigation.navigate("DashboardScreen")} color="white" fill="white" size={30} />
        <Text className="font-medium text-white text-2xl">Queue</Text>
        <TrashIcon color="white" fill="white" size={30} onPress={handleClearAsyncStorage}/>
      </View>
      <FlatList
        data={taskList}
        renderItem={(item) => <TaskListCard navigation={navigation} item={item}/>}
        keyExtractor={item => item[0]} 
        onRefresh={fetchCurrentTasksStatus}
        refreshing={refreshing}
      />
    </>
  )
}

export default QueueTask