import { useCallback, useRef } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useTabBarVisibility } from "../components/TabBarVisibilityContext";
type Config = {
  hideThreshold?: number;
  showThreshold?: number;
  topRevealOffset?: number;
  jitter?: number;
};
export function useGlobalTabBarScroll(config: Config = {}) {
  const {
    hideThreshold = 18,
    showThreshold = 12,
    topRevealOffset = 2,
    jitter = 1.5,
  } = config;
  const { setVisible } = useTabBarVisibility();
  const lastOffsetY = useRef(0);
  const directionalDistance = useRef(0);
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const delta = offsetY - lastOffsetY.current;
      if (offsetY <= topRevealOffset) {
        setVisible(true);
        directionalDistance.current = 0;
        lastOffsetY.current = offsetY;
        return;
      }
      if (Math.abs(delta) < jitter) return;
      directionalDistance.current += delta;
      if (directionalDistance.current > hideThreshold) {
        setVisible(false);
        directionalDistance.current = 0;
      } else if (directionalDistance.current < -showThreshold) {
        setVisible(true);
        directionalDistance.current = 0;
      }
      lastOffsetY.current = offsetY;
    },
    [hideThreshold, jitter, setVisible, showThreshold, topRevealOffset],
  );
  return {
    onScroll,
    scrollEventThrottle: 16 as const,
  };
}
