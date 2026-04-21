/**
 * Meeny - Main Navigation
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../auth/Auth';
import UnauthorizedStack from './UnauthorizedStack';
import AuthorizedStack from './AuthorizedStack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../design';

export default function Navigation() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AuthorizedStack /> : <UnauthorizedStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
