import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, Dimensions } from 'react-native';
import { useToastStore } from '../../store/toastStore';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function Toast() {
  const { isVisible, message, type, hideToast } = useToastStore();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 50,
          useNativeDriver: true,
          tension: 40,
          friction: 6,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hide();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hideToast();
    });
  };

  if (!isVisible) return null;

  let bgBorderColor = '#1D3238';
  let textColor = '#F2EFE9';
  let Icon = Info;
  let iconColor = '#9BA8A6';

  if (type === 'success') {
    bgBorderColor = '#2F9E8F';
    iconColor = '#2F9E8F';
    Icon = CheckCircle;
  } else if (type === 'error') {
    bgBorderColor = '#e74c3c';
    iconColor = '#e74c3c';
    Icon = AlertTriangle;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          borderColor: bgBorderColor,
        },
      ]}
    >
      <Icon size={20} color={iconColor} style={styles.icon} />
      <Text style={[styles.message, { color: textColor }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: width * 0.05,
    width: width * 0.9,
    backgroundColor: '#16262A',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
