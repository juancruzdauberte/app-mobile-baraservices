# Mobile UI Components Specification

## Purpose

Define modern, performant UI component patterns for the BaraServices mobile app. This specification establishes requirements for touch interaction components that provide superior user experience, accessibility, and performance compared to legacy React Native APIs.

---

## Requirements

### Requirement: Pressable for Touch Interactions

The system MUST use `Pressable` for all touch interactions instead of `TouchableOpacity`, `TouchableHighlight`, or other legacy touchable components.

**Rationale:** `Pressable` is the modern React Native touch API with better performance, flexible styling, and superior accessibility support. TouchableOpacity is deprecated and lacks advanced features like pressed state styling functions and fine-grained interaction callbacks.

**Technical Constraint:** All interactive elements (buttons, cards, list items) MUST use `Pressable`.

#### Scenario: Button Press with Visual Feedback

- GIVEN a user viewing a primary action button
- WHEN the user presses the button
- THEN the button immediately shows pressed state styling (opacity or scale change)
- AND the pressed style is applied via the `style` function, not inline opacity
- AND the style smoothly returns to normal on release

#### Scenario: Card Press in List

- GIVEN a service card in a scrollable list
- WHEN the user taps the card
- THEN the card shows a subtle pressed state (scale 0.98 or opacity 0.8)
- AND the navigation occurs after release (not on press down)
- AND the press feedback is visible even during fast taps

#### Scenario: Disabled State

- GIVEN a button in disabled state
- WHEN the user attempts to press it
- THEN no press feedback occurs
- AND the `onPress` callback is not invoked
- AND the component shows disabled styling (reduced opacity)

**Edge Cases:**
- Long press: Use `onLongPress` prop with separate handler
- Press in/out without commit: Handle with `onPressIn`/`onPressOut` for analytics
- Nested Pressables: Avoid when possible; use `hitSlop` for small targets instead

**Code Example:**

```tsx
// ✅ CORRECT: Pressable with style function
import { Pressable, Text } from 'react-native';

const Button = ({ onPress, disabled, children }) => (
  <Pressable
    style={({ pressed }) => [
      styles.button,
      pressed && styles.buttonPressed,
      disabled && styles.buttonDisabled,
    ]}
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityState={{ disabled }}
  >
    <Text style={styles.buttonText}>{children}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

// ❌ INCORRECT: TouchableOpacity (deprecated)
import { TouchableOpacity } from 'react-native';

const Button = ({ onPress, children }) => (
  <TouchableOpacity 
    style={styles.button} 
    onPress={onPress}
    activeOpacity={0.8} // Less flexible than Pressable's style function
  >
    <Text style={styles.buttonText}>{children}</Text>
  </TouchableOpacity>
);
```

---

### Requirement: Pressed State Styling

The system MUST define pressed states using the `style` function prop, not component-level opacity props.

**Rationale:** The `style` function provides more flexibility (combine opacity, scale, color changes) and integrates with React Native's optimization passes. It's the recommended pattern for modern React Native.

**Technical Constraint:** Pressed state MUST use `style={({ pressed }) => [...]}` pattern.

#### Scenario: Multi-State Button

- GIVEN a button that can be pressed, disabled, or loading
- WHEN defining styles
- THEN the `style` function combines all states correctly
- AND the visual precedence is: disabled > loading > pressed > default

#### Scenario: Custom Press Effect

- GIVEN a card component with brand-specific press feedback
- WHEN the user presses the card
- THEN the custom effect (e.g., shadow depth change, border color) applies
- AND the effect is defined in the `style` function, not animated separately

**Code Example:**

