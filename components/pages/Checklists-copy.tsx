import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { CircleCheck as CheckCircle, Circle, Clock, User, MessageSquare, CreditCard as Edit3, X, Save, Trash2, Type, SquareCheck as CheckSquare, Thermometer, Camera,Plus, MoreVertical } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Checklist, ChecklistItem } from '@/types';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';

interface ChecklistTask {
  id: string;
  type: 'text' | 'checkbox' | 'temperature';
  title: string;
  placeholder?: string;
  completed: boolean;
  timestamp?: Date;
}

interface ChecklistSection {
  id: string;
  title: string;
  description?: string;
  comment?: string;
  tasks: ChecklistTask[];
}

interface ExtendedChecklist extends Omit<Checklist, 'items'> {
  sections: ChecklistSection[];
}

// Fixed checklist types
const FIXED_CHECKLIST_TYPES = [
  { key: 'opening', label: 'Opening' },
  { key: 'closing', label: 'Closing' },
  { key: 'probe', label: 'Probe Check' },
  { key: 'weekly', label: 'Weekly' },
];

// Mock data with sections
const mockChecklists: ExtendedChecklist[] = [
  {
    id: '1',
    type: 'opening',
    date: new Date(),
    status: 'in-progress',
    sections: [
      {
        id: 'section-1',
        title: 'Temperature Checks',
        comment: 'All fridges and freezers must be within range',
        tasks: [
          { id: '1', type: 'checkbox', title: 'Check fridge temperatures', completed: true, timestamp: new Date() },
          { id: '2', type: 'temperature', title: 'Record main fridge temperature', completed: true, timestamp: new Date() },
        ]
      },
      {
        id: 'section-2', 
        title: 'Safety Checks',
        tasks: [
          { id: '3', type: 'text', title: 'Verify cleaning supplies', completed: false },
          { id: '4', type: 'checkbox', title: 'Check hand washing stations', completed: false },
        ]
      }
    ]
  },
  {
    id: '2',
    type: 'closing',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'completed',
    completedBy: 'John Smith',
    sections: [
      {
        id: 'section-3',
        title: 'Cleaning Tasks',
        tasks: [
          { id: '5', type: 'checkbox', title: 'Clean all surfaces', completed: true, timestamp: new Date() },
          { id: '6', type: 'checkbox', title: 'Empty trash bins', completed: true, timestamp: new Date() },
          { id: '7', type: 'checkbox', title: 'Lock all doors', completed: true, timestamp: new Date() },
        ]
      }
    ]
  },
  {
    id: '3',
    type: 'probe',
    date: new Date(),
    status: 'pending',
    sections: [
      {
        id: 'section-4',
        title: 'Temperature Probes',
        tasks: [
          { id: '8', type: 'temperature', title: 'Probe main fridge', completed: false },
          { id: '9', type: 'temperature', title: 'Probe freezer unit', completed: false },
        ]
      }
    ]
  },
  {
    id: '4',
    type: 'weekly',
    date: new Date(),
    status: 'pending',
    sections: [
      {
        id: 'section-5',
        title: 'Weekly Audit',
        tasks: [
          { id: '10', type: 'text', title: 'Review incident reports', completed: false },
          { id: '11', type: 'checkbox', title: 'Check equipment maintenance', completed: false },
        ]
      }
    ]
  }
];

