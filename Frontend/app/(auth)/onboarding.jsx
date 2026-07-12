import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Animated } from 'react-native';
import { Text, Button, useTheme, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { onboardingSlides } from '../../src/constants/mockData';

const { width } = Dimensions.get('window');

export default function Onboarding() {
  const router = useRouter();
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < onboardingSlides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  const renderSlide = ({ item }) => (
    <View style={[styles.slide, { width }]}>
      <View style={styles.imageContainer}>
        <Icon source="washing-machine" size={120} color={colors.primary} />
      </View>
      <Text variant="headlineSmall" style={[styles.title, { color: colors.onBackground }]}>
        {item.title}
      </Text>
      <Text variant="bodyLarge" style={[styles.description, { color: colors.onSurfaceVariant }]}>
        {item.description}
      </Text>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {onboardingSlides.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                width: dotWidth,
                opacity,
                backgroundColor: colors.primary,
              },
            ]}
          />
        );
      })}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.skipContainer}>
        <Button onPress={handleSkip} compact>
          Saltar
        </Button>
      </View>

      <FlatList
        ref={flatListRef}
        data={onboardingSlides}
        renderItem={renderSlide}
        keyExtractor={(item) => String(item.id)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        bounces={false}
      />

      {renderDots()}

      <View style={styles.footer}>
        <Button mode="contained" onPress={handleNext} style={styles.button} contentStyle={styles.buttonContent}>
          {currentIndex === onboardingSlides.length - 1 ? 'Comenzar' : 'Siguiente'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipContainer: {
    alignItems: 'flex-end',
    padding: 16,
    paddingTop: 48,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  button: {
    borderRadius: 12,
  },
  buttonContent: {
    height: 52,
  },
});
