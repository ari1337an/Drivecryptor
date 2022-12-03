// Core 
import {View, Text, FlatList, BackHandler, DeviceEventEmitter} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';

// File and Storage System
import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorageUtil from '../utils/AsyncStorageUtil';

// Components 
import TaskListCard from '../components/TaskListCard';

// Icons
import {ArrowUturnLeftIcon, TrashIcon} from 'react-native-heroicons/solid';
import { useFocusEffect } from '@react-navigation/native';
import UploadingTaskCard from '../components/UploadingTaskCard';

const UploadingTasks = ({navigation, route}) => {
  const [taskList, setTaskList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Double Backpress
  const [pressedBackBtn, setPressedBackBtn] = useState(false);
  useEffect(() => {
    if(pressedBackBtn === true){
      navigation.navigate("DashboardScreen");
      setPressedBackBtn(false);
    }
  },[pressedBackBtn]);
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        setPressedBackBtn(true);
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const fetchCurrentTasksStatus = async () => {
    setRefreshing(true);
    let values = [];
    try {
      let filteredKeys = await AsyncStorageUtil.getAllUploadKeys();
      values = await AsyncStorage.multiGet(filteredKeys);
      setTaskList(values);
      setRefreshing(false);
    } catch (e) {
      console.log(e);
      setRefreshing(false);
    }
  };

  const handleClearAsyncStorage = async () => {
    try {
      await AsyncStorage.multiRemove(await AsyncStorageUtil.getAllUploadKeys());
      navigation.push('UploadingTasks');
    } catch (error) {
      console.log(error);
    }
  };

  // onFocus of current screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchCurrentTasksStatus();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <>
      <View className="flex-row items-center justify-between px-4 py-4 bg-flat_blue2 mb-2">
        <ArrowUturnLeftIcon
          onPress={() => navigation.navigate('DashboardScreen')}
          color="white"
          fill="white"
          size={30}
        />
        <Text className="font-medium text-white text-2xl">Upload Tasks</Text>
        <TrashIcon
          color="white"
          fill="white"
          size={30}
          onPress={handleClearAsyncStorage}
        />
      </View>
      <FlatList
        data={taskList}
        renderItem={item => (
          <UploadingTaskCard navigation={navigation} item={item} />
        )}
        keyExtractor={item => item[0]}
        onRefresh={fetchCurrentTasksStatus}
        refreshing={refreshing}
      />
    </>
  );
};

export default UploadingTasks;
