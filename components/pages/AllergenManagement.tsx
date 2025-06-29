import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Plus, X, CreditCard as Edit, Trash2, ShieldAlert, Save, Upload } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import AllergyMatrixUpload from '@/components/AllergyMatrixUpload';

interface Allergen {
  id: string;
  name: string;
  isActive: boolean;
}

interface Dish {
  id: string;
  name: string;
  allergens: string[];
  isActive: boolean;
}

interface AllergyMatrix {
  id: string;
  name: string;
  type: 'csv' | 'xls' | 'pdf' | 'png' | 'jpg';
  uploadDate: Date;
  size: string;
  url?: string;
}

const mockAllergens: Allergen[] = [
  { id: '1', name: 'Nuts (Tree nuts)', isActive: true },
  { id: '2', name: 'Peanuts', isActive: true },
  { id: '3', name: 'Dairy/Milk', isActive: true },
  { id: '4', name: 'Eggs', isActive: true },
  { id: '5', name: 'Gluten/Wheat', isActive: true },
  { id: '6', name: 'Soy', isActive: true },
  { id: '7', name: 'Shellfish', isActive: true },
  { id: '8', name: 'Fish', isActive: true },
];

const mockDishes: Dish[] = [
  { id: '1', name: 'Caesar Salad', allergens: ['4', '5', '3'], isActive: true },
  { id: '2', name: 'Grilled Salmon', allergens: ['8'], isActive: true },
  { id: '3', name: 'Chicken Stir Fry', allergens: ['6'], isActive: true },
  { id: '4', name: 'Beef Burger', allergens: ['5', '3', '4'], isActive: true },
  { id: '5', name: 'Thai Curry', allergens: ['1', '7', '8'], isActive: true },
];

const mockMatrices: AllergyMatrix[] = [
  {
    id: '1',
    name: 'Main Menu Allergy Matrix.pdf',
    type: 'pdf',
    uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    size: '2.4 MB',
  },
  {
    id: '2',
    name: 'Seasonal Menu Allergens.csv',
    type: 'csv',
    uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    size: '156 KB',
  },
];

