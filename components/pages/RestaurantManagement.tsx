import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Plus, X, CreditCard as Edit, Trash2, Building, Users, Settings, MapPin } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface Restaurant {
  id: string;
  name: string;
  address: string;
  adminEmail: string;
  subscriptionType: 'sensor-based' | 'non-sensor-based';
  userCount: number;
  status: 'active' | 'inactive';
  createdAt: Date;
}

const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Demo Restaurant',
    address: '123 Main St, City, State 12345',
    adminEmail: 'admin@vigilix.tech',
    subscriptionType: 'sensor-based',
    userCount: 5,
    status: 'active',
    createdAt: new Date(2024, 0, 15),
  },
  {
    id: '2',
    name: 'Non-Sensor Restaurant',
    address: '456 Oak Ave, City, State 67890',
    adminEmail: 'admin-nonsensor@vigilix.tech',
    subscriptionType: 'non-sensor-based',
    userCount: 3,
    status: 'active',
    createdAt: new Date(2024, 1, 20),
  },
];

export default function RestaurantManagement() {
  const { t } = useTranslation();
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    address: '',
    adminEmail: '',
    subscriptionType: 'sensor-based' as const,
  });

  const getSubscriptionColor = (type: string) => {
    return type === 'sensor-based' ? '#2563EB' : '#059669';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? '#10B981' : '#EF4444';
  };

  const handleAddRestaurant = () => {
    if (!newRestaurant.name.trim() || !newRestaurant.adminEmail.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const restaurant: Restaurant = {
      id: Date.now().toString(),
      ...newRestaurant,
      userCount: 1,
      status: 'active',
      createdAt: new Date(),
    };

    setRestaurants([...restaurants, restaurant]);
    setNewRestaurant({ name: '', address: '', adminEmail: '', subscriptionType: 'sensor-based' });
    setShowAddModal(false);
    Alert.alert('Success', 'Restaurant created successfully');
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setNewRestaurant({
      name: restaurant.name,
      address: restaurant.address,
      adminEmail: restaurant.adminEmail,
      subscriptionType: restaurant.subscriptionType,
    });
    setShowAddModal(true);
  };

  const handleUpdateRestaurant = () => {
    if (!editingRestaurant) return;

    setRestaurants(restaurants.map(r => 
      r.id === editingRestaurant.id 
        ? { ...editingRestaurant, ...newRestaurant }
        : r
    ));

    setEditingRestaurant(null);
    setNewRestaurant({ name: '', address: '', adminEmail: '', subscriptionType: 'sensor-based' });
    setShowAddModal(false);
    Alert.alert('Success', 'Restaurant updated successfully');
  };

  const handleDeleteRestaurant = (id: string) => {
    Alert.alert(
      'Delete Restaurant',
      'Are you sure you want to delete this restaurant? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setRestaurants(restaurants.filter(r => r.id !== id));
            Alert.alert('Success', 'Restaurant deleted successfully');
          },
        },
      ]
    );
  };

  const toggleRestaurantStatus = (id: string) => {
    setRestaurants(restaurants.map(r => 
      r.id === id ? { ...r, status: r.status === 'active' ? 'inactive' : 'active' } : r
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Restaurant Management</Text>
          <Text style={styles.subtitle}>Manage restaurants and their subscriptions</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Restaurant</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{restaurants.length}</Text>
            <Text style={styles.statLabel}>Total Restaurants</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {restaurants.filter(r => r.status === 'active').length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {restaurants.filter(r => r.subscriptionType === 'sensor-based').length}
            </Text>
            <Text style={styles.statLabel}>Sensor-Based</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {restaurants.reduce((sum, r) => sum + r.userCount, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurants ({restaurants.length})</Text>
          <View style={styles.restaurantsList}>
            {restaurants.map(restaurant => (
              <View key={restaurant.id} style={styles.restaurantCard}>
                <View style={styles.restaurantHeader}>
                  <View style={styles.restaurantInfo}>
                    <View style={styles.restaurantTitleRow}>
                      <Building size={20} color="#2563EB" />
                      <Text style={styles.restaurantName}>{restaurant.name}</Text>
                      <View style={[
                        styles.subscriptionBadge,
                        { backgroundColor: `${getSubscriptionColor(restaurant.subscriptionType)}20` }
                      ]}>
                        <Text style={[
                          styles.subscriptionText,
                          { color: getSubscriptionColor(restaurant.subscriptionType) }
                        ]}>
                          {restaurant.subscriptionType === 'sensor-based' ? 'SENSOR' : 'BASIC'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.restaurantDetails}>
                      <View style={styles.detailRow}>
                        <MapPin size={14} color="#64748B" />
                        <Text style={styles.detailText}>{restaurant.address}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Users size={14} color="#64748B" />
                        <Text style={styles.detailText}>
                          Admin: {restaurant.adminEmail} • {restaurant.userCount} users
                        </Text>
                      </View>
                      <Text style={styles.createdDate}>
                        Created: {restaurant.createdAt.toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.restaurantActions}>
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        restaurant.status === 'active' ? styles.activeButton : styles.inactiveButton
                      ]}
                      onPress={() => toggleRestaurantStatus(restaurant.id)}
                    >
                      <Text style={[
                        styles.statusButtonText,
                        restaurant.status === 'active' ? styles.activeButtonText : styles.inactiveButtonText
                      ]}>
                        {restaurant.status === 'active' ? 'Active' : 'Inactive'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditRestaurant(restaurant)}
                    >
                      <Edit size={16} color="#2563EB" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteRestaurant(restaurant.id)}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Add/Edit Restaurant Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowAddModal(false);
                setEditingRestaurant(null);
                setNewRestaurant({ name: '', address: '', adminEmail: '', subscriptionType: 'sensor-based' });
              }}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Restaurant Name *</Text>
                <TextInput
                  style={styles.input}
                  value={newRestaurant.name}
                  onChangeText={(text) => setNewRestaurant(prev => ({ ...prev, name: text }))}
                  placeholder="Enter restaurant name"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newRestaurant.address}
                  onChangeText={(text) => setNewRestaurant(prev => ({ ...prev, address: text }))}
                  placeholder="Enter restaurant address"
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Admin Email *</Text>
                <TextInput
                  style={styles.input}
                  value={newRestaurant.adminEmail}
                  onChangeText={(text) => setNewRestaurant(prev => ({ ...prev, adminEmail: text }))}
                  placeholder="Enter admin email"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Subscription Type</Text>
                <View style={styles.subscriptionButtons}>
                  <TouchableOpacity
                    style={[
                      styles.subscriptionButton,
                      newRestaurant.subscriptionType === 'sensor-based' && styles.selectedSubscriptionButton
                    ]}
                    onPress={() => setNewRestaurant(prev => ({ ...prev, subscriptionType: 'sensor-based' }))}
                  >
                    <Text style={[
                      styles.subscriptionButtonText,
                      newRestaurant.subscriptionType === 'sensor-based' && styles.selectedSubscriptionText
                    ]}>
                      Sensor-Based
                    </Text>
                    <Text style={styles.subscriptionDescription}>
                      Full features with temperature monitoring
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.subscriptionButton,
                      newRestaurant.subscriptionType === 'non-sensor-based' && styles.selectedSubscriptionButton
                    ]}
                    onPress={() => setNewRestaurant(prev => ({ ...prev, subscriptionType: 'non-sensor-based' }))}
                  >
                    <Text style={[
                      styles.subscriptionButtonText,
                      newRestaurant.subscriptionType === 'non-sensor-based' && styles.selectedSubscriptionText
                    ]}>
                      Basic Plan
                    </Text>
                    <Text style={styles.subscriptionDescription}>
                      Core features without sensors
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  setEditingRestaurant(null);
                  setNewRestaurant({ name: '', address: '', adminEmail: '', subscriptionType: 'sensor-based' });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={editingRestaurant ? handleUpdateRestaurant : handleAddRestaurant}
              >
                <Text style={styles.saveButtonText}>
                  {editingRestaurant ? 'Update' : 'Create'} Restaurant
                </Text>
              </TouchableOpacity>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  statsSection: {
    flexDirection: 'row',
    padding: 32,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    textAlign: 'center',
  },
  section: {
    padding: 32,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 24,
  },
  restaurantsList: {
    gap: 16,
  },
  restaurantCard: {
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
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  restaurantInfo: {
    flex: 1,
    marginRight: 16,
  },
  restaurantTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    flex: 1,
  },
  subscriptionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subscriptionText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  restaurantDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    flex: 1,
  },
  createdDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  restaurantActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  activeButton: {
    backgroundColor: '#DCFCE7',
    borderColor: '#10B981',
  },
  inactiveButton: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  statusButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  activeButtonText: {
    color: '#10B981',
  },
  inactiveButtonText: {
    color: '#EF4444',
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
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
    maxWidth: 500,
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
  modalBody: {
    padding: 24,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 20,
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
    color: '#1E293B',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  subscriptionButtons: {
    gap: 12,
  },
  subscriptionButton: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  selectedSubscriptionButton: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  subscriptionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    marginBottom: 4,
  },
  selectedSubscriptionText: {
    color: '#2563EB',
  },
  subscriptionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});