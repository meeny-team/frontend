/**
 * Meeny - UnauthorizedStack
 * 로그인 전 네비게이션
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Login/LoginScreen';

export type UnauthorizedStackParamList = {
  Login: undefined;
};

const Stack = createNativeStackNavigator<UnauthorizedStackParamList>();

export default function UnauthorizedStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
