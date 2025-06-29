import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Calendar, Download, Mail, FileText, ChartBar as BarChart3, TrendingUp, X, Eye } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import DateRangePicker from '@/components/DateRangePicker';
import { Colors } from '@/constants/Colors';

interface ReportData {
  id: string;
  title: string;
  type: 'temperature' | 'checklist' | 'incident' | 'haccp' | 'deliveries';
  dateRange: string;
  status: 'ready' | 'generating' | 'error';
  size: string;
  previewUrl?: string;
}

const mockReports: ReportData[] = [
  {
    id: '1',
    title: 'Weekly Temperature Log',
    type: 'temperature',
    dateRange: 'Dec 23-29, 2024',
    status: 'ready',
    size: '2.4 MB',
    previewUrl: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '2',
    title: 'Monthly Checklist Summary',
    type: 'checklist',
    dateRange: 'December 2024',
    status: 'ready',
    size: '1.8 MB',
    previewUrl: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '3',
    title: 'Delivery Compliance Report',
    type: 'deliveries',
    dateRange: 'Q4 2024',
    status: 'ready',
    size: '3.2 MB',
    previewUrl: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '4',
    title: 'Incident Report Analysis',
    type: 'incident',
    dateRange: 'Q4 2024',
    status: 'generating',
    size: '--'
  },
];

