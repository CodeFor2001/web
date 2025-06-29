import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Plus, X, CreditCard as Edit, Trash2, BookOpen, Shield, Droplets, Snowflake, Flame, Users, Save, Image, Type, SquareCheck as CheckSquare, Camera } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/Colors';

interface HACCPTask {
  id: string;
  title: string;
  type: 'checkbox' | 'text' | 'textbox' | 'image';
  completed: boolean;
  completedBy?: string;
  completedAt?: Date;
}

interface HACCPSectionData {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  tasks: HACCPTask[];
}

const initialSections: HACCPSectionData[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    description: 'HACCP principles and food safety fundamentals',
    icon: BookOpen,
    color: Colors.info,
    tasks: [
      { id: 'intro-1', title: 'Review HACCP principles', type: 'checkbox', completed: false },
      { id: 'intro-2', title: 'Identify food safety team', type: 'text', completed: false },
      { id: 'intro-3', title: 'Document food safety policy', type: 'textbox', completed: false },
    ]
  },
  {
    id: 'cross-contamination',
    title: 'Cross Contamination',
    description: 'Prevention of cross-contamination between raw and cooked foods',
    icon: Shield,
    color: Colors.error,
    tasks: [
      { id: 'cross-1', title: 'Separate raw and cooked food storage', type: 'checkbox', completed: false },
      { id: 'cross-2', title: 'Implement color-coded cutting boards', type: 'image', completed: false },
      { id: 'cross-3', title: 'Train staff on contamination prevention', type: 'textbox', completed: false },
    ]
  },
  {
    id: 'cleaning',
    title: 'Cleaning',
    description: 'Cleaning and sanitization procedures',
    icon: Droplets,
    color: Colors.info,
    tasks: [
      { id: 'clean-1', title: 'Develop cleaning schedules', type: 'textbox', completed: false },
      { id: 'clean-2', title: 'Verify sanitizer concentrations', type: 'text', completed: false },
      { id: 'clean-3', title: 'Document cleaning procedures', type: 'checkbox', completed: false },
    ]
  },
  {
    id: 'chilling',
    title: 'Chilling',
    description: 'Temperature control and cold chain management',
    icon: Snowflake,
    color: '#00B4D8',
    tasks: [
      { id: 'chill-1', title: 'Monitor refrigeration temperatures', type: 'text', completed: false },
      { id: 'chill-2', title: 'Calibrate temperature sensors', type: 'checkbox', completed: false },
      { id: 'chill-3', title: 'Implement cold chain procedures', type: 'textbox', completed: false },
    ]
  },
  {
    id: 'cooking',
    title: 'Cooking',
    description: 'Proper cooking temperatures and procedures',
    icon: Flame,
    color: '#FF6B35',
    tasks: [
      { id: 'cook-1', title: 'Establish cooking temperature standards', type: 'text', completed: false },
      { id: 'cook-2', title: 'Train staff on proper cooking methods', type: 'textbox', completed: false },
      { id: 'cook-3', title: 'Implement temperature monitoring', type: 'checkbox', completed: false },
    ]
  },
  {
    id: 'management',
    title: 'Management',
    description: 'Management systems and record keeping',
    icon: Users,
    color: Colors.success,
    tasks: [
      { id: 'mgmt-1', title: 'Establish management review process', type: 'textbox', completed: false },
      { id: 'mgmt-2', title: 'Implement record keeping system', type: 'checkbox', completed: false },
      { id: 'mgmt-3', title: 'Schedule regular audits', type: 'text', completed: false },
    ]
  },
];

