import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Thermometer, Save, RotateCcw, TrendingUp, TrendingDown, Vibrate as Calibrate } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface SensorCalibration {
  id: string;
  name: string;
  type: 'fridge' | 'freezer' | 'ambient';
  location: string;
  currentTemp: number;
  upperTempLimit: number;
  lowerTempLimit: number;
  offset: number;
  lastCalibrated: Date;
  status: 'ok' | 'warning' | 'critical';
}

const mockSensors: SensorCalibration[] = [
  {
    id: '1',
    name: 'Main Fridge',
    type: 'fridge',
    location: 'Kitchen',
    currentTemp: 3.2,
    upperTempLimit: 5,
    lowerTempLimit: 0,
    offset: 0.2,
    lastCalibrated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'ok',
  },
  {
    id: '2',
    name: 'Freezer Unit A',
    type: 'freezer',
    location: 'Storage Room',
    currentTemp: -18.5,
    upperTempLimit: -15,
    lowerTempLimit: -20,
    offset: -0.1,
    lastCalibrated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    status: 'ok',
  },
  {
    id: '3',
    name: 'Prep Room',
    type: 'ambient',
    location: 'Prep Kitchen',
    currentTemp: 22.1,
    upperTempLimit: 25,
    lowerTempLimit: 18,
    offset: 0.0,
    lastCalibrated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    status: 'warning',
  },
  {
    id: '4',
    name: 'Walk-in Cooler',
    type: 'fridge',
    location: 'Storage Area',
    currentTemp: 4.8,
    upperTempLimit: 6,
    lowerTempLimit: 2,
    offset: 0.5,
    lastCalibrated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'ok',
  },
];

