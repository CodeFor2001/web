import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BookOpen, Shield, Droplets, Snowflake, Flame, Users, ChevronDown, ChevronUp, CircleCheck as CheckCircle, Circle, Plus, CreditCard as Edit3, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';

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

interface HACCPSectionProps {
  section: HACCPSectionData;
  onTaskToggle: (sectionId: string, taskId: string) => void;
  onTaskAdd?: (sectionId: string, title: string) => void;
  onTaskEdit?: (sectionId: string, taskId: string, title: string) => void;
  onTaskDelete?: (sectionId: string, taskId: string) => void;
}

export default function HACCPSection({ 
  section, 
  onTaskToggle, 
  onTaskAdd, 
  onTaskEdit, 
  onTaskDelete 
}: HACCPSectionProps) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  const canEdit = user?.role === 'superadmin';
  const completedTasks = section.tasks.filter(task => task.completed).length;
  const completionPercentage = section.tasks.length > 0 ? (completedTasks / section.tasks.length) * 100 : 0;

  const Icon = section.icon;

  const handleTaskAdd = () => {
    if (newTaskTitle.trim() && onTaskAdd) {
      onTaskAdd(section.id, newTaskTitle.trim());
      setNewTaskTitle('');
      setShowAddTask(false);
    }
  };

  const handleTaskEdit = (taskId: string, title: string) => {
    if (onTaskEdit) {
      onTaskEdit(section.id, taskId, title);
      setEditingTask(null);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <LinearGradient
          colors={[section.color + '20', section.color + '10']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconContainer, { backgroundColor: section.color + '20' }]}>
                <Icon size={24} color={section.color} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionDescription}>{section.description}</Text>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressText}>
                    {completedTasks}/{section.tasks.length} completed
                  </Text>
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
                </View>
              </View>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.completionBadge}>
                <Text style={[styles.completionText, { color: section.color }]}>
                  {Math.round(completionPercentage)}%
                </Text>
              </View>
              {expanded ? (
                <ChevronUp size={20} color={Colors.textSecondary} />
              ) : (
                <ChevronDown size={20} color={Colors.textSecondary} />
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          <ScrollView style={styles.tasksList} showsVerticalScrollIndicator={false}>
            {section.tasks.map(task => (
              <View key={task.id} style={styles.taskItem}>
                <TouchableOpacity
                  style={styles.taskToggle}
                  onPress={() => onTaskToggle(section.id, task.id)}
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
                      onPress={() => onTaskDelete?.(section.id, task.id)}
                    >
                      <Trash2 size={16} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}

            {canEdit && (
              <View style={styles.addTaskSection}>
                {showAddTask ? (
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
                        style={styles.addTaskButton}
                        onPress={handleTaskAdd}
                      >
                        <Text style={styles.addTaskButtonText}>Add</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelTaskButton}
                        onPress={() => {
                          setShowAddTask(false);
                          setNewTaskTitle('');
                        }}
                      >
                        <Text style={styles.cancelTaskButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addTaskTrigger}
                    onPress={() => setShowAddTask(true)}
                  >
                    <Plus size={16} color={section.color} />
                    <Text style={[styles.addTaskText, { color: section.color }]}>
                      Add Task
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  header: {
    borderRadius: 16,
  },
  headerGradient: {
    padding: 20,
    borderRadius: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
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
    marginBottom: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  headerRight: {
    alignItems: 'center',
    gap: 8,
  },
  completionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 12,
  },
  completionText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  content: {
    backgroundColor: Colors.backgroundPrimary,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  tasksList: {
    maxHeight: 300,
    padding: 20,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  taskToggle: {
    marginRight: 12,
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
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textPrimary,
  },
  addTaskSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  addTaskTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  addTaskText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  addTaskForm: {
    gap: 12,
  },
  addTaskInput: {
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textPrimary,
  },
  addTaskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  addTaskButton: {
    flex: 1,
    backgroundColor: Colors.success,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  addTaskButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textInverse,
  },
  cancelTaskButton: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelTaskButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
  },
});