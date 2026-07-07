/**
 * AddPinScreen 의 2-스텝 슬라이드 + progress 애니메이션 훅.
 *
 * next: 좌로 슬라이드 아웃 → step +1 → 우에서 슬라이드 인
 * back: 우로 슬라이드 아웃 → step -1 → 좌에서 슬라이드 인
 * step 1 에서 back 은 onExitFirstStep 콜백 (보통 navigation.goBack)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface UseStepAnimationOptions {
  totalSteps: number;
  onExitFirstStep: () => void;
}

export interface StepAnimation {
  step: number;
  slideAnim: Animated.Value;
  progressAnim: Animated.Value;
  next: () => void;
  back: () => void;
}

export function useStepAnimation({ totalSteps, onExitFirstStep }: UseStepAnimationOptions): StepAnimation {
  const [step, setStep] = useState(1);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: step,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [step, progressAnim]);

  const next = useCallback(() => {
    if (step >= totalSteps) return;
    Animated.timing(slideAnim, {
      toValue: -SCREEN_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setStep(step + 1);
      slideAnim.setValue(SCREEN_WIDTH);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [step, totalSteps, slideAnim]);

  const back = useCallback(() => {
    if (step <= 1) {
      onExitFirstStep();
      return;
    }
    Animated.timing(slideAnim, {
      toValue: SCREEN_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setStep(step - 1);
      slideAnim.setValue(-SCREEN_WIDTH);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [step, slideAnim, onExitFirstStep]);

  return { step, slideAnim, progressAnim, next, back };
}
