import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { BookOpen, Shield, Droplets, Snowflake, Flame, Users, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

// HACCP sections data
const haccpSections = [
  {
    id: 'introduction',
    title: 'Introduction',
    description: 'HACCP principles and food safety fundamentals',
    icon: BookOpen,
    color: Colors.info,
    taskCount: 3,
    completedTasks: 2,
  },
  {
    id: 'cross-contamination',
    title: 'Cross Contamination',
    description: 'Prevention of cross-contamination between raw and cooked foods',
    icon: Shield,
    color: Colors.error,
    taskCount: 3,
    completedTasks: 1,
  },
  {
    id: 'cleaning',
    title: 'Cleaning',
    description: 'Cleaning and sanitization procedures',
    icon: Droplets,
    color: Colors.info,
    taskCount: 3,
    completedTasks: 2,
  },
  {
    id: 'chilling',
    title: 'Chilling',
    description: 'Temperature control and cold chain management',
    icon: Snowflake,
    color: '#00B4D8',
    taskCount: 3,
    completedTasks: 1,
  },
  {
    id: 'cooking',
    title: 'Cooking',
    description: 'Proper cooking temperatures and procedures',
    icon: Flame,
    color: '#FF6B35',
    taskCount: 3,
    completedTasks: 2,
  },
  {
    id: 'management',
    title: 'Management',
    description: 'Management systems and record keeping',
    icon: Users,
    color: Colors.success,
    taskCount: 3,
    completedTasks: 0,
  },
];

export default function HACCP() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();

  // Calculate overall compliance
  const totalTasks = haccpSections.reduce((sum, section) => sum + section.taskCount, 0);
  const completedTasks = haccpSections.reduce((sum, section) => sum + section.completedTasks, 0);
  const overallCompliance = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleSectionPress = (sectionId: string) => {
    router.push(`/haccp-section/${sectionId}`);
  };

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
          <View style={styles.sectionsGrid}>
            {haccpSections.map(section => {
              const Icon = section.icon;
              const completionPercentage = section.taskCount > 0 ? (section.completedTasks / section.taskCount) * 100 : 0;
              
              return (
                <TouchableOpacity
                  key={section.id}
                  style={styles.sectionCard}
                  onPress={() => handleSectionPress(section.id)}
                >
                  <LinearGradient
                    colors={[section.color + '20', section.color + '10']}
                    style={styles.sectionGradient}
                  >
                    <View style={styles.sectionHeader}>
                      <View style={[styles.iconContainer, { backgroundColor: section.color + '20' }]}>
                        <Icon size={32} color={section.color} />
                      </View>
                      <View style={styles.progressIndicator}>
                        <Text style={[styles.progressText, { color: section.color }]}>
                          {Math.round(completionPercentage)}%
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.sectionContent}>
                      <Text style={styles.sectionTitle}>{section.title}</Text>
                      <Text style={styles.sectionDescription}>{section.description}</Text>
                      
                      <View style={styles.progressInfo}>
                        <Text style={styles.taskProgress}>
                          {section.completedTasks}/{section.taskCount} tasks completed
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
                    
                    <View style={styles.sectionFooter}>
                      <Text style={[styles.viewDetailsText, { color: section.color }]}>
                        View Details
                      </Text>
                      <ArrowRight size={16} color={section.color} />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
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
  sectionsGrid: {
    gap: 16,
  },
  sectionCard: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionGradient: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressIndicator: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  sectionContent: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  progressInfo: {
    gap: 8,
  },
  taskProgress: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  viewDetailsText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});
