import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TemperatureReading } from '@/types';

interface TemperatureChartProps {
  readings: TemperatureReading[];
  title: string;
}

export default function TemperatureChart({ readings, title }: TemperatureChartProps) {
  const maxTemp = Math.max(...readings.map(r => r.temperature));
  const minTemp = Math.min(...readings.map(r => r.temperature));
  const range = maxTemp - minTemp || 1;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartContainer}>
        <View style={styles.chart}>
          {readings.map((reading, index) => {
            const height = ((reading.temperature - minTemp) / range) * 120 + 20;
            return (
              <View key={reading.id} style={styles.dataPoint}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: height,
                      backgroundColor: reading.temperature > 5 ? '#EF4444' : 
                                    reading.temperature > 2 ? '#F59E0B' : '#00B88A'
                    }
                  ]} 
                />
                <Text style={styles.tempLabel}>{reading.temperature}°</Text>
                <Text style={styles.timeLabel}>
                  {new Date(reading.timestamp).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F6FAFF',
    borderRadius: 8,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(15,27,45,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#0F1B2D',
    marginBottom: 20,
  },
  chartContainer: {
    marginHorizontal: -8,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    height: 180,
  },
  dataPoint: {
    alignItems: 'center',
    marginHorizontal: 6,
    width: 50,
  },
  bar: {
    width: 24,
    borderRadius: 6,
    marginBottom: 12,
  },
  tempLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#0F1B2D',
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#677D95',
    transform: [{ rotate: '-45deg' }],
  },
});