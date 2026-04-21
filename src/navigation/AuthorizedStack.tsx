/**
 * Meeny - AuthorizedStack
 * 로그인 후 네비게이션
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import HomeScreen from '../screens/Home/HomeScreen';
import CrewDetailScreen from '../screens/Crew/CrewDetailScreen';
import CreateCrewScreen from '../screens/Crew/CreateCrewScreen';
import PlayDetailScreen from '../screens/Play/PlayDetailScreen';
import PlaySettingsScreen from '../screens/Play/PlaySettingsScreen';
import CreatePlayScreen from '../screens/Play/CreatePlayScreen';
import AddPinScreen from '../screens/Pin/AddPinScreen';
import PinDetailScreen from '../screens/Pin/PinDetailScreen';
import SettlementScreen from '../screens/Settlement/SettlementScreen';
import ProfileEditScreen from '../screens/ProfileEdit/ProfileEditScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

export type AuthorizedStackParamList = {
  Home: undefined;
  CrewDetail: { crewId: string };
  CreateCrew: undefined;
  PlayDetail: { playId: string };
  PlaySettings: { playId: string };
  CreatePlay: { crewId: string };
  AddPin: { playId: string };
  PinDetail: { pinId: string };
  Settlement: { playId: string };
  Settings: undefined;
  ProfileEdit: undefined;
};

const Stack = createNativeStackNavigator<AuthorizedStackParamList>();

export default function AuthorizedStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CrewDetail" component={CrewDetailScreen} />
      <Stack.Screen
        name="CreateCrew"
        component={CreateCrewScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
      />
      <Stack.Screen name="PlayDetail" component={PlayDetailScreen} />
      <Stack.Screen name="PlaySettings" component={PlaySettingsScreen} />
      <Stack.Screen
        name="CreatePlay"
        component={CreatePlayScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
      <Stack.Screen
        name="AddPin"
        component={AddPinScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
      <Stack.Screen name="PinDetail" component={PinDetailScreen} />
      <Stack.Screen name="Settlement" component={SettlementScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
    </Stack.Navigator>
  );
}