export default function Reports() {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateRange, setDateRange] = useState('7days');
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [previewReport, setPreviewReport] = useState<ReportData | null>(null);

  const reportTypes = [
    { key: 'all', label: t('reports.allReports'), icon: FileText },
    { key: 'temperature', label: t('reports.temperature'), icon: TrendingUp },
    { key: 'checklist', label: t('reports.checklists'), icon: FileText },
    { key: 'incident', label: t('reports.incidents'), icon: FileText },
    { key: 'deliveries', label: t('reports.deliveries'), icon: FileText },
    { key: 'haccp', label: t('reports.haccp'), icon: FileText },
  ];

  const dateRanges = [
    { key: '7days', label: t('reports.last7Days') },
    { key: '30days', label: t('reports.last30Days') },
    { key: '90days', label: t('reports.last90Days') },
    { key: 'custom', label: t('reports.customRange') },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return Colors.success;
      case 'generating': return Colors.warning;
      case 'error': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'temperature': return TrendingUp;
      case 'checklist': return FileText;
      case 'incident': return FileText;
      case 'deliveries': return FileText;
      case 'haccp': return FileText;
      default: return FileText;
    }
  };

  const handleDateRangeSelect = (key: string) => {
    if (key === 'custom') {
      setShowDatePicker(true);
    } else {
      setDateRange(key);
      setCustomDateRange(null);
    }
  };

  const handleCustomDateSelect = (startDate: Date, endDate: Date) => {
    setCustomDateRange({ start: startDate, end: endDate });
    setDateRange('custom');
  };

  const getDateRangeLabel = () => {
    if (dateRange === 'custom' && customDateRange) {
      return `${customDateRange.start.toLocaleDateString()} - ${customDateRange.end.toLocaleDateString()}`;
    }
    return dateRanges.find(range => range.key === dateRange)?.label || '';
  };

  const generateReport = () => {
    console.log('Generate report for:', selectedType, dateRange, customDateRange);
  };

  const downloadReport = (reportId: string) => {
    console.log('Download report:', reportId);
  };

  const emailReport = (reportId: string) => {
    console.log('Email report:', reportId);
  };

  const previewReportHandler = (report: ReportData) => {
    if (report.status === 'ready') {
      setPreviewReport(report);
    }
  };

  const filteredReports = selectedType === 'all' 
    ? mockReports 
    : mockReports.filter(r => r.type === selectedType);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('reports.title')}</Text>
          <Text style={styles.subtitle}>{t('reports.subtitle')}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.generateSection}>
          <Text style={styles.sectionTitle}>{t('reports.generateNewReport')}</Text>
          
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>{t('reports.reportType')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {reportTypes.map(type => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.filterChip,
                    selectedType === type.key && styles.activeFilterChip
                  ]}
                  onPress={() => setSelectedType(type.key)}
                >
                  <type.icon size={16} color={selectedType === type.key ? Colors.textInverse : Colors.textSecondary} />
                  <Text style={[
                    styles.filterChipText,
                    selectedType === type.key && styles.activeFilterChipText
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            
            </ScrollView>
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>{t('reports.dateRange')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {dateRanges.map(range => (
                <TouchableOpacity
                  key={range.key}
                  style={[
                    styles.filterChip,
                    dateRange === range.key && styles.activeFilterChip
                  ]}
                  onPress={() => handleDateRangeSelect(range.key)}
                >
                  {range.key === 'custom' && <Calendar size={16} color={dateRange === range.key ? Colors.textInverse : Colors.textSecondary} />}
                  <Text style={[
                    styles.filterChipText,
                    dateRange === range.key && styles.activeFilterChipText
                  ]}>
                    {range.key === 'custom' && customDateRange ? getDateRangeLabel() : range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.generateButton} onPress={generateReport}>
            <BarChart3 size={20} color={Colors.textInverse} />
            <Text style={styles.generateButtonText}>{t('reports.generateReport')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('reports.recentReports')}</Text>
          
          <View style={styles.reportsList}>
            {filteredReports.map((report) => {
              const Icon = getTypeIcon(report.type);
              return (
                <View key={report.id} style={styles.reportCard}>
                  <View style={styles.reportHeader}>
                    <View style={styles.reportIcon}>
                      <Icon size={24} color={Colors.info} />
                    </View>
                    <View style={styles.reportInfo}>
                      <Text style={styles.reportTitle}>{report.title}</Text>
                      <Text style={styles.reportSubtitle}>{report.dateRange}</Text>
                      <View style={styles.reportMeta}>
                        <View style={[
                          styles.statusDot,
                          { backgroundColor: getStatusColor(report.status) }
                        ]} />
                        <Text style={styles.statusText}>
                          {t(`reports.${report.status}`)}
                        </Text>
                        <Text style={styles.sizeText}> • {report.size}</Text>
                      </View>
                    </View>
                  </View>

                  {report.status === 'ready' && (
                    <View style={styles.reportActions}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => previewReportHandler(report)}
                      >
                        <Eye size={16} color={Colors.info} />
                        <Text style={styles.actionButtonText}>{t('reports.preview')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => downloadReport(report.id)}
                      >
                        <Download size={16} color={Colors.info} />
                        <Text style={styles.actionButtonText}>{t('reports.download')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => emailReport(report.id)}
                      >
                        <Mail size={16} color={Colors.info} />
                        <Text style={styles.actionButtonText}>{t('reports.email')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {report.status === 'generating' && (
                    <View style={styles.generatingIndicator}>
                      <Text style={styles.generatingText}>{t('reports.generatingReport')}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {filteredReports.length === 0 && (
            <View style={styles.emptyState}>
              <FileText size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>{t('reports.noReportsFound')}</Text>
              <Text style={styles.emptySubtitle}>
                {t('reports.generateFirstReport')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>{t('reports.reportStatistics')}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>{t('reports.reportsGenerated')}</Text>
              <Text style={styles.statPeriod}>{t('reports.thisMonth')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>156</Text>
              <Text style={styles.statLabel}>{t('reports.totalDownloads')}</Text>
              <Text style={styles.statPeriod}>{t('reports.allTime')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Date Range Picker */}
      <DateRangePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={handleCustomDateSelect}
        initialStartDate={customDateRange?.start}
        initialEndDate={customDateRange?.end}
      />

      {/* Report Preview Modal */}
      <Modal visible={!!previewReport} animationType="slide" transparent>
        <View style={styles.previewOverlay}>
          <View style={styles.previewContent}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>
                {previewReport?.title}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setPreviewReport(null)}
              >
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.previewBody} showsVerticalScrollIndicator={false}>
              {previewReport?.previewUrl && (
                <View style={styles.previewImageContainer}>
                  <Text style={styles.previewLabel}>Report Preview:</Text>
                  <View style={styles.reportPreview}>
                    <View style={styles.reportHeader}>
                      <Text style={styles.reportHeaderTitle}>📊 {previewReport.title}</Text>
                      <Text style={styles.reportHeaderSubtitle}>Generated on {new Date().toLocaleDateString()}</Text>
                    </View>
                    
                    <View style={styles.reportSection}>
                      <Text style={styles.reportSectionTitle}>Executive Summary</Text>
                      <Text style={styles.reportText}>
                        This report provides a comprehensive analysis of {previewReport.type} data for the period {previewReport.dateRange}.
                      </Text>
                    </View>

                    <View style={styles.reportSection}>
                      <Text style={styles.reportSectionTitle}>Key Metrics</Text>
                      <View style={styles.metricsGrid}>
                        <View style={styles.metricCard}>
                          <Text style={styles.metricValue}>98.5%</Text>
                          <Text style={styles.metricLabel}>Compliance Rate</Text>
                        </View>
                        <View style={styles.metricCard}>
                          <Text style={styles.metricValue}>24</Text>
                          <Text style={styles.metricLabel}>Total Records</Text>
                        </View>
                        <View style={styles.metricCard}>
                          <Text style={styles.metricValue}>2</Text>
                          <Text style={styles.metricLabel}>Issues Found</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.chartPlaceholder}>
                      <Text style={styles.chartText}>📈 Data Visualization</Text>
                      <Text style={styles.chartSubtext}>Interactive charts and graphs showing trends and patterns</Text>
                    </View>

                    <View style={styles.reportSection}>
                      <Text style={styles.reportSectionTitle}>Recommendations</Text>
                      <Text style={styles.reportText}>
                        • Continue current monitoring procedures{'\n'}
                        • Address identified temperature deviations{'\n'}
                        • Schedule additional staff training{'\n'}
                        • Review equipment calibration schedule
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.previewActions}>
              <TouchableOpacity 
                style={styles.previewActionButton}
                onPress={() => downloadReport(previewReport?.id || '')}
              >
                <Download size={20} color={Colors.textInverse} />
                <Text style={styles.previewActionText}>{t('reports.download')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.previewActionButton, styles.secondaryActionButton]}
                onPress={() => emailReport(previewReport?.id || '')}
              >
                <Mail size={20} color={Colors.info} />
                <Text style={[styles.previewActionText, styles.secondaryActionText]}>{t('reports.email')}</Text>
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
  content: {
    flex: 1,
  },
  generateSection: {
    backgroundColor: Colors.backgroundPrimary,
    margin: 32,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  filterRow: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    gap: 8,
  },
  activeFilterChip: {
    backgroundColor: Colors.info,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  activeFilterChipText: {
    color: Colors.textInverse,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#237ECD',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  generateButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textInverse,
  },
  section: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  reportsList: {
    gap: 16,
  },
  reportCard: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reportIcon: {
    width: 48,
    height: 48,
    backgroundColor: Colors.info + '20',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  reportSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  sizeText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textTertiary,
  },
  reportActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.info + '20',
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.info,
  },
  generatingIndicator: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  generatingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.warning,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  statsSection: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  statPeriod: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textTertiary,
  },
  // Preview Modal Styles
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContent: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 16,
    width: '95%',
    maxWidth: 900,
    maxHeight: '90%',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  previewTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
  },
  previewBody: {
    flex: 1,
    padding: 24,
  },
  previewImageContainer: {
    flex: 1,
  },
  previewLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  reportPreview: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  reportHeaderTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  reportHeaderSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  reportSection: {
    marginBottom: 24,
  },
  reportSectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  reportText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  metricValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.info,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  chartPlaceholder: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 8,
    padding: 32,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  chartText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.info,
    marginBottom: 8,
  },
  chartSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  previewActions: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 12,
  },
  previewActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#237ECD',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  secondaryActionButton: {
    backgroundColor: Colors.info + '20',
  },
  previewActionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textInverse,
  },
  secondaryActionText: {
    color: Colors.info,
  },
});