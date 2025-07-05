import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Platform, Image } from 'react-native';
import { CircleCheck as CheckCircle, Circle, Clock, User, MessageSquare, X, Save, Trash2, Type, SquareCheck as CheckSquare, Thermometer, Camera, Plus, MoreVertical as MoreVertical, GripVertical, ChevronDown, ChevronUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { Checklist, ChecklistItem } from '@/types';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import DragHandle from '@/components/DragHandle';
import * as DocumentPicker from 'expo-document-picker';

// Web drag and drop
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Mobile drag and drop
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';

interface ChecklistTask {
  id: string;
  type: 'text' | 'checkbox' | 'temperature';
  title: string;
  placeholder?: string;
  completed: boolean;
  timestamp?: Date;
  value?: string;
  textValue?: string;
}

interface ChecklistSection {
  id: string;
  title: string;
  description?: string;
  comment?: string;
  imageUri?: string;
  tasks: ChecklistTask[];
  collapsed?: boolean;
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

// Mock sensor data
const mockSensors = [
  { id: '1', name: 'Main Fridge', currentTemp: 3.2 },
  { id: '2', name: 'Freezer Unit A', currentTemp: -18.5 },
  { id: '3', name: 'Prep Room', currentTemp: 22.1 },
  { id: '4', name: 'Walk-in Cooler', currentTemp: 4.8 },
  { id: '5', name: 'Freezer Unit B', currentTemp: -19.2 },
  { id: '6', name: 'Display Fridge', currentTemp: 2.8 },
  { id: '7', name: 'Dining Area', currentTemp: 21.5 },
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
        collapsed: false,
        tasks: [
          { id: '1', type: 'checkbox', title: 'Check fridge temperatures', completed: true, timestamp: new Date() },
          { id: '2', type: 'temperature', title: 'Record main fridge temperature', completed: true, timestamp: new Date() },
        ]
      },
      {
        id: 'section-2', 
        title: 'Safety Checks',
        collapsed: false,
        tasks: [
          { id: '3', type: 'text', title: 'Verify cleaning supplies', completed: false, textValue: '' },
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
        collapsed: false,
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
        collapsed: false,
        tasks: [
          { id: '8', type: 'temperature', title: 'Probe main fridge', completed: false },
          { id: '9', type: 'temperature', title: 'Probe freezer unit', completed: false },
        ]
      }
    ]
  },
  
];

