import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { lightTheme, darkTheme } from "@/constants/theme";
import { Pressable, View, type ViewStyle } from "react-native";
import { Image } from "expo-image";
import { AVATAR_PLACEHOLDER, IMAGE_CACHE_POLICY, IMAGE_TRANSITION } from "../constants/image-config";
import Ionicons from "@expo/vector-icons/Ionicons";
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
import { useAuth } from "../providers/AuthProvider";



export function AnimatedTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useTheme();
  // Semantic tab bar color tokens
  const BAR_BG = colorScheme === 'dark'
    ? darkTheme.colors.background.secondary  // #27272A — dark gray bar
    : lightTheme.colors.primary;             // #0284C7 — sky blue bar
  const PILL_BG = colorScheme === 'dark'
    ? darkTheme.colors.primary               // #38BDF8 — sky pill on dark bar
    : lightTheme.colors.background.primary;  // #FFFFFF — white pill on blue bar
  const ICON_FOCUSED = colorScheme === 'dark'
    ? darkTheme.colors.background.primary    // #18181B — dark icon on bright pill
    : lightTheme.colors.primary;             // #0284C7 — blue icon on white pill
  const ICON_MUTED = colorScheme === 'dark'
    ? darkTheme.colors.text.secondary        // #CBD5E1 — light gray icon on dark bar
    : lightTheme.colors.background.primary;  // #FFFFFF — white icon on blue bar
  const { isVisible, setVisible } = useTabBarVisibility();
  const { profile } = useAuth();
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
      // ─── Legacy (tabs) routes ─────────────────────────────────────────────
      case "index":
        return <HomeIcon color={color} size={22} />;
      case "my-jobs-requests":
        return <RecordIcon color={color} size={22} />;
      case "profile":
        return profile?.avatar ? (
          <Image
            source={{ uri: profile.avatar }}
            placeholder={AVATAR_PLACEHOLDER}
            transition={IMAGE_TRANSITION}
            cachePolicy={IMAGE_CACHE_POLICY}
            contentFit="cover"
            style={{ width: 30, height: 30, borderRadius: 22 }}
          />
        ) : (
          <UserIcon color={color} size={18} />
        );
      // ─── Cliente routes ───────────────────────────────────────────────────
      case "solicitudes":
        return <Ionicons name="clipboard-outline" size={22} color={color} />;
      case "ordenes":
        return <Ionicons name="briefcase-outline" size={22} color={color} />;
      // ─── Profesional routes ───────────────────────────────────────────────
      case "mercado":
        return <Ionicons name="search-outline" size={22} color={color} />;
      case "propuestas":
        return <Ionicons name="send-outline" size={22} color={color} />;
      // ─── Shared new routes ────────────────────────────────────────────────
      case "perfil":
        return profile?.avatar ? (
          <Image
            source={{ uri: profile.avatar }}
            placeholder={AVATAR_PLACEHOLDER}
            transition={IMAGE_TRANSITION}
            cachePolicy={IMAGE_CACHE_POLICY}
            contentFit="cover"
            style={{ width: 30, height: 30, borderRadius: 22 }}
          />
        ) : (
          <UserIcon color={color} size={18} />
        );
    }
  };

  return (
    <Animated.View
      className="absolute w-[80%] flex-row items-center justify-center self-center rounded-full px-3 py-3.5"
      // backgroundColor is set dynamically below

      style={[
        animatedContainerStyle,
        {
          bottom: insets.bottom + 16,
          backgroundColor: BAR_BG,
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
                backgroundColor: isFocused ? PILL_BG : "transparent",
              }}
            >
              {getIconByRouteName(
                route.name,
                isFocused ? ICON_FOCUSED : ICON_MUTED,
              )}

              {isFocused ? (
                <Animated.Text
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(200)}
                  className="ml-2 font-bold"
                  style={{ color: ICON_FOCUSED }}
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
