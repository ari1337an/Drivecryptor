import { configureStore } from '@reduxjs/toolkit'
import currentUserReducer from '../features/currentUserSlice'

let store = configureStore({
  reducer: {
    currentUser: currentUserReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk:true,
      immutableCheck: false,
      serializableCheck: false,
    }),
})

export default store