export default function HACCPManager() {
  const { t } = useTranslation();
  const [sections, setSections] = useState<HACCPSectionData[]>(initialSections);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingSection, setEditingSection] = useState<HACCPSectionData | null>(null);
  const [editingTask, setEditingTask] = useState<{ sectionId: string; task: HACCPTask | null }>({ sectionId: '', task: null });
  const [newSection, setNewSection] = useState({
    title: '',
    description: '',
    icon: 'BookOpen',
    color: Colors.info,
  });
  const [newTask, setNewTask] = useState({
    title: '',
    type: 'checkbox' as const,
  });

  const iconOptions = [
    { name: 'BookOpen', icon: BookOpen, color: Colors.info },
    { name: 'Shield', icon: Shield, color: Colors.error },
    { name: 'Droplets', icon: Droplets, color: Colors.info },
    { name: 'Snowflake', icon: Snowflake, color: '#00B4D8' },
    { name: 'Flame', icon: Flame, color: '#FF6B35' },
    { name: 'Users', icon: Users, color: Colors.success },
  ];

  const taskTypes = [
    { key: 'checkbox', label: 'Checkbox', icon: CheckSquare },
    { key: 'text', label: 'Text Input', icon: Type },
    { key: 'textbox', label: 'Text Area', icon: Type },
    { key: 'image', label: 'Image Upload', icon: Camera },
  ];

  const handleAddSection = () => {
    if (!newSection.title.trim()) {
      Alert.alert('Error', 'Please enter a section title');
      return;
    }

    const selectedIcon = iconOptions.find(opt => opt.name === newSection.icon);
    const section: HACCPSectionData = {
      id: Date.now().toString(),
      title: newSection.title,
      description: newSection.description,
      icon: selectedIcon?.icon || BookOpen,
      color: selectedIcon?.color || Colors.info,
      tasks: [],
    };

    setSections([...sections, section]);
    setNewSection({ title: '', description: '', icon: 'BookOpen', color: Colors.info });
    setShowSectionModal(false);
    Alert.alert('Success', 'Section added successfully');
  };

  const handleEditSection = (section: HACCPSectionData) => {
    setEditingSection(section);
    setNewSection({
      title: section.title,
      description: section.description,
      icon: iconOptions.find(opt => opt.icon === section.icon)?.name || 'BookOpen',
      color: section.color,
    });
    setShowSectionModal(true);
  };

  const handleUpdateSection = () => {
    if (!editingSection) return;

    const selectedIcon = iconOptions.find(opt => opt.name === newSection.icon);
    setSections(sections.map(s => 
      s.id === editingSection.id 
        ? { 
            ...s, 
            title: newSection.title,
            description: newSection.description,
            icon: selectedIcon?.icon || BookOpen,
            color: selectedIcon?.color || Colors.info,
          }
        : s
    ));

    setEditingSection(null);
    setNewSection({ title: '', description: '', icon: 'BookOpen', color: Colors.info });
    setShowSectionModal(false);
    Alert.alert('Success', 'Section updated successfully');
  };

  const handleDeleteSection = (sectionId: string) => {
    Alert.alert(
      'Delete Section',
      'Are you sure you want to delete this section and all its tasks?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSections(sections.filter(s => s.id !== sectionId));
            Alert.alert('Success', 'Section deleted successfully');
          },
        },
      ]
    );
  };

  const handleAddTask = (sectionId: string) => {
    setEditingTask({ sectionId, task: null });
    setNewTask({ title: '', type: 'checkbox' });
    setShowTaskModal(true);
  };

  const handleEditTask = (sectionId: string, task: HACCPTask) => {
    setEditingTask({ sectionId, task });
    setNewTask({ title: task.title, type: task.type });
    setShowTaskModal(true);
  };

  const handleSaveTask = () => {
    if (!newTask.title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    if (editingTask.task) {
      // Update existing task
      setSections(sections.map(section => 
        section.id === editingTask.sectionId
          ? {
              ...section,
              tasks: section.tasks.map(task => 
                task.id === editingTask.task!.id
                  ? { ...task, title: newTask.title, type: newTask.type }
                  : task
              )
            }
          : section
      ));
    } else {
      // Add new task
      const task: HACCPTask = {
        id: Date.now().toString(),
        title: newTask.title,
        type: newTask.type,
        completed: false,
      };

      setSections(sections.map(section => 
        section.id === editingTask.sectionId
          ? { ...section, tasks: [...section.tasks, task] }
          : section
      ));
    }

    setEditingTask({ sectionId: '', task: null });
    setNewTask({ title: '', type: 'checkbox' });
    setShowTaskModal(false);
    Alert.alert('Success', `Task ${editingTask.task ? 'updated' : 'added'} successfully`);
  };

  const handleDeleteTask = (sectionId: string, taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSections(sections.map(section => 
              section.id === sectionId
                ? { ...section, tasks: section.tasks.filter(task => task.id !== taskId) }
                : section
            ));
            Alert.alert('Success', 'Task deleted successfully');
          },
        },
      ]
    );
  };

  const getTaskTypeIcon = (type: string) => {
    const taskType = taskTypes.find(t => t.key === type);
    return taskType?.icon || CheckSquare;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>HACCP Manager</Text>
          <Text style={styles.subtitle}>Manage HACCP sections and tasks</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowSectionModal(true)}
        >
          <Plus size={20} color={Colors.textInverse} />
          <Text style={styles.addButtonText}>Add Section</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionsContainer}>
          <Text style={styles.sectionsTitle}>HACCP Sections ({sections.length})</Text>
          
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <View key={section.id} style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionInfo}>
                    <View style={styles.sectionTitleRow}>
                      <View style={[styles.sectionIconContainer, { backgroundColor: section.color + '20' }]}>
                        <Icon size={24} color={section.color} />
                      </View>
                      <View style={styles.sectionDetails}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <Text style={styles.sectionDescription}>{section.description}</Text>
                        <Text style={styles.taskCount}>{section.tasks.length} tasks</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.sectionActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditSection(section)}
                    >
                      <Edit size={16} color={Colors.info} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteSection(section.id)}
                    >
                      <Trash2 size={16} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.tasksContainer}>
                  <View style={styles.tasksHeader}>
                    <Text style={styles.tasksTitle}>Tasks</Text>
                    <TouchableOpacity
                      style={styles.addTaskButton}
                      onPress={() => handleAddTask(section.id)}
                    >
                      <Plus size={16} color={Colors.info} />
                      <Text style={styles.addTaskText}>Add Task</Text>
                    </TouchableOpacity>
                  </View>

                  {section.tasks.map(task => {
                    const TaskIcon = getTaskTypeIcon(task.type);
                    return (
                      <View key={task.id} style={styles.taskItem}>
                        <View style={styles.taskHeader}>
                          <View style={styles.taskInfo}>
                            <View style={styles.taskTypeIndicator}>
                              <TaskIcon size={16} color={Colors.textSecondary} />
                            </View>
                            <Text style={styles.taskTitle}>{task.title}</Text>
                            <View style={styles.taskTypeBadge}>
                              <Text style={styles.taskTypeText}>{task.type}</Text>
                            </View>
                          </View>
                          <View style={styles.taskActions}>
                            <TouchableOpacity
                              style={styles.taskActionButton}
                              onPress={() => handleEditTask(section.id, task)}
                            >
                              <Edit size={14} color={Colors.info} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.taskActionButton}
                              onPress={() => handleDeleteTask(section.id, task.id)}
                            >
                              <Trash2 size={14} color={Colors.error} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })}

                  {section.tasks.length === 0 && (
                    <View style={styles.emptyTasks}>
                      <Text style={styles.emptyTasksText}>No tasks added yet</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Section Modal */}
      <Modal visible={showSectionModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingSection ? 'Edit Section' : 'Add New Section'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowSectionModal(false);
                setEditingSection(null);
                setNewSection({ title: '', description: '', icon: 'BookOpen', color: Colors.info });
              }}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Section Title *</Text>
                <TextInput
                  style={styles.input}
                  value={newSection.title}
                  onChangeText={(text) => setNewSection(prev => ({ ...prev, title: text }))}
                  placeholder="Enter section title"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newSection.description}
                  onChangeText={(text) => setNewSection(prev => ({ ...prev, description: text }))}
                  placeholder="Enter section description"
                  placeholderTextColor={Colors.textTertiary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Icon & Color</Text>
                <View style={styles.iconGrid}>
                  {iconOptions.map(option => {
                    const IconComponent = option.icon;
                    return (
                      <TouchableOpacity
                        key={option.name}
                        style={[
                          styles.iconOption,
                          newSection.icon === option.name && styles.selectedIconOption,
                          { borderColor: option.color }
                        ]}
                        onPress={() => setNewSection(prev => ({ ...prev, icon: option.name, color: option.color }))}
                      >
                        <IconComponent size={24} color={option.color} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowSectionModal(false);
                  setEditingSection(null);
                  setNewSection({ title: '', description: '', icon: 'BookOpen', color: Colors.info });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={editingSection ? handleUpdateSection : handleAddSection}
              >
                <Save size={16} color={Colors.textInverse} />
                <Text style={styles.saveButtonText}>
                  {editingSection ? 'Update' : 'Add'} Section
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Task Modal */}
      <Modal visible={showTaskModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingTask.task ? 'Edit Task' : 'Add New Task'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowTaskModal(false);
                setEditingTask({ sectionId: '', task: null });
                setNewTask({ title: '', type: 'checkbox' });
              }}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Task Title *</Text>
                <TextInput
                  style={styles.input}
                  value={newTask.title}
                  onChangeText={(text) => setNewTask(prev => ({ ...prev, title: text }))}
                  placeholder="Enter task title"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Task Type</Text>
                <View style={styles.taskTypeGrid}>
                  {taskTypes.map(type => {
                    const TypeIcon = type.icon;
                    return (
                      <TouchableOpacity
                        key={type.key}
                        style={[
                          styles.taskTypeOption,
                          newTask.type === type.key && styles.selectedTaskTypeOption
                        ]}
                        onPress={() => setNewTask(prev => ({ ...prev, type: type.key as any }))}
                      >
                        <TypeIcon size={20} color={newTask.type === type.key ? Colors.info : Colors.textSecondary} />
                        <Text style={[
                          styles.taskTypeLabel,
                          newTask.type === type.key && styles.selectedTaskTypeLabel
                        ]}>
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowTaskModal(false);
                  setEditingTask({ sectionId: '', task: null });
                  setNewTask({ title: '', type: 'checkbox' });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveTask}
              >
                <Save size={16} color={Colors.textInverse} />
                <Text style={styles.saveButtonText}>
                  {editingTask.task ? 'Update' : 'Add'} Task
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
    backgroundColor: Colors.info,
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
  content: {
    flex: 1,
  },
  sectionsContainer: {
    padding: 32,
  },
  sectionsTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 24,
  },
  sectionCard: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  sectionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionDetails: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  taskCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textTertiary,
  },
  sectionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: Colors.backgroundSecondary,
  },
  tasksContainer: {
    padding: 24,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tasksTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.info + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  addTaskText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.info,
  },
  taskItem: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  taskTypeIndicator: {
    width: 32,
    height: 32,
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textPrimary,
    flex: 1,
  },
  taskTypeBadge: {
    backgroundColor: Colors.backgroundPrimary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskTypeText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 4,
  },
  taskActionButton: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: Colors.backgroundPrimary,
  },
  emptyTasks: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyTasksText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textTertiary,
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
    color: Colors.textPrimary,
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
    color: Colors.textPrimary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  selectedIconOption: {
    backgroundColor: Colors.backgroundPrimary,
    borderWidth: 3,
  },
  taskTypeGrid: {
    gap: 12,
  },
  taskTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
    gap: 12,
  },
  selectedTaskTypeOption: {
    backgroundColor: Colors.info + '20',
    borderColor: Colors.info,
  },
  taskTypeLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  selectedTaskTypeLabel: {
    color: Colors.info,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 12,
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
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.info,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textInverse,
  },
});