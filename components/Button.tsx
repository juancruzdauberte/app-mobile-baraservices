import { Pressable, Text, ActivityIndicator, StyleSheet } from "react-native";
import { theme, lightTheme, darkTheme } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  onPress,
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const { colorScheme } = useTheme();
  const colors = colorScheme === "dark" ? darkTheme.colors : lightTheme.colors;

  const variantStyle = {
    primary:   { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.secondary },
    outline:   { backgroundColor: "transparent" as const, borderWidth: 1, borderColor: colors.border.default },
    ghost:     { backgroundColor: "transparent" as const },
    danger:    { backgroundColor: colors.error },
  }[variant];

  const variantTextStyle = {
    primary:   { color: colors.text.inverse },
    secondary: { color: colors.text.inverse },
    outline:   { color: colors.text.primary },
    ghost:     { color: colors.text.secondary },
    danger:    { color: colors.text.inverse },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyle,
        styles[size],
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? colors.text.primary : colors.success}
        />
      ) : (
        <Text style={[styles.text, variantTextStyle]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  // Sizes
  sm: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  md: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  lg: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },

  // States
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: "100%",
  },

  // Text base (color is set dynamically)
  text: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
