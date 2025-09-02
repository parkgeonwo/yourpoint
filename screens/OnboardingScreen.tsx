import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { lightTheme } from '../theme';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    emoji: '📅',
    title: '일정을 함께 관리하세요',
    description: '소중한 사람들과 스케줄을 공유하고\n함께 계획을 세워보세요',
  },
  {
    id: 2,
    emoji: '👥',
    title: '우리만의 공간',
    description: '커플, 친구, 가족과 함께하는\n프라이빗한 공유 공간을 만들어보세요',
  },
  {
    id: 3,
    emoji: '💝',
    title: '추억을 기록하세요',
    description: '특별한 순간들을 기록하고\n소중한 기념일을 함께 챙겨보세요',
  },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNext = () => {
    if (currentPage < onboardingData.length - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      scrollViewRef.current?.scrollTo({
        x: width * nextPage,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentPage(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {onboardingData.map((item) => (
          <View key={item.id} style={styles.slide}>
            <View style={styles.content}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentPage === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentPage === onboardingData.length - 1 ? '시작하기' : '다음'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  slide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: lightTheme.spacing.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  emoji: {
    fontSize: 80,
    marginBottom: lightTheme.spacing.xl,
  },
  title: {
    fontSize: lightTheme.typography.fontSize['2xl'],
    fontWeight: 'bold',
    color: lightTheme.colors.text,
    textAlign: 'center',
    marginBottom: lightTheme.spacing.md,
  },
  description: {
    fontSize: lightTheme.typography.fontSize.base,
    color: lightTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: lightTheme.typography.lineHeight.relaxed * lightTheme.typography.fontSize.base,
  },
  footer: {
    paddingHorizontal: lightTheme.spacing.xl,
    paddingBottom: lightTheme.spacing.xl,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: lightTheme.spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: lightTheme.colors.primary,
  },
  inactiveDot: {
    backgroundColor: lightTheme.colors.border,
  },
  button: {
    backgroundColor: lightTheme.colors.primary,
    paddingVertical: lightTheme.spacing.md,
    paddingHorizontal: lightTheme.spacing.xl,
    borderRadius: lightTheme.borderRadius.lg,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: lightTheme.typography.fontSize.base,
    fontWeight: '600',
  },
});