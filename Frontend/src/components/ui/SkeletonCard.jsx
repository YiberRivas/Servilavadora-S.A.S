import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, radii, shadows } from '../../theme';

const SkeletonCard = React.memo(function SkeletonCard({ style }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardRow}>
        <Animated.View style={[styles.skelCircle, { opacity: pulse }]} />
        <View style={styles.skelTextBlock}>
          <Animated.View style={[styles.skelLine, { width: '70%', opacity: pulse }]} />
          <Animated.View style={[styles.skelLine, { width: '50%', opacity: pulse }]} />
          <Animated.View style={[styles.skelLine, { width: '60%', opacity: pulse }]} />
        </View>
      </View>
    </View>
  );
});

export default SkeletonCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 18,
    ...shadows.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  skelCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gray100,
  },
  skelTextBlock: {
    flex: 1,
    gap: 10,
    justifyContent: 'center',
  },
  skelLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.gray100,
  },
});