// Sortable Task Item for Web
function SortableTaskItem({ 
  task, 
  checklistId, 
  sectionId, 
  editMode, 
  onTaskToggle, 
  onTaskUpdate, 
  onTaskDelete, 
  onRecordTemperature,
  isSensorBased 
}: {
  task: ChecklistTask;
  checklistId: string;
  sectionId: string;
  editMode: boolean;
  onTaskToggle: (checklistId: string, sectionId: string, taskId: string) => void;
  onTaskUpdate: (checklistId: string, sectionId: string, taskId: string, updates: Partial<ChecklistTask>) => void;
  onTaskDelete: (checklistId: string, sectionId: string, taskId: string) => void;
  onRecordTemperature: (checklistId: string, sectionId: string, taskId: string) => void;
  isSensorBased: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [manualTemp, setManualTemp] = useState(0);

  const handleTaskToggle = () => {
    if (task.type === 'text' && !task.completed && (!task.textValue || task.textValue.trim() === '')) {
      Alert.alert('Text Required', 'Please fill in the text before marking this task as complete.');
      return;
    }
    
    if (task.type === 'temperature') {
      onRecordTemperature(checklistId, sectionId, task.id);
    } else {
      onTaskToggle(checklistId, sectionId, task.id);
    }
  };

  const handleTextChange = (text: string) => {
    onTaskUpdate(checklistId, sectionId, task.id, { textValue: text });
  };

  const handleTitleChange = (title: string) => {
    onTaskUpdate(checklistId, sectionId, task.id, { title });
  };

  const handleManualTempChange = (temp: number) => {
    setManualTemp(temp);
    const tempValue = `Manual reading: ${temp.toFixed(1)}°C`;
    onTaskUpdate(checklistId, sectionId, task.id, { 
      value: tempValue,
      completed: true,
      timestamp: new Date()
    });
  };

  return (
    <View ref={setNodeRef} style={[styles.taskItemContainer, style]}>
      <View style={styles.taskRow}>
        {editMode && (
          <TouchableOpacity 
            style={styles.dragHandle} 
            {...attributes} 
            {...listeners}
          >
            <DragHandle />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.taskToggle}
          onPress={handleTaskToggle}
        >
          {task.type === 'temperature' ? (
            <View style={styles.temperatureButton}>
              <Thermometer size={16} color="#7C3AED" />
            </View>
          ) : task.completed ? (
            <CheckCircle size={18} color={Colors.success} />
          ) : (
            <Circle size={18} color={Colors.textSecondary} />
          )}
        </TouchableOpacity>
        
        <View style={styles.taskContent}>
          {editMode ? (
            <TextInput
              style={styles.editTaskInput}
              value={task.title}
              onChangeText={handleTitleChange}
              placeholder="Task description..."
              placeholderTextColor={Colors.textTertiary}
            />
          ) : (
            <Text style={[
              styles.taskTitle,
              task.completed && styles.completedTask
            ]}>
              {task.title}
            </Text>
          )}
          
          {task.timestamp && (
            <View style={styles.taskMeta}>
              <Clock size={10} color={Colors.textSecondary} />
              <Text style={styles.taskTime}>
                {task.timestamp.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          )}
          
          {task.value && (
            <Text style={styles.taskValue}>{task.value}</Text>
          )}
        </View>

        {editMode && (
          <TouchableOpacity
            style={styles.removeTaskButton}
            onPress={() => onTaskDelete(checklistId, sectionId, task.id)}
          >
            <Trash2 size={14} color={Colors.error} />
          </TouchableOpacity>
        )}
      </View>
      
      {task.type === 'text' && (
        <View style={styles.textInputContainer}>
          <TextInput
            style={[
              styles.taskTextInput,
              task.completed && styles.disabledTextInput
            ]}
            value={task.textValue || ''}
            onChangeText={handleTextChange}
            placeholder="Add notes or measurements..."
            placeholderTextColor={Colors.textTertiary}
            multiline
            numberOfLines={2}
            editable={!task.completed}
          />
        </View>
      )}

      {task.type === 'temperature' && !isSensorBased && !task.completed && (
        <View style={styles.manualTempContainer}>
          <Text style={styles.manualTempLabel}>Manual Temperature: {manualTemp.toFixed(1)}°C</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>-20°C</Text>
            <Slider
              style={styles.slider}
              minimumValue={-20}
              maximumValue={60}
              value={manualTemp}
              onValueChange={setManualTemp}
              onSlidingComplete={handleManualTempChange}
              minimumTrackTintColor="#7C3AED"
              maximumTrackTintColor="#E2E8F0"
              thumbTintColor="#7C3AED"
            />
            <Text style={styles.sliderLabel}>60°C</Text>
          </View>
        </View>
      )}
    </View>
  );
}

// Mobile Task Item for DraggableFlatList
function MobileTaskItem({ 
  item: task, 
  drag, 
  isActive, 
  checklistId, 
  sectionId, 
  editMode, 
  onTaskToggle, 
  onTaskUpdate, 
  onTaskDelete, 
  onRecordTemperature,
  isSensorBased 
}: RenderItemParams<ChecklistTask> & {
  checklistId: string;
  sectionId: string;
  editMode: boolean;
  onTaskToggle: (checklistId: string, sectionId: string, taskId: string) => void;
  onTaskUpdate: (checklistId: string, sectionId: string, taskId: string, updates: Partial<ChecklistTask>) => void;
  onTaskDelete: (checklistId: string, sectionId: string, taskId: string) => void;
  onRecordTemperature: (checklistId: string, sectionId: string, taskId: string) => void;
  isSensorBased: boolean;
}) {
  const [manualTemp, setManualTemp] = useState(0);

  const handleTaskToggle = () => {
    if (task.type === 'text' && !task.completed && (!task.textValue || task.textValue.trim() === '')) {
      Alert.alert('Text Required', 'Please fill in the text before marking this task as complete.');
      return;
    }
    
    if (task.type === 'temperature') {
      onRecordTemperature(checklistId, sectionId, task.id);
    } else {
      onTaskToggle(checklistId, sectionId, task.id);
    }
  };

  const handleTextChange = (text: string) => {
    onTaskUpdate(checklistId, sectionId, task.id, { textValue: text });
  };

  const handleTitleChange = (title: string) => {
    onTaskUpdate(checklistId, sectionId, task.id, { title });
  };

  const handleManualTempChange = (temp: number) => {
    setManualTemp(temp);
    const tempValue = `Manual reading: ${temp.toFixed(1)}°C`;
    onTaskUpdate(checklistId, sectionId, task.id, { 
      value: tempValue,
      completed: true,
      timestamp: new Date()
    });
  };

  return (
    <ScaleDecorator>
      <View style={[styles.taskItemContainer, isActive && styles.draggingTask]}>
        <View style={styles.taskRow}>
          {editMode && (
            <TouchableOpacity 
              style={styles.dragHandle} 
              onLongPress={drag}
              delayLongPress={100}
            >
              <DragHandle />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.taskToggle}
            onPress={handleTaskToggle}
          >
            {task.type === 'temperature' ? (
              <View style={styles.temperatureButton}>
                <Thermometer size={16} color="#7C3AED" />
              </View>
            ) : task.completed ? (
              <CheckCircle size={18} color={Colors.success} />
            ) : (
              <Circle size={18} color={Colors.textSecondary} />
            )}
          </TouchableOpacity>
          
          <View style={styles.taskContent}>
            {editMode ? (
              <TextInput
                style={styles.editTaskInput}
                value={task.title}
                onChangeText={handleTitleChange}
                placeholder="Task description..."
                placeholderTextColor={Colors.textTertiary}
              />
            ) : (
              <Text style={[
                styles.taskTitle,
                task.completed && styles.completedTask
              ]}>
                {task.title}
              </Text>
            )}
            
            {task.timestamp && (
              <View style={styles.taskMeta}>
                <Clock size={10} color={Colors.textSecondary} />
                <Text style={styles.taskTime}>
                  {task.timestamp.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            )}
            
            {task.value && (
              <Text style={styles.taskValue}>{task.value}</Text>
            )}
          </View>

          {editMode && (
            <TouchableOpacity
              style={styles.removeTaskButton}
              onPress={() => onTaskDelete(checklistId, sectionId, task.id)}
            >
              <Trash2 size={14} color={Colors.error} />
            </TouchableOpacity>
          )}
        </View>
        
        {task.type === 'text' && (
          <View style={styles.textInputContainer}>
            <TextInput
              style={[
                styles.taskTextInput,
                task.completed && styles.disabledTextInput
              ]}
              value={task.textValue || ''}
              onChangeText={handleTextChange}
              placeholder="Add notes or measurements..."
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={2}
              editable={!task.completed}
            />
          </View>
        )}

        {task.type === 'temperature' && !isSensorBased && !task.completed && (
          <View style={styles.manualTempContainer}>
            <Text style={styles.manualTempLabel}>Manual Temperature: {manualTemp.toFixed(1)}°C</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>-20°C</Text>
              <Slider
                style={styles.slider}
                minimumValue={-20}
                maximumValue={60}
                value={manualTemp}
                onValueChange={setManualTemp}
                onSlidingComplete={handleManualTempChange}
                minimumTrackTintColor="#7C3AED"
                maximumTrackTintColor="#E2E8F0"
                thumbTintColor="#7C3AED"
              />
              <Text style={styles.sliderLabel}>60°C</Text>
            </View>
          </View>
        )}
      </View>
    </ScaleDecorator>
  );
}

export default function Checklists() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'opening' | 'closing' | 'probe' | 'weekly'>('opening');
  const [expandedChecklist, setExpandedChecklist] = useState<string | null>(null);
  const [showSectionOptionsModal, setShowSectionOptionsModal] = useState(false);
  const [showTaskTypeModal, setShowTaskTypeModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [submittingChecklistId, setSubmittingChecklistId] = useState<string | null>(null);
  const [checklists, setChecklists] = useState(mockChecklists);
  const [editMode, setEditMode] = useState(false);
  const [selectedSection, setSelectedSection] = useState<{ checklistId: string; sectionId: string } | null>(null);
  const [addingTaskToSection, setAddingTaskToSection] = useState<{ checklistId: string; sectionId: string } | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredChecklists = checklists.filter(c => c.type === activeTab);
  const canEdit = user?.role === 'admin';
  const isSensorBased = user?.subscriptionType === 'sensor-based';

  const isChecklistComplete = (checklist: ExtendedChecklist) => {
    return checklist.sections.every(section => 
      section.tasks.every(task => task.completed)
    );
  };

    const createNewChecklist = (type: 'opening' | 'closing' | 'probe' | 'weekly') => {
    const newChecklist: ExtendedChecklist = {
      id: Date.now().toString(),
      type,
      date: new Date(),
      status: 'pending',
      sections: [
        {
          id: 'section-' + Date.now(),
          title: 'New Section',
          tasks: [],
          collapsed: false,
        }
      ]
    };

    setChecklists(prev => [...prev, newChecklist]);
    setExpandedChecklist(newChecklist.id);
    setEditMode(true);
  };
  const toggleTask = (checklistId: string, sectionId: string, taskId: string) => {
    setChecklists(prev => prev.map(checklist => 
      checklist.id === checklistId 
        ? {
            ...checklist,
            status: checklist.status === 'completed' ? 'in-progress' : checklist.status,
            sections: checklist.sections.map(section => 
              section.id === sectionId
                ? {
                    ...section,
                    tasks: section.tasks.map(task => 
                      task.id === taskId 
                        ? { 
                            ...task, 
                            completed: !task.completed, 
                            timestamp: !task.completed ? new Date() : undefined 
                          }
                        : task
                    )
                  }
                : section
            )
          }
        : checklist
    ));
  };

  const updateTask = (checklistId: string, sectionId: string, taskId: string, updates: Partial<ChecklistTask>) => {
    setChecklists(prev => prev.map(checklist => 
      checklist.id === checklistId 
        ? {
            ...checklist,
            status: checklist.status === 'completed' ? 'in-progress' : checklist.status,
            sections: checklist.sections.map(section => 
              section.id === sectionId
                ? {
                    ...section,
                    tasks: section.tasks.map(task => 
                      task.id === taskId ? { ...task, ...updates } : task
                    )
                  }
                : section
            )
          }
        : checklist
    ));
  };

  const recordTemperature = (checklistId: string, sectionId: string, taskId: string) => {
    if (isSensorBased) {
      // Automatically record all sensors
      const temperatureReadings = mockSensors.map(sensor => 
        `${sensor.name}: ${sensor.currentTemp}°C`
      ).join('\n');

      setChecklists(prev => prev.map(checklist => 
        checklist.id === checklistId 
          ? {
              ...checklist,
              status: checklist.status === 'completed' ? 'in-progress' : checklist.status,
              sections: checklist.sections.map(section => 
                section.id === sectionId
                  ? {
                      ...section,
                      tasks: section.tasks.map(task => 
                        task.id === taskId 
                          ? { 
                              ...task, 
                              completed: true, 
                              timestamp: new Date(), 
                              value: temperatureReadings 
                            }
                          : task
                      )
                    }
                  : section
              )
            }
          : checklist
      ));

      Alert.alert('Temperature Recorded', 'All sensor temperatures have been automatically recorded.');
    }
    // For non-sensor users, the manual temperature input will handle this
  };

  const deleteTask = (checklistId: string, sectionId: string, taskId: string) => {
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

  const addTask = (checklistId: string, sectionId: string, type: 'checkbox' | 'text' | 'temperature') => {
    const newTask: ChecklistTask = {
      id: Date.now().toString(),
      type,
      title: type === 'text' ? 'Enter task description' : 
             type === 'temperature' ? 'Record temperature' :
             'Check when completed',
      completed: false,
      textValue: type === 'text' ? '' : undefined,
    };

    setChecklists(prev => prev.map(checklist => 
      checklist.id === checklistId
        ? {
            ...checklist,
            sections: checklist.sections.map(section => 
              section.id === sectionId
                ? { ...section, tasks: [...section.tasks, newTask] }
                : section
            )
          }
        : checklist
    ));
  };

  const addSection = (checklistId: string) => {
    const newSection: ChecklistSection = {
      id: Date.now().toString(),
      title: 'New Section',
      tasks: [],
      collapsed: false,
    };

    setChecklists(prev => prev.map(checklist => 
      checklist.id === checklistId
        ? { ...checklist, sections: [...checklist.sections, newSection] }
        : checklist
    ));
  };

  const toggleSectionCollapse = (checklistId: string, sectionId: string) => {
    setChecklists(prev => prev.map(checklist => 
      checklist.id === checklistId
        ? {
            ...checklist,
            sections: checklist.sections.map(section => 
              section.id === sectionId
                ? { ...section, collapsed: !section.collapsed }
                : section
            )
          }
        : checklist
    ));
  };

  const handleDragEnd = (event: DragEndEvent, checklistId: string, sectionId: string) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setChecklists(prev => prev.map(checklist => 
        checklist.id === checklistId
          ? {
              ...checklist,
              sections: checklist.sections.map(section => 
                section.id === sectionId
                  ? {
                      ...section,
                      tasks: arrayMove(
                        section.tasks,
                        section.tasks.findIndex(task => task.id === active.id),
                        section.tasks.findIndex(task => task.id === over.id)
                      )
                    }
                  : section
              )
            }
          : checklist
      ));
    }
  };

  const handleMobileDragEnd = (data: ChecklistTask[], checklistId: string, sectionId: string) => {
    setChecklists(prev => prev.map(checklist => 
      checklist.id === checklistId
        ? {
            ...checklist,
            sections: checklist.sections.map(section => 
              section.id === sectionId
                ? { ...section, tasks: data }
                : section
            )
          }
        : checklist
    ));
  };

  const handleSubmitChecklist = (checklistId: string) => {
    const checklist = checklists.find(c => c.id === checklistId);
    if (!checklist) return;

    if (!isChecklistComplete(checklist)) {
      Alert.alert(
        'Incomplete Checklist',
        'Please complete all tasks before submitting the checklist.',
        [{ text: 'OK' }]
      );
      return;
    }

    setSubmittingChecklistId(checklistId);
    setSubmitterName('');
    setShowSubmissionModal(true);
  };

  const confirmSubmission = () => {
    if (!submitterName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!submittingChecklistId) return;

    setChecklists(prev => prev.map(checklist => 
      checklist.id === submittingChecklistId 
        ? { 
            ...checklist, 
            status: 'completed', 
            completedBy: submitterName.trim() 
          }
        : checklist
    ));

    setShowSubmissionModal(false);
    setSubmittingChecklistId(null);
    setSubmitterName('');
    Alert.alert('Success', 'Checklist submitted successfully!');
  };

  const handleSectionOptions = (checklistId: string, sectionId: string) => {
    setSelectedSection({ checklistId, sectionId });
    setShowSectionOptionsModal(true);
  };

  const handleAddComment = () => {
    setShowSectionOptionsModal(false);
    setComment('');
    setShowCommentModal(true);
  };

  const handleAddImage = () => {
    setShowSectionOptionsModal(false);
    setShowImageModal(true);
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

  const saveImage = async () => {
    if (!selectedSection) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const { checklistId, sectionId } = selectedSection;
        const imageUri = result.assets[0].uri;
        
        setChecklists(prev => prev.map(checklist => 
          checklist.id === checklistId
            ? {
                ...checklist,
                sections: checklist.sections.map(section => 
                  section.id === sectionId
                    ? { ...section, imageUri }
                    : section
                )
              }
            : checklist
        ));

        setShowImageModal(false);
        setSelectedSection(null);
        Alert.alert('Success', 'Image has been added to the section');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const saveChanges = () => {
    setEditMode(false);
    Alert.alert('Success', 'Changes saved successfully!');
  };

  const cancelEdit = () => {
    setEditMode(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return Colors.success;
      case 'in-progress': return Colors.warning;
      case 'pending': return Colors.textSecondary;
      default: return Colors.textSecondary;
    }
  };

  const renderTaskList = (section: ChecklistSection, checklistId: string) => {
    if (Platform.OS === 'web') {
      // Web implementation with @dnd-kit
      return (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => handleDragEnd(event, checklistId, section.id)}
        >
          <SortableContext
            items={section.tasks.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <View style={styles.tasksList}>
              {section.tasks.map(task => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  checklistId={checklistId}
                  sectionId={section.id}
                  editMode={editMode}
                  onTaskToggle={toggleTask}
                  onTaskUpdate={updateTask}
                  onTaskDelete={deleteTask}
                  onRecordTemperature={recordTemperature}
                  isSensorBased={isSensorBased}
                />
              ))}
            </View>
          </SortableContext>
        </DndContext>
      );
    } else {
      // Mobile implementation with react-native-draggable-flatlist
      return (
        <View style={styles.tasksList}>
          <DraggableFlatList
            data={section.tasks}
            onDragEnd={({ data }) => handleMobileDragEnd(data, checklistId, section.id)}
            keyExtractor={(item) => item.id}
            renderItem={(params) => (
              <MobileTaskItem
                {...params}
                checklistId={checklistId}
                sectionId={section.id}
                editMode={editMode}
                onTaskToggle={toggleTask}
                onTaskUpdate={updateTask}
                onTaskDelete={deleteTask}
                onRecordTemperature={recordTemperature}
                isSensorBased={isSensorBased}
              />
            )}
            scrollEnabled={false}
          />
        </View>
      );
    }
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

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        <View style={styles.section}>
          {filteredChecklists.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No {activeTab} checklist found</Text>
              <Text style={styles.emptyText}>
                This checklist type hasn't been set up yet.
              </Text>
              {canEdit && (
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => createNewChecklist(activeTab)}
                >
                  <Plus size={20} color={Colors.textInverse} />
                  <Text style={styles.createButtonText}>Create Checklist</Text>
                </TouchableOpacity>
              )}
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
                        <TouchableOpacity
                          style={styles.sectionHeader}
                          onPress={() => toggleSectionCollapse(checklist.id, section.id)}
                        >
                          <View style={styles.sectionTitleContainer}>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                            {section.description && (
                              <Text style={styles.sectionDescription}>{section.description}</Text>
                            )}
                          </View>
                          
                          <View style={styles.sectionHeaderActions}>
                            <TouchableOpacity
                              style={styles.sectionOptionsButton}
                              onPress={() => handleSectionOptions(checklist.id, section.id)}
                            >
                              <MoreVertical size={20} color={Colors.textSecondary} />
                            </TouchableOpacity>
                            {section.collapsed ? (
                              <ChevronDown size={20} color={Colors.textSecondary} />
                            ) : (
                              <ChevronUp size={20} color={Colors.textSecondary} />
                            )}
                          </View>
                        </TouchableOpacity>

                        {!section.collapsed && (
                          <>
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

                            {renderTaskList(section, checklist.id)}

                            {editMode && (
                              <View style={styles.addTaskSection}>
                                <TouchableOpacity
                                  style={styles.addTaskButton}
                                  onPress={() => {
                                    setAddingTaskToSection({ checklistId: checklist.id, sectionId: section.id });
                                    setShowTaskTypeModal(true);
                                  }}
                                >
                                  <Plus size={16} color={Colors.info} />
                                  <Text style={styles.addTaskText}>Add Task</Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </>
                        )}
                      </View>
                    ))}

                    {editMode && (
                      <TouchableOpacity
                        style={styles.addSectionButton}
                        onPress={() => addSection(checklist.id)}
                      >
                        <Plus size={16} color={Colors.info} />
                        <Text style={styles.addSectionText}>Add Section</Text>
                      </TouchableOpacity>
                    )}

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
                          onPress={() => handleSubmitChecklist(checklist.id)}
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

      {/* Section Options Modal */}
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
                onPress={() => {
                  if (addingTaskToSection) {
                    addTask(addingTaskToSection.checklistId, addingTaskToSection.sectionId, 'checkbox');
                  }
                  setShowTaskTypeModal(false);
                  setAddingTaskToSection(null);
                }}
              >
                <CheckSquare size={24} color={Colors.info} />
                <Text style={styles.taskTypeTitle}>Checkbox</Text>
                <Text style={styles.taskTypeDescription}>Simple yes/no task</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.taskTypeOption}
                onPress={() => {
                  if (addingTaskToSection) {
                    addTask(addingTaskToSection.checklistId, addingTaskToSection.sectionId, 'text');
                  }
                  setShowTaskTypeModal(false);
                  setAddingTaskToSection(null);
                }}
              >
                <Type size={24} color={Colors.success} />
                <Text style={styles.taskTypeTitle}>Text Input</Text>
                <Text style={styles.taskTypeDescription}>Requires text entry</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.taskTypeOption}
                onPress={() => {
                  if (addingTaskToSection) {
                    addTask(addingTaskToSection.checklistId, addingTaskToSection.sectionId, 'temperature');
                  }
                  setShowTaskTypeModal(false);
                  setAddingTaskToSection(null);
                }}
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
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <TextInput
                style={styles.commentInput}
                value={comment}
                onChangeText={setComment}
                placeholder="Enter your comment..."
                placeholderTextColor={Colors.textTertiary}
                multiline
                numberOfLines={4}
                autoFocus
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelModalButton}
                onPress={() => setShowCommentModal(false)}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={saveComment}
              >
                <Text style={styles.primaryButtonText}>Save Comment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Modal */}
      <Modal visible={showImageModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Image</Text>
              <TouchableOpacity onPress={() => setShowImageModal(false)}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.imageHelperText}>
                Select an image to attach to this section.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelModalButton}
                onPress={() => setShowImageModal(false)}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={saveImage}
              >
                <Text style={styles.primaryButtonText}>Select Image</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Submission Modal */}
      <Modal visible={showSubmissionModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Checklist</Text>
              <TouchableOpacity onPress={() => setShowSubmissionModal(false)}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.submissionText}>
                Please enter your name to confirm submission of this checklist.
              </Text>
              <TextInput
                style={styles.submitterInput}
                value={submitterName}
                onChangeText={setSubmitterName}
                placeholder="Enter your full name"
                placeholderTextColor={Colors.textTertiary}
                autoFocus
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelModalButton}
                onPress={() => setShowSubmissionModal(false)}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={confirmSubmission}
              >
                <Text style={styles.primaryButtonText}>Submit Checklist</Text>
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
  createButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 16,
  paddingVertical: 12,
  paddingHorizontal: 24,
  backgroundColor: '#237ECD',
  borderRadius: 8,
},
createButtonText: {
  marginLeft: 8,
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
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sectionHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionOptionsButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: Colors.backgroundSecondary,
  },
  sectionComment: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.backgroundSecondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.info,
    gap: 8,
  },
  sectionCommentText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    fontStyle: 'italic',
    flex: 1,
  },
  sectionImage: {
    marginBottom: 12,
  },
  sectionImageView: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  tasksList: {
    gap: 6,
  },
  taskItemContainer: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 6,
  },
  draggingTask: {
    opacity: 0.8,
    transform: [{ scale: 1.02 }],
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
  },
  dragHandle: {
    padding: 4,
  },
  taskToggle: {
    padding: 4,
  },
  temperatureButton: {
    width: 28,
    height: 28,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  editTaskInput: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    borderRadius: 6,
    padding: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  taskTime: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  taskValue: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  removeTaskButton: {
    padding: 6,
    backgroundColor: Colors.error + '20',
    borderRadius: 4,
  },
  textInputContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  taskTextInput: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    backgroundColor: Colors.backgroundSecondary,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  disabledTextInput: {
    backgroundColor: Colors.borderLight,
    color: Colors.textSecondary,
  },
  manualTempContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  manualTempLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#7C3AED',
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  addTaskSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 6,
    gap: 6,
  },
  addTaskText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.info,
  },
  addSectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  addSectionText: {
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
  modalBody: {
    padding: 24,
  },
  submissionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textPrimary,
    marginBottom: 16,
    lineHeight: 24,
  },
  submitterInput: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textPrimary,
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
  imageHelperText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textPrimary,
    textAlign: 'center',
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
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#237ECD',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textInverse,
  },
});
