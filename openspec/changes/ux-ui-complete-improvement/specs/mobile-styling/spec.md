# Mobile Styling Specification

## Purpose

Establish consistent, performant styling patterns for the BaraServices mobile app. This specification defines requirements for eliminating inline style object allocation, standardizing design tokens, and ensuring optimal render performance through proper StyleSheet usage.

---

## Requirements

### Requirement: StyleSheet.create for All Styles

The system MUST use `StyleSheet.create()` for all component styles instead of inline style objects.

**Rationale:** Inline style objects (`style={{ padding: 16 }}`) create new object references on every render, causing unnecessary re-renders in memoized components and increasing GC pressure. StyleSheet.create() creates optimized, reusable style references.

**Technical Constraint:** Zero inline style objects permitted in components. All styles MUST be defined via `StyleSheet.create()` or design system utilities.

#### Scenario: Component with Multiple Style States

- GIVEN a button component with default, pressed, and disabled states
- WHEN defining styles
- THEN all style variations are defined in `StyleSheet.create()`
- AND style arrays combine base and state styles
- AND no inline objects are created during render

#### Scenario: Dynamic Styles Based on Props

- GIVEN a component that needs prop-based styling (e.g., custom width)
- WHEN the prop changes
- THEN the style resolves from pre-defined StyleSheet entries
- OR uses a small set of pre-created style variations
- AND no inline object allocation occurs

#### Scenario: Conditional Styles in Lists

- GIVEN a list item that changes style based on selection state
- WHEN the selection state changes
- THEN the component combines StyleSheet entries via array
- AND React.memo() correctly identifies unchanged items
- AND only the selected item re-renders

**Edge Cases:**
- Truly dynamic values (e.g., animation interpolation): Use Reanimated's `useAnimatedStyle` hook
- User-customizable values (e.g., theme colors): Pre-compute StyleSheet for each theme
- Single-use components: Still use StyleSheet for consistency and optimization

**Code Example:**

```tsx
// ✅ CORRECT: StyleSheet.create with state combinations
import { StyleSheet, Pressable, Text } from 'react-native';

const Button = ({ onPress, disabled, variant = 'primary' }) => (
  <Pressable
    style={({ pressed }) => [
      styles.button,
      styles[variant], // Primary, secondary, tertiary
      pressed && styles.pressed,
      disabled && styles.disabled,
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={[styles.buttonText, styles[`${variant}Text`]]}>
      Press Me
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#5856D6',
  },
  tertiary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    backgroundColor: '#C7C7CC',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: 'white',
  },
  tertiaryText: {
    color: '#007AFF',
  },
});

// ❌ INCORRECT: Inline style objects
const Button = ({ onPress, disabled }) => (
  <Pressable
    style={({ pressed }) => ({
      paddingVertical: 12, // New object every render!
      paddingHorizontal: 24,
      backgroundColor: disabled ? '#C7C7CC' : '#007AFF',
      opacity: pressed ? 0.8 : 1,
    })}
    onPress={onPress}
  >
    <Text style={{ color: 'white', fontSize: 16 }}>Press Me</Text>
  </Pressable>
);
```

---

### Requirement: Design Token System

The system MUST centralize design values (colors, spacing, typography) in a design token file.

**Rationale:** Hardcoded values scattered across components create maintenance burden and visual inconsistency. Centralized tokens enable theme changes, ensure consistency, and provide type safety.

**Technical Constraint:** All components MUST import design tokens from `theme.ts` or equivalent design system module. No hardcoded color hex values or spacing numbers in components.

#### Scenario: Component Using Theme Colors

- GIVEN a service card component
- WHEN defining styles
- THEN colors reference `theme.colors.primary`, `theme.colors.background`, etc.
- AND the component automatically reflects theme changes
- AND TypeScript autocomplete suggests available color tokens

#### Scenario: Consistent Spacing

- GIVEN multiple components with padding/margin
- WHEN defining layouts
- THEN spacing values use `theme.spacing.sm`, `theme.spacing.md`, etc.
- AND all components share consistent spacing scale
- AND designers can update spacing globally

#### Scenario: Typography Consistency

- GIVEN text elements across the app
- WHEN styling text
- THEN typography uses `theme.typography.heading`, `theme.typography.body`, etc.
- AND font sizes, weights, and line heights are consistent
- AND accessibility font scaling is respected

**Design Token Structure:**

