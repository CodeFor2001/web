import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import {
  CircleAlert as AlertCircle,
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  Save,
  Settings,
  Thermometer,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

import SensorCard from '@/components/SensorCard';
import TemperatureChart from '@/components/TemperatureChart';
import { Sensor, TemperatureReading } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';

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

const mockReadings: TemperatureReading[] = [
  { id: '1', sensorId: '1', temperature: 3.0, timestamp: new Date(Date.now() - 6 * 3600000) },
  { id: '2', sensorId: '1', temperature: 3.2, timestamp: new Date(Date.now() - 5 * 3600000) },
  { id: '3', sensorId: '1', temperature: 3.1, timestamp: new Date(Date.now() - 4 * 3600000) },
  { id: '4', sensorId: '1', temperature: 3.3, timestamp: new Date(Date.now() - 3 * 3600000) },
  { id: '5', sensorId: '1', temperature: 3.2, timestamp: new Date(Date.now() - 2 * 3600000) },
  { id: '6', sensorId: '1', temperature: 3.4, timestamp: new Date(Date.now() - 1 * 3600000) },
  { id: '7', sensorId: '1', temperature: 3.2, timestamp: new Date() },
];

interface SensorDetailModalProps {
  sensor: Sensor | null;
  visible: boolean;
  onClose: () => void;
  onSave: (sensorId: string, updates: Partial<Sensor>) => void;
  isAdmin: boolean;
}

function SensorDetailModal({ sensor, visible, onClose, onSave, isAdmin }: SensorDetailModalProps) {
  const [editValues, setEditValues] = useState({
    targetMin: sensor?.targetMin?.toString() || '',
    targetMax: sensor?.targetMax?.toString() || '',
    alertsEnabled: true,
  });

  React.useEffect(() => {
    if (sensor) {
      setEditValues({
        targetMin: sensor.targetMin.toString(),
        targetMax: sensor.targetMax.toString(),
        alertsEnabled: true,
      });
    }
  }, [sensor]);

  const handleSave = () => {
    if (!sensor) return;

    const targetMin = parseFloat(editValues.targetMin);
    const targetMax = parseFloat(editValues.targetMax);

    if (isNaN(targetMin) || isNaN(targetMax)) {
      Alert.alert('Error', 'Please enter valid numeric values');
      return;
    }

    if (targetMax <= targetMin) {
      Alert.alert('Error', 'Maximum temperature must be greater than minimum');
      return;
    }

    onSave(sensor.id, {
      targetMin,
      targetMax,
    });

    Alert.alert('Success', 'Sensor calibration updated successfully');
    onClose();
  };

  if (!sensor) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sensor Details</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.sensorInfo}>
              <Text style={styles.sensorName}>{sensor.name}</Text>
              <Text style={styles.sensorLocation}>{sensor.location}</Text>
              <Text style={styles.sensorId}>ID: {sensor.id}</Text>
            </View>

            <View style={styles.currentReading}>
              <Text style={styles.currentTemp}>{sensor.currentTemp}°C</Text>
              <Text style={styles.currentLabel}>Current Temperature</Text>
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.settingsTitle}>Temperature Limits</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Minimum Temperature (°C)</Text>
                <TextInput
                  style={[styles.input, !isAdmin && styles.inputDisabled]}
                  value={editValues.targetMin}
                  onChangeText={(text) => setEditValues(prev => ({ ...prev, targetMin: text }))}
                  keyboardType="numeric"
                  editable={isAdmin}
                  placeholder="Min temp"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Maximum Temperature (°C)</Text>
                <TextInput
                  style={[styles.input, !isAdmin && styles.inputDisabled]}
                  value={editValues.targetMax}
                  onChangeText={(text) => setEditValues(prev => ({ ...prev, targetMax: text }))}
                  keyboardType="numeric"
                  editable={isAdmin}
                  placeholder="Max temp"
                />
              </View>

              <View style={styles.switchGroup}>
                <Text style={styles.inputLabel}>Temperature Alerts</Text>
                <Switch
                  value={editValues.alertsEnabled}
                  onValueChange={(value) => setEditValues(prev => ({ ...prev, alertsEnabled: value }))}
                  trackColor={{ false: Colors.borderMedium, true: Colors.success }}
                  thumbColor={editValues.alertsEnabled ? Colors.textInverse : Colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.statusSection}>
              <Text style={styles.statusTitle}>Status Information</Text>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Current Status:</Text>
                <View style={[styles.statusBadge, { backgroundColor: sensor.status === 'ok' ? Colors.success + '20' : Colors.warning + '20' }]}>
                  <Text style={[styles.statusText, { color: sensor.status === 'ok' ? Colors.success : Colors.warning }]}>
                    {sensor.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Last Update:</Text>
                <Text style={styles.statusValue}>{sensor.lastUpdate.toLocaleString()}</Text>
              </View>
            </View>
          </ScrollView>

          {isAdmin && (
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Save size={16} color={Colors.textInverse} />
                <Text style={styles.saveButtonText}>Save Calibration</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

interface AddSensorModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (sensor: Omit<Sensor, 'id' | 'currentTemp' | 'status' | 'lastUpdate'>) => void;
}

function AddSensorModal({ visible, onClose, onAdd }: AddSensorModalProps) {
  const [newSensor, setNewSensor] = useState({
    name: '',
    type: 'fridge' as const,
    location: '',
    targetMin: '',
    targetMax: '',
  });

  const handleAdd = () => {
    if (!newSensor.name.trim() || !newSensor.location.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const targetMin = parseFloat(newSensor.targetMin);
    const targetMax = parseFloat(newSensor.targetMax);

    if (isNaN(targetMin) || isNaN(targetMax)) {
      Alert.alert('Error', 'Please enter valid temperature limits');
      return;
    }

    if (targetMax <= targetMin) {
      Alert.alert('Error', 'Maximum temperature must be greater than minimum');
      return;
    }

    onAdd({
      name: newSensor.name,
      type: newSensor.type,
      location: newSensor.location,
      targetMin,
      targetMax,
    });

    setNewSensor({
      name: '',
      type: 'fridge',
      location: '',
      targetMin: '',
      targetMax: '',
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Sensor</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sensor Name *</Text>
              <TextInput
                style={styles.input}
                value={newSensor.name}
                onChangeText={(text) => setNewSensor(prev => ({ ...prev, name: text }))}
                placeholder="Enter sensor name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sensor Type</Text>
              <View style={styles.typeButtons}>
                {['fridge', 'freezer', 'ambient'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      newSensor.type === type && styles.activeTypeButton
                    ]}
                    onPress={() => setNewSensor(prev => ({ ...prev, type: type as any }))}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      newSensor.type === type && styles.activeTypeButtonText
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location *</Text>
              <TextInput
                style={styles.input}
                value={newSensor.location}
                onChangeText={(text) => setNewSensor(prev => ({ ...prev, location: text }))}
                placeholder="Enter location"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Minimum Temperature (°C) *</Text>
              <TextInput
                style={styles.input}
                value={newSensor.targetMin}
                onChangeText={(text) => setNewSensor(prev => ({ ...prev, targetMin: text }))}
                keyboardType="numeric"
                placeholder="Min temp"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Maximum Temperature (°C) *</Text>
              <TextInput
                style={styles.input}
                value={newSensor.targetMax}
                onChangeText={(text) => setNewSensor(prev => ({ ...prev, targetMax: text }))}
                keyboardType="numeric"
                placeholder="Max temp"
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleAdd}>
              <Plus size={16} color={Colors.textInverse} />
              <Text style={styles.saveButtonText}>Add Sensor</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function Temperature() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sensors, setSensors] = useState<Sensor[]>(mockSensors);
  const [selectedSensor, setSelectedSensor] = useState<string>('1');
  const [alertsVisible, setAlertsVisible] = useState(true);
  const [showSensorDetail, setShowSensorDetail] = useState(false);
  const [showAddSensor, setShowAddSensor] = useState(false);
  const [detailSensor, setDetailSensor] = useState<Sensor | null>(null);

  const isAdmin = user?.role === 'admin';
  const activeAlerts = sensors.filter((s) => s.status !== 'ok');
  const selectedSensorData = sensors.find((s) => s.id === selectedSensor);
  const sensorReadings = mockReadings.filter((r) => r.sensorId === selectedSensor);

  const handleSensorClick = (sensor: Sensor) => {
    setDetailSensor(sensor);
    setShowSensorDetail(true);
  };

  const handleSensorSave = (sensorId: string, updates: Partial<Sensor>) => {
    setSensors(prev => prev.map(sensor => 
      sensor.id === sensorId ? { ...sensor, ...updates } : sensor
    ));
  };

  const handleAddSensor = (newSensorData: Omit<Sensor, 'id' | 'currentTemp' | 'status' | 'lastUpdate'>) => {
    const newSensor: Sensor = {
      ...newSensorData,
      id: Date.now().toString(),
      currentTemp: 0,
      status: 'ok',
      lastUpdate: new Date(),
    };
    setSensors(prev => [...prev, newSensor]);
    Alert.alert('Success', 'Sensor added successfully');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('temperature.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('temperature.subtitle')}</Text>
        </View>

        {activeAlerts.length > 0 && alertsVisible && (
          <View style={styles.alertsSection}>
            <View style={styles.alertHeader}>
              <AlertCircle size={20} color="#EF4444" />
              <Text style={styles.alertTitle}>
                {t('temperature.activeAlerts', { count: activeAlerts.length })}
              </Text>
              <TouchableOpacity onPress={() => setAlertsVisible(false)}>
                <Text style={styles.dismissText}>{t('temperature.dismiss')}</Text>
              </TouchableOpacity>
            </View>
            {activeAlerts.map((sensor) => (
              <Text key={sensor.id} style={styles.alertText}>
                {sensor.name}: {sensor.currentTemp}°C - {sensor.status.toUpperCase()}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('temperature.allSensors')}</Text>
            {isAdmin && (
              <TouchableOpacity
                style={styles.addSensorButton}
                onPress={() => setShowAddSensor(true)}
              >
                <Plus size={20} color={Colors.textInverse} />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.sensorsGrid}>
            {sensors.map((sensor, index) => (
              <TouchableOpacity
                key={sensor.id}
                onPress={() => handleSensorClick(sensor)}
                style={[
                  styles.sensorWrapper,
                  selectedSensor === sensor.id && styles.selectedSensor,
                ]}
              >
                <SensorCard sensor={sensor} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedSensorData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('temperature.temperatureTrends')}</Text>
            <TemperatureChart
              readings={sensorReadings}
              title={`${selectedSensorData.name} - ${t('temperature.lastHours')}`}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('temperature.statistics')}</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <TrendingUp size={24} color="#00B88A" />
              <Text style={styles.statValue}>{t('temperature.24hHigh')}</Text>
              <Text style={styles.statNumber}>4.2°C</Text>
            </View>
            <View style={styles.statCard}>
              <TrendingDown size={24} color="#237ECD" />
              <Text style={styles.statValue}>{t('temperature.24hLow')}</Text>
              <Text style={styles.statNumber}>2.8°C</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <SensorDetailModal
        sensor={detailSensor}
        visible={showSensorDetail}
        onClose={() => setShowSensorDetail(false)}
        onSave={handleSensorSave}
        isAdmin={isAdmin}
      />

      <AddSensorModal
        visible={showAddSensor}
        onClose={() => setShowAddSensor(false)}
        onAdd={handleAddSensor}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 32,
    paddingBottom: 16,
    backgroundColor: '#F6FAFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15,27,45,0.08)',
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#0F1B2D',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#677D95',
  },
  alertsSection: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    margin: 20,
    padding: 16,
    borderRadius: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    marginLeft: 8,
    flex: 1,
  },
  dismissText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#677D95',
  },
  alertText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#7F1D1D',
    marginLeft: 28,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#0F1B2D',
  },
  addSensorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.info,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.info,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sensorsGrid: {
    gap: 16,
  },
  sensorWrapper: {
    borderRadius: 8,
  },
  selectedSensor: {
    borderWidth: 2,
    borderColor: '#00B88A',
    shadowColor: '#00B88A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F6FAFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(15,27,45,0.08)',
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#677D95',
    marginTop: 8,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#0F1B2D',
    marginTop: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
  },
  modalBody: {
    padding: 24,
    maxHeight: 400,
  },
  sensorInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sensorName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sensorLocation: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  sensorId: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textTertiary,
  },
  currentReading: {
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  currentTemp: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    color: Colors.info,
    marginBottom: 4,
  },
  currentLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: Colors.backgroundPrimary,
    color: Colors.textPrimary,
  },
  inputDisabled: {
    backgroundColor: Colors.backgroundSecondary,
    color: Colors.textSecondary,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusSection: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  statusValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.backgroundPrimary,
  },
  activeTypeButton: {
    backgroundColor: Colors.info,
    borderColor: Colors.info,
  },
  typeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  activeTypeButtonText: {
    color: Colors.textInverse,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#237ECD',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textInverse,
  },
});