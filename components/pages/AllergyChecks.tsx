import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image } from 'react-native';
import { ShieldAlert, RotateCcw, Download, SquareCheck as CheckSquare, Square, Eye, X, FileText, Image as ImageIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';

const allergens = [
  'Nuts (Tree nuts)',
  'Peanuts',
  'Dairy/Milk',
  'Eggs',
  'Gluten/Wheat',
  'Soy',
  'Shellfish',
  'Fish',
  'Sesame',
  'Mustard',
  'Celery',
  'Sulphites',
];

const mockDishes = [
  { id: '1', name: 'Caesar Salad', allergens: ['eggs', 'gluten', 'dairy'] },
  { id: '2', name: 'Grilled Salmon', allergens: ['fish'] },
  { id: '3', name: 'Chicken Stir Fry', allergens: ['soy', 'sesame'] },
  { id: '4', name: 'Beef Burger', allergens: ['gluten', 'dairy', 'eggs'] },
  { id: '5', name: 'Vegetable Soup', allergens: ['celery'] },
  { id: '6', name: 'Thai Curry', allergens: ['nuts', 'shellfish', 'fish'] },
  { id: '7', name: 'Chocolate Cake', allergens: ['gluten', 'dairy', 'eggs', 'nuts'] },
  { id: '8', name: 'Garden Salad', allergens: [] },
  { id: '9', name: 'Grilled Chicken', allergens: [] },
  { id: '10', name: 'Rice Pilaf', allergens: [] },
];

// Mock allergy matrices from Allergen Management
const mockMatrices = [
  {
    id: '1',
    name: 'Main Menu Allergy Matrix.pdf',
    type: 'pdf' as const,
    uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    size: '2.4 MB',
    url: 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '2',
    name: 'Seasonal Menu Allergens.csv',
    type: 'csv' as const,
    uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    size: '156 KB',
  },
  {
    id: '3',
    name: 'Visual Allergy Guide.png',
    type: 'png' as const,
    uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    size: '1.8 MB',
    url: 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export default function AllergyChecks() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [selectedMatrix, setSelectedMatrix] = useState<typeof mockMatrices[0] | null>(null);

  // Users have read-only access
  const isReadOnly = user?.role === 'user';

  const toggleAllergen = (allergen: string) => {
    const key = allergen.toLowerCase().split(' ')[0].replace('/', '');
    setSelectedAllergens(prev =>
      prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key]
    );
  };

  const resetSelection = () => {
    setSelectedAllergens([]);
  };

  const exportResults = () => {
    console.log('Export allergy check results');
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'csv':
      case 'xls':
        return <FileText size={20} color={Colors.success} />;
      case 'pdf':
        return <FileText size={20} color={Colors.error} />;
      case 'png':
      case 'jpg':
        return <ImageIcon size={20} color={Colors.info} />;
      default:
        return <FileText size={20} color={Colors.textSecondary} />;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'csv':
      case 'xls':
        return Colors.success;
      case 'pdf':
        return Colors.error;
      case 'png':
      case 'jpg':
        return Colors.info;
      default:
        return Colors.textSecondary;
    }
  };

  const handleMatrixView = (matrix: typeof mockMatrices[0]) => {
    setSelectedMatrix(matrix);
    setShowMatrixModal(true);
  };

  const dishesWithAllergens = mockDishes.filter(dish =>
    dish.allergens.some(allergen => selectedAllergens.includes(allergen))
  );

  const dishesFreeOfAllergens = mockDishes.filter(dish =>
    !dish.allergens.some(allergen => selectedAllergens.includes(allergen))
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('allergyChecks.title')}</Text>
          <Text style={styles.subtitle}>{t('allergyChecks.subtitle')}</Text>
          {isReadOnly && (
            <View style={styles.readOnlyBadge}>
              <Eye size={16} color={Colors.info} />
              <Text style={styles.readOnlyText}>Read-Only Access</Text>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={resetSelection}>
            <RotateCcw size={20} color={Colors.textSecondary} />
            <Text style={styles.secondaryButtonText}>{t('allergyChecks.reset')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={exportResults}>
            <Download size={20} color={Colors.textInverse} />
            <Text style={styles.primaryButtonText}>{t('allergyChecks.exportResults')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Allergy Matrices Section */}
        {mockMatrices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Allergy Matrices</Text>
            <Text style={styles.sectionDescription}>
              View uploaded allergy matrices for comprehensive allergen information
            </Text>
            <View style={styles.matricesGrid}>
              {mockMatrices.map(matrix => (
                <TouchableOpacity
                  key={matrix.id}
                  style={styles.matrixCard}
                  onPress={() => handleMatrixView(matrix)}
                >
                  <View style={styles.matrixHeader}>
                    {getFileIcon(matrix.type)}
                    <View style={[
                      styles.matrixTypeBadge,
                      { backgroundColor: getFileTypeColor(matrix.type) + '20' }
                    ]}>
                      <Text style={[
                        styles.matrixTypeText,
                        { color: getFileTypeColor(matrix.type) }
                      ]}>
                        {matrix.type.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.matrixName}>{matrix.name}</Text>
                  <View style={styles.matrixMeta}>
                    <Text style={styles.matrixSize}>{matrix.size}</Text>
                    <Text style={styles.matrixDate}>
                      {matrix.uploadDate.toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.viewButton}>
                    <Eye size={16} color={Colors.info} />
                    <Text style={styles.viewButtonText}>View</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('allergyChecks.selectAllergens')}</Text>
          <View style={styles.allergensGrid}>
            {allergens.map(allergen => {
              const key = allergen.toLowerCase().split(' ')[0].replace('/', '');
              const isSelected = selectedAllergens.includes(key);

              return (
                <TouchableOpacity
                  key={allergen}
                  style={[styles.allergenCard, isSelected && styles.selectedAllergenCard]}
                  onPress={() => toggleAllergen(allergen)}
                >
                  <View style={styles.allergenHeader}>
                    {isSelected ? (
                      <CheckSquare size={20} color={Colors.info} />
                    ) : (
                      <Square size={20} color={Colors.textSecondary} />
                    )}
                    <ShieldAlert size={24} color={isSelected ? Colors.info : Colors.textSecondary} />
                  </View>
                  <Text
                    style={[
                      styles.allergenText,
                      isSelected && styles.selectedAllergenText,
                    ]}
                  >
                    {allergen}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {selectedAllergens.length > 0 ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('allergyChecks.dishesContaining', {
                  count: dishesWithAllergens.length,
                })}
              </Text>
              <View style={styles.dishesContainer}>
                {dishesWithAllergens.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                      {t('allergyChecks.noDishesContain')}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.dishesList}>
                    {dishesWithAllergens.map(dish => (
                      <View key={dish.id} style={[styles.dishCard, styles.warningDishCard]}>
                        <View style={styles.dishHeader}>
                          <Text style={styles.dishName}>{dish.name}</Text>
                          <View style={styles.warningBadge}>
                            <ShieldAlert size={16} color={Colors.error} />
                            <Text style={styles.warningText}>Contains Allergens</Text>
                          </View>
                        </View>
                        <View style={styles.allergenTags}>
                          {dish.allergens
                            .filter(a => selectedAllergens.includes(a))
                            .map(a => (
                              <View key={a} style={styles.allergenTag}>
                                <Text style={styles.allergenTagText}>
                                  {a.charAt(0).toUpperCase() + a.slice(1)}
                                </Text>
                              </View>
                            ))}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('allergyChecks.dishesFreeOf', {
                  count: dishesFreeOfAllergens.length,
                })}
              </Text>
              <View style={styles.dishesContainer}>
                {dishesFreeOfAllergens.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                      {t('allergyChecks.noDishesAreFree')}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.dishesList}>
                    {dishesFreeOfAllergens.map(dish => (
                      <View key={dish.id} style={[styles.dishCard, styles.safeDishCard]}>
                        <View style={styles.dishHeader}>
                          <Text style={styles.dishName}>{dish.name}</Text>
                          <View style={styles.safeBadge}>
                            <CheckSquare size={16} color={Colors.success} />
                            <Text style={styles.safeText}>Safe</Text>
                          </View>
                        </View>
                        {dish.allergens.length > 0 && (
                          <View style={styles.allergenTags}>
                            <Text style={styles.otherAllergensText}>
                              {t('allergyChecks.contains', {
                                allergens: dish.allergens
                                  .map(a => a.charAt(0).toUpperCase() + a.slice(1))
                                  .join(', '),
                              })}
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.instructionsSection}>
            <ShieldAlert size={48} color={Colors.textSecondary} />
            <Text style={styles.instructionsTitle}>
              {t('allergyChecks.selectAllergensToFilter')}
            </Text>
            <Text style={styles.instructionsText}>
              {t('allergyChecks.selectAllergensDescription')}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Matrix View Modal */}
      <Modal visible={showMatrixModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedMatrix?.name}
              </Text>
              <TouchableOpacity onPress={() => setShowMatrixModal(false)}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {selectedMatrix && (
                <View style={styles.matrixViewer}>
                  {selectedMatrix.type === 'png' || selectedMatrix.type === 'jpg' ? (
                    selectedMatrix.url ? (
                      <Image 
                        source={{ uri: selectedMatrix.url }}
                        style={styles.matrixImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <ImageIcon size={48} color={Colors.textSecondary} />
                        <Text style={styles.placeholderText}>Image preview not available</Text>
                      </View>
                    )
                  ) : selectedMatrix.type === 'pdf' ? (
                    <View style={styles.pdfViewer}>
                      <FileText size={48} color={Colors.error} />
                      <Text style={styles.pdfTitle}>PDF Document</Text>
                      <Text style={styles.pdfDescription}>
                        {selectedMatrix.name}
                      </Text>
                      <Text style={styles.pdfNote}>
                        PDF preview is not available in this view. Download the file to view the complete allergy matrix.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.csvViewer}>
                      <FileText size={48} color={Colors.success} />
                      <Text style={styles.csvTitle}>Spreadsheet Data</Text>
                      <Text style={styles.csvDescription}>
                        {selectedMatrix.name}
                      </Text>
                      <View style={styles.csvPreview}>
                        <Text style={styles.csvHeader}>Sample Allergy Matrix Data:</Text>
                        <View style={styles.csvTable}>
                          <View style={styles.csvRow}>
                            <Text style={styles.csvCell}>Dish</Text>
                            <Text style={styles.csvCell}>Nuts</Text>
                            <Text style={styles.csvCell}>Dairy</Text>
                            <Text style={styles.csvCell}>Gluten</Text>
                          </View>
                          <View style={styles.csvRow}>
                            <Text style={styles.csvCell}>Caesar Salad</Text>
                            <Text style={styles.csvCell}>No</Text>
                            <Text style={styles.csvCell}>Yes</Text>
                            <Text style={styles.csvCell}>Yes</Text>
                          </View>
                          <View style={styles.csvRow}>
                            <Text style={styles.csvCell}>Grilled Salmon</Text>
                            <Text style={styles.csvCell}>No</Text>
                            <Text style={styles.csvCell}>No</Text>
                            <Text style={styles.csvCell}>No</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  )}
                  
                  <View style={styles.matrixInfo}>
                    <Text style={styles.matrixInfoTitle}>File Information</Text>
                    <View style={styles.matrixInfoRow}>
                      <Text style={styles.matrixInfoLabel}>Type:</Text>
                      <Text style={styles.matrixInfoValue}>{selectedMatrix.type.toUpperCase()}</Text>
                    </View>
                    <View style={styles.matrixInfoRow}>
                      <Text style={styles.matrixInfoLabel}>Size:</Text>
                      <Text style={styles.matrixInfoValue}>{selectedMatrix.size}</Text>
                    </View>
                    <View style={styles.matrixInfoRow}>
                      <Text style={styles.matrixInfoLabel}>Uploaded:</Text>
                      <Text style={styles.matrixInfoValue}>
                        {selectedMatrix.uploadDate.toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.downloadButton}
                onPress={() => console.log('Download matrix')}
              >
                <Download size={16} color={Colors.textInverse} />
                <Text style={styles.downloadButtonText}>Download</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={() => setShowMatrixModal(false)}
              >
                <Text style={styles.closeModalButtonText}>Close</Text>
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
    marginBottom: 8,
  },
  readOnlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.info + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  readOnlyText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.info,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
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
    color: Colors.textInverse,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
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
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  matricesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  matrixCard: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  matrixHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matrixTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matrixTypeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  matrixName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  matrixMeta: {
    marginBottom: 12,
  },
  matrixSize: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  matrixDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.info + '20',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  viewButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.info,
  },
  allergensGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  allergenCard: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    minWidth: 180,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedAllergenCard: {
    backgroundColor: Colors.info + '10',
    borderColor: Colors.info,
  },
  allergenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  allergenText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  selectedAllergenText: {
    color: Colors.info,
    fontFamily: 'Inter-SemiBold',
  },
  dishesContainer: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  dishesList: {
    gap: 1,
  },
  dishCard: {
    padding: 20,
    backgroundColor: Colors.backgroundPrimary,
  },
  warningDishCard: {
    backgroundColor: Colors.error + '10',
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  safeDishCard: {
    backgroundColor: Colors.success + '10',
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  dishHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dishName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    flex: 1,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  warningText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.error,
  },
  safeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  safeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.success,
  },
  allergenTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergenTag: {
    backgroundColor: Colors.error + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  allergenTagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.error,
  },
  otherAllergensText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  instructionsSection: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  instructionsTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 500,
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
    width: '95%',
    maxWidth: 800,
    maxHeight: '90%',
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
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    flex: 1,
  },
  modalBody: {
    flex: 1,
    padding: 24,
  },
  matrixViewer: {
    flex: 1,
  },
  matrixImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginBottom: 20,
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginTop: 8,
  },
  pdfViewer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    marginBottom: 20,
  },
  pdfTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  pdfDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  pdfNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  csvViewer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  csvTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  csvDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  csvPreview: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 8,
    padding: 16,
  },
  csvHeader: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  csvTable: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 6,
    overflow: 'hidden',
  },
  csvRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  csvCell: {
    flex: 1,
    padding: 8,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textPrimary,
    borderRightWidth: 1,
    borderRightColor: Colors.borderLight,
  },
  matrixInfo: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
  },
  matrixInfoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  matrixInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  matrixInfoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  matrixInfoValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 12,
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.info,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  downloadButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textInverse,
  },
  closeModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
  },
  closeModalButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
  },
});