import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect } from "react";
import { Pressable, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeOut,
  interpolate,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  ExpensesIcon,
  HomeIcon,
  RecordIcon,
  UserIcon,
} from "../components/Icons";
import { useTabBarVisibility } from "./TabBarVisibilityContext";

const PRIMARY_COLOR = "#130057";
const SECONDARY_COLOR = "#FFFFFF";

export function AnimatedTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isVisible, setVisible } = useTabBarVisibility();
  const visibilityProgress = useSharedValue(1);

  useEffect(() => {
    setVisible(true);
  }, [setVisible, state.index]);

  useEffect(() => {
    visibilityProgress.value = withSpring(isVisible ? 1 : 0, {
      damping: 18,
      stiffness: 180,
      mass: 0.8,
    });
  }, [isVisible, visibilityProgress]);

  const animatedContainerStyle = useAnimatedStyle<ViewStyle>(() => {
    const opacity = interpolate(visibilityProgress.value, [0, 1], [0, 1]);
    const translateY = interpolate(visibilityProgress.value, [0, 1], [70, 0]);
    const scale = interpolate(visibilityProgress.value, [0, 1], [0.94, 1]);

    return {
      opacity,
      transform: [{ translateY }, { scale }] as ViewStyle["transform"],
    };
  });

  const getIconByRouteName = (routeName: string, color: string) => {
    switch (routeName) {
      case "index":
        return <HomeIcon color={color} size={18} />;
      case "expenses":
        return <ExpensesIcon color={color} size={18} />;
      case "payments-history":
        return <RecordIcon color={color} size={18} />;
      case "profile":
        return <UserIcon color={color} size={18} />;
      default:
        return <HomeIcon color={color} size={18} />;
    }
  };

  return (
    <Animated.View
      className="absolute w-[80%] flex-row items-center justify-center self-center rounded-full bg-[#130057] px-3 py-3.5"
      style={[
        animatedContainerStyle,
        {
          bottom: insets.bottom + 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 6,
        },
      ]}
      pointerEvents={isVisible ? "auto" : "none"}
    >
      {state.routes.map((route, index) => {
        if (["_sitemap", "+not-found"].includes(route.name)) {
          return null;
        }

        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <Animated.View
            key={route.key}
            layout={LinearTransition.springify().mass(0.5)}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              className="h-9 flex-row items-center justify-center rounded-full px-[13px]"
              style={{
                backgroundColor: isFocused ? SECONDARY_COLOR : "transparent",
              }}
            >
              {getIconByRouteName(
                route.name,
                isFocused ? PRIMARY_COLOR : SECONDARY_COLOR,
              )}

              {isFocused ? (
                <Animated.Text
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(200)}
                  className="ml-2 font-bold text-[#130057]"
                >
                  {label as string}
                </Animated.Text>
              ) : null}
            </Pressable>
          </Animated.View>
        );
      })}
    </Animated.View>
  );
}
