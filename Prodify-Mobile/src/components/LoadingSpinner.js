import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  Modal,
} from 'react-native';

const LoadingSpinner = ({
  visible = true,
  size = 'large',
  color = '#3498db',
  text = null,
  overlay = false,
  overlayColor = 'rgba(0, 0, 0, 0.5)',
}) => {
  const spinnerContent = (
    <View style={[styles.container, overlay && styles.overlayContainer]}>
      <View style={styles.spinnerWrapper}>
        <ActivityIndicator size={size} color={color} />
        {text && <Text style={[styles.text, { color }]}>{text}</Text>}
      </View>
    </View>
  );

  if (!visible) {
    return null;
  }

  if (overlay) {
    return (
      <Modal
        transparent
        animationType="fade"
        visible={visible}
        statusBarTranslucent
      >
        <View style={[styles.modalOverlay, { backgroundColor: overlayColor }]}>
          <View style={styles.modalContent}>
            <ActivityIndicator size={size} color={color} />
            {text && <Text style={[styles.text, { color }]}>{text}</Text>}
          </View>
        </View>
      </Modal>
    );
  }

  return spinnerContent;
};

// Full screen loading component
export const FullScreenLoading = ({
  visible = true,
  text = 'A carregar...',
  color = '#3498db',
}) => {
  if (!visible) return null;

  return (
    <View style={styles.fullScreenContainer}>
      <ActivityIndicator size="large" color={color} />
      {text && <Text style={[styles.fullScreenText, { color }]}>{text}</Text>}
    </View>
  );
};

// Inline loading component (for use within content)
export const InlineLoading = ({
  visible = true,
  size = 'small',
  color = '#3498db',
}) => {
  if (!visible) return null;

  return (
    <View style={styles.inlineContainer}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
  },
  spinnerWrapper: {
    alignItems: 'center',
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  fullScreenText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  inlineContainer: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LoadingSpinner;