export default function AllergenManagement() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'allergens' | 'dishes' | 'matrices'>('allergens');
  const [allergens, setAllergens] = useState<Allergen[]>(mockAllergens);
  const [dishes, setDishes] = useState<Dish[]>(mockDishes);
  const [matrices, setMatrices] = useState<AllergyMatrix[]>(mockMatrices);
  const [showAllergenModal, setShowAllergenModal] = useState(false);
  const [showDishModal, setShowDishModal] = useState(false);
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [editingAllergen, setEditingAllergen] = useState<Allergen | null>(null);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [newAllergen, setNewAllergen] = useState({
    name: '',
    isActive: true,
  });
  const [newDish, setNewDish] = useState({
    name: '',
    allergens: [] as string[],
    isActive: true,
  });

  const handleAddAllergen = () => {
    if (!newAllergen.name.trim()) {
      Alert.alert('Error', 'Please enter an allergen name');
      return;
    }

    const allergen: Allergen = {
      id: Date.now().toString(),
      ...newAllergen,
    };

    setAllergens([...allergens, allergen]);
    setNewAllergen({ name: '', isActive: true });
    setShowAllergenModal(false);
    Alert.alert('Success', 'Allergen added successfully');
  };

  const handleAddDish = () => {
    if (!newDish.name.trim()) {
      Alert.alert('Error', 'Please enter a dish name');
      return;
    }

    const dish: Dish = {
      id: Date.now().toString(),
      ...newDish,
    };

    setDishes([...dishes, dish]);
    setNewDish({ name: '', allergens: [], isActive: true });
    setShowDishModal(false);
    Alert.alert('Success', 'Dish added successfully');
  };

  const handleEditAllergen = (allergen: Allergen) => {
    setEditingAllergen(allergen);
    setNewAllergen({
      name: allergen.name,
      isActive: allergen.isActive,
    });
    setShowAllergenModal(true);
  };

  const handleEditDish = (dish: Dish) => {
    setEditingDish(dish);
    setNewDish({
      name: dish.name,
      allergens: dish.allergens,
      isActive: dish.isActive,
    });
    setShowDishModal(true);
  };

  const handleUpdateAllergen = () => {
    if (!editingAllergen) return;

    setAllergens(allergens.map(a => 
      a.id === editingAllergen.id 
        ? { ...editingAllergen, ...newAllergen }
        : a
    ));

    setEditingAllergen(null);
    setNewAllergen({ name: '', isActive: true });
    setShowAllergenModal(false);
    Alert.alert('Success', 'Allergen updated successfully');
  };

  const handleUpdateDish = () => {
    if (!editingDish) return;

    setDishes(dishes.map(d => 
      d.id === editingDish.id 
        ? { ...editingDish, ...newDish }
        : d
    ));

    setEditingDish(null);
    setNewDish({ name: '', allergens: [], isActive: true });
    setShowDishModal(false);
    Alert.alert('Success', 'Dish updated successfully');
  };

  const handleDeleteAllergen = (id: string) => {
    Alert.alert(
      'Delete Allergen',
      'Are you sure you want to delete this allergen?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAllergens(allergens.filter(a => a.id !== id));
            Alert.alert('Success', 'Allergen deleted successfully');
          },
        },
      ]
    );
  };

  const handleDeleteDish = (id: string) => {
    Alert.alert(
      'Delete Dish',
      'Are you sure you want to delete this dish?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDishes(dishes.filter(d => d.id !== id));
            Alert.alert('Success', 'Dish deleted successfully');
          },
        },
      ]
    );
  };

  const handleMatrixUpload = (matrixData: Omit<AllergyMatrix, 'id' | 'uploadDate'>) => {
    const newMatrix: AllergyMatrix = {
      ...matrixData,
      id: Date.now().toString(),
      uploadDate: new Date(),
    };
    setMatrices([newMatrix, ...matrices]);
  };

  const handleMatrixDelete = (id: string) => {
    setMatrices(matrices.filter(m => m.id !== id));
    Alert.alert('Success', 'Matrix deleted successfully');
  };

  const toggleAllergenInDish = (allergenId: string) => {
    setNewDish(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergenId)
        ? prev.allergens.filter(id => id !== allergenId)
        : [...prev.allergens, allergenId]
    }));
  };

  const renderAllergensTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>Allergens ({allergens.length})</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAllergenModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Allergen</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.allergensList}>
        {allergens.map(allergen => (
          <View key={allergen.id} style={styles.allergenCard}>
            <View style={styles.allergenHeader}>
              <View style={styles.allergenInfo}>
                <View style={styles.allergenTitleRow}>
                  <ShieldAlert size={20} color="#EF4444" />
                  <Text style={styles.allergenName}>{allergen.name}</Text>
                </View>
              </View>
              <View style={styles.allergenActions}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    allergen.isActive ? styles.activeButton : styles.inactiveButton
                  ]}
                >
                  <Text style={[
                    styles.statusButtonText,
                    allergen.isActive ? styles.activeButtonText : styles.inactiveButtonText
                  ]}>
                    {allergen.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditAllergen(allergen)}
                >
                  <Edit size={16} color="#237ECD" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteAllergen(allergen.id)}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderDishesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>Dishes ({dishes.length})</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowDishModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Dish</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.dishesList}>
        {dishes.map(dish => (
          <View key={dish.id} style={styles.dishCard}>
            <View style={styles.dishHeader}>
              <View style={styles.dishInfo}>
                <Text style={styles.dishName}>{dish.name}</Text>
                <View style={styles.allergenTags}>
                  {dish.allergens.map(allergenId => {
                    const allergen = allergens.find(a => a.id === allergenId);
                    return allergen ? (
                      <View key={allergenId} style={styles.allergenTag}>
                        <Text style={styles.allergenTagText}>{allergen.name}</Text>
                      </View>
                    ) : null;
                  })}
                </View>
              </View>
              <View style={styles.dishActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditDish(dish)}
                >
                  <Edit size={16} color="#237ECD" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteDish(dish.id)}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderMatricesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>Allergy Matrices ({matrices.length})</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowMatrixModal(true)}
        >
          <Upload size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Upload Matrix</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.matricesDescription}>
        <Text style={styles.descriptionText}>
          Upload allergy matrices that will be displayed in the Allergy Checks section for both admin and user views. 
          Supported formats: CSV, XLS, PDF, PNG, JPG.
        </Text>
      </View>

      <View style={styles.matricesList}>
        {matrices.map(matrix => (
          <View key={matrix.id} style={styles.matrixCard}>
            <View style={styles.matrixHeader}>
              <View style={styles.matrixInfo}>
                <Text style={styles.matrixName}>{matrix.name}</Text>
                <View style={styles.matrixMeta}>
                  <Text style={styles.matrixType}>{matrix.type.toUpperCase()}</Text>
                  <Text style={styles.matrixSize}>{matrix.size}</Text>
                  <Text style={styles.matrixDate}>
                    {matrix.uploadDate.toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <View style={styles.matrixActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleMatrixDelete(matrix.id)}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
        
        {matrices.length === 0 && (
          <View style={styles.emptyMatrices}>
            <Upload size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No matrices uploaded</Text>
            <Text style={styles.emptyDescription}>
              Upload your first allergy matrix to display in Allergy Checks
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Allergen Management</Text>
          <Text style={styles.subtitle}>Manage allergens, dishes, and allergy matrices</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {[
          { key: 'allergens', label: 'Allergens' },
          { key: 'dishes', label: 'Dishes' },
          { key: 'matrices', label: 'Allergy Matrices' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'allergens' && renderAllergensTab()}
        {activeTab === 'dishes' && renderDishesTab()}
        {activeTab === 'matrices' && renderMatricesTab()}
      </ScrollView>

      {/* Allergen Modal */}
      <Modal visible={showAllergenModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAllergen ? 'Edit Allergen' : 'Add New Allergen'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowAllergenModal(false);
                setEditingAllergen(null);
                setNewAllergen({ name: '', isActive: true });
              }}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Allergen Name *</Text>
                <TextInput
                  style={styles.input}
                  value={newAllergen.name}
                  onChangeText={(text) => setNewAllergen(prev => ({ ...prev, name: text }))}
                  placeholder="Enter allergen name"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAllergenModal(false);
                  setEditingAllergen(null);
                  setNewAllergen({ name: '', isActive: true });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={editingAllergen ? handleUpdateAllergen : handleAddAllergen}
              >
                <Save size={16} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>
                  {editingAllergen ? 'Update' : 'Add'} Allergen
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Dish Modal */}
      <Modal visible={showDishModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingDish ? 'Edit Dish' : 'Add New Dish'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowDishModal(false);
                setEditingDish(null);
                setNewDish({ name: '', allergens: [], isActive: true });
              }}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Dish Name *</Text>
                <TextInput
                  style={styles.input}
                  value={newDish.name}
                  onChangeText={(text) => setNewDish(prev => ({ ...prev, name: text }))}
                  placeholder="Enter dish name"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Allergens</Text>
                <View style={styles.allergenSelection}>
                  {allergens.map(allergen => (
                    <TouchableOpacity
                      key={allergen.id}
                      style={[
                        styles.allergenSelectButton,
                        newDish.allergens.includes(allergen.id) && styles.selectedAllergenButton
                      ]}
                      onPress={() => toggleAllergenInDish(allergen.id)}
                    >
                      <Text style={[
                        styles.allergenSelectText,
                        newDish.allergens.includes(allergen.id) && styles.selectedAllergenText
                      ]}>
                        {allergen.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowDishModal(false);
                  setEditingDish(null);
                  setNewDish({ name: '', allergens: [], isActive: true });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={editingDish ? handleUpdateDish : handleAddDish}
              >
                <Save size={16} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>
                  {editingDish ? 'Update' : 'Add'} Dish
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Matrix Upload Modal */}
      <AllergyMatrixUpload
        visible={showMatrixModal}
        onClose={() => setShowMatrixModal(false)}
        onUpload={handleMatrixUpload}
        matrices={matrices}
        onDelete={handleMatrixDelete}
      />
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  activeTab: {
    backgroundColor: '#237ECD',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 32,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  tabTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
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
    color: '#FFFFFF',
  },
  matricesDescription: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#237ECD',
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    lineHeight: 20,
  },
  allergensList: {
    gap: 16,
  },
  allergenCard: {
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
  allergenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  allergenInfo: {
    flex: 1,
    marginRight: 16,
  },
  allergenTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  allergenName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    flex: 1,
  },
  allergenActions: {
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
  dishesList: {
    gap: 16,
  },
  dishCard: {
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
  dishHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dishInfo: {
    flex: 1,
    marginRight: 16,
  },
  dishName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 12,
  },
  allergenTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergenTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  allergenTagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#DC2626',
  },
  dishActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matricesList: {
    gap: 16,
  },
  matrixCard: {
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
  matrixHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  matrixInfo: {
    flex: 1,
    marginRight: 16,
  },
  matrixName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 8,
  },
  matrixMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  matrixType: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#237ECD',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matrixSize: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  matrixDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  matrixActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyMatrices: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
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
  allergenSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergenSelectButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  selectedAllergenButton: {
    backgroundColor: '#EFF6FF',
    borderColor: '#237ECD',
  },
  allergenSelectText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  selectedAllergenText: {
    color: '#237ECD',
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
    color: '#FFFFFF',
  },
});