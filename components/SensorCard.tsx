import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Thermometer, Refrigerator, Snowflake, Chrome as Home } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sensor } from '@/types';
import { Colors } from '@/constants/Colors';

interface SensorCardProps {
  sensor: Sensor;
}

export default function SensorCard({ sensor }: SensorCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return Colors.success;
      case 'warning': return Colors.warning;
      case 'critical': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const getIcon = () => {
    const iconColor = Colors.info;
    switch (sensor.type) {
      case 'fridge':
        return <Refrigerator size={24} color={iconColor} />;
      case 'freezer':
        return <Snowflake size={24} color={iconColor} />;
      case 'ambient':
        return <Home size={24} color={iconColor} />;
      default:
        return <Thermometer size={24} color={iconColor} />;
    }
  };

  return (
    <LinearGradient
      colors={[Colors.backgroundSecondary, Colors.backgroundPrimary]}
      style={styles.card}
    >
      <View style={styles.header}>
        <LinearGradient
          colors={[Colors.info + '20', Colors.info + '10']}
          style={styles.iconContainer}
        >
          {getIcon()}
        </LinearGradient>
        <View style={styles.titleContainer}>
          <Text style={styles.name}>{sensor.name}</Text>
          <Text style={styles.location}>{sensor.location}</Text>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(sensor.status) }]} />
      </View>
      
      <View style={styles.temperatureSection}>
        <Text style={styles.currentTemp}>{sensor.currentTemp}°C</Text>
        <Text style={styles.targetRange}>
          Target: {sensor.targetMin}°C - {sensor.targetMax}°C
        </Text>
      </View>
      
      <Text style={styles.lastUpdate}>
        Last update: {new Date(sensor.lastUpdate).toLocaleTimeString()}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  temperatureSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  currentTemp: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  targetRange: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  lastUpdate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});