```typescript
// theme.ts
export const theme = {
  colors: {
    // Primary palette
    primary: '#007AFF',
    primaryDark: '#0051D5',
    primaryLight: '#5EADFF',
    
    // Semantic colors
    background: '#FFFFFF',
    surface: '#F2F2F7',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    
    // Text colors
    textPrimary: '#000000',
    textSecondary: '#8E8E93',
    textTertiary: '#C7C7CC',
    
    // Component-specific
    buttonPrimary: '#007AFF',
    buttonSecondary: '#5856D6',
    cardBackground: '#FFFFFF',
    divider: '#C6C6C8',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 9999, // Fully rounded
  },
  
  typography: {
    largeTitle: {
      fontSize: 34,
      fontWeight: '700',
      lineHeight: 41,
    },
    title1: {
      fontSize: 28,
      fontWeight: '600',
      lineHeight: 34,
    },
    title2: {
      fontSize: 22,
      fontWeight: '600',
      lineHeight: 28,
    },
    headline: {
      fontSize: 17,
      fontWeight: '600',
      lineHeight: 22,
    },
    body: {
      fontSize: 17,
      fontWeight: '400',
      lineHeight: 22,
    },
    callout: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 21,
    },
    subheadline: {
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 20,
    },
    footnote: {
      fontSize: 13,
      fontWeight: '400',
      lineHeight: 18,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
} as const;

export type Theme = typeof theme;
```

**Code Example:**

```tsx
// ✅ CORRECT: Design tokens from theme
import { StyleSheet } from 'react-native';
import { theme } from '../theme';

const ServiceCard = ({ service }) => (
  <Pressable style={styles.card}>
    <Image source={{ uri: service.imageUrl }} style={styles.image} />
    <Text style={styles.title}>{service.name}</Text>
    <Text style={styles.category}>{service.category}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.md, // Spread shadow object
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.headline,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  category: {
    ...theme.typography.subheadline,
    color: theme.colors.textSecondary,
  },
});

// ❌ INCORRECT: Hardcoded values
const ServiceCard = ({ service }) => (
  <Pressable style={styles.card}>
    <Text style={styles.title}>{service.name}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF', // Should use theme.colors.cardBackground
    borderRadius: 12, // Should use theme.borderRadius.lg
    padding: 16, // Should use theme.spacing.md
  },
  title: {
    fontSize: 17, // Should use theme.typography.headline
    fontWeight: '600',
    color: '#000000', // Should use theme.colors.textPrimary
  },
});
```

---

### Requirement: Style Composition Patterns

The system MUST compose styles using arrays instead of object spreading in render methods.

**Rationale:** Array-based style composition is optimized by React Native's style reconciliation. Object spreading in render (`{...styles.a, ...styles.b}`) creates new objects, negating StyleSheet benefits.

**Technical Constraint:** All style combinations MUST use array syntax: `[styles.base, condition && styles.variant]`.

#### Scenario: Conditional Style Application

- GIVEN a list item with selected state
- WHEN composing styles
- THEN array syntax combines base and selected styles
- AND short-circuit evaluation (`&&`) handles conditional styles
- AND no object spreading occurs

#### Scenario: Style Overrides from Props

- GIVEN a reusable component accepting custom styles via props
- WHEN the parent passes custom styles
- THEN array syntax merges component styles with prop styles
- AND later array entries override earlier ones
- AND the override happens at style resolution, not render time

**Code Example:**

```tsx
// ✅ CORRECT: Array-based style composition
const ListItem = ({ item, isSelected, onPress, style }) => (
  <Pressable
    style={[
      styles.item,
      isSelected && styles.itemSelected,
      style, // Allow parent overrides
    ]}
    onPress={onPress}
  >
    <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
      {item.name}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  item: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.cardBackground,
  },
  itemSelected: {
    backgroundColor: theme.colors.primaryLight,
  },
  itemText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  itemTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

// ❌ INCORRECT: Object spreading in render
const ListItem = ({ item, isSelected, onPress, style }) => (
  <Pressable
    style={{
      ...styles.item, // Creates new object!
      ...(isSelected ? styles.itemSelected : {}),
      ...style,
    }}
    onPress={onPress}
  >
    <Text style={styles.itemText}>{item.name}</Text>
  </Pressable>
);
```

---

### Requirement: Avoid Inline Functions Returning Styles

The system MUST NOT use inline functions that return style objects in render methods.

**Rationale:** Functions like `getStyles(props)` that create new objects on every render negate StyleSheet benefits and cause re-renders.

**Technical Constraint:** Style computation MUST happen during StyleSheet definition or via pre-computed style maps, not during render.

#### Scenario: Prop-Based Style Variants

- GIVEN a component with 3 size variants ('small', 'medium', 'large')
- WHEN selecting styles based on props
- THEN all variants are pre-defined in StyleSheet
- AND selection uses `styles[size]` syntax, not a function call
- AND no new objects are created

**Code Example:**

