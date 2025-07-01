import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SensorCard from '@/components/SensorCard';
import ProgressRing from '@/components/ProgressRing';
import { Sensor } from '@/types';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import { Bell } from 'lucide-react-native';

// Mock data for sensors
const mockSensors: Sensor[] = [
  {
    id: '1',
    name: 'Main Fridge',
    type: 'fridge',
    currentTemp: 3.2,
    targetMin: 0,
    targetMax: 5,
    status: 'ok',
    location: 'Kitchen',
    lastUpdate: new Date(),
  },
  {
    id: '2',
    name: 'Freezer Unit A',
    type: 'freezer',
    currentTemp: -18.5,
    targetMin: -20,
    targetMax: -15,
    status: 'ok',
    location: 'Storage Room',
    lastUpdate: new Date(),
  },
  {
    id: '3',
    name: 'Prep Room',
    type: 'ambient',
    currentTemp: 22.1,
    targetMin: 18,
    targetMax: 25,
    status: 'warning',
    location: 'Prep Kitchen',
    lastUpdate: new Date(),
  },
];

// Mock completion data
const mockCompletionData = {
  openingChecklist: 75, // 75% completed
  closingChecklist: 100, // 100% completed
  compliance: 85, // 85% compliance level
};

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const isSensorBased = user?.subscriptionType === 'sensor-based';
  const currentTime = new Date();

  const handleAlertsPress = () => {
    console.log('Navigate to alerts');
  };

  return (
    <View style={styles.container}>
      {/* Compact Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {user?.name} · {currentTime.toLocaleDateString()} · {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <TouchableOpacity style={styles.alertsButton} onPress={handleAlertsPress}>
          <Bell size={20} color={Colors.textSecondary} />
          <Text style={styles.alertsText}>Alerts</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 1. Live Temperature Cards (Sensor-based only) */}
        {isSensorBased && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Live Temperature Monitoring</Text>
            <View style={styles.sensorsGrid}>
              {mockSensors.map(sensor => (
                <View key={sensor.id} style={styles.sensorWrapper}>
                  <SensorCard sensor={sensor} />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 2. Daily Progress Bars */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Progress</Text>
          <View style={styles.progressGrid}>
            <LinearGradient
              colors={[Colors.success + '20', Colors.success + '10']}
              style={styles.progressCard}
            >
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Opening Checklist</Text>
                <Text style={styles.progressPercentage}>{mockCompletionData.openingChecklist}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${mockCompletionData.openingChecklist}%`,
                      backgroundColor: Colors.success
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressSubtitle}>
                {Math.round(mockCompletionData.openingChecklist * 0.12)} of 16 tasks completed
              </Text>
            </LinearGradient>

            <LinearGradient
              colors={[Colors.info + '20', Colors.info + '10']}
              style={styles.progressCard}
            >
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Closing Checklist</Text>
                <Text style={styles.progressPercentage}>{mockCompletionData.closingChecklist}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${mockCompletionData.closingChecklist}%`,
                      backgroundColor: Colors.info
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressSubtitle}>
                All 14 tasks completed
              </Text>
            </LinearGradient>

            <LinearGradient
              colors={[Colors.warning + '20', Colors.warning + '10']}
              style={styles.progressCard}
            >
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Compliance Level</Text>
                <Text style={styles.progressPercentage}>{mockCompletionData.compliance}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${mockCompletionData.compliance}%`,
                      backgroundColor: Colors.warning
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressSubtitle}>
                Overall system compliance
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* 3. Recent Activity Feed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <LinearGradient
            colors={[Colors.backgroundSecondary, Colors.backgroundPrimary]}
            style={styles.activityList}
          >
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityIconText}>✓</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Opening checklist completed</Text>
                <Text style={styles.activityTime}>2 minutes ago</Text>
              </View>
            </View>
            
            {isSensorBased && (
              <View style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: Colors.warning + '20' }]}>
                  <Text style={[styles.activityIconText, { color: Colors.warning }]}>⚠</Text>
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Temperature warning - Prep Room</Text>
                  <Text style={styles.activityTime}>15 minutes ago</Text>
                </View>
              </View>
            )}
            
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: Colors.info + '20' }]}>
                <Text style={[styles.activityIconText, { color: Colors.info }]}>📦</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Delivery logged - Fresh Produce Co.</Text>
                <Text style={styles.activityTime}>1 hour ago</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: Colors.success + '20' }]}>
                <Text style={[styles.activityIconText, { color: Colors.success }]}>📊</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Weekly temperature report generated</Text>
                <Text style={styles.activityTime}>3 hours ago</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 20,
    backgroundColor: Colors.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  welcomeText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  alertsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  alertsText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 32,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 24,
  },
  sensorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  sensorWrapper: {
    flex: 1,
    minWidth: 300,
  },
  progressGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  progressCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
  },
  progressPercentage: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.textPrimary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  activityList: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityIconText: {
    fontSize: 16,
    color: Colors.success,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
});
