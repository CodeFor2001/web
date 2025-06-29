import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Plus, TriangleAlert as AlertTriangle, Calendar, MapPin, User, Filter, ChevronRight, X, Save } from 'lucide-react-native';
import { Incident } from '@/types';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/Colors';

interface ExtendedIncident extends Incident {
  resolution?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
}

const mockIncidents: ExtendedIncident[] = [
  {
    id: '1',
    type: 'Temperature Deviation',
    severity: 'high',
    date: new Date(),
    location: 'Main Fridge',
    description: 'Fridge temperature exceeded 5°C for 2 hours during night shift',
    correctiveActions: 'Adjusted thermostat, checked door seals, scheduled maintenance',
    reportedBy: 'Sarah Johnson',
    status: 'investigating',
  },
  {
    id: '2',
    type: 'Cross Contamination Risk',
    severity: 'medium',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    location: 'Prep Kitchen',
    description: 'Raw chicken stored above ready-to-eat vegetables',
    correctiveActions: 'Relocated items, retrained staff on storage procedures',
    reportedBy: 'Mike Chen',
    status: 'open',
  },
  {
    id: '3',
    type: 'Equipment Malfunction',
    severity: 'critical',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    location: 'Dishwasher Area',
    description: 'Dishwasher not reaching required sanitizing temperature',
    correctiveActions: 'Equipment serviced, temperature verified, documentation updated',
    reportedBy: 'Lisa Wong',
    status: 'resolved',
    resolution: 'Dishwasher heating element was replaced and system was recalibrated. Temperature now consistently reaches 82°C as required. All dishes processed during the malfunction period were re-sanitized.',
    resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    resolvedBy: 'John Smith',
  },
];

