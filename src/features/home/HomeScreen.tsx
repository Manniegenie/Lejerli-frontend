import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../../app/_layout';

export default function HomeScreen() {
  const { logout } = useAuth();

  const handleSignOut = logout;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Lejerli</Text>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  text: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '500',
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F26522',
  },
  buttonText: {
    color: '#F26522',
    fontSize: 15,
    fontWeight: '600',
  },
});
