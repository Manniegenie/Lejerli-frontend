import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../../assets/LOADING.json')}
        autoPlay
        loop
        width={48}
        height={48}
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: 48,
    height: 48,
  },
});