export default function SensorCalibration() {
  const { t } = useTranslation();
  const [sensors, setSensors] = useState<SensorCalibration[]>(mockSensors);
  const [editingSensor, setEditingSensor] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    upperTempLimit: string;
    lowerTempLimit: string;
    offset: string;
  }>({
    upperTempLimit: '',
    lowerTempLimit: '',
    offset: '',
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fridge':
        return '❄️';
      case 'freezer':
        return '🧊';
      case 'ambient':
        return '🌡️';
      default:
        return '📊';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#64748B';
    }
  };

  const startEditing = (sensor: SensorCalibration) => {
    setEditingSensor(sensor.id);
    setEditValues({
      upperTempLimit: sensor.upperTempLimit.toString(),
      lowerTempLimit: sensor.lowerTempLimit.toString(),
      offset: sensor.offset.toString(),
    });
  };

  const cancelEditing = () => {
    setEditingSensor(null);
    setEditValues({
      upperTempLimit: '',
      lowerTempLimit: '',
      offset: '',
    });
  };

  const saveCalibration = (sensorId: string) => {
    const upperLimit = parseFloat(editValues.upperTempLimit);
    const lowerLimit = parseFloat(editValues.lowerTempLimit);
    const offset = parseFloat(editValues.offset);

    if (isNaN(upperLimit) || isNaN(lowerLimit) || isNaN(offset)) {
      Alert.alert('Error', 'Please enter valid numeric values');
      return;
    }

    if (upperLimit <= lowerLimit) {
      Alert.alert('Error', 'Upper temperature limit must be greater than lower limit');
      return;
    }

    if (Math.abs(offset) > 5) {
      Alert.alert('Error', 'Offset cannot exceed ±5°C');
      return;
    }

    setSensors(prev => prev.map(sensor => 
      sensor.id === sensorId 
        ? { 
            ...sensor, 
            upperTempLimit: upperLimit,
            lowerTempLimit: lowerLimit,
            offset: offset,
            lastCalibrated: new Date()
          }
        : sensor
    ));

    setEditingSensor(null);
    setEditValues({
      upperTempLimit: '',
      lowerTempLimit: '',
      offset: '',
    });

    Alert.alert('Success', 'Sensor calibration updated successfully');
  };

  const resetCalibration = (sensorId: string) => {
    Alert.alert(
      'Reset Calibration',
      'Are you sure you want to reset the calibration to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            setSensors(prev => prev.map(sensor => 
              sensor.id === sensorId 
                ? { 
                    ...sensor, 
                    offset: 0,
                    lastCalibrated: new Date()
                  }
                : sensor
            ));
            Alert.alert('Success', 'Sensor calibration reset successfully');
          },
        },
      ]
    );
  };

  const calibrateAllSensors = () => {
    Alert.alert(
      'Calibrate All Sensors',
      'This will run an automatic calibration process for all sensors. This may take a few minutes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Calibration',
          onPress: () => {
            Alert.alert('Calibration Started', 'All sensors are being calibrated. You will be notified when complete.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Sensor Calibration</Text>
          <Text style={styles.subtitle}>Adjust sensor limits and calibration settings</Text>
        </View>
        <TouchableOpacity 
          style={styles.calibrateAllButton}
          onPress={calibrateAllSensors}
        >
          <Calibrate size={20} color="#FFFFFF" />
          <Text style={styles.calibrateAllButtonText}>Calibrate All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Calibration Guidelines</Text>
            <Text style={styles.infoText}>
              • Upper and lower temperature limits define alert thresholds{'\n'}
              • Offset values should be between -5°C and +5°C{'\n'}
              • Positive offset increases displayed temperature{'\n'}
              • Negative offset decreases displayed temperature{'\n'}
              • Calibrate sensors monthly or when readings seem inaccurate{'\n'}
              • Use a certified reference thermometer for comparison
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sensors ({sensors.length})</Text>
          <View style={styles.sensorsList}>
            {sensors.map(sensor => {
              const isEditing = editingSensor === sensor.id;
              const adjustedTemp = sensor.currentTemp + sensor.offset;
              const isOutOfRange = adjustedTemp > sensor.upperTempLimit || adjustedTemp < sensor.lowerTempLimit;

              return (
                <View key={sensor.id} style={styles.sensorCard}>
                  <View style={styles.sensorHeader}>
                    <View style={styles.sensorInfo}>
                      <View style={styles.sensorTitleRow}>
                        <Text style={styles.sensorIcon}>{getTypeIcon(sensor.type)}</Text>
                        <View style={styles.sensorDetails}>
                          <Text style={styles.sensorName}>{sensor.name}</Text>
                          <Text style={styles.sensorLocation}>{sensor.location}</Text>
                        </View>
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: `${getStatusColor(sensor.status)}20` }
                        ]}>
                          <Text style={[
                            styles.statusText,
                            { color: getStatusColor(sensor.status) }
                          ]}>
                            {sensor.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {isOutOfRange && (
                    <View style={styles.alertBanner}>
                      <Text style={styles.alertText}>
                        ⚠️ Temperature Alert: Current reading ({adjustedTemp.toFixed(1)}°C) is outside limits
                      </Text>
                    </View>
                  )}

                  <View style={styles.temperatureSection}>
                    <View style={styles.temperatureRow}>
                      <View style={styles.tempDisplay}>
                        <Text style={styles.tempLabel}>Raw Reading</Text>
                        <Text style={styles.tempValue}>{sensor.currentTemp}°C</Text>
                      </View>
                      <View style={styles.tempDisplay}>
                        <Text style={styles.tempLabel}>Adjusted Reading</Text>
                        <Text style={[
                          styles.tempValue, 
                          styles.adjustedTemp,
                          isOutOfRange && styles.alertTemp
                        ]}>
                          {adjustedTemp.toFixed(1)}°C
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.calibrationSection}>
                    <View style={styles.calibrationGrid}>
                      <View style={styles.calibrationField}>
                        <Text style={styles.fieldLabel}>Upper Temp Limit (°C)</Text>
                        {isEditing ? (
                          <TextInput
                            style={styles.fieldInput}
                            value={editValues.upperTempLimit}
                            onChangeText={(value) => setEditValues(prev => ({ ...prev, upperTempLimit: value }))}
                            keyboardType="numeric"
                            placeholder="Upper limit"
                          />
                        ) : (
                          <Text style={styles.fieldValue}>{sensor.upperTempLimit}°C</Text>
                        )}
                      </View>

                      <View style={styles.calibrationField}>
                        <Text style={styles.fieldLabel}>Lower Temp Limit (°C)</Text>
                        {isEditing ? (
                          <TextInput
                            style={styles.fieldInput}
                            value={editValues.lowerTempLimit}
                            onChangeText={(value) => setEditValues(prev => ({ ...prev, lowerTempLimit: value }))}
                            keyboardType="numeric"
                            placeholder="Lower limit"
                          />
                        ) : (
                          <Text style={styles.fieldValue}>{sensor.lowerTempLimit}°C</Text>
                        )}
                      </View>

                      <View style={styles.calibrationField}>
                        <Text style={styles.fieldLabel}>Offset (°C)</Text>
                        {isEditing ? (
                          <TextInput
                            style={styles.fieldInput}
                            value={editValues.offset}
                            onChangeText={(value) => setEditValues(prev => ({ ...prev, offset: value }))}
                            keyboardType="numeric"
                            placeholder="Offset"
                          />
                        ) : (
                          <Text style={styles.fieldValue}>
                            {sensor.offset > 0 ? '+' : ''}{sensor.offset}°C
                          </Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.calibrationActions}>
                      {isEditing ? (
                        <>
                          <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={cancelEditing}
                          >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.saveButton}
                            onPress={() => saveCalibration(sensor.id)}
                          >
                            <Save size={16} color="#FFFFFF" />
                            <Text style={styles.saveButtonText}>Save</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => startEditing(sensor)}
                          >
                            <Text style={styles.editButtonText}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.resetButton}
                            onPress={() => resetCalibration(sensor.id)}
                          >
                            <RotateCcw size={16} color="#64748B" />
                            <Text style={styles.resetButtonText}>Reset</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>

                  <View style={styles.calibrationInfo}>
                    <Text style={styles.lastCalibratedText}>
                      Last calibrated: {sensor.lastCalibrated.toLocaleDateString()} at {sensor.lastCalibrated.toLocaleTimeString()}
                    </Text>
                    {sensor.offset !== 0 && (
                      <View style={styles.offsetIndicator}>
                        {sensor.offset > 0 ? (
                          <TrendingUp size={14} color="#EF4444" />
                        ) : (
                          <TrendingDown size={14} color="#2563EB" />
                        )}
                        <Text style={styles.offsetIndicatorText}>
                          {sensor.offset > 0 ? '+' : ''}{sensor.offset}°C offset applied
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  calibrateAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  calibrateAllButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  infoSection: {
    padding: 32,
    paddingBottom: 16,
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 20,
  },
  section: {
    padding: 32,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 24,
  },
  sensorsList: {
    gap: 20,
  },
  sensorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sensorHeader: {
    marginBottom: 20,
  },
  sensorInfo: {
    flex: 1,
  },
  sensorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sensorIcon: {
    fontSize: 24,
  },
  sensorDetails: {
    flex: 1,
  },
  sensorName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  sensorLocation: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  alertBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  alertText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#DC2626',
  },
  temperatureSection: {
    marginBottom: 20,
  },
  temperatureRow: {
    flexDirection: 'row',
    gap: 24,
  },
  tempDisplay: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  tempLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 4,
  },
  tempValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  adjustedTemp: {
    color: '#2563EB',
  },
  alertTemp: {
    color: '#EF4444',
  },
  calibrationSection: {
    marginBottom: 16,
  },
  calibrationGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  calibrationField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 8,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#FFFFFF',
    color: '#1E293B',
  },
  fieldValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
  },
  calibrationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 4,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    gap: 4,
  },
  resetButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  calibrationInfo: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  lastCalibratedText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginBottom: 8,
  },
  offsetIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  offsetIndicatorText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
});