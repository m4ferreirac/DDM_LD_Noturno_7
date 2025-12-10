import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  style = {},
  textStyle = {},
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          button: styles.primaryButton,
          text: styles.primaryText,
          disabledButton: styles.primaryDisabled,
        };
      case 'secondary':
        return {
          button: styles.secondaryButton,
          text: styles.secondaryText,
          disabledButton: styles.secondaryDisabled,
        };
      case 'danger':
        return {
          button: styles.dangerButton,
          text: styles.dangerText,
          disabledButton: styles.dangerDisabled,
        };
      case 'success':
        return {
          button: styles.successButton,
          text: styles.successText,
          disabledButton: styles.successDisabled,
        };
      case 'warning':
        return {
          button: styles.warningButton,
          text: styles.warningText,
          disabledButton: styles.warningDisabled,
        };
      case 'outline':
        return {
          button: styles.outlineButton,
          text: styles.outlineText,
          disabledButton: styles.outlineDisabled,
        };
      case 'outlineDanger':
        return {
          button: styles.outlineDangerButton,
          text: styles.outlineDangerText,
          disabledButton: styles.outlineDangerDisabled,
        };
      case 'ghost':
        return {
          button: styles.ghostButton,
          text: styles.ghostText,
          disabledButton: styles.ghostDisabled,
        };
      case 'link':
        return {
          button: styles.linkButton,
          text: styles.linkText,
          disabledButton: styles.linkDisabled,
        };
      default:
        return {
          button: styles.primaryButton,
          text: styles.primaryText,
          disabledButton: styles.primaryDisabled,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          button: styles.smallButton,
          text: styles.smallText,
        };
      case 'medium':
        return {
          button: styles.mediumButton,
          text: styles.mediumText,
        };
      case 'large':
        return {
          button: styles.largeButton,
          text: styles.largeText,
        };
      default:
        return {
          button: styles.mediumButton,
          text: styles.mediumText,
        };
    }
  };

  const getLoadingColor = () => {
    if (variant === 'outline' || variant === 'ghost' || variant === 'link') {
      return '#3498db';
    }
    if (variant === 'outlineDanger') {
      return '#e74c3c';
    }
    return '#ffffff';
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const isDisabled = disabled || loading;

  const buttonStyles = [
    styles.baseButton,
    variantStyles.button,
    sizeStyles.button,
    fullWidth && styles.fullWidth,
    isDisabled && variantStyles.disabledButton,
    style,
  ];

  const textStyles = [
    styles.baseText,
    variantStyles.text,
    sizeStyles.text,
    isDisabled && styles.disabledText,
    textStyle,
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={getLoadingColor()}
        />
      );
    }

    if (icon && iconPosition === 'left') {
      return (
        <View style={styles.contentContainer}>
          {icon}
          <Text style={[...textStyles, styles.textWithIcon]}>{title}</Text>
        </View>
      );
    }

    if (icon && iconPosition === 'right') {
      return (
        <View style={styles.contentContainer}>
          <Text style={[...textStyles, styles.textWithIcon]}>{title}</Text>
          {icon}
        </View>
      );
    }

    return <Text style={textStyles}>{title}</Text>;
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  baseText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWithIcon: {
    marginHorizontal: 8,
  },
  fullWidth: {
    width: '100%',
  },
  disabledText: {
    opacity: 0.7,
  },

  // Size variants
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  smallText: {
    fontSize: 14,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 48,
  },
  mediumText: {
    fontSize: 16,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 56,
  },
  largeText: {
    fontSize: 18,
  },

  // Primary variant
  primaryButton: {
    backgroundColor: '#3498db',
  },
  primaryText: {
    color: '#ffffff',
  },
  primaryDisabled: {
    backgroundColor: '#a9cce3',
  },

  // Secondary variant
  secondaryButton: {
    backgroundColor: '#95a5a6',
  },
  secondaryText: {
    color: '#ffffff',
  },
  secondaryDisabled: {
    backgroundColor: '#bdc3c7',
  },

  // Danger variant
  dangerButton: {
    backgroundColor: '#e74c3c',
  },
  dangerText: {
    color: '#ffffff',
  },
  dangerDisabled: {
    backgroundColor: '#f1948a',
  },

  // Success variant
  successButton: {
    backgroundColor: '#27ae60',
  },
  successText: {
    color: '#ffffff',
  },
  successDisabled: {
    backgroundColor: '#7dcea0',
  },

  // Warning variant
  warningButton: {
    backgroundColor: '#f39c12',
  },
  warningText: {
    color: '#ffffff',
  },
  warningDisabled: {
    backgroundColor: '#f9e79f',
  },

  // Outline variant
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3498db',
  },
  outlineText: {
    color: '#3498db',
  },
  outlineDisabled: {
    borderColor: '#a9cce3',
  },

  // Outline Danger variant
  outlineDangerButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#e74c3c',
  },
  outlineDangerText: {
    color: '#e74c3c',
  },
  outlineDangerDisabled: {
    borderColor: '#f1948a',
  },

  // Ghost variant
  ghostButton: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: '#3498db',
  },
  ghostDisabled: {
    backgroundColor: 'transparent',
  },

  // Link variant
  linkButton: {
    backgroundColor: 'transparent',
    paddingVertical: 4,
    paddingHorizontal: 0,
    minHeight: 0,
  },
  linkText: {
    color: '#3498db',
    textDecorationLine: 'underline',
  },
  linkDisabled: {
    backgroundColor: 'transparent',
  },
});

export default Button;