```tsx
// ✅ CORRECT: Pre-defined style variants
type ButtonSize = 'small' | 'medium' | 'large';

const Button = ({ size = 'medium', children }: { size?: ButtonSize; children: string }) => (
  <Pressable style={[styles.button, styles[size]]}>
    <Text style={[styles.buttonText, styles[`${size}Text`]]}>{children}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  medium: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  large: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  buttonText: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});

// ❌ INCORRECT: Function returning styles
const Button = ({ size = 'medium', children }) => {
  const getButtonStyles = (size) => ({ // Called every render!
    paddingVertical: size === 'small' ? 4 : size === 'medium' ? 8 : 12,
    paddingHorizontal: size === 'small' ? 8 : size === 'medium' ? 16 : 24,
  });

  return (
    <Pressable style={[styles.button, getButtonStyles(size)]}>
      <Text>{children}</Text>
    </Pressable>
  );
};
```

---

## Non-Functional Requirements

### Performance Impact

- **Render Performance:** StyleSheet.create() optimization reduces render time by ~5-10% vs inline objects
- **Memory Pressure:** Eliminates object allocation churn during renders
- **Bundle Size:** Design token system adds ~2KB (negligible)

### Developer Experience

- **TypeScript Support:** Theme tokens MUST provide full type safety and autocomplete
- **Linting:** ESLint rules SHOULD warn on inline style objects (optional but recommended)
- **Documentation:** All design tokens MUST be documented with usage examples

---

## Testing Requirements

### Requirement: Style Consistency Validation

The system MUST validate that no inline style objects exist in components.

#### Test Scenario: ESLint Rule Enforcement

```javascript
// .eslintrc.js (optional but recommended)
module.exports = {
  rules: {
    'react-native/no-inline-styles': 'error', // Enforce StyleSheet usage
    'react-native/no-color-literals': 'warn', // Warn on hardcoded colors
  },
};
```

#### Test Scenario: Theme Token Coverage

```typescript
// Test: Verify all colors come from theme
describe('Theme Token Usage', () => {
  it('has no hardcoded color values', () => {
    const componentFiles = glob.sync('src/components/**/*.tsx');
    
    componentFiles.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Check for hex color patterns outside theme.ts
      const hexColorPattern = /#[0-9A-Fa-f]{6}/g;
      const matches = content.match(hexColorPattern);
      
      if (matches && !file.includes('theme.ts')) {
        fail(`Found hardcoded colors in ${file}: ${matches.join(', ')}`);
      }
    });
  });
});
```

### Manual Testing Checklist

For each component:

- [ ] All styles use `StyleSheet.create()`
- [ ] No inline style objects: `style={{ ... }}`
- [ ] Colors reference theme tokens
- [ ] Spacing uses theme scale
- [ ] Typography uses theme definitions
- [ ] Style arrays used for composition, not object spreading
- [ ] TypeScript shows autocomplete for theme values

---

## Migration Guide

### From Inline Styles to StyleSheet

**Step 1:** Identify inline style objects

```tsx
// Search codebase for:
style={{
style={[{ // in arrays too
```

**Step 2:** Extract to StyleSheet

```tsx
// Before
<View style={{ padding: 16, marginBottom: 8 }}>
  <Text style={{ fontSize: 16, color: '#000' }}>Hello</Text>
</View>

// After
const MyComponent = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Hello</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  text: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textPrimary,
  },
});
```

**Step 3:** Replace hardcoded values with theme tokens

```tsx
// Before
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
  },
});

// After
const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
});
```

**Step 4:** Convert conditional inline objects to arrays

```tsx
// Before
<View style={{ ...styles.card, ...(isActive && { backgroundColor: 'blue' }) }}>

// After
<View style={[styles.card, isActive && styles.cardActive]}>

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
  },
  cardActive: {
    backgroundColor: theme.colors.primary,
  },
});
```

---

## Success Criteria

### Definition of Done for Styling

A component meets styling requirements when:

1. ✅ All styles use `StyleSheet.create()`
2. ✅ Zero inline style objects (`style={{ ... }}`)
3. ✅ All colors reference theme tokens
4. ✅ All spacing uses theme scale
5. ✅ Typography uses theme definitions
6. ✅ Style composition uses arrays, not spreading
7. ✅ TypeScript provides autocomplete for theme values
8. ✅ ESLint shows no inline style warnings (if rule enabled)

### Regression Prevention

The system MUST NOT:
- Break existing visual designs during migration
- Introduce new style bugs or layout shifts
- Reduce style flexibility for edge cases
- Remove ability to override styles via props

---

## Related Requirements

- See `mobile-list-performance` spec for style optimization in lists
- See `mobile-ui-components` spec for Pressable style patterns
- See `vercel-react-native-skills/rules/list-performance-inline-objects.md`

---

**End of Specification**