```tsx
// ✅ CORRECT: Style function with multiple states
const ServiceCard = ({ service, onPress, disabled, loading }) => (
  <Pressable
    style={({ pressed }) => [
      styles.card,
      pressed && !disabled && !loading && styles.cardPressed,
      disabled && styles.cardDisabled,
      loading && styles.cardLoading,
    ]}
    onPress={onPress}
    disabled={disabled || loading}
  >
    <Image source={{ uri: service.imageUrl }} style={styles.cardImage} />
    <Text style={styles.cardTitle}>{service.name}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.05, // Reduce shadow on press
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardLoading: {
    opacity: 0.7,
  },
});

// ❌ INCORRECT: Inline style in style function
const ServiceCard = ({ service, onPress }) => (
  <Pressable
    style={({ pressed }) => ({
      ...styles.card,
      opacity: pressed ? 0.8 : 1, // Creates new object every render!
    })}
    onPress={onPress}
  >
    {/* ... */}
  </Pressable>
);
```

---

### Requirement: Hit Area Optimization

The system MUST provide adequate touch targets for all interactive elements, with minimum 44x44 point hit area per Apple Human Interface Guidelines.

**Rationale:** Small touch targets cause user frustration and accessibility issues. `hitSlop` allows visual design to remain compact while ensuring usable tap targets.

**Technical Constraint:** Interactive elements smaller than 44x44 points MUST use `hitSlop` prop.

#### Scenario: Icon Button with Small Visual Size

- GIVEN an icon button with 24x24 point visual size
- WHEN defining the Pressable
- THEN `hitSlop` adds 10 points on all sides
- AND the effective tap target is 44x44 points
- AND the visual size remains 24x24

#### Scenario: Close Button in Modal

- GIVEN a close (X) button in top-right corner
- WHEN the user attempts to tap it
- THEN the extended hit area makes the target easy to tap
- AND the hit area doesn't overlap with adjacent interactive elements

**Code Example:**

```tsx
// ✅ CORRECT: Hit slop for small icon button
const IconButton = ({ icon, onPress }) => (
  <Pressable
    onPress={onPress}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    style={({ pressed }) => [
      styles.iconButton,
      pressed && styles.iconButtonPressed,
    ]}
  >
    <Icon name={icon} size={24} />
  </Pressable>
);

const styles = StyleSheet.create({
  iconButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonPressed: {
    opacity: 0.6,
  },
});

// Alternative: Shorter syntax for uniform hit slop
<Pressable
  onPress={onPress}
  hitSlop={10} // Applies to all sides
  style={styles.iconButton}
>
  <Icon name={icon} size={24} />
</Pressable>

// ❌ INCORRECT: No hit slop for small button
const IconButton = ({ icon, onPress }) => (
  <Pressable onPress={onPress} style={styles.iconButton}>
    <Icon name={icon} size={24} /> {/* Too small, hard to tap */}
  </Pressable>
);
```

---

### Requirement: Ripple Effect on Android

The system MUST provide native ripple feedback on Android while using appropriate iOS feedback.

**Rationale:** Android users expect Material Design ripple effects. `Pressable` supports platform-specific `android_ripple` prop for native performance.

**Technical Constraint:** Android Pressables SHOULD use `android_ripple` prop when appropriate for material design consistency.

#### Scenario: Button with Platform-Specific Feedback

- GIVEN a button component rendered on Android
- WHEN the user presses the button
- THEN a native ripple effect emanates from the touch point
- AND the ripple color contrasts with the button background
- AND on iOS, the button shows opacity/scale feedback instead

#### Scenario: Ripple Radius Control

- GIVEN a circular icon button
- WHEN configuring the ripple
- THEN the ripple is bounded to the button's circular shape
- AND the ripple doesn't extend beyond the button visually

**Code Example:**

```tsx
// ✅ CORRECT: Platform-specific press feedback
import { Pressable, Platform } from 'react-native';

const Button = ({ onPress, children }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.button,
      Platform.OS === 'ios' && pressed && styles.buttonPressedIOS,
    ]}
    android_ripple={{
      color: 'rgba(255, 255, 255, 0.3)',
      borderless: false,
      radius: -1, // -1 = bounded to view
    }}
  >
    <Text style={styles.buttonText}>{children}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    overflow: 'hidden', // Required for ripple clipping
  },
  buttonPressedIOS: {
    opacity: 0.8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

// ❌ INCORRECT: No Android-specific feedback
const Button = ({ onPress, children }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.button,
      pressed && styles.buttonPressed, // Same on both platforms
    ]}
  >
    <Text style={styles.buttonText}>{children}</Text>
  </Pressable>
);
```