export default function Checklists() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'opening' | 'closing' | 'probe' | 'weekly'>('opening');
  const [expandedChecklist, setExpandedChecklist] = useState<string | null>(null);
  const [showSectionOptionsModal, setShowSectionOptionsModal] = useState(false);
  const [showTaskTypeModal, setShowTaskTypeModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [checklists, setChecklists] = useState(mockChecklists);
  const [editMode, setEditMode] = useState(false);
    const [editingSectionTitle, setEditingSectionTitle] = useState<string | null>(null);
  const [editingSectionDescription, setEditingSectionDescription] = useState<string | null>(null);
  const [sectionTitleValue, setSectionTitleValue] = useState('');
  const [sectionDescriptionValue, setSectionDescriptionValue] = useState('');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [sectionComment, setSectionComment] = useState('');
  const [showSectionCommentModal, setShowSectionCommentModal] = useState(false);
    const [showCommentModal, setShowCommentModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<{ checklistId: string; sectionId: string } | null>(null);
  const [addingTaskToSection, setAddingTaskToSection] = useState<{ checklistId: string; sectionId: string; insertIndex?: number } | null>(null);

  const filteredChecklists = checklists.filter(c => c.type === activeTab);
  const canEdit = user?.role === 'admin';
  const isSensorBased = user?.subscriptionType === 'sensor-based';

  const toggleItem = (checklistId: string, itemId: string) => {
    setChecklists(prev => prev.map(checklist => 
      checklist.id === checklistId 
        ? {
            ...checklist,
            sections: checklist.sections.map(section => ({
              ...section,
              tasks: section.tasks.map(item => 
                item.id === itemId 
                  ? { ...item, completed: !item.completed, timestamp: item.completed ? undefined : new Date() }
                  : item
              )
            }))
          }
        : checklist
    ));
  };


  const recordTemperature = (checklistId: string, itemId: string) => {
    const temperature = (Math.random() * 10 - 5).toFixed(1);
    Alert.alert(
      'Temperature Recorded',
      `Temperature automatically recorded: ${temperature}°C`,
      [{ text: 'OK' }]
    );
    
    setChecklists(prev => prev.map(checklist => 
      checklist.id === checklistId 
        ? {
            ...checklist,
            sections: checklist.sections.map(section => ({
              ...section,
              tasks: section.tasks.map(item => 
                item.id === itemId 
                  ? { ...item, completed: true, timestamp: new Date(), value: `${temperature}°C` }
                  : item
              )
            }))
          }
        : checklist
    ));
  };

  const handleSectionOptions = (checklistId: string, sectionId: string) => {
    setSelectedSection({ checklistId, sectionId });
    setShowSectionOptionsModal(true);
  };

  const handleAddComment = () => {
    setShowSectionOptionsModal(false);
    setShowCommentModal(true);
  };

  const handleAddImage = () => {
    setShowSectionOptionsModal(false);
    setShowImageModal(true);
  };

  const handleRecordTemperatures = () => {
    if (!selectedSection) return;

    const { checklistId, sectionId } = selectedSection;
    const temperatureTask = {
      id: Date.now().toString(),
      type: 'temperature' as const,
      title: 'Automatic Temperature Recording',
      completed: true,
      timestamp: new Date(),
      value: '3.2°C (Main Fridge), -18.5°C (Freezer A)'
    };

    setChecklists(prev => prev.map(checklist => 
      checklist.id === checklistId
        ? {
            ...checklist,
            sections: checklist.sections.map(section => 
              section.id === sectionId
                ? { ...section, tasks: [...section.tasks, temperatureTask] }
                : section
            )
          }
        : checklist
    ));

    setShowSectionOptionsModal(false);
    Alert.alert('Success', 'Temperature readings have been automatically recorded');
  };

  const saveComment = () => {
    if (!selectedSection) return;

    const { checklistId, sectionId } = selectedSection;
    setChecklists(prev => prev.map(checklist => 
      checklist.id === checklistId
        ? {
            ...checklist,
            sections: checklist.sections.map(section => 
              section.id === sectionId
                ? { ...section, comment: comment.trim() || undefined }
                : section
            )
          }
        : checklist
    ));

    setShowCommentModal(false);
    setComment('');
    setSelectedSection(null);
  };

  const saveImage = () => {
    if (!selectedSection) return;

    const { checklistId, sectionId } = selectedSection;
    // Mock image URI
    const mockImageUri = 'https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg?auto=compress&cs=tinysrgb&w=400';
    
    setChecklists(prev => prev.map(checklist => 
      checklist.id === checklistId
        ? {
            ...checklist,
            sections: checklist.sections.map(section => 
              section.id === sectionId
                ? { ...section, imageUri: mockImageUri }
                : section
            )
          }
        : checklist
    ));

    setShowImageModal(false);
    setSelectedSection(null);
    Alert.alert('Success', 'Image has been added to the section');
  };

  const startEditingSectionTitle = (sectionId: string, currentTitle: string) => {
    setEditingSectionTitle(sectionId);
    setSectionTitleValue(currentTitle);
  };

  const startEditingSectionDescription = (sectionId: string, currentDescription: string) => {
    setEditingSectionDescription(sectionId);
    setSectionDescriptionValue(currentDescription || '');
  };

  const saveSectionTitle = (checklistId: string, sectionId: string) => {
    setChecklists(prev => prev.map(checklist => 
      checklist.id === checklistId
        ? {
            ...checklist,
            sections: checklist.sections.map(section => 
              section.id === sectionId
                ? { ...section, title: sectionTitleValue }
                : section
            )
          }
        : checklist
    ));
    setEditingSectionTitle(null);
    setSectionTitleValue('');
  };

  const saveSectionDescription = (checklistId: string, sectionId: string) => {
    setChecklists(prev => prev.map(checklist => 
      checklist.id === checklistId
        ? {
            ...checklist,
            sections: checklist.sections.map(section => 
              section.id === sectionId
                ? { ...section, description: sectionDescriptionValue }
                : section
            )
          }
        : checklist
    ));
    setEditingSectionDescription(null);
    setSectionDescriptionValue('');
  };

  const handleAddTaskClick = (checklistId: string, sectionId: string, insertIndex?: number) => {
    setAddingTaskToSection({ checklistId, sectionId, insertIndex });
    setShowTaskTypeModal(true);
  };

  const addTaskOfType = (type: 'checkbox' | 'text' | 'temperature') => {
    if (!addingTaskToSection) return;

    const { checklistId, sectionId, insertIndex } = addingTaskToSection;
    
    const newTask: ChecklistTask = {
      id: Date.now().toString(),
      type,
      title: type === 'text' ? 'Enter task description' : 
             type === 'temperature' ? 'Record temperature' :
             'Check when completed',
      completed: false,
    };

    setChecklists(prev => prev.map(checklist => 
      checklist.id === checklistId
        ? {
            ...checklist,
            sections: checklist.sections.map(section => 
              section.id === sectionId
                ? {
                    ...section,
                    tasks: insertIndex !== undefined 
                      ? [
                          ...section.tasks.slice(0, insertIndex),
                          newTask,
                          ...section.tasks.slice(insertIndex)
                        ]
                      : [...section.tasks, newTask]
                  }
                : section
            )
          }
        : checklist
    ));

    setShowTaskTypeModal(false);
    setAddingTaskToSection(null);
  };

  const removeTask = (checklistId: string, sectionId: string, taskId: string) => {
    setChecklists(prev => prev.map(checklist => 
      checklist.id === checklistId
        ? {
            ...checklist,
            sections: checklist.sections.map(section => 
              section.id === sectionId
                ? { ...section, tasks: section.tasks.filter(task => task.id !== taskId) }
                : section
            )
          }
        : checklist
    ));
  };

  const updateTaskTitle = (checklistId: string, sectionId: string, taskId: string, newTitle: string) => {
    setChecklists(prev => prev.map(checklist => 
      checklist.id === checklistId
        ? {
            ...checklist,
            sections: checklist.sections.map(section => 
              section.id === sectionId
                ? {
                    ...section,
                    tasks: section.tasks.map(task => 
                      task.id === taskId
                        ? { ...task, title: newTitle }
                        : task
                    )
                  }
                : section
            )
          }
        : checklist
    ));
  };

  const saveChanges = () => {
    setEditMode(false);
    Alert.alert('Success', 'Changes saved successfully!');
  };

  const cancelEdit = () => {
    setEditMode(false);
    // Reset any unsaved changes here if needed
  };

  const submitChecklist = (checklistId: string) => {
    Alert.alert(
      'Submit Checklist',
      'Are you sure you want to submit this checklist? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => {
            setChecklists(prev => prev.map(checklist => 
              checklist.id === checklistId 
                ? { ...checklist, status: 'completed', completedBy: user?.name || 'Current User' }
                : checklist
            ));
            Alert.alert('Success', 'Checklist submitted successfully!');
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return Colors.success;
      case 'in-progress': return Colors.warning;
      case 'pending': return Colors.textSecondary;
      default: return Colors.textSecondary;
    }
  };

  const renderTaskItem = (item: any, checklistId: string, sectionId: string, taskIndex: number) => {
    const taskType = item.type || 'checkbox';
    
    return (
      <View key={item.id} style={styles.checklistItemContainer}>
        {/* Insert task button (only in edit mode) */}
        {editMode && (
          <TouchableOpacity
            style={styles.insertTaskButton}
            onPress={() => handleAddTaskClick(checklistId, sectionId, taskIndex)}
          >
            <Text style={styles.insertTaskText}>+ Insert Task</Text>
          </TouchableOpacity>
        )}

        <View style={styles.taskRow}>
          <TouchableOpacity
            style={styles.checklistItem}
            onPress={() => {
              if (taskType === 'temperature') {
                recordTemperature(checklistId, item.id);
              } else {
                toggleItem(checklistId, item.id);
              }
            }}
          >
            {taskType === 'temperature' ? (
              <View style={styles.temperatureButton}>
                <Thermometer size={20} color="#7C3AED" />
              </View>
            ) : item.completed ? (
              <CheckCircle size={20} color={Colors.success} />
            ) : (
              <Circle size={20} color={Colors.textSecondary} />
            )}
            
            {editMode ? (
              <TextInput
                style={styles.editTaskInput}
                value={item.title}
                onChangeText={(text) => updateTaskTitle(checklistId, sectionId, item.id, text)}
                multiline
              />
            ) : (
              <Text style={[
                styles.itemText,
                item.completed && styles.completedText
              ]}>
                {item.title}
              </Text>
            )}
            
            {item.timestamp && (
              <View style={styles.itemMeta}>
                <Clock size={12} color={Colors.textSecondary} />
                <Text style={styles.itemTime}>
                  {item.timestamp.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {editMode && (
            <TouchableOpacity
              style={styles.removeTaskButton}
              onPress={() => removeTask(checklistId, sectionId, item.id)}
            >
              <Trash2 size={16} color={Colors.error} />
            </TouchableOpacity>
          )}
        </View>
        
        {taskType === 'text' && (
          <TextInput
            style={styles.itemInput}
            placeholder="Add notes or measurements..."
            multiline
            numberOfLines={2}
          />
        )}

      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('checklists.title')}</Text>
          <Text style={styles.subtitle}>{t('checklists.subtitle')}</Text>
        </View>
        <View style={styles.headerActions}>
          {canEdit && (
            <>
              <TouchableOpacity
                style={[styles.editToggle, editMode && styles.editToggleActive]}
                onPress={() => setEditMode(!editMode)}
              >
                <Edit3 size={16} color={editMode ? Colors.textInverse : Colors.info} />
                <Text style={[
                  styles.editToggleText,
                  editMode && styles.editToggleTextActive
                ]}>
                  {editMode ? 'EDIT' : 'Edit'}
                </Text>
              </TouchableOpacity>
              {editMode && (
                <>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={cancelEdit}
                  >
                    <X size={16} color={Colors.textSecondary} />
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={saveChanges}
                  >
                    <Save size={16} color={Colors.textInverse} />
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      </View>

      <View style={styles.tabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FIXED_CHECKLIST_TYPES.map(tab => (
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
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          {filteredChecklists.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No {activeTab} checklist found</Text>
              <Text style={styles.emptyText}>
                This checklist type hasn't been set up yet.
              </Text>
            </View>
          ) : (
            filteredChecklists.map(checklist => (
              <View key={checklist.id} style={styles.checklistCard}>
                <TouchableOpacity
                  style={styles.checklistHeader}
                  onPress={() => setExpandedChecklist(
                    expandedChecklist === checklist.id ? null : checklist.id
                  )}
                >
                  <View style={styles.checklistInfo}>
                    <Text style={styles.checklistTitle}>
                      {FIXED_CHECKLIST_TYPES.find(t => t.key === checklist.type)?.label} Checklist
                    </Text>
                    <Text style={styles.checklistDate}>
                      {checklist.date.toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.checklistStatus}>
                    <View style={[
                      styles.statusIndicator,
                      { backgroundColor: getStatusColor(checklist.status) }
                    ]} />
                    <Text style={styles.statusText}>
                      {checklist.status.replace('-', ' ').toUpperCase()}
                    </Text>
                  </View>
                </TouchableOpacity>

{expandedChecklist === checklist.id && (
                  <View style={styles.checklistContent}>
                    {checklist.sections.map(section => (
                      <View key={section.id} style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                          <View style={styles.sectionTitleContainer}>
                            {editMode && editingSectionTitle === section.id ? (
                              <View style={styles.editTitleContainer}>
                                <TextInput
                                  style={styles.sectionTitleInput}
                                  value={sectionTitleValue}
                                  onChangeText={setSectionTitleValue}
                                  onBlur={() => saveSectionTitle(checklist.id, section.id)}
                                  autoFocus
                                />
                              </View>
                            ) : (
                              <TouchableOpacity
                                onPress={() => editMode && startEditingSectionTitle(section.id, section.title)}
                                disabled={!editMode}
                              >
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                              </TouchableOpacity>
                            )}
                            
                            {section.description && (
                              <>
                                {editMode && editingSectionDescription === section.id ? (
                                  <TextInput
                                    style={styles.sectionDescriptionInput}
                                    value={sectionDescriptionValue}
                                    onChangeText={setSectionDescriptionValue}
                                    onBlur={() => saveSectionDescription(checklist.id, section.id)}
                                    placeholder="Add section description..."
                                    multiline
                                    autoFocus
                                  />
                                ) : (
                                  <TouchableOpacity
                                    onPress={() => editMode && startEditingSectionDescription(section.id, section.description || '')}
                                    disabled={!editMode}
                                  >
                                    <Text style={styles.sectionDescription}>{section.description}</Text>
                                  </TouchableOpacity>
                                )}
                              </>
                            )}
                            
                            {editMode && !section.description && (
                              <TouchableOpacity
                                onPress={() => startEditingSectionDescription(section.id, '')}
                                style={styles.addDescriptionButton}
                              >
                                <Plus size={16} color={Colors.info} />
                                <Text style={styles.addDescriptionText}>Add description</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                          
                          <TouchableOpacity
                            style={styles.sectionOptionsButton}
                            onPress={() => handleSectionOptions(checklist.id, section.id)}
                          >
                            <MoreVertical size={20} color={Colors.textSecondary} />
                          </TouchableOpacity>
                        </View>

                        {section.comment && (
                          <View style={styles.sectionComment}>
                            <MessageSquare size={16} color={Colors.info} />
                            <Text style={styles.sectionCommentText}>{section.comment}</Text>
                          </View>
                        )}

                        {section.imageUri && (
                          <View style={styles.sectionImage}>
                            <Image source={{ uri: section.imageUri }} style={styles.sectionImageView} />
                          </View>
                        )}

                        <View style={styles.sectionTasks}>
                          {section.tasks.map((item) => renderTaskItem(item, checklist.id, section.id))}
                        </View>
                      </View>
                    ))}

                    <View style={styles.checklistActions}>
                      {checklist.completedBy && (
                        <View style={styles.completedBy}>
                          <User size={16} color={Colors.textSecondary} />
                          <Text style={styles.completedByText}>
                            {t('checklists.completedBy', { name: checklist.completedBy })}
                          </Text>
                        </View>
                      )}
                      
                      
                      {checklist.status !== 'completed' && (
                        <TouchableOpacity
                          style={styles.submitButton}
                          onPress={() => submitChecklist(checklist.id)}
                        >
                          <Text style={styles.submitButtonText}>Submit Checklist</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <Modal visible={showSectionOptionsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Section Options</Text>
              <TouchableOpacity onPress={() => setShowSectionOptionsModal(false)}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.optionsContainer}>
              <TouchableOpacity style={styles.optionButton} onPress={handleAddComment}>
                <MessageSquare size={20} color={Colors.info} />
                <Text style={styles.optionText}>Add Comment</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.optionButton} onPress={handleAddImage}>
                <Camera size={20} color={Colors.info} />
                <Text style={styles.optionText}>Add Image</Text>
              </TouchableOpacity>
              
              {isSensorBased && (
                <TouchableOpacity style={styles.optionButton} onPress={handleRecordTemperatures}>
                  <Thermometer size={20} color={Colors.info} />
                  <Text style={styles.optionText}>Record Temperatures</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
      {/* Task Type Selection Modal */}
      <Modal visible={showTaskTypeModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Task Type</Text>
              <TouchableOpacity onPress={() => {
                setShowTaskTypeModal(false);
                setAddingTaskToSection(null);
              }}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.taskTypeOptions}>
              <TouchableOpacity
                style={styles.taskTypeOption}
                onPress={() => addTaskOfType('checkbox')}
              >
                <CheckSquare size={24} color={Colors.info} />
                <Text style={styles.taskTypeTitle}>Checkbox</Text>
                <Text style={styles.taskTypeDescription}>Simple yes/no task</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.taskTypeOption}
                onPress={() => addTaskOfType('text')}
              >
                <Type size={24} color={Colors.success} />
                <Text style={styles.taskTypeTitle}>Text Input</Text>
                <Text style={styles.taskTypeDescription}>Requires text entry</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.taskTypeOption}
                onPress={() => addTaskOfType('temperature')}
              >
                <Thermometer size={24} color="#7C3AED" />
                <Text style={styles.taskTypeTitle}>Temperature</Text>
                <Text style={styles.taskTypeDescription}>
                  {isSensorBased ? 'Auto-record from sensors' : 'Manual temperature entry'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Comment Modal */}
      <Modal visible={showCommentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Comment</Text>
              <TouchableOpacity onPress={() => setShowCommentModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <TextInput
                style={styles.commentInput}
                value={comment}
                onChangeText={setComment}
                placeholder="Enter your comment..."
                multiline
                numberOfLines={4}
                autoFocus
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.primaryButton} onPress={saveComment}>
                <Text style={styles.primaryButtonText}>Save Comment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Section Comment Modal */}
      <Modal visible={showSectionCommentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Section Comment</Text>
              <TouchableOpacity onPress={() => setShowSectionCommentModal(false)}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <TextInput
                style={styles.commentInput}
                value={sectionComment}
                onChangeText={setSectionComment}
                placeholder="Add a note for this section..."
                multiline
                numberOfLines={4}
                autoFocus
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelModalButton}
                onPress={() => setShowSectionCommentModal(false)}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
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
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.info,
    gap: 6,
  },
  editToggleActive: {
    backgroundColor: Colors.info,
  },
  editToggleText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.info,
  },
  editToggleTextActive: {
    color: Colors.textInverse,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#237ECD',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textInverse,
  },
  tabs: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: Colors.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
  },
  activeTab: {
    backgroundColor: Colors.success,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.textInverse,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 32,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  checklistCard: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  checklistInfo: {
    flex: 1,
  },
  checklistTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  checklistDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  checklistStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  checklistContent: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    padding: 24,
  },
  sectionContainer: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
  },
  sectionTitleInput: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderMedium,
    paddingVertical: 4,
    flex: 1,
    marginRight: 12,
  },
  sectionCommentButton: {
    padding: 4,
  },
  commentIconGradient: {
    padding: 4,
    borderRadius: 6,
  },
  sectionComment: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.info,
  },
  sectionCommentText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  sectionTasks: {
    gap: 8,
  },
  checklistItemContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundSecondary,
  },
  insertTaskButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.info + '20',
    borderRadius: 6,
    marginBottom: 8,
  },
  insertTaskText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.info,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
    flex: 1,
  },
  temperatureButton: {
    width: 32,
    height: 32,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textPrimary,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  editTaskInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    borderRadius: 6,
    padding: 8,
  },
  removeTaskButton: {
    padding: 8,
    backgroundColor: Colors.error + '20',
    borderRadius: 6,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  itemInput: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    backgroundColor: Colors.backgroundSecondary,
    marginBottom: 8,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.info + '20',
    borderRadius: 6,
    gap: 4,
  },
  commentButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.info,
  },
  addTaskButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    marginTop: 12,
  },
  addTaskText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.info,
  },
  checklistActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.backgroundSecondary,
  },
  completedBy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedByText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  submitButton: {
    backgroundColor: '#237ECD',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textInverse,
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
  },
  cancelText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  modalBody: {
    padding: 24,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  taskTypeOptions: {
    padding: 24,
    gap: 16,
  },
  taskTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    gap: 16,
  },
  taskTypeTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    flex: 1,
  },
  taskTypeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    flex: 2,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 12,
  },
  cancelModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
  },
  cancelModalButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#237ECD',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textInverse,
  },
  optionsContainer: {
    padding: 24,
    gap: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.textPrimary,
  },
    sectionDescriptionInput: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    minHeight: 60,
    textAlignVertical: 'top',
  },
    addDescriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  addDescriptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.info,
  },
    sectionTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
   sectionOptionsButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: Colors.backgroundSecondary,
  },
   sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
});
