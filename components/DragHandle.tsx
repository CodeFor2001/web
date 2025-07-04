import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function DragHandle() {
  return (
    <View style={styles.container}>
      <View style={styles.dotRow}>
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
      <View style={styles.dotRow}>
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
      <View style={styles.dotRow}>
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 16,
    height: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textTertiary,
  },
});