---

### Requirement: Accessibility Integration

The system MUST provide comprehensive accessibility props for all Pressable components.

**Rationale:** Screen readers need semantic information to provide meaningful context to users. Pressable supports rich accessibility integration better than legacy touchables.

**Technical Constraint:** All Pressable components MUST include:
- `accessibilityRole`
- `accessibilityLabel` (if visual label isn't sufficient)
- `accessibilityState` for disabled/selected states
- `accessibilityHint` for non-obvious actions

#### Scenario: Button with Screen Reader Support

- GIVEN a button labeled "Add to Cart"
- WHEN a VoiceOver (iOS) or TalkBack (Android) user focuses on it
- THEN the screen reader announces "Add to Cart, button"
- AND if disabled, announces "Add to Cart, button, dimmed"
- AND if loading, announces "Add to Cart, button, busy"

#### Scenario: Card with Action Hint

- GIVEN a service card that navigates to details on press
- WHEN a screen reader user focuses on it
- THEN the screen reader announces the service name and "button"
- AND the hint "Double-tap to view details" is announced

**Code Example:**

```tsx
// ✅ CORRECT: Full accessibility props
const ServiceCard = ({ service, onPress, isFavorited }) => (
  <Pressable
    onPress={onPress}
    style={styles.card}
    accessibilityRole="button"
    accessibilityLabel={`${service.name}, ${service.category}`}
    accessibilityHint="Double-tap to view service details"
    accessibilityState={{ selected: isFavorited }}
  >
    <Image source={{ uri: service.imageUrl }} style={styles.image} />
    <Text style={styles.name}>{service.name}</Text>
    <Text style={styles.category}>{service.category}</Text>
  </Pressable>
);

// Complex state example
const Button = ({ onPress, disabled, loading, children }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled || loading}
    accessibilityRole="button"
    accessibilityState={{
      disabled: disabled || loading,
      busy: loading,
    }}
    accessibilityLabel={typeof children === 'string' ? children : undefined}
  >
    {loading ? <ActivityIndicator /> : <Text>{children}</Text>}
  </Pressable>
);

// ❌ INCORRECT: No accessibility props
const ServiceCard = ({ service, onPress }) => (
  <Pressable onPress={onPress} style={styles.card}>
    <Image source={{ uri: service.imageUrl }} style={styles.image} />
    <Text style={styles.name}>{service.name}</Text>
  </Pressable>
  // Screen reader has no context about what this element does
);
```

---

## Non-Functional Requirements

### Performance Requirements

- **Pressable Rendering:** Must not introduce measurable performance regression vs TouchableOpacity
- **Style Function Calls:** Should be optimized by React Native; no manual optimization needed
- **Ripple Effect:** Must use native Android ripple (not JS animation) for 60fps feedback

### Platform Consistency

- **iOS:** Subtle opacity/scale feedback preferred
- **Android:** Material Design ripple effects standard
- **Web (if applicable):** Hover states via `style` function with `hovered` prop

### Design System Integration

- All Pressable components MUST use design tokens from `theme.ts`:
  - Colors: `theme.colors.primary`, `theme.colors.disabled`
  - Spacing: `theme.spacing.sm`, `theme.spacing.md`
  - Border radius: `theme.borderRadius.sm`, `theme.borderRadius.md`

---

## Testing Requirements

### Requirement: Touch Interaction Testing

The system MUST validate touch feedback on real devices.

#### Test Scenario: Press Feedback Timing

```typescript
// Test: Verify pressed state applies immediately
import { fireEvent, render } from '@testing-library/react-native';

describe('Button Press Feedback', () => {
  it('applies pressed style when touched', () => {
    const { getByRole } = render(<Button onPress={jest.fn()}>Press Me</Button>);
    const button = getByRole('button');
    
    // Press in
    fireEvent(button, 'pressIn');
    
    // Verify pressed style is applied
    const pressedStyle = button.props.style({ pressed: true });
    expect(pressedStyle).toContainEqual(expect.objectContaining({
      opacity: 0.8,
    }));
    
    // Release
    fireEvent(button, 'pressOut');
  });
});
```

### Requirement: Accessibility Testing

The system MUST validate screen reader announcements.

#### Test Scenario: Screen Reader Context

```typescript
// Test: Verify accessibility props are present
describe('ServiceCard Accessibility', () => {
  it('provides complete screen reader context', () => {
    const service = {
      id: '1',
      name: 'House Cleaning',
      category: 'Home Services',
    };
    
    const { getByRole } = render(
      <ServiceCard service={service} onPress={jest.fn()} />
    );
    
    const card = getByRole('button');
    
    expect(card).toHaveAccessibilityValue({
      label: 'House Cleaning, Home Services',
      hint: 'Double-tap to view service details',
    });
  });
  
  it('announces disabled state', () => {
    const { getByRole } = render(
      <Button disabled onPress={jest.fn()}>
        Add to Cart
      </Button>
    );
    
    const button = getByRole('button');
    expect(button).toHaveAccessibilityState({ disabled: true });
  });
});
```

### Manual Testing Checklist

For each screen with Pressable components:

- [ ] Press feedback is immediate and visible
- [ ] Pressed style clears on release
- [ ] Disabled state prevents interaction
- [ ] Hit areas are adequate (can tap comfortably)
- [ ] Android shows native ripple effect
- [ ] iOS shows opacity/scale feedback
- [ ] VoiceOver announces element role and label
- [ ] VoiceOver announces disabled/selected states
- [ ] TalkBack provides equivalent Android experience

---

## Migration Guide

### From TouchableOpacity to Pressable

**Step 1:** Replace import

```tsx
// Before
import { TouchableOpacity } from 'react-native';

// After
import { Pressable } from 'react-native';
```

**Step 2:** Replace component and convert activeOpacity to style function

```tsx
// Before
<TouchableOpacity
  style={styles.button}
  onPress={handlePress}
  activeOpacity={0.7}
>
  <Text>Press Me</Text>
</TouchableOpacity>

// After
<Pressable
  style={({ pressed }) => [
    styles.button,
    pressed && { opacity: 0.7 },
  ]}
  onPress={handlePress}
>
  <Text>Press Me</Text>
</Pressable>
```

**Step 3:** Add accessibility props

```tsx
<Pressable
  style={({ pressed }) => [
    styles.button,
    pressed && styles.buttonPressed,
  ]}
  onPress={handlePress}
  accessibilityRole="button"
  accessibilityLabel="Press Me"
>
  <Text>Press Me</Text>
</Pressable>
```

**Step 4:** Extract pressed styles to StyleSheet

```tsx
<Pressable
  style={({ pressed }) => [
    styles.button,
    pressed && styles.buttonPressed,
  ]}
  onPress={handlePress}
  accessibilityRole="button"
>
  <Text>Press Me</Text>
</Pressable>

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
```

---

## Success Criteria

### Definition of Done for UI Components

A component meets UI requirements when:

1. ✅ Uses `Pressable` (no TouchableOpacity, TouchableHighlight, etc.)
2. ✅ Pressed state defined via `style` function
3. ✅ Android ripple configured with `android_ripple` prop
4. ✅ Includes `accessibilityRole`, `accessibilityLabel`, `accessibilityState`
5. ✅ Hit area is minimum 44x44 points (use `hitSlop` if needed)
6. ✅ All styles use `StyleSheet.create`, no inline objects
7. ✅ Manual testing shows smooth press feedback on device
8. ✅ VoiceOver/TalkBack provide meaningful context

### Regression Prevention

The system MUST NOT:
- Break existing touch interactions
- Reduce hit areas below 44x44 points
- Remove accessibility context
- Introduce visual glitches in pressed states
- Cause performance regressions in lists with many Pressables

---

## Related Requirements

- See `mobile-list-performance` spec for memoization requirements
- See `mobile-accessibility` spec for comprehensive accessibility requirements
- See `mobile-styling` spec for StyleSheet requirements
- See `vercel-react-native-skills/rules/ui-pressable.md` for detailed pattern

---

**End of Specification**
