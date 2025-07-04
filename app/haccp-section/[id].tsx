import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { ArrowLeft, BookOpen, Shield, Droplets, Snowflake, Flame, Users, CircleCheck as CheckCircle, Circle, Plus, CreditCard as Edit3, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';

interface HACCPTask {
  id: string;
  title: string;
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

const sectionsData: Record<string, HACCPSectionData> = {
  introduction: {
    id: 'introduction',
    title: 'Introduction',
    description: 'HACCP principles and food safety fundamentals',
    icon: BookOpen,
    color: Colors.info,
    tasks: [
      { id: 'intro-1', title: 'Review HACCP principles', completed: true, completedBy: 'John Smith', completedAt: new Date() },
      { id: 'intro-2', title: 'Identify food safety team', completed: true, completedBy: 'Sarah Johnson', completedAt: new Date() },
      { id: 'intro-3', title: 'Document food safety policy', completed: false },
    ]
  },
  'cross-contamination': {
    id: 'cross-contamination',
    title: 'Cross Contamination',
    description: 'Prevention of cross-contamination between raw and cooked foods',
    icon: Shield,
    color: Colors.error,
    tasks: [
      { id: 'cross-1', title: 'Separate raw and cooked food storage', completed: true, completedBy: 'Mike Chen', completedAt: new Date() },
      { id: 'cross-2', title: 'Implement color-coded cutting boards', completed: false },
      { id: 'cross-3', title: 'Train staff on contamination prevention', completed: false },
    ]
  },
  cleaning: {
    id: 'cleaning',
    title: 'Cleaning',
    description: 'Cleaning and sanitization procedures',
    icon: Droplets,
    color: Colors.info,
    tasks: [
      { id: 'clean-1', title: 'Develop cleaning schedules', completed: true, completedBy: 'Lisa Wong', completedAt: new Date() },
      { id: 'clean-2', title: 'Verify sanitizer concentrations', completed: true, completedBy: 'John Smith', completedAt: new Date() },
      { id: 'clean-3', title: 'Document cleaning procedures', completed: false },
    ]
  },
  chilling: {
    id: 'chilling',
    title: 'Chilling',
    description: 'Temperature control and cold chain management',
    icon: Snowflake,
    color: '#00B4D8',
    tasks: [
      { id: 'chill-1', title: 'Monitor refrigeration temperatures', completed: true, completedBy: 'Sarah Johnson', completedAt: new Date() },
      { id: 'chill-2', title: 'Calibrate temperature sensors', completed: false },
      { id: 'chill-3', title: 'Implement cold chain procedures', completed: false },
    ]
  },
  cooking: {
    id: 'cooking',
    title: 'Cooking',
    description: 'Proper cooking temperatures and procedures',
    icon: Flame,
    color: '#FF6B35',
    tasks: [
      { id: 'cook-1', title: 'Establish cooking temperature standards', completed: true, completedBy: 'Mike Chen', completedAt: new Date() },
      { id: 'cook-2', title: 'Train staff on proper cooking methods', completed: true, completedBy: 'Lisa Wong', completedAt: new Date() },
      { id: 'cook-3', title: 'Implement temperature monitoring', completed: false },
    ]
  },
  management: {
    id: 'management',
    title: 'Management',
    description: 'Management systems and record keeping',
    icon: Users,
    color: Colors.success,
    tasks: [
      { id: 'mgmt-1', title: 'Establish management review process', completed: false },
      { id: 'mgmt-2', title: 'Implement record keeping system', completed: false },
      { id: 'mgmt-3', title: 'Schedule regular audits', completed: false },
    ]
  },
};

export default function HACCPSectionDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [sectionData, setSectionData] = useState(sectionsData[id as string]);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  const canEdit = user?.role === 'superadmin';

  if (!sectionData) {
    return (
      <View style={styles.container}>
        <Text>Section not found</Text>
      </View>
    );
  }

  const Icon = sectionData.icon;
  const completedTasks = sectionData.tasks.filter(task => task.completed).length;
  const completionPercentage = sectionData.tasks.length > 0 ? (completedTasks / sectionData.tasks.length) * 100 : 0;

  const handleBack = () => {
    router.back();
  };

  const handleTaskToggle = (taskId: string) => {
    setSectionData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === taskId
          ? { 
              ...task, 
              completed: !task.completed,
              completedBy: !task.completed ? 'Current User' : undefined,
              completedAt: !task.completed ? new Date() : undefined
            }
          : task
      )
    }));
  };

  const handleTaskAdd = () => {
    if (!canEdit || !newTaskTitle.trim()) return;

    const newTask: HACCPTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      completed: false,
    };

    setSectionData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));

    setNewTaskTitle('');
    setShowAddTask(false);
  };

  const handleTaskEdit = (taskId: string, title: string) => {
    if (!canEdit) return;

    setSectionData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === taskId ? { ...task, title } : task
      )
    }));
    setEditingTask(null);
  };

  const handleTaskDelete = (taskId: string) => {
    if (!canEdit) return;

    setSectionData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId)
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={[styles.headerIcon, { backgroundColor: sectionData.color + '20' }]}>
            <Icon size={32} color={sectionData.color} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{sectionData.title}</Text>
            <Text style={styles.headerDescription}>{sectionData.description}</Text>
          </View>
        </View>
      </View>

      <View style={styles.progressSection}>
        <LinearGradient
          colors={[sectionData.color + '20', sectionData.color + '10']}
          style={styles.progressCard}
        >
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Section Progress</Text>
            <Text style={[styles.progressPercentage, { color: sectionData.color }]}>
              {Math.round(completionPercentage)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${completionPercentage}%`,
                  backgroundColor: completionPercentage >= 100 ? Colors.success : 
                                 completionPercentage >= 50 ? Colors.warning : Colors.error
                }
              ]}
            />
          </View>
          <Text style={styles.progressSubtitle}>
            {completedTasks} of {sectionData.tasks.length} tasks completed
          </Text>
        </LinearGradient>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tasksSection}>
          <View style={styles.tasksHeader}>
            <Text style={styles.tasksTitle}>Tasks</Text>
            {canEdit && (
              <TouchableOpacity
                style={styles.addTaskButton}
                onPress={() => setShowAddTask(true)}
              >
                <Plus size={16} color={sectionData.color} />
                <Text style={[styles.addTaskText, { color: sectionData.color }]}>
                  Add Task
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.tasksList}>
            {sectionData.tasks.map(task => (
              <View key={task.id} style={styles.taskItem}>
                <TouchableOpacity
                  style={styles.taskToggle}
                  onPress={() => handleTaskToggle(task.id)}
                >
                  {task.completed ? (
                    <CheckCircle size={20} color={Colors.success} />
                  ) : (
                    <Circle size={20} color={Colors.textSecondary} />
                  )}
                </TouchableOpacity>
                
                {editingTask === task.id ? (
                  <View style={styles.editTaskContainer}>
                    <TextInput
                      style={styles.editTaskInput}
                      value={task.title}
                      onChangeText={(text) => handleTaskEdit(task.id, text)}
                      onBlur={() => setEditingTask(null)}
                      autoFocus
                    />
                  </View>
                ) : (
                  <View style={styles.taskContent}>
                    <Text style={[
                      styles.taskTitle,
                      task.completed && styles.completedTask
                    ]}>
                      {task.title}
                    </Text>
                    {task.completed && task.completedBy && (
                      <Text style={styles.taskMeta}>
                        Completed by {task.completedBy} at {task.completedAt?.toLocaleTimeString()}
                      </Text>
                    )}
                  </View>
                )}

                {canEdit && (
                  <View style={styles.taskActions}>
                    <TouchableOpacity
                      style={styles.taskActionButton}
                      onPress={() => setEditingTask(task.id)}
                    >
                      <Edit3 size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.taskActionButton}
                      onPress={() => handleTaskDelete(task.id)}
                    >
                      <Trash2 size={16} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}

            {canEdit && showAddTask && (
              <View style={styles.addTaskForm}>
                <TextInput
                  style={styles.addTaskInput}
                  value={newTaskTitle}
                  onChangeText={setNewTaskTitle}
                  placeholder="Enter task title..."
                  autoFocus
                />
                <View style={styles.addTaskActions}>
                  <TouchableOpacity
                    style={styles.addTaskConfirmButton}
                    onPress={handleTaskAdd}
                  >
                    <Text style={styles.addTaskConfirmText}>Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addTaskCancelButton}
                    onPress={() => {
                      setShowAddTask(false);
                      setNewTaskTitle('');
                    }}
                  >
                    <Text style={styles.addTaskCancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  headerDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  progressSection: {
    padding: 32,
    paddingBottom: 16,
  },
  progressCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
  },
  progressPercentage: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  tasksSection: {
    padding: 32,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  tasksTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addTaskText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  tasksList: {
    gap: 16,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  taskToggle: {
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  taskMeta: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textTertiary,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  taskActionButton: {
    padding: 4,
  },
  editTaskContainer: {
    flex: 1,
  },
  editTaskInput: {
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textPrimary,
  },
  addTaskForm: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 12,
  },
  addTaskInput: {
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textPrimary,
  },
  addTaskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  addTaskConfirmButton: {
    flex: 1,
    backgroundColor: Colors.success,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  addTaskConfirmText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textInverse,
  },
  addTaskCancelButton: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  addTaskCancelText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
  },
});
