import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Plus, X, Type, SquareCheck as CheckSquare, Folder, Save, Thermometer } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

interface ChecklistTask {
  id: string;
  type: 'text' | 'checkbox' | 'temperature';
  title: string;
  placeholder?: string;
}

interface ChecklistSection {
  id: string;
  title: string;
  tasks: ChecklistTask[];
}

interface ChecklistCreatorProps {
  visible: boolean;
  onClose: () => void;
  onSave: (checklist: { title: string; sections: ChecklistSection[] }) => void;
}

export default function ChecklistCreator({ visible, onClose, onSave }: ChecklistCreatorProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [checklistTitle, setChecklistTitle] = useState('');
  const [sections, setSections] = useState<ChecklistSection[]>([
    {
      id: '1',
      title: 'Section 1',
      tasks: []
    }
  ]);

  const isSensorBased = user?.subscriptionType === 'sensor-based';

  const addSection = () => {
    const newSection: ChecklistSection = {
      id: Date.now().toString(),
      title: `Section ${sections.length + 1}`,
      tasks: []
    };
    setSections([...sections, newSection]);
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, title } : section
    ));
  };

  const removeSection = (sectionId: string) => {
    if (sections.length > 1) {
      setSections(sections.filter(section => section.id !== sectionId));
    }
  };

  const addTask = (sectionId: string, type: 'text' | 'checkbox' | 'temperature') => {
    const newTask: ChecklistTask = {
      id: Date.now().toString(),
      type,
      title: type === 'text' ? 'Enter task description' : 
             type === 'temperature' ? 'Record temperature automatically' :
             'Check when completed',
      placeholder: type === 'text' ? 'Enter details here...' : undefined
    };

    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, tasks: [...section.tasks, newTask] }
        : section
    ));
  };

  const updateTask = (sectionId: string, taskId: string, title: string) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            tasks: section.tasks.map(task => 
              task.id === taskId ? { ...task, title } : task
            )
          }
        : section
    ));
  };

  const removeTask = (sectionId: string, taskId: string) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, tasks: section.tasks.filter(task => task.id !== taskId) }
        : section
    ));
  };

  const handleSave = () => {
    if (!checklistTitle.trim()) {
      Alert.alert('Error', 'Please enter a checklist title');
      return;
    }

    if (sections.every(section => section.tasks.length === 0)) {
      Alert.alert('Error', 'Please add at least one task');
      return;
    }

    onSave({
      title: checklistTitle,
      sections: sections.filter(section => section.tasks.length > 0)
    });

    // Reset form
    setChecklistTitle('');
    setSections([{
      id: '1',
      title: 'Section 1',
      tasks: []
    }]);
    onClose();
  };

  const handleClose = () => {
    setChecklistTitle('');
    setSections([{
      id: '1',
      title: 'Section 1',
      tasks: []
    }]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <X size={24} color="#64748B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Checklist</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Save size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.titleSection}>
            <Text style={styles.label}>Checklist Title</Text>
            <TextInput
              style={styles.titleInput}
              value={checklistTitle}
              onChangeText={setChecklistTitle}
              placeholder="Enter checklist title..."
              placeholderTextColor="#94A3B8"
            />
          </View>

          {sections.map((section, sectionIndex) => (
            <View key={section.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Folder size={20} color="#2563EB" />
                  <TextInput
                    style={styles.sectionTitleInput}
                    value={section.title}
                    onChangeText={(text) => updateSectionTitle(section.id, text)}
                    placeholder="Section title..."
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                {sections.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeSectionButton}
                    onPress={() => removeSection(section.id)}
                  >
                    <X size={16} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.tasksContainer}>
                {section.tasks.map((task, taskIndex) => (
                  <View key={task.id} style={styles.taskItem}>
                    <View style={styles.taskHeader}>
                      <View style={styles.taskTypeIndicator}>
                        {task.type === 'text' ? (
                          <Type size={16} color="#059669" />
                        ) : task.type === 'temperature' ? (
                          <Thermometer size={16} color="#7C3AED" />
                        ) : (
                          <CheckSquare size={16} color="#2563EB" />
                        )}
                      </View>
                      <TextInput
                        style={styles.taskTitleInput}
                        value={task.title}
                        onChangeText={(text) => updateTask(section.id, task.id, text)}
                        placeholder="Task description..."
                        placeholderTextColor="#94A3B8"
                      />
                      <TouchableOpacity
                        style={styles.removeTaskButton}
                        onPress={() => removeTask(section.id, task.id)}
                      >
                        <X size={14} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                    
                    {task.type === 'text' && (
                      <View style={styles.taskPreview}>
                        <Text style={styles.taskPreviewLabel}>Input field preview:</Text>
                        <View style={styles.previewInput}>
                          <Text style={styles.previewPlaceholder}>
                            {task.placeholder || 'Enter details here...'}
                          </Text>
                        </View>
                      </View>
                    )}
                    
                    {task.type === 'temperature' && (
                      <View style={styles.taskPreview}>
                        <Text style={styles.taskPreviewLabel}>Temperature recording preview:</Text>
                        <View style={styles.temperaturePreview}>
                          <Thermometer size={16} color="#7C3AED" />
                          <Text style={styles.temperatureLabel}>Auto-record from sensors</Text>
                        </View>
                      </View>
                    )}
                    
                    {task.type === 'checkbox' && (
                      <View style={styles.taskPreview}>
                        <Text style={styles.taskPreviewLabel}>Checkbox preview:</Text>
                        <View style={styles.checkboxPreview}>
                          <View style={styles.checkbox} />
                          <Text style={styles.checkboxLabel}>Mark as completed</Text>
                        </View>
                      </View>
                    )}
                  </View>
                ))}

                <View style={styles.addTaskButtons}>
                  <TouchableOpacity
                    style={styles.addTaskButton}
                    onPress={() => addTask(section.id, 'text')}
                  >
                    <Type size={16} color="#059669" />
                    <Text style={styles.addTaskButtonText}>Add Input Task</Text>
                  </TouchableOpacity>
                  
                  {isSensorBased && (
                    <TouchableOpacity
                      style={styles.addTaskButton}
                      onPress={() => addTask(section.id, 'temperature')}
                    >
                      <Thermometer size={16} color="#7C3AED" />
                      <Text style={styles.addTaskButtonText}>Record Temperature</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={styles.addTaskButton}
                    onPress={() => addTask(section.id, 'checkbox')}
                  >
                    <CheckSquare size={16} color="#2563EB" />
                    <Text style={styles.addTaskButtonText}>Add Checkbox Task</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addSectionButton} onPress={addSection}>
            <Plus size={20} color="#7C3AED" />
            <Text style={styles.addSectionButtonText}>Add New Section</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
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
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00B88A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  titleSection: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 8,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    backgroundColor: '#FFFFFF',
    color: '#1E293B',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  sectionTitleInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  removeSectionButton: {
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
  },
  tasksContainer: {
    gap: 16,
  },
  taskItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  taskTypeIndicator: {
    width: 32,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  taskTitleInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  removeTaskButton: {
    padding: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 4,
  },
  taskPreview: {
    marginTop: 8,
  },
  taskPreviewLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 8,
  },
  previewInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  previewPlaceholder: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  temperaturePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
  },
  temperatureLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#7C3AED',
  },
  checkboxPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  checkboxLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  addTaskButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    minWidth: 120,
  },
  addTaskButtonText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  addSectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 40,
  },
  addSectionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#7C3AED',
  },
});