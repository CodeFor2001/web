import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, TextInput } from 'react-native';
import { Globe, Bell, Users, Shield, ChevronRight, Mail, Smartphone } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  type: 'navigation' | 'toggle' | 'selector' | 'input';
  value?: boolean | string;
  options?: string[];
}

export default function Settings() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    alertEmail: 'admin@vigilix.tech',
    language: i18n.language,
  });

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [tempEmail, setTempEmail] = useState(settings.alertEmail);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' }
  ];

  const toggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const settingsSections = [
    {
      title: t('settings.general'),
      items: [
        {
          id: 'language',
          title: t('settings.language'),
          subtitle: languages.find(l => l.code === settings.language)?.name || 'English',
          icon: Globe,
          type: 'selector' as const,
          value: settings.language,
          options: languages.map(l => l.name),
        },
        {
          id: 'alertEmail',
          title: 'Alert Email',
          subtitle: settings.alertEmail,
          icon: Mail,
          type: 'input' as const,
          value: settings.alertEmail,
        },
      ],
    },
    {
      title: t('settings.notifications'),
      items: [
        {
          id: 'emailNotifications',
          title: t('settings.emailNotifications'),
          subtitle: t('settings.emailNotificationsDesc'),
          icon: Mail,
          type: 'toggle' as const,
          value: settings.emailNotifications,
        },
        {
          id: 'pushNotifications',
          title: t('settings.pushNotifications'),
          subtitle: t('settings.pushNotificationsDesc'),
          icon: Bell,
          type: 'toggle' as const,
          value: settings.pushNotifications,
        },
        {
          id: 'smsNotifications',
          title: t('settings.smsNotifications'),
          subtitle: t('settings.smsNotificationsDesc'),
          icon: Smartphone,
          type: 'toggle' as const,
          value: settings.smsNotifications,
        },
      ],
    },
    {
      title: t('settings.system'),
      items: [
        {
          id: 'userManagement',
          title: t('settings.userManagement'),
          subtitle: t('settings.userManagementDesc'),
          icon: Users,
          type: 'navigation' as const,
        },
        {
          id: 'security',
          title: t('settings.securityPrivacy'),
          subtitle: t('settings.securityPrivacyDesc'),
          icon: Shield,
          type: 'navigation' as const,
        },
      ],
    },
  ];

  const handleSettingPress = (item: SettingItem) => {
    if (item.type === 'toggle') {
      toggleSetting(item.id);
    } else if (item.type === 'selector' && item.id === 'language') {
      setShowLanguageModal(true);
    } else if (item.type === 'input' && item.id === 'alertEmail') {
      setTempEmail(settings.alertEmail);
      setShowEmailModal(true);
    } else if (item.type === 'navigation') {
      console.log('Navigate to:', item.id);
    }
  };

  const selectLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setSettings(prev => ({ ...prev, language: languageCode }));
    setShowLanguageModal(false);
  };

  const saveEmail = () => {
    setSettings(prev => ({ ...prev, alertEmail: tempEmail }));
    setShowEmailModal(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings.title')}</Text>
        <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingsSections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.settingItem,
                    index === section.items.length - 1 && styles.lastSettingItem
                  ]}
                  onPress={() => handleSettingPress(item)}
                  disabled={item.type === 'toggle'}
                >
                  <View style={styles.settingIcon}>
                    <item.icon size={20} color="#64748B" />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    {item.subtitle && (
                      <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                    )}
                  </View>
                  <View style={styles.settingAction}>
                    {item.type === 'toggle' ? (
                      <Switch
                        value={item.value as boolean}
                        onValueChange={() => handleSettingPress(item)}
                        trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
                        thumbColor={item.value ? '#FFFFFF' : '#FFFFFF'}
                      />
                    ) : (
                      <ChevronRight size={20} color="#94A3B8" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
          <View style={styles.aboutSection}>
            <Text style={styles.aboutTitle}>{t('settings.appName')}</Text>
            <Text style={styles.aboutVersion}>{t('settings.version')}</Text>
            <Text style={styles.aboutDescription}>
              {t('settings.appDescription')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal visible={showLanguageModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('settings.selectLanguage')}</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Text style={styles.cancelText}>{t('settings.cancel')}</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.languageList}>
              {languages.map(language => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageItem,
                    settings.language === language.code && styles.selectedLanguageItem
                  ]}
                  onPress={() => selectLanguage(language.code)}
                >
                  <Text style={[
                    styles.languageText,
                    settings.language === language.code && styles.selectedLanguageText
                  ]}>
                    {language.name}
                  </Text>
                  {settings.language === language.code && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Email Input Modal */}
      <Modal visible={showEmailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Alert Email</Text>
              <TouchableOpacity onPress={() => setShowEmailModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.emailInputContainer}>
              <Text style={styles.emailLabel}>Email Address</Text>
              <TextInput
                style={styles.emailInput}
                value={tempEmail}
                onChangeText={setTempEmail}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.emailHelperText}>
                This email will receive critical alerts and notifications
              </Text>
            </View>

            <View style={styles.emailActions}>
              <TouchableOpacity 
                style={styles.emailCancelButton}
                onPress={() => setShowEmailModal(false)}
              >
                <Text style={styles.emailCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.emailSaveButton}
                onPress={saveEmail}
              >
                <Text style={styles.emailSaveText}>Save</Text>
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
    paddingHorizontal: 32,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  settingIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  settingAction: {
    marginLeft: 12,
  },
  aboutSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 32,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  aboutTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 16,
  },
  aboutDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '80%',
    maxWidth: 400,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  cancelText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  languageList: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  selectedLanguageItem: {
    backgroundColor: '#EFF6FF',
  },
  languageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  selectedLanguageText: {
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
  checkmark: {
    width: 24,
    height: 24,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  emailInputContainer: {
    padding: 24,
  },
  emailLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 8,
  },
  emailInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    marginBottom: 8,
  },
  emailHelperText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 20,
  },
  emailActions: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  emailCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  emailCancelText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  emailSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  emailSaveText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});
