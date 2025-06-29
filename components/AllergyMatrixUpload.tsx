import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
import { Upload, X, FileText, Image as ImageIcon, Download, Eye, Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import * as DocumentPicker from 'expo-document-picker';

interface AllergyMatrix {
  id: string;
  name: string;
  type: 'csv' | 'xls' | 'pdf' | 'png' | 'jpg';
  uploadDate: Date;
  size: string;
  url?: string;
}

interface AllergyMatrixUploadProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (matrix: Omit<AllergyMatrix, 'id' | 'uploadDate'>) => void;
  matrices: AllergyMatrix[];
  onDelete: (id: string) => void;
}

export default function AllergyMatrixUpload({ 
  visible, 
  onClose, 
  onUpload, 
  matrices, 
  onDelete 
}: AllergyMatrixUploadProps) {
  const [uploading, setUploading] = useState(false);

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

  const handleFileUpload = async () => {
    try {
      setUploading(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'text/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/pdf',
          'image/png',
          'image/jpeg'
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        
        let fileType: 'csv' | 'xls' | 'pdf' | 'png' | 'jpg';
        switch (fileExtension) {
          case 'csv':
            fileType = 'csv';
            break;
          case 'xls':
          case 'xlsx':
            fileType = 'xls';
            break;
          case 'pdf':
            fileType = 'pdf';
            break;
          case 'png':
            fileType = 'png';
            break;
          case 'jpg':
          case 'jpeg':
            fileType = 'jpg';
            break;
          default:
            Alert.alert('Error', 'Unsupported file type. Please upload CSV, XLS, PDF, PNG, or JPG files.');
            return;
        }

        const sizeInMB = (file.size || 0) / (1024 * 1024);
        const sizeString = sizeInMB > 1 
          ? `${sizeInMB.toFixed(1)} MB` 
          : `${((file.size || 0) / 1024).toFixed(0)} KB`;

        const matrix = {
          name: file.name,
          type: fileType,
          size: sizeString,
          url: file.uri,
        };

        onUpload(matrix);
        Alert.alert('Success', 'Allergy matrix uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', 'Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Matrix',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(id),
        },
      ]
    );
  };

  const handlePreview = (matrix: AllergyMatrix) => {
    if (matrix.url) {
      // In a real app, you would open the file for preview
      Alert.alert('Preview', `Opening ${matrix.name} for preview...`);
    }
  };

  const handleDownload = (matrix: AllergyMatrix) => {
    // In a real app, you would trigger download
    Alert.alert('Download', `Downloading ${matrix.name}...`);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Allergy Matrix Management</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.uploadSection}>
              <Text style={styles.sectionTitle}>Upload New Matrix</Text>
              <Text style={styles.sectionDescription}>
                Upload allergy matrices in CSV, XLS, PDF, PNG, or JPG format. These will be displayed in the Allergy Checks section.
              </Text>
              
              <TouchableOpacity 
                style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                onPress={handleFileUpload}
                disabled={uploading}
              >
                <Upload size={24} color={Colors.textInverse} />
                <Text style={styles.uploadButtonText}>
                  {uploading ? 'Uploading...' : 'Choose File to Upload'}
                </Text>
              </TouchableOpacity>

              <View style={styles.supportedFormats}>
                <Text style={styles.supportedFormatsTitle}>Supported Formats:</Text>
                <View style={styles.formatsList}>
                  <View style={styles.formatItem}>
                    <FileText size={16} color={Colors.success} />
                    <Text style={styles.formatText}>CSV, XLS</Text>
                  </View>
                  <View style={styles.formatItem}>
                    <FileText size={16} color={Colors.error} />
                    <Text style={styles.formatText}>PDF</Text>
                  </View>
                  <View style={styles.formatItem}>
                    <ImageIcon size={16} color={Colors.info} />
                    <Text style={styles.formatText}>PNG, JPG</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.matricesSection}>
              <Text style={styles.sectionTitle}>Uploaded Matrices ({matrices.length})</Text>
              
              {matrices.length === 0 ? (
                <View style={styles.emptyState}>
                  <Upload size={48} color={Colors.textSecondary} />
                  <Text style={styles.emptyTitle}>No matrices uploaded</Text>
                  <Text style={styles.emptyDescription}>
                    Upload your first allergy matrix to get started
                  </Text>
                </View>
              ) : (
                <View style={styles.matricesList}>
                  {matrices.map((matrix) => (
                    <View key={matrix.id} style={styles.matrixCard}>
                      <View style={styles.matrixHeader}>
                        <View style={styles.matrixInfo}>
                          <View style={styles.matrixTitleRow}>
                            {getFileIcon(matrix.type)}
                            <Text style={styles.matrixName}>{matrix.name}</Text>
                            <View style={[
                              styles.typeBadge,
                              { backgroundColor: getFileTypeColor(matrix.type) + '20' }
                            ]}>
                              <Text style={[
                                styles.typeText,
                                { color: getFileTypeColor(matrix.type) }
                              ]}>
                                {matrix.type.toUpperCase()}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.matrixMeta}>
                            <Text style={styles.matrixSize}>{matrix.size}</Text>
                            <Text style={styles.matrixDate}>
                              Uploaded: {matrix.uploadDate.toLocaleDateString()}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.matrixActions}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handlePreview(matrix)}
                          >
                            <Eye size={16} color={Colors.info} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleDownload(matrix)}
                          >
                            <Download size={16} color={Colors.success} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleDelete(matrix.id, matrix.name)}
                          >
                            <Trash2 size={16} color={Colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 16,
    width: '95%',
    maxWidth: 600,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  uploadSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.info,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
  },
  uploadButtonDisabled: {
    backgroundColor: Colors.textTertiary,
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textInverse,
  },
  supportedFormats: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
  },
  supportedFormatsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  formatsList: {
    flexDirection: 'row',
    gap: 16,
  },
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  formatText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  matricesSection: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  matricesList: {
    gap: 12,
  },
  matrixCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  matrixHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  matrixInfo: {
    flex: 1,
    marginRight: 12,
  },
  matrixTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  matrixName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  matrixMeta: {
    flexDirection: 'row',
    gap: 16,
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
  matrixActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: Colors.backgroundPrimary,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  closeButton: {
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
  },
});