import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {
  Plus,
  Truck,
  Thermometer,
  CircleCheck as CheckCircle,
  CircleAlert as AlertCircle,
  X,
  Save,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/Colors';

interface Supplier {
  id: string;
  name: string;
  contactName: string;
  telephone: string;
  email: string;
  address: string;
}

interface Delivery {
  id: string;
  supplier: string;
  referenceId: string;
  date: Date;
  status: {
    intact: boolean;
    inDate: boolean;
    correctQuantity: boolean;
  };
  temperatureCategory: 'chilled' | 'frozen' | 'ambient';
  probeTemperature?: number;
  overallStatus: 'pending' | 'accepted' | 'rejected';
}

const mockDeliveries: Delivery[] = [
  {
    id: '1',
    supplier: 'Fresh Produce Co.',
    referenceId: 'FPC-2024-001',
    date: new Date(),
    status: { intact: true, inDate: true, correctQuantity: true },
    temperatureCategory: 'chilled',
    probeTemperature: 2.5,
    overallStatus: 'accepted',
  },
  {
    id: '2',
    supplier: 'Frozen Foods Ltd.',
    referenceId: 'FFL-2024-089',
    date: new Date(Date.now() - 86400000),
    status: { intact: true, inDate: false, correctQuantity: true },
    temperatureCategory: 'frozen',
    probeTemperature: -16.2,
    overallStatus: 'rejected',
  },
  {
    id: '3',
    supplier: 'Dry Goods Supplier',
    referenceId: 'DGS-2024-156',
    date: new Date(Date.now() - 2 * 86400000),
    status: { intact: true, inDate: true, correctQuantity: true },
    temperatureCategory: 'ambient',
    overallStatus: 'accepted',
  },
];

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Fresh Produce Co.',
    contactName: 'John Smith',
    telephone: '+1 555-0123',
    email: 'john@freshproduce.com',
    address: '123 Market St, City, State 12345',
  },
  {
    id: '2',
    name: 'Frozen Foods Ltd.',
    contactName: 'Sarah Johnson',
    telephone: '+1 555-0456',
    email: 'sarah@frozenfoods.com',
    address: '456 Cold Storage Ave, City, State 67890',
  },
  {
    id: '3',
    name: 'Dry Goods Supplier',
    contactName: 'Mike Chen',
    telephone: '+1 555-0789',
    email: 'mike@drygoods.com',
    address: '789 Warehouse Blvd, City, State 54321',
  },
];

