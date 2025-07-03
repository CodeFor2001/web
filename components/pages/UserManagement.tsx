import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Plus, X, CreditCard as Edit, Trash2, Users, Mail, Building, Shield, Eye, EyeOff, Key } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'restaurant-admin' | 'user';
  restaurantId: string;
  restaurantName: string;
  status: 'active' | 'inactive';
  lastLogin: Date;
  createdAt: Date;
}

const mockUsers: User[] = [
  {
    id: '2',
    name: 'Restaurant Admin',
    email: 'admin@vigilix.tech',
    role: 'restaurant-admin',
    restaurantId: 'rest1',
    restaurantName: 'Demo Restaurant',
    status: 'active',
    lastLogin: new Date(),
    createdAt: new Date(2024, 0, 15),
  },
  {
    id: '3',
    name: 'Restaurant User',
    email: 'user@vigilix.tech',
    role: 'user',
    restaurantId: 'rest1',
    restaurantName: 'Demo Restaurant',
    status: 'active',
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date(2024, 0, 20),
  },
  {
    id: '4',
    name: 'Non-Sensor Admin',
    email: 'admin-nonsensor@vigilix.tech',
    role: 'restaurant-admin',
    restaurantId: 'rest2',
    restaurantName: 'Non-Sensor Restaurant',
    status: 'active',
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdAt: new Date(2024, 1, 20),
  },
];

const mockRestaurants = [
  { id: 'rest1', name: 'Demo Restaurant' },
  { id: 'rest2', name: 'Non-Sensor Restaurant' },
];

