import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import { lightTheme } from '../theme';

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 50;

interface MonthYearPickerProps {
  visible: boolean;
  onClose: () => void;
  currentDate: string;
  onSelect: (year: number, month: number) => void;
}

export default function MonthYearPicker({
  visible,
  onClose,
  currentDate,
  onSelect,
}: MonthYearPickerProps) {
  const currentYear = new Date().getFullYear();
  const initialYear = parseInt(currentDate.split('-')[0]);
  const initialMonth = parseInt(currentDate.split('-')[1]);
  
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const yearScrollRef = useRef<ScrollView>(null);
  const monthScrollRef = useRef<ScrollView>(null);

  const years = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    if (visible && !isInitialized) {
      setSelectedYear(initialYear);
      setSelectedMonth(initialMonth);
      
      setTimeout(() => {
        const yearIndex = years.findIndex(year => year === initialYear);
        const monthIndex = initialMonth - 1;
        
        if (yearIndex >= 0) {
          yearScrollRef.current?.scrollTo({
            y: yearIndex * ITEM_HEIGHT,
            animated: false,
          });
        }
        
        monthScrollRef.current?.scrollTo({
          y: monthIndex * ITEM_HEIGHT,
          animated: false,
        });
        
        setIsInitialized(true);
      }, 200);
    }
    
    if (!visible) {
      setIsInitialized(false);
    }
  }, [visible]);

  const handleYearScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, years.length - 1));
    setSelectedYear(years[clampedIndex]);
  };

  const handleMonthScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, months.length - 1));
    setSelectedMonth(months[clampedIndex]);
  };

  const handleSelect = () => {
    onSelect(selectedYear, selectedMonth);
    onClose();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modal}
    >
      <View style={styles.container}>
        <View style={styles.handle} />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.title}>날짜 선택</Text>
          <TouchableOpacity onPress={handleSelect}>
            <Text style={styles.selectText}>선택</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.pickerContainer}>
            <View style={styles.yearPicker}>
              <ScrollView 
                ref={yearScrollRef}
                showsVerticalScrollIndicator={false}
                style={styles.pickerScroll}
                contentContainerStyle={styles.pickerContent}
                onScroll={handleYearScroll}
                onMomentumScrollEnd={handleYearScroll}
                scrollEventThrottle={16}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
              >
                <View style={styles.spacer} />
                <View style={styles.spacer} />
                {years.map(year => (
                  <TouchableOpacity 
                    key={year} 
                    style={styles.pickerItem}
                    onPress={() => {
                      const index = years.findIndex(y => y === year);
                      yearScrollRef.current?.scrollTo({
                        y: index * ITEM_HEIGHT,
                        animated: true,
                      });
                      setSelectedYear(year);
                    }}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      selectedYear === year && styles.selectedPickerItemText,
                    ]}>
                      {year}년
                    </Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.spacer} />
                <View style={styles.spacer} />
              </ScrollView>
            </View>

            <View style={styles.monthPicker}>
              <ScrollView 
                ref={monthScrollRef}
                showsVerticalScrollIndicator={false}
                style={styles.pickerScroll}
                contentContainerStyle={styles.pickerContent}
                onScroll={handleMonthScroll}
                onMomentumScrollEnd={handleMonthScroll}
                scrollEventThrottle={16}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
              >
                <View style={styles.spacer} />
                <View style={styles.spacer} />
                {months.map(month => (
                  <TouchableOpacity 
                    key={month} 
                    style={styles.pickerItem}
                    onPress={() => {
                      const index = month - 1;
                      monthScrollRef.current?.scrollTo({
                        y: index * ITEM_HEIGHT,
                        animated: true,
                      });
                      setSelectedMonth(month);
                    }}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      selectedMonth === month && styles.selectedPickerItemText,
                    ]}>
                      {month}월
                    </Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.spacer} />
                <View style={styles.spacer} />
              </ScrollView>
            </View>
          </View>
          
          <View style={styles.selectionIndicator} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: lightTheme.colors.surface,
    borderTopLeftRadius: lightTheme.borderRadius.xl,
    borderTopRightRadius: lightTheme.borderRadius.xl,
    height: 400,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: lightTheme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: lightTheme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: lightTheme.spacing.lg,
    paddingVertical: lightTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.border,
  },
  title: {
    fontSize: lightTheme.typography.fontSize.lg,
    fontWeight: '600',
    color: lightTheme.colors.text,
  },
  cancelText: {
    fontSize: lightTheme.typography.fontSize.base,
    color: lightTheme.colors.textSecondary,
    fontWeight: '500',
  },
  selectText: {
    fontSize: lightTheme.typography.fontSize.base,
    color: lightTheme.colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: lightTheme.spacing.lg,
    position: 'relative',
  },
  pickerContainer: {
    flexDirection: 'row',
    height: 250,
    marginTop: lightTheme.spacing.lg,
  },
  yearPicker: {
    flex: 1,
  },
  monthPicker: {
    flex: 1,
  },
  pickerScroll: {
    flex: 1,
  },
  pickerContent: {
    paddingVertical: 0,
  },
  spacer: {
    height: ITEM_HEIGHT,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: lightTheme.typography.fontSize.xl,
    color: lightTheme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: '400',
  },
  selectedPickerItemText: {
    color: lightTheme.colors.text,
    fontWeight: '700',
    fontSize: lightTheme.typography.fontSize['2xl'],
  },
  selectionIndicator: {
    position: 'absolute',
    top: '50%',
    left: lightTheme.spacing.lg,
    right: lightTheme.spacing.lg,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: lightTheme.colors.border + '60',
    marginTop: -ITEM_HEIGHT / 2 + lightTheme.spacing.lg,
    pointerEvents: 'none',
  },
});