export default function Deliveries() {
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contactName: '',
    telephone: '',
    email: '',
    address: '',
  });
  const [newDelivery, setNewDelivery] = useState({
    supplier: '',
    referenceId: '',
    status: { intact: true, inDate: true, correctQuantity: true },
    temperatureCategory: 'ambient' as const,
    probeTemperature: 0,
  });

  const [screenData, setScreenData] = React.useState(Dimensions.get('window'));

  React.useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  const isPortrait = screenData.height > screenData.width;
  const isSmallScreen = screenData.width < 768;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      case 'pending':
        return '#F59E0B';
      default:
        return '#64748B';
    }
  };

  const handleAddDelivery = () => {
    console.log('Add delivery:', newDelivery);
    setShowAddForm(false);
    setNewDelivery({
      supplier: '',
      referenceId: '',
      status: { intact: true, inDate: true, correctQuantity: true },
      temperatureCategory: 'ambient',
      probeTemperature: 0,
    });
  };

  const handleAddSupplier = () => {
    if (!newSupplier.name.trim() || !newSupplier.contactName.trim()) {
      alert('Please fill in required fields');
      return;
    }

    const supplier: Supplier = {
      id: Date.now().toString(),
      ...newSupplier,
    };

    setSuppliers([...suppliers, supplier]);
    setNewSupplier({
      name: '',
      contactName: '',
      telephone: '',
      email: '',
      address: '',
    });
    setShowSupplierForm(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('deliveries.title')}</Text>
          <Text style={styles.subtitle}>{t('deliveries.subtitle')}</Text>
        </View>
        <View style={[
          styles.headerActions,
          (isPortrait || isSmallScreen) && styles.headerActionsVertical
        ]}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowSupplierForm(true)}
          >
            <Plus size={20} color="#237ECD" />
            <Text style={styles.secondaryButtonText}>{t('deliveries.addSupplier')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setShowAddForm(true)}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>{t('deliveries.addDelivery')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('deliveries.recentDeliveries')}</Text>
          
          <View style={styles.deliveriesList}>
            {mockDeliveries.map((delivery) => (
              <View key={delivery.id} style={styles.deliveryCard}>
                <View style={styles.deliveryHeader}>
                  <View style={styles.deliveryIcon}>
                    <Truck size={24} color="#237ECD" />
                  </View>
                  <View style={styles.deliveryInfo}>
                    <Text style={styles.deliverySupplier}>{delivery.supplier}</Text>
                    <Text style={styles.deliveryReference}>Ref: {delivery.referenceId}</Text>
                    <Text style={styles.deliveryDate}>{delivery.date.toLocaleDateString()}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(delivery.overallStatus)}20` },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: getStatusColor(delivery.overallStatus) }]}>
                      {t(`deliveries.${delivery.overallStatus}`)}
                    </Text>
                  </View>
                </View>

                <View style={styles.deliveryDetails}>
                  <View style={styles.statusChecks}>
                    {['intact', 'inDate', 'correctQuantity'].map((key) => (
                      <View key={key} style={styles.statusCheck}>
                        {delivery.status[key as keyof typeof delivery.status] ? (
                          <CheckCircle size={16} color="#10B981" />
                        ) : (
                          <AlertCircle size={16} color="#EF4444" />
                        )}
                        <Text style={styles.statusCheckText}>{t(`deliveries.${key}`)}</Text>
                      </View>
                    ))}
                  </View>

                  {delivery.probeTemperature !== undefined && (
                    <View style={styles.temperatureInfo}>
                      <Thermometer size={16} color="#237ECD" />
                      <Text style={styles.temperatureText}>
                        {t('deliveries.probeTemperature', {
                          temp: delivery.probeTemperature,
                        })}{' '}
                        ({t(`deliveries.${delivery.temperatureCategory}`)})
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Add Delivery Modal */}
      <Modal visible={showAddForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('deliveries.addDelivery')}</Text>
              <TouchableOpacity onPress={() => setShowAddForm(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('deliveries.supplier')}</Text>
                <ScrollView style={styles.supplierList} showsVerticalScrollIndicator={false}>
                  {suppliers.map((supplier) => (
                    <TouchableOpacity
                      key={supplier.id}
                      style={[
                        styles.supplierOption,
                        newDelivery.supplier === supplier.name && styles.selectedSupplier
                      ]}
                      onPress={() => setNewDelivery((prev) => ({ ...prev, supplier: supplier.name }))}
                    >
                      <Text style={[
                        styles.supplierName,
                        newDelivery.supplier === supplier.name && styles.selectedSupplierText
                      ]}>
                        {supplier.name}
                      </Text>
                      <Text style={styles.supplierContact}>{supplier.contactName}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('deliveries.referenceId')}</Text>
                <TextInput
                  style={styles.input}
                  value={newDelivery.referenceId}
                  onChangeText={(text) =>
                    setNewDelivery((prev) => ({ ...prev, referenceId: text }))
                  }
                  placeholder="Enter reference ID"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('deliveries.deliveryStatus')}</Text>
                <View style={styles.statusToggles}>
                  {['intact', 'inDate', 'correctQuantity'].map((key) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.statusToggle,
                        newDelivery.status[key as keyof typeof newDelivery.status] && styles.activeStatusToggle
                      ]}
                      onPress={() =>
                        setNewDelivery((prev) => ({
                          ...prev,
                          status: {
                            ...prev.status,
                            [key]: !prev.status[key as keyof typeof prev.status],
                          },
                        }))
                      }
                    >
                      <Text style={[
                        styles.statusToggleText,
                        newDelivery.status[key as keyof typeof newDelivery.status] && styles.activeStatusToggleText
                      ]}>
                        {t(`deliveries.${key}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('deliveries.temperatureCategory')}</Text>
                <View style={styles.categoryButtons}>
                  {['chilled', 'frozen', 'ambient'].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryButton,
                        newDelivery.temperatureCategory === cat && styles.activeCategoryButton
                      ]}
                      onPress={() =>
                        setNewDelivery((prev) => ({
                          ...prev,
                          temperatureCategory: cat as any,
                        }))
                      }
                    >
                      <Text style={[
                        styles.categoryText,
                        newDelivery.temperatureCategory === cat && styles.activeCategoryText
                      ]}>
                        {t(`deliveries.${cat}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Temperature (°C): {newDelivery.probeTemperature.toFixed(1)}</Text>
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderLabel}>-20°C</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={-20}
                    maximumValue={30}
                    value={newDelivery.probeTemperature}
                    onValueChange={(value) =>
                      setNewDelivery((prev) => ({ ...prev, probeTemperature: value }))
                    }
                    minimumTrackTintColor="#237ECD"
                    maximumTrackTintColor="#E2E8F0"
                    thumbTintColor="#237ECD"
                  />
                  <Text style={styles.sliderLabel}>30°C</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleAddDelivery}>
                <Text style={styles.submitButtonText}>{t('deliveries.addDelivery')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Supplier Modal */}
      <Modal visible={showSupplierForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('deliveries.addSupplier')}</Text>
              <TouchableOpacity onPress={() => setShowSupplierForm(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Supplier Name *</Text>
                <TextInput
                  style={styles.input}
                  value={newSupplier.name}
                  onChangeText={(text) => setNewSupplier(prev => ({ ...prev, name: text }))}
                  placeholder="Enter supplier name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Contact Name *</Text>
                <TextInput
                  style={styles.input}
                  value={newSupplier.contactName}
                  onChangeText={(text) => setNewSupplier(prev => ({ ...prev, contactName: text }))}
                  placeholder="Enter contact person name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Telephone</Text>
                <TextInput
                  style={styles.input}
                  value={newSupplier.telephone}
                  onChangeText={(text) => setNewSupplier(prev => ({ ...prev, telephone: text }))}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={newSupplier.email}
                  onChangeText={(text) => setNewSupplier(prev => ({ ...prev, email: text }))}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newSupplier.address}
                  onChangeText={(text) => setNewSupplier(prev => ({ ...prev, address: text }))}
                  placeholder="Enter full address"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleAddSupplier}>
                <Save size={16} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>{t('deliveries.addSupplier')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerActionsVertical: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#237ECD',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#237ECD',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 24,
  },
  deliveriesList: {
    gap: 16,
  },
  deliveryCard: {
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
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  deliveryIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliverySupplier: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  deliveryReference: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 2,
  },
  deliveryDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  deliveryDetails: {
    gap: 12,
  },
  statusChecks: {
    flexDirection: 'row',
    gap: 24,
  },
  statusCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusCheckText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  temperatureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  temperatureText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#237ECD',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  formContainer: {
    padding: 24,
    maxHeight: 500,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  supplierList: {
    maxHeight: 150,
  },
  supplierOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  selectedSupplier: {
    backgroundColor: '#EFF6FF',
    borderColor: '#237ECD',
  },
  supplierName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  selectedSupplierText: {
    color: '#237ECD',
  },
  supplierContact: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  statusToggles: {
    gap: 8,
  },
  statusToggle: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  activeStatusToggle: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  statusToggleText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  activeStatusToggleText: {
    color: '#FFFFFF',
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  activeCategoryButton: {
    backgroundColor: '#237ECD',
    borderColor: '#237ECD',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#237ECD',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});