export default function UserManagement() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [changingPasswordUser, setChangingPasswordUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as const,
    restaurantId: '',
  });
  const [passwordChange, setPasswordChange] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const getRoleColor = (role: string) => {
    return role === 'restaurant-admin' ? '#7C3AED' : '#2563EB';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? '#10B981' : '#EF4444';
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return 'Password must contain at least one special character (@$!%*?&)';
    }
    return null;
  };

  const handleAddUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim() || !newUser.restaurantId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const passwordError = validatePassword(newUser.password);
    if (passwordError) {
      Alert.alert('Password Error', passwordError);
      return;
    }

    const restaurant = mockRestaurants.find(r => r.id === newUser.restaurantId);
    if (!restaurant) {
      Alert.alert('Error', 'Invalid restaurant selected');
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      restaurantId: newUser.restaurantId,
      restaurantName: restaurant.name,
      status: 'active',
      lastLogin: new Date(),
      createdAt: new Date(),
    };

    setUsers([...users, user]);
    setNewUser({ name: '', email: '', password: '', confirmPassword: '', role: 'user', restaurantId: '' });
    setShowAddModal(false);
    Alert.alert('Success', `User created successfully with password: ${newUser.password}`);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role,
      restaurantId: user.restaurantId,
    });
    setShowAddModal(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.restaurantId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const restaurant = mockRestaurants.find(r => r.id === newUser.restaurantId);
    if (!restaurant) {
      Alert.alert('Error', 'Invalid restaurant selected');
      return;
    }

    setUsers(users.map(u => 
      u.id === editingUser.id 
        ? { 
            ...editingUser, 
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            restaurantId: newUser.restaurantId,
            restaurantName: restaurant.name
          }
        : u
    ));

    setEditingUser(null);
    setNewUser({ name: '', email: '', password: '', confirmPassword: '', role: 'user', restaurantId: '' });
    setShowAddModal(false);
    Alert.alert('Success', 'User updated successfully');
  };

  const handleChangePassword = (user: User) => {
    setChangingPasswordUser(user);
    setPasswordChange({ newPassword: '', confirmPassword: '' });
    setShowPasswordModal(true);
  };

  const handlePasswordUpdate = () => {
    if (!changingPasswordUser) return;

    if (!passwordChange.newPassword.trim() || !passwordChange.confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const passwordError = validatePassword(passwordChange.newPassword);
    if (passwordError) {
      Alert.alert('Password Error', passwordError);
      return;
    }

    setPasswordChange({ newPassword: '', confirmPassword: '' });
    setChangingPasswordUser(null);
    setShowPasswordModal(false);
    Alert.alert('Success', `Password updated successfully for ${changingPasswordUser.name}`);
  };

  const handleDeleteUser = (id: string) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setUsers(users.filter(u => u.id !== id));
            Alert.alert('Success', 'User deleted successfully');
          },
        },
      ]
    );
  };

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(u => 
      u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>User Management</Text>
          <Text style={styles.subtitle}>Manage users across all restaurants</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add User</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{users.length}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {users.filter(u => u.status === 'active').length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {users.filter(u => u.role === 'restaurant-admin').length}
            </Text>
            <Text style={styles.statLabel}>Admins</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {users.filter(u => u.role === 'user').length}
            </Text>
            <Text style={styles.statLabel}>Regular Users</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Users ({users.length})</Text>
          <View style={styles.usersList}>
            {users.map(user => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <View style={styles.userInfo}>
                    <View style={styles.userTitleRow}>
                      <Users size={20} color="#2563EB" />
                      <Text style={styles.userName}>{user.name}</Text>
                      <View style={[
                        styles.roleBadge,
                        { backgroundColor: `${getRoleColor(user.role)}20` }
                      ]}>
                        <Text style={[
                          styles.roleText,
                          { color: getRoleColor(user.role) }
                        ]}>
                          {user.role === 'restaurant-admin' ? 'ADMIN' : 'USER'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.userDetails}>
                      <View style={styles.detailRow}>
                        <Mail size={14} color="#64748B" />
                        <Text style={styles.detailText}>{user.email}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Building size={14} color="#64748B" />
                        <Text style={styles.detailText}>{user.restaurantName}</Text>
                      </View>
                      <Text style={styles.lastLoginText}>
                        Last login: {user.lastLogin.toLocaleDateString()} at {user.lastLogin.toLocaleTimeString()}
                      </Text>
                      <Text style={styles.createdDate}>
                        Created: {user.createdAt.toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.userActions}>
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        user.status === 'active' ? styles.activeButton : styles.inactiveButton
                      ]}
                      onPress={() => toggleUserStatus(user.id)}
                    >
                      <Text style={[
                        styles.statusButtonText,
                        user.status === 'active' ? styles.activeButtonText : styles.inactiveButtonText
                      ]}>
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleChangePassword(user)}
                    >
                      <Key size={16} color="#F59E0B" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditUser(user)}
                    >
                      <Edit size={16} color="#2563EB" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteUser(user.id)}
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

      {/* Add/Edit User Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingUser ? 'Edit User' : 'Add New User'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowAddModal(false);
                setEditingUser(null);
                setNewUser({ name: '', email: '', password: '', confirmPassword: '', role: 'user', restaurantId: '' });
              }}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={newUser.name}
                  onChangeText={(text) => setNewUser(prev => ({ ...prev, name: text }))}
                  placeholder="Enter full name"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address *</Text>
                <TextInput
                  style={styles.input}
                  value={newUser.email}
                  onChangeText={(text) => setNewUser(prev => ({ ...prev, email: text }))}
                  placeholder="Enter email address"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {!editingUser && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Password *</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        value={newUser.password}
                        onChangeText={(text) => setNewUser(prev => ({ ...prev, password: text }))}
                        placeholder="Enter password"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={20} color="#64748B" />
                        ) : (
                          <Eye size={20} color="#64748B" />
                        )}
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.passwordRequirements}>
                      Password must be at least 8 characters with uppercase, lowercase, number, and special character
                    </Text>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Confirm Password *</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        value={newUser.confirmPassword}
                        onChangeText={(text) => setNewUser(prev => ({ ...prev, confirmPassword: text }))}
                        placeholder="Confirm password"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} color="#64748B" />
                        ) : (
                          <Eye size={20} color="#64748B" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Restaurant *</Text>
                <View style={styles.restaurantButtons}>
                  {mockRestaurants.map(restaurant => (
                    <TouchableOpacity
                      key={restaurant.id}
                      style={[
                        styles.restaurantButton,
                        newUser.restaurantId === restaurant.id && styles.selectedRestaurantButton
                      ]}
                      onPress={() => setNewUser(prev => ({ ...prev, restaurantId: restaurant.id }))}
                    >
                      <Building size={16} color={newUser.restaurantId === restaurant.id ? '#2563EB' : '#64748B'} />
                      <Text style={[
                        styles.restaurantButtonText,
                        newUser.restaurantId === restaurant.id && styles.selectedRestaurantText
                      ]}>
                        {restaurant.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Role</Text>
                <View style={styles.roleButtons}>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      newUser.role === 'user' && styles.selectedRoleButton
                    ]}
                    onPress={() => setNewUser(prev => ({ ...prev, role: 'user' }))}
                  >
                    <Users size={16} color={newUser.role === 'user' ? '#2563EB' : '#64748B'} />
                    <Text style={[
                      styles.roleButtonText,
                      newUser.role === 'user' && styles.selectedRoleText
                    ]}>
                      User
                    </Text>
                    <Text style={styles.roleDescription}>
                      Can create incidents, deliveries, and complete checklists
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      newUser.role === 'restaurant-admin' && styles.selectedRoleButton
                    ]}
                    onPress={() => setNewUser(prev => ({ ...prev, role: 'restaurant-admin' }))}
                  >
                    <Shield size={16} color={newUser.role === 'restaurant-admin' ? '#7C3AED' : '#64748B'} />
                    <Text style={[
                      styles.roleButtonText,
                      newUser.role === 'restaurant-admin' && styles.selectedRoleText
                    ]}>
                      Restaurant Admin
                    </Text>
                    <Text style={styles.roleDescription}>
                      Can manage checklists, allergens, and sensor calibration
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
                  setEditingUser(null);
                  setNewUser({ name: '', email: '', password: '', confirmPassword: '', role: 'user', restaurantId: '' });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={editingUser ? handleUpdateUser : handleAddUser}
              >
                <Text style={styles.saveButtonText}>
                  {editingUser ? 'Update' : 'Create'} User
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Change Password - {changingPasswordUser?.name}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowPasswordModal(false);
                setChangingPasswordUser(null);
                setPasswordChange({ newPassword: '', confirmPassword: '' });
              }}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>New Password *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={passwordChange.newPassword}
                    onChangeText={(text) => setPasswordChange(prev => ({ ...prev, newPassword: text }))}
                    placeholder="Enter new password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#64748B" />
                    ) : (
                      <Eye size={20} color="#64748B" />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.passwordRequirements}>
                  Password must be at least 8 characters with uppercase, lowercase, number, and special character
                </Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Confirm New Password *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={passwordChange.confirmPassword}
                    onChangeText={(text) => setPasswordChange(prev => ({ ...prev, confirmPassword: text }))}
                    placeholder="Confirm new password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#64748B" />
                    ) : (
                      <Eye size={20} color="#64748B" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowPasswordModal(false);
                  setChangingPasswordUser(null);
                  setPasswordChange({ newPassword: '', confirmPassword: '' });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handlePasswordUpdate}
              >
                <Text style={styles.saveButtonText}>Update Password</Text>
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
  usersList: {
    gap: 16,
  },
  userCard: {
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
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flex: 1,
    marginRight: 16,
  },
  userTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  userDetails: {
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
  lastLoginText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  createdDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  userActions: {
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
    maxHeight: '90%',
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
    flex: 1,
  },
  modalBody: {
    padding: 24,
    maxHeight: 500,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  eyeButton: {
    padding: 12,
  },
  passwordRequirements: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
  },
  restaurantButtons: {
    gap: 8,
  },
  restaurantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  selectedRestaurantButton: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  restaurantButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  selectedRestaurantText: {
    color: '#2563EB',
  },
  roleButtons: {
    gap: 12,
  },
  roleButton: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  selectedRoleButton: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  roleButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    marginBottom: 4,
    marginTop: 8,
  },
  selectedRoleText: {
    color: '#2563EB',
  },
  roleDescription: {
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
