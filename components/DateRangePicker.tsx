import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface DateRangePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (startDate: Date, endDate: Date) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

export default function DateRangePicker({ 
  visible, 
  onClose, 
  onSelect, 
  initialStartDate, 
  initialEndDate 
}: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate || null);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate || null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateInRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const isDateSelected = (date: Date) => {
    if (!date) return false;
    return (startDate && date.toDateString() === startDate.toDateString()) ||
           (endDate && date.toDateString() === endDate.toDateString());
  };

  const handleDateSelect = (date: Date) => {
    if (selectingStart) {
      setStartDate(date);
      setEndDate(null);
      setSelectingStart(false);
    } else {
      if (date < startDate!) {
        setStartDate(date);
        setEndDate(startDate);
      } else {
        setEndDate(date);
      }
    }
  };

  const handleConfirm = () => {
    if (startDate && endDate) {
      onSelect(startDate, endDate);
      onClose();
    }
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectingStart(true);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Date Range</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.selectionInfo}>
            <View style={styles.dateSelection}>
              <Text style={styles.selectionLabel}>Start Date:</Text>
              <Text style={[styles.selectionDate, selectingStart && styles.activeSelection]}>
                {startDate ? startDate.toLocaleDateString() : 'Select start date'}
              </Text>
            </View>
            <View style={styles.dateSelection}>
              <Text style={styles.selectionLabel}>End Date:</Text>
              <Text style={[styles.selectionDate, !selectingStart && styles.activeSelection]}>
                {endDate ? endDate.toLocaleDateString() : 'Select end date'}
              </Text>
            </View>
          </View>

          <View style={styles.calendar}>
            <View style={styles.monthHeader}>
              <TouchableOpacity onPress={() => navigateMonth('prev')}>
                <ChevronLeft size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </Text>
              <TouchableOpacity onPress={() => navigateMonth('next')}>
                <ChevronRight size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.dayHeaders}>
              {dayNames.map(day => (
                <Text key={day} style={styles.dayHeader}>{day}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {getDaysInMonth(currentMonth).map((date, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    !date && styles.emptyDay,
                    date && isDateSelected(date) && styles.selectedDay,
                    date && isDateInRange(date) && !isDateSelected(date) && styles.rangeDay,
                  ]}
                  onPress={() => date && handleDateSelect(date)}
                  disabled={!date}
                >
                  {date && (
                    <Text style={[
                      styles.dayText,
                      isDateSelected(date) && styles.selectedDayText,
                      isDateInRange(date) && !isDateSelected(date) && styles.rangeDayText,
                    ]}>
                      {date.getDate()}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.confirmButton, (!startDate || !endDate) && styles.disabledButton]} 
              onPress={handleConfirm}
              disabled={!startDate || !endDate}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
  },
  selectionInfo: {
    padding: 20,
    backgroundColor: Colors.backgroundSecondary,
  },
  dateSelection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  selectionDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textPrimary,
  },
  activeSelection: {
    color: Colors.info,
    fontFamily: 'Inter-SemiBold',
  },
  calendar: {
    padding: 20,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
    paddingVertical: 8,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  emptyDay: {
    backgroundColor: 'transparent',
  },
  selectedDay: {
    backgroundColor: Colors.info,
  },
  rangeDay: {
    backgroundColor: Colors.info + '20',
  },
  dayText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textPrimary,
  },
  selectedDayText: {
    color: Colors.textInverse,
    fontFamily: 'Inter-SemiBold',
  },
  rangeDayText: {
    color: Colors.info,
    fontFamily: 'Inter-Medium',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.info,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.textTertiary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textInverse,
  },
});