export default function Incidents() {
  const { t } = useTranslation();

  const [showForm, setShowForm] = useState(false);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [incidents, setIncidents] = useState<ExtendedIncident[]>(mockIncidents);
  const [resolvingIncident, setResolvingIncident] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [newIncident, setNewIncident] = useState({
    type: '',
    severity: 'medium' as const,
    location: '',
    description: '',
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return Colors.error;
      case 'high': return '#EF4444';
      case 'medium': return Colors.warning;
      case 'low': return Colors.success;
      default: return Colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return Colors.success;
      case 'investigating': return Colors.warning;
      case 'open': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const updateIncidentStatus = (incidentId: string, newStatus: string) => {
    if (newStatus === 'resolved') {
      setResolvingIncident(incidentId);
      setShowResolutionModal(true);
      return;
    }

    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId 
        ? { ...incident, status: newStatus as any }
        : incident
    ));
  };

  const handleResolveIncident = () => {
    if (!resolutionText.trim()) {
      Alert.alert('Error', 'Please provide a resolution description');
      return;
    }

    if (!resolvingIncident) return;

    setIncidents(prev => prev.map(incident => 
      incident.id === resolvingIncident 
        ? { 
            ...incident, 
            status: 'resolved' as any,
            resolution: resolutionText.trim(),
            resolvedAt: new Date(),
            resolvedBy: 'Current User' // In real app, use actual user
          }
        : incident
    ));

    setShowResolutionModal(false);
    setResolutionText('');
    setResolvingIncident(null);
    Alert.alert('Success', 'Incident has been resolved');
  };

  const filteredIncidents = filterStatus === 'all' 
    ? incidents 
    : incidents.filter(i => i.status === filterStatus);

  const handleSubmit = () => {
    if (!newIncident.type.trim() || !newIncident.description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const incident: ExtendedIncident = {
      id: Date.now().toString(),
      ...newIncident,
      date: new Date(),
      reportedBy: 'Current User', // In real app, use actual user
      status: 'open',
      correctiveActions: '', // Will be added later when resolving
    };

    setIncidents([incident, ...incidents]);
    setShowForm(false);
    setNewIncident({
      type: '',
      severity: 'medium',
      location: '',
      description: '',
    });
    Alert.alert('Success', 'Incident reported successfully');
  };

  const canEditStatus = (status: string) => {
    return status === 'open' || status === 'investigating';
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'open': return 'investigating';
      case 'investigating': return 'resolved';
      default: return currentStatus;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('incidents.title')}</Text>
          <Text style={styles.subtitle}>{t('incidents.subtitle')}</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowForm(true)}
        >
          <Plus size={20} color={Colors.textInverse} />
          <Text style={styles.addButtonText}>{t('incidents.reportIncident')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={16} color={Colors.textSecondary} />
          <Text style={styles.filterText}>{t('incidents.filter')}</Text>
        </TouchableOpacity>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'open', 'investigating', 'resolved'].map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusFilter,
                filterStatus === status && styles.activeStatusFilter
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[
                styles.statusFilterText,
                filterStatus === status && styles.activeStatusFilterText
              ]}>
                {t(`incidents.${status}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.incidentsList}>
          {filteredIncidents.map(incident => (
            <View key={incident.id} style={styles.incidentCard}>
              <View style={styles.incidentHeader}>
                <View style={styles.incidentTitle}>
                  <AlertTriangle 
                    size={20} 
                    color={getSeverityColor(incident.severity)} 
                  />
                  <Text style={styles.incidentType}>{incident.type}</Text>
                </View>
                <View style={styles.statusContainer}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(incident.status)}20` }
                  ]}>
                    <Text style={[
                      styles.statusBadgeText,
                      { color: getStatusColor(incident.status) }
                    ]}>
                      {incident.status.toUpperCase()}
                    </Text>
                  </View>
                  {canEditStatus(incident.status) && (
                    <TouchableOpacity
                      style={styles.statusUpdateButton}
                      onPress={() => updateIncidentStatus(incident.id, getNextStatus(incident.status))}
                    >
                      <ChevronRight size={16} color={Colors.info} />
                      <Text style={styles.statusUpdateText}>
                        {t('incidents.moveTo', { status: getNextStatus(incident.status) })}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.incidentMeta}>
                <View style={styles.metaItem}>
                  <Calendar size={14} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>
                    {incident.date.toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <MapPin size={14} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>{incident.location}</Text>
                </View>
                <View style={styles.metaItem}>
                  <User size={14} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>{incident.reportedBy}</Text>
                </View>
              </View>

              <Text style={styles.incidentDescription}>
                {incident.description}
              </Text>

              {incident.correctiveActions && (
                <View style={styles.actionsSection}>
                  <Text style={styles.actionsTitle}>{t('incidents.correctiveActions')}:</Text>
                  <Text style={styles.actionsText}>
                    {incident.correctiveActions}
                  </Text>
                </View>
              )}

              {incident.resolution && (
                <View style={styles.resolutionSection}>
                  <Text style={styles.resolutionTitle}>Resolution:</Text>
                  <Text style={styles.resolutionText}>
                    {incident.resolution}
                  </Text>
                  {incident.resolvedAt && incident.resolvedBy && (
                    <Text style={styles.resolutionMeta}>
                      Resolved by {incident.resolvedBy} on {incident.resolvedAt.toLocaleDateString()} at {incident.resolvedAt.toLocaleTimeString()}
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.severityIndicator}>
                <View style={[
                  styles.severityDot,
                  { backgroundColor: getSeverityColor(incident.severity) }
                ]} />
                <Text style={styles.severityLabel}>
                  {incident.severity.toUpperCase()} {t('incidents.severity').toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {filteredIncidents.length === 0 && (
          <View style={styles.emptyState}>
            <AlertTriangle size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>{t('incidents.noIncidentsFound')}</Text>
            <Text style={styles.emptySubtitle}>
              {filterStatus === 'all' 
                ? t('incidents.noIncidentsReported')
                : t('incidents.noStatusIncidents', { status: filterStatus })
              }
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Incident Modal */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('incidents.reportIncident')}</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('incidents.incidentType')} *</Text>
                <TextInput
                  style={styles.input}
                  value={newIncident.type}
                  onChangeText={(text) => setNewIncident(prev => ({ ...prev, type: text }))}
                  placeholder={t('incidents.incidentType')}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('incidents.severity')}</Text>
                <View style={styles.severityButtons}>
                  {['low', 'medium', 'high', 'critical'].map(level => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.severityButton,
                        newIncident.severity === level && styles.activeSeverityButton,
                        { borderColor: getSeverityColor(level) }
                      ]}
                      onPress={() => setNewIncident(prev => ({ ...prev, severity: level as any }))}
                    >
                      <Text style={[
                        styles.severityText,
                        newIncident.severity === level && { color: getSeverityColor(level) }
                      ]}>
                        {t(`incidents.${level}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('incidents.location')}</Text>
                <TextInput
                  style={styles.input}
                  value={newIncident.location}
                  onChangeText={(text) => setNewIncident(prev => ({ ...prev, location: text }))}
                  placeholder={t('incidents.location')}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('incidents.description')} *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newIncident.description}
                  onChangeText={(text) => setNewIncident(prev => ({ ...prev, description: text }))}
                  placeholder={t('incidents.description')}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>{t('incidents.submit')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Resolution Modal */}
      <Modal visible={showResolutionModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Resolve Incident</Text>
              <TouchableOpacity onPress={() => {
                setShowResolutionModal(false);
                setResolutionText('');
                setResolvingIncident(null);
              }}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Resolution Description *</Text>
                <Text style={styles.helperText}>
                  Please provide a detailed description of how this incident was resolved.
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={resolutionText}
                  onChangeText={setResolutionText}
                  placeholder="Describe the resolution steps taken, any repairs made, and preventive measures implemented..."
                  multiline
                  numberOfLines={6}
                  autoFocus
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowResolutionModal(false);
                    setResolutionText('');
                    setResolvingIncident(null);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.resolveButton, !resolutionText.trim() && styles.disabledButton]}
                  onPress={handleResolveIncident}
                  disabled={!resolutionText.trim()}
                >
                  <Save size={16} color={Colors.textInverse} />
                  <Text style={styles.resolveButtonText}>Resolve Incident</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    padding: 32,
    backgroundColor: Colors.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#237ECD',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textInverse,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: Colors.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 6,
    marginRight: 16,
    gap: 4,
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  statusFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
  },
  activeStatusFilter: {
    backgroundColor: Colors.info,
  },
  statusFilterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  activeStatusFilterText: {
    color: Colors.textInverse,
  },
  content: {
    flex: 1,
  },
  incidentsList: {
    padding: 32,
    gap: 16,
  },
  incidentCard: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  incidentTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  incidentType: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
  },
  statusContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  statusUpdateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.info + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusUpdateText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.info,
  },
  incidentMeta: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  incidentDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textPrimary,
    lineHeight: 24,
    marginBottom: 16,
  },
  actionsSection: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  actionsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  actionsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  resolutionSection: {
    backgroundColor: Colors.success + '10',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  resolutionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  resolutionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: 8,
  },
  resolutionMeta: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  severityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  severityLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textTertiary,
    textAlign: 'center',
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
    maxWidth: 600,
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
  formContainer: {
    padding: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
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
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  severityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  severityButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeSeverityButton: {
    backgroundColor: Colors.backgroundSecondary,
  },
  severityText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
  },
  submitButton: {
    backgroundColor: '#237ECD',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textInverse,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
  resolveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#237ECD',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: Colors.textTertiary,
  },
  resolveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textInverse,
  },
});