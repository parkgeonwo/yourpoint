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

interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  currentTime: string;
  onSelect: (time: string) => void;
  title: string;
}

export default function TimePickerModal({
  visible,
  onClose,
  currentTime,
  onSelect,
  title,
}: TimePickerModalProps) {
  const [initialHour, initialMinute] = currentTime.split(':').map(Number);
  
  // Convert 24-hour to 12-hour format
  const convert24To12 = (hour24: number) => {
    if (hour24 === 0) return { hour: 12, period: 'AM' };
    if (hour24 < 12) return { hour: hour24, period: 'AM' };
    if (hour24 === 12) return { hour: 12, period: 'PM' };
    return { hour: hour24 - 12, period: 'PM' };
  };
  
  const { hour: initialHour12, period: initialPeriod } = convert24To12(initialHour);
  
  const [selectedHour, setSelectedHour] = useState(initialHour12);
  const [selectedMinute, setSelectedMinute] = useState(initialMinute);
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);
  const periodScrollRef = useRef<ScrollView>(null);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods = ['AM', 'PM'];

  useEffect(() => {
    if (visible && !isInitialized) {
      const { hour: hour12, period } = convert24To12(initialHour);
      setSelectedHour(hour12);
      setSelectedMinute(initialMinute);
      setSelectedPeriod(period);
      
      setTimeout(() => {
        hourScrollRef.current?.scrollTo({
          y: (hour12 - 1) * ITEM_HEIGHT,
          animated: false,
        });

        minuteScrollRef.current?.scrollTo({
          y: initialMinute * ITEM_HEIGHT,
          animated: false,
        });

        periodScrollRef.current?.scrollTo({
          y: (period === 'AM' ? 0 : 1) * ITEM_HEIGHT,
          animated: false,
        });
        
        setIsInitialized(true);
      }, 200);
    }
    
    if (!visible) {
      setIsInitialized(false);
    }
  }, [visible, initialHour, initialMinute]);

  const handleHourScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, hours.length - 1));
    setSelectedHour(hours[clampedIndex]);
  };

  const handlePeriodScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, periods.length - 1));
    setSelectedPeriod(periods[clampedIndex]);
  };

  const handleMinuteScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, minutes.length - 1));
    setSelectedMinute(minutes[clampedIndex]);
  };

  const handleConfirm = () => {
    // Convert 12-hour to 24-hour format
    let hour24 = selectedHour;
    if (selectedPeriod === 'AM' && selectedHour === 12) {
      hour24 = 0;
    } else if (selectedPeriod === 'PM' && selectedHour !== 12) {
      hour24 = selectedHour + 12;
    }
    
    const formattedTime = `${hour24.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onSelect(formattedTime);
    onClose();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={styles.modal}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={handleConfirm}>
            <Text style={styles.confirmText}>확인</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerColumn}>
              <Text style={styles.columnLabel}>시</Text>
              <ScrollView 
                ref={hourScrollRef}
                showsVerticalScrollIndicator={false}
                style={styles.pickerScroll}
                contentContainerStyle={styles.pickerContent}
                onScroll={handleHourScroll}
                onMomentumScrollEnd={handleHourScroll}
                scrollEventThrottle={16}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
              >
                <View style={styles.spacer} />
                <View style={styles.spacer} />
                {hours.map(hour => (
                  <TouchableOpacity 
                    key={hour} 
                    style={styles.pickerItem}
                    onPress={() => {
                      hourScrollRef.current?.scrollTo({
                        y: (hour - 1) * ITEM_HEIGHT,
                        animated: true,
                      });
                      setSelectedHour(hour);
                    }}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      selectedHour === hour && styles.selectedPickerItemText,
                    ]}>
                      {hour.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.spacer} />
                <View style={styles.spacer} />
              </ScrollView>
            </View>

            <View style={styles.pickerColumn}>
              <Text style={styles.columnLabel}>분</Text>
              <ScrollView 
                ref={minuteScrollRef}
                showsVerticalScrollIndicator={false}
                style={styles.pickerScroll}
                contentContainerStyle={styles.pickerContent}
                onScroll={handleMinuteScroll}
                onMomentumScrollEnd={handleMinuteScroll}
                scrollEventThrottle={16}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
              >
                <View style={styles.spacer} />
                <View style={styles.spacer} />
                {minutes.map(minute => (
                  <TouchableOpacity 
                    key={minute} 
                    style={styles.pickerItem}
                    onPress={() => {
                      minuteScrollRef.current?.scrollTo({
                        y: minute * ITEM_HEIGHT,
                        animated: true,
                      });
                      setSelectedMinute(minute);
                    }}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      selectedMinute === minute && styles.selectedPickerItemText,
                    ]}>
                      {minute.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.spacer} />
                <View style={styles.spacer} />
              </ScrollView>
            </View>

            <View style={styles.pickerColumn}>
              <Text style={styles.columnLabel}>오전/오후</Text>
              <ScrollView 
                ref={periodScrollRef}
                showsVerticalScrollIndicator={false}
                style={styles.pickerScroll}
                contentContainerStyle={styles.pickerContent}
                onScroll={handlePeriodScroll}
                onMomentumScrollEnd={handlePeriodScroll}
                scrollEventThrottle={16}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
              >
                <View style={styles.spacer} />
                <View style={styles.spacer} />
                {periods.map(period => (
                  <TouchableOpacity 
                    key={period} 
                    style={styles.pickerItem}
                    onPress={() => {
                      const index = periods.findIndex(p => p === period);
                      periodScrollRef.current?.scrollTo({
                        y: index * ITEM_HEIGHT,
                        animated: true,
                      });
                      setSelectedPeriod(period);
                    }}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      selectedPeriod === period && styles.selectedPickerItemText,
                    ]}>
                      {period === 'AM' ? '오전' : '오후'}
                    </Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.spacer} />
                <View style={styles.spacer} />
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  container: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.borderRadius.xl,
    width: width - 40,
    height: 380,
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
  confirmText: {
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
    height: 200,
    marginTop: lightTheme.spacing.lg,
  },
  pickerColumn: {
    flex: 1,
  },
  columnLabel: {
    fontSize: lightTheme.typography.fontSize.sm,
    color: lightTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: lightTheme.spacing.sm,
    fontWeight: '600',
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
    fontSize: lightTheme.typography.fontSize.lg,
    color: lightTheme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: '400',
  },
  selectedPickerItemText: {
    color: lightTheme.colors.text,
    fontWeight: '700',
    fontSize: lightTheme.typography.fontSize.xl,
  },
});