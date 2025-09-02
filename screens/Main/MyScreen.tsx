import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { lightTheme } from '../../theme';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/authService';

export default function MyScreen() {
  const { user } = useAuthStore();

  const handleLogout = async () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.signOut();
            } catch (error: any) {
              Alert.alert('오류', '로그아웃에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>마이 페이지</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.user_metadata?.name || '사용자'}
            </Text>
            <Text style={styles.profileEmail}>
              {user?.email}
            </Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>알림 설정</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>테마 설정</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>도움말</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Text style={[styles.menuText, styles.logoutText]}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  header: {
    paddingHorizontal: lightTheme.spacing.lg,
    paddingTop: lightTheme.spacing.lg,
    paddingBottom: lightTheme.spacing.md,
    backgroundColor: lightTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.border,
  },
  title: {
    fontSize: lightTheme.typography.fontSize.xl,
    fontWeight: '600',
    color: lightTheme.colors.text,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: lightTheme.colors.surface,
    margin: lightTheme.spacing.md,
    borderRadius: lightTheme.borderRadius.lg,
    padding: lightTheme.spacing.lg,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: lightTheme.typography.fontSize.lg,
    fontWeight: '600',
    color: lightTheme.colors.text,
    marginBottom: lightTheme.spacing.xs,
  },
  profileEmail: {
    fontSize: lightTheme.typography.fontSize.sm,
    color: lightTheme.colors.textSecondary,
  },
  menuSection: {
    backgroundColor: lightTheme.colors.surface,
    margin: lightTheme.spacing.md,
    borderRadius: lightTheme.borderRadius.lg,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: lightTheme.spacing.lg,
    paddingHorizontal: lightTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.border,
  },
  menuText: {
    fontSize: lightTheme.typography.fontSize.base,
    color: lightTheme.colors.text,
    fontWeight: '500',
  },
  logoutText: {
    color: lightTheme.colors.destructive,
  },
});