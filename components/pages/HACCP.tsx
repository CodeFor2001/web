import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { Plus, Shield, FileText, CircleCheck as CheckCircle, Clock, ArrowRight, BookOpen, Droplets, Snowflake, Flame, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { HACCPPlan } from '@/types';
import HACCPSection from '@/components/HACCPSection';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';

// Mock HACCP sections data
const haccpSections = [
  {
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
  {
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
  {
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
  {
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
  {
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
  {
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
];

export default function HACCP() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sections, setSections] = useState(haccpSections);

  const canEdit = user?.role === 'superadmin';

  const handleTaskToggle = (sectionId: string, taskId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId
        ? {
            ...section,
            tasks: section.tasks.map(task => 
              task.id === taskId
                ? { 
                    ...task, 
                    completed: !task.completed,
                    completedBy: !task.completed ? 'Current User' : undefined,
                    completedAt: !task.completed ? new Date() : undefined
                  }
                : task
            )
          }
        : section
    ));
  };

  const handleTaskAdd = (sectionId: string, title: string) => {
    if (!canEdit) return;

    const newTask = {
      id: Date.now().toString(),
      title,
      completed: false,
    };

    setSections(prev => prev.map(section => 
      section.id === sectionId
        ? { ...section, tasks: [...section.tasks, newTask] }
        : section
    ));
  };

  const handleTaskEdit = (sectionId: string, taskId: string, title: string) => {
    if (!canEdit) return;

    setSections(prev => prev.map(section => 
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

  const handleTaskDelete = (sectionId: string, taskId: string) => {
    if (!canEdit) return;

    setSections(prev => prev.map(section => 
      section.id === sectionId
        ? { ...section, tasks: section.tasks.filter(task => task.id !== taskId) }
        : section
    ));
  };

  // Calculate overall compliance
  const totalTasks = sections.reduce((sum, section) => sum + section.tasks.length, 0);
  const completedTasks = sections.reduce((sum, section) => 
    sum + section.tasks.filter(task => task.completed).length, 0
  );
  const overallCompliance = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('haccp.title')}</Text>
          <Text style={styles.subtitle}>{t('haccp.subtitle')}</Text>
        </View>
      </View>

      {/* Overall Compliance Section */}
      <View style={styles.complianceSection}>
        <LinearGradient
          colors={[Colors.gradientStart + '20', Colors.gradientEnd + '10']}
          style={styles.complianceCard}
        >
          <View style={styles.complianceHeader}>
            <Text style={styles.complianceTitle}>HACCP Compliance Overview</Text>
            <Text style={styles.compliancePercentage}>{Math.round(overallCompliance)}%</Text>
          </View>
          <View style={styles.complianceBar}>
            <View 
              style={[
                styles.complianceFill,
                { 
                  width: `${overallCompliance}%`,
                  backgroundColor: overallCompliance >= 80 ? Colors.success : 
                                 overallCompliance >= 60 ? Colors.warning : Colors.error
                }
              ]}
            />
          </View>
          <Text style={styles.complianceSubtitle}>
            {completedTasks} of {totalTasks} tasks completed across all sections
          </Text>
        </LinearGradient>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionsContainer}>
          <Text style={styles.sectionsTitle}>HACCP Sections</Text>
          {sections.map(section => (
            <HACCPSection
              key={section.id}
              section={section}
              onTaskToggle={handleTaskToggle}
              onTaskAdd={canEdit ? handleTaskAdd : undefined}
              onTaskEdit={canEdit ? handleTaskEdit : undefined}
              onTaskDelete={canEdit ? handleTaskDelete : undefined}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  complianceSection: {
    padding: 32,
    paddingBottom: 16,
  },
  complianceCard: {
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
  complianceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  complianceTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
  },
  compliancePercentage: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.textPrimary,
  },
  complianceBar: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  complianceFill: {
    height: '100%',
    borderRadius: 4,
  },
  complianceSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  scrollContainer: {
    flex: 1,
  },
  sectionsContainer: {
    padding: 32,
    paddingBottom: 16,
  },
  sectionsTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 24,
  },
});