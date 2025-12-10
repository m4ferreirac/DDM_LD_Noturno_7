import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Header = ({
  title,
  subtitle,
  userName,
  userRole,
  showBackButton = false,
  onBackPress,
  rightIcon,
  onRightPress,
  leftIcon,
  onLeftPress,
  backgroundColor = '#3498db',
  textColor = '#ffffff',
  style,
}) => {
  const insets = useSafeAreaInsets();

  const getRoleBadgeColor = () => {
    return userRole === 'Gestor' ? '#9b59b6' : '#2ecc71';
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          paddingTop: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight || 0,
        },
        style,
      ]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={backgroundColor}
        translucent
      />

      <View style={styles.content}>
        {/* Left Side */}
        <View style={styles.leftContainer}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onBackPress}
              activeOpacity={0.7}
            >
              <Text style={[styles.backIcon, { color: textColor }]}>←</Text>
            </TouchableOpacity>
          )}
          {leftIcon && !showBackButton && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onLeftPress}
              activeOpacity={0.7}
            >
              {leftIcon}
            </TouchableOpacity>
          )}
        </View>

        {/* Center - Title */}
        <View style={styles.centerContainer}>
          <Text
            style={[styles.title, { color: textColor }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[styles.subtitle, { color: textColor + 'CC' }]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Side */}
        <View style={styles.rightContainer}>
          {rightIcon && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onRightPress}
              activeOpacity={0.7}
            >
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* User Info Bar */}
      {userName && (
        <View style={styles.userInfoBar}>
          <View style={styles.userInfoContent}>
            <View style={styles.userAvatarContainer}>
              <Text style={styles.userAvatar}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: textColor }]} numberOfLines={1}>
                {userName}
              </Text>
              {userRole && (
                <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor() }]}>
                  <Text style={styles.roleText}>{userRole}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

// Simple Header variant (just title and navigation)
export const SimpleHeader = ({
  title,
  showBackButton = false,
  onBackPress,
  rightIcon,
  onRightPress,
  backgroundColor = '#3498db',
  textColor = '#ffffff',
  style,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.simpleContainer,
        {
          backgroundColor,
          paddingTop: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight || 0,
        },
        style,
      ]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={backgroundColor}
        translucent
      />

      <View style={styles.simpleContent}>
        {/* Left Side */}
        <View style={styles.simpleLeftContainer}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onBackPress}
              activeOpacity={0.7}
            >
              <Text style={[styles.backIcon, { color: textColor }]}>←</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Center - Title */}
        <View style={styles.simpleCenterContainer}>
          <Text
            style={[styles.simpleTitle, { color: textColor }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>

        {/* Right Side */}
        <View style={styles.simpleRightContainer}>
          {rightIcon && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onRightPress}
              activeOpacity={0.7}
            >
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

// Kanban Header with user info prominently displayed
export const KanbanHeader = ({
  userName,
  userRole,
  onMenuPress,
  onProfilePress,
  backgroundColor = '#3498db',
}) => {
  const insets = useSafeAreaInsets();

  const getRoleBadgeColor = () => {
    return userRole === 'Gestor' ? '#9b59b6' : '#2ecc71';
  };

  return (
    <View
      style={[
        styles.kanbanContainer,
        {
          backgroundColor,
          paddingTop: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight || 0,
        },
      ]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={backgroundColor}
        translucent
      />

      <View style={styles.kanbanContent}>
        {/* Logo/App Name */}
        <View style={styles.kanbanLogoContainer}>
          <Text style={styles.kanbanLogo}>📋</Text>
          <Text style={styles.kanbanAppName}>Prodify</Text>
        </View>

        {/* User Info */}
        <TouchableOpacity
          style={styles.kanbanUserContainer}
          onPress={onProfilePress}
          activeOpacity={0.7}
        >
          <View style={styles.kanbanUserInfo}>
            <Text style={styles.kanbanUserName} numberOfLines={1}>
              {userName || 'Utilizador'}
            </Text>
            {userRole && (
              <View style={[styles.kanbanRoleBadge, { backgroundColor: getRoleBadgeColor() }]}>
                <Text style={styles.kanbanRoleText}>{userRole}</Text>
              </View>
            )}
          </View>
          <View style={styles.kanbanAvatarContainer}>
            <Text style={styles.kanbanAvatar}>
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Menu Button */}
      {onMenuPress && (
        <TouchableOpacity
          style={styles.menuButton}
          onPress={onMenuPress}
          activeOpacity={0.7}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Main Header Styles
  container: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 4,
  },
  leftContainer: {
    width: 56,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    width: 56,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '600',
  },

  // User Info Bar Styles
  userInfoBar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  userInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  userAvatar: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  userDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },

  // Simple Header Styles
  simpleContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  simpleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 4,
  },
  simpleLeftContainer: {
    width: 56,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  simpleCenterContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simpleRightContainer: {
    width: 56,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  simpleTitle: {
    fontSize: 18,
    fontWeight: '600',
  },

  // Kanban Header Styles
  kanbanContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  kanbanContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  kanbanLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kanbanLogo: {
    fontSize: 24,
    marginRight: 8,
  },
  kanbanAppName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  kanbanUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kanbanUserInfo: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  kanbanUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    maxWidth: 120,
  },
  kanbanRoleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  kanbanRoleText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  kanbanAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  kanbanAvatar: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  menuButton: {
    position: 'absolute',
    left: 16,
    bottom: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 24,
    color: '#fff',
  },
});

export default Header;
