# Mobile Accessibility Specification

## Purpose

Establish comprehensive accessibility standards for the BaraServices mobile app to ensure all users, including those using assistive technologies, can effectively use the application. This specification defines requirements for screen reader support, keyboard navigation, dynamic type, and accessibility best practices across all UI components.

---

## Requirements

### Requirement: Screen Reader Support for Interactive Elements

The system MUST provide meaningful labels and hints for all interactive elements to enable screen reader users to navigate and operate the app.

**Rationale:** Screen readers (VoiceOver on iOS, TalkBack on Android) rely on accessibility metadata to describe UI elements. Without proper labels, screen reader users cannot understand or interact with the app.

**Technical Constraint:** All interactive elements (buttons, links, form inputs, cards) MUST include:
- `accessibilityRole` to identify element type
- `accessibilityLabel` for descriptive text
- `accessibilityHint` for non-obvious actions
- `accessibilityState` for dynamic states (disabled, selected, busy)

#### Scenario: Service Card Navigation

- GIVEN a service card in a list
- WHEN a VoiceOver user focuses on the card
- THEN VoiceOver announces: "{Service Name}, {Category}, button. Double-tap to view service details."
- AND the announcement includes the service name and category
- AND the hint clarifies the action

#### Scenario: Button State Announcements

- GIVEN a "Book Service" button that can be disabled or loading
- WHEN the button is disabled
- THEN VoiceOver announces: "Book Service, button, dimmed"
- AND when loading: "Book Service, button, busy"
- AND the user understands the button is not currently actionable

#### Scenario: Form Input Labeling

- GIVEN a text input for "Service Address"
- WHEN a VoiceOver user focuses on the input
- THEN VoiceOver announces: "Service Address, text field, required"
- AND if the input has an error: "Service Address, text field, invalid. Please enter a valid address."
- AND the user receives complete context

**Edge Cases:**
- Images with no alt text: Must provide `accessibilityLabel` describing image content
- Icon-only buttons: Must provide descriptive label, not just "button"
- Complex interactive elements (e.g., star ratings): Provide clear value and adjustment hints

**Code Example:**

```tsx
// ✅ CORRECT: Complete accessibility metadata
import { Pressable, Text } from 'react-native';

const ServiceCard = ({ service, onPress, isFavorited }) => (
  <Pressable
    onPress={onPress}
    style={styles.card}
    accessibilityRole="button"
    accessibilityLabel={`${service.name}, ${service.category}, ${service.price}`}
    accessibilityHint="Double-tap to view service details"
    accessibilityState={{
      selected: isFavorited,
    }}
  >
    <Image 
      source={{ uri: service.imageUrl }} 
      style={styles.image}
      accessibilityIgnoresInvertColors // Preserve image appearance in dark mode
      accessible={false} // Don't focus; card handles semantics
    />
    <Text style={styles.name}>{service.name}</Text>
    <Text style={styles.category}>{service.category}</Text>
    <Text style={styles.price}>{service.price}</Text>
  </Pressable>
);

// Button with multiple states
const BookButton = ({ onPress, disabled, loading, service }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled || loading}
    style={styles.button}
    accessibilityRole="button"
    accessibilityLabel={`Book ${service.name}`}
    accessibilityHint={disabled ? undefined : "Double-tap to book this service"}
    accessibilityState={{
      disabled: disabled || loading,
      busy: loading,
    }}
  >
    {loading ? (
      <ActivityIndicator color="white" />
    ) : (
      <Text style={styles.buttonText}>Book Service</Text>
    )}
  </Pressable>
);

// Form input with label and error
const FormInput = ({ label, value, onChange, error, required }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label} {required && '*'}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      style={[styles.input, error && styles.inputError]}
      accessibilityLabel={label}
      accessibilityRequired={required}
      accessibilityInvalid={!!error}
      accessibilityHint={error || undefined}
    />
    {error && (
      <Text 
        style={styles.errorText}
        accessibilityLiveRegion="polite" // Announce errors immediately
      >
        {error}
      </Text>
    )}
  </View>
);

// ❌ INCORRECT: No accessibility metadata
const ServiceCard = ({ service, onPress }) => (
  <Pressable onPress={onPress} style={styles.card}>
    <Image source={{ uri: service.imageUrl }} style={styles.image} />
    <Text>{service.name}</Text>
    {/* Screen reader has no idea what this is or what happens on tap */}
  </Pressable>
);
```

---

### Requirement: Accessibility Roles for Semantic Structure

The system MUST assign appropriate `accessibilityRole` values to all UI elements to convey their purpose.

**Rationale:** Accessibility roles help screen readers understand the type and behavior of elements, enabling users to navigate efficiently using role-based navigation (e.g., "next button", "next heading").

**Technical Constraint:** All components MUST use one of React Native's supported accessibility roles:
- `button` - Interactive elements that trigger actions
- `link` - Navigation to other screens/content
- `search` - Search input fields
- `image` - Images (when accessible)
- `imagebutton` - Interactive images
- `header` - Section headings
- `text` - Static text (default, usually implicit)
- `adjustable` - Sliders, steppers, pickers
- `switch` - Toggle switches
- `checkbox` - Checkboxes
- `radio` - Radio buttons
- `tab` - Tab navigation items
- `menu` - Menu items
- `menubar` - Menu bars
- `menuitem` - Individual menu items
- `progressbar` - Progress indicators
- `alert` - Important announcements
- `combobox` - Dropdowns/pickers

#### Scenario: Navigation Header

- GIVEN a screen with a section header "Featured Services"
- WHEN a VoiceOver user navigates by headings
- THEN the header is announced as "Featured Services, heading"
- AND the user can jump between sections using heading navigation

#### Scenario: Toggle Switch

- GIVEN a settings toggle for "Enable Notifications"
- WHEN a VoiceOver user focuses on it
- THEN VoiceOver announces: "Enable Notifications, switch, on" (or "off")
- AND the user can double-tap to toggle the state

#### Scenario: Search Input

- GIVEN a search bar at the top of the screen
- WHEN a VoiceOver user focuses on it
- THEN VoiceOver announces: "Search services, search field"
- AND the role helps users find the search quickly

**Code Example:**

```tsx
// ✅ CORRECT: Appropriate accessibility roles
import { Text, TextInput, Switch, Pressable } from 'react-native';

// Section header
const SectionHeader = ({ title }) => (
  <Text 
    style={styles.header}
    accessibilityRole="header"
  >
    {title}
  </Text>
);

// Search input
const SearchBar = ({ value, onChangeText, onSubmit }) => (
  <TextInput
    value={value}
    onChangeText={onChangeText}
    onSubmitEditing={onSubmit}
    style={styles.searchInput}
    placeholder="Search services"
    accessibilityRole="search"
    accessibilityLabel="Search services"
    returnKeyType="search"
  />
);

// Toggle setting
const SettingToggle = ({ label, value, onChange }) => (
  <View style={styles.settingRow}>
    <Text style={styles.settingLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onChange}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
    />
  </View>
);

// Navigation button (link to another screen)
const ViewAllButton = ({ onPress }) => (
  <Pressable
    onPress={onPress}
    style={styles.link}
    accessibilityRole="link"
    accessibilityLabel="View all services"
    accessibilityHint="Navigates to full service catalog"
  >
    <Text style={styles.linkText}>View All →</Text>
  </Pressable>
);

// Alert message
const ErrorAlert = ({ message }) => (
  <View 
    style={styles.alert}
    accessibilityRole="alert"
    accessibilityLiveRegion="assertive" // Interrupt and announce immediately
  >
    <Text style={styles.alertText}>{message}</Text>
  </View>
);

// ❌ INCORRECT: Missing or wrong roles
const SectionHeader = ({ title }) => (
  <Text style={styles.header}>
    {title}
    {/* Missing accessibilityRole="header" - not navigable by headings */}
  </Text>
);

const SearchBar = ({ value, onChangeText }) => (
  <TextInput
    value={value}
    onChangeText={onChangeText}
    // Missing accessibilityRole="search" - harder to find
  />
);
```

---

### Requirement: Focus Management and Navigation Order

The system MUST ensure logical focus order and provide focus management for screen reader and keyboard navigation.

**Rationale:** Screen reader users navigate sequentially through elements. Illogical focus order or focus traps cause confusion and prevent task completion.

**Technical Constraint:** All screens MUST:
- Present elements in logical reading order (top-to-bottom, left-to-right)
- Avoid focus traps (modals, overlays must allow escape)
- Manage focus after navigation or modal dismissal
- Group related elements appropriately

#### Scenario: Modal Opening and Closing

- GIVEN a user opening a booking confirmation modal
- WHEN the modal opens
- THEN focus moves to the modal's close button or first interactive element
- AND the background content is hidden from screen readers (`aria-hidden` equivalent)
- WHEN the modal closes
- THEN focus returns to the element that triggered the modal
- AND the user's place in the page is preserved

#### Scenario: Form Field Sequence

- GIVEN a multi-step booking form
- WHEN a screen reader user navigates through fields
- THEN fields are announced in logical order: Name → Email → Phone → Address
- AND no hidden or out-of-order fields interrupt the flow
- AND the "Next" button follows the last field

#### Scenario: List Item Focus

- GIVEN a list of 50 service items
- WHEN a user taps an item to view details, then navigates back
- THEN focus returns to the selected item (not the top of the list)
- AND the user can continue from where they left off

**Edge Cases:**
- Nested interactive elements: Avoid buttons inside buttons
- Dynamic content: Manage focus when content loads or changes
- Sticky headers: Don't interfere with focus order

**Code Example:**

```tsx
// ✅ CORRECT: Focus management in modal
import { Modal, View, Pressable, Text } from 'react-native';
import { useRef, useEffect } from 'react';

const BookingModal = ({ visible, onClose, service }) => {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (visible && closeButtonRef.current) {
      // Focus close button when modal opens
      closeButtonRef.current.focus();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      transparent
      animationType="fade"
      accessibilityViewIsModal // Hide background from screen readers
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Pressable
            ref={closeButtonRef}
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close booking confirmation"
          >
            <Text>✕</Text>
          </Pressable>
          
          <Text style={styles.modalTitle} accessibilityRole="header">
            Booking Confirmation
          </Text>
          
          <Text style={styles.modalBody}>
            Your booking for {service.name} has been confirmed.
          </Text>
          
          <Pressable
            onPress={onClose}
            style={styles.primaryButton}
            accessibilityRole="button"
            accessibilityLabel="Done"
          >
            <Text>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

// Logical field order in form
const BookingForm = () => (
  <View style={styles.form}>
    <FormInput 
      label="Full Name" 
      required
      accessibilityLabel="Full Name, required"
    />
    <FormInput 
      label="Email" 
      required
      keyboardType="email-address"
      accessibilityLabel="Email, required"
    />
    <FormInput 
      label="Phone Number" 
      required
      keyboardType="phone-pad"
      accessibilityLabel="Phone Number, required"
    />
    <FormInput 
      label="Service Address" 
      required
      accessibilityLabel="Service Address, required"
    />
    <Pressable
      onPress={handleSubmit}
      style={styles.submitButton}
      accessibilityRole="button"
      accessibilityLabel="Submit booking"
    >
      <Text>Next</Text>
    </Pressable>
  </View>
);

// ❌ INCORRECT: Poor focus management
const BookingModal = ({ visible, onClose, service }) => (
  <Modal visible={visible} onRequestClose={onClose}>
    <View>
      {/* No focus management - user doesn't know modal opened */}
      {/* No accessibilityViewIsModal - background still accessible */}
      <Text>Booking Confirmation</Text>
      <Pressable onPress={onClose}>
        <Text>Close</Text>
        {/* No accessibility metadata */}
      </Pressable>
    </View>
  </Modal>
);
```

---

### Requirement: Dynamic Type Support

The system MUST support iOS Dynamic Type and Android font scaling to accommodate users with different visual needs.

**Rationale:** Users with low vision or reading difficulties rely on system-level font size settings. Apps that don't support dynamic type force these users to choose between readability and functionality.

**Technical Constraint:** All text elements MUST:
- Use `maxFontSizeMultiplier` to prevent extreme scaling when necessary
- Test layouts with font scaling at 200% and 300%
- Avoid fixed heights that clip scaled text
- Use `allowFontScaling` appropriately (default true for text content)

#### Scenario: Text Scaling at 200%

- GIVEN a user with iOS Dynamic Type set to "Accessibility Extra Large" (200% scale)
- WHEN viewing service cards
- THEN all text scales proportionally
- AND buttons remain tappable (don't overflow)
- AND layouts flex to accommodate larger text

#### Scenario: Clipping Prevention

- GIVEN a button with fixed height
- WHEN text scales to 200%
- THEN the button height adjusts to fit scaled text
- OR the text is truncated with ellipsis
- AND no text is clipped or hidden

#### Scenario: Non-Scaling Text (Rare Cases)

- GIVEN decorative text or precise UI elements (e.g., tab bar labels)
- WHEN text scaling is inappropriate
- THEN `allowFontScaling={false}` is set explicitly
- AND the decision is documented with a comment explaining why

**Code Example:**

```tsx
// ✅ CORRECT: Dynamic Type support
import { Text, Pressable, StyleSheet } from 'react-native';

const ServiceCard = ({ service }) => (
  <View style={styles.card}>
    <Text 
      style={styles.title}
      numberOfLines={2}
      ellipsizeMode="tail"
      maxFontSizeMultiplier={1.5} // Cap at 150% to prevent extreme overflow
    >
      {service.name}
    </Text>
    <Text 
      style={styles.category}
      maxFontSizeMultiplier={1.5}
    >
      {service.category}
    </Text>
  </View>
);

// Button with flexible height
const Button = ({ onPress, children }) => (
  <Pressable
    onPress={onPress}
    style={styles.button} // No fixed height
    accessibilityRole="button"
  >
    <Text 
      style={styles.buttonText}
      maxFontSizeMultiplier={2.0} // Allow up to 200% scaling
    >
      {children}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
    // No fixed height - allows growth for scaled text
  },
  title: {
    ...theme.typography.headline,
    marginBottom: theme.spacing.xs,
    // Text can scale up to 150%
  },
  button: {
    paddingVertical: theme.spacing.sm, // Flexible padding
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    // No fixed height - adjusts to text size
  },
  buttonText: {
    ...theme.typography.callout,
    color: 'white',
    textAlign: 'center',
  },
});

// ❌ INCORRECT: Fixed heights and no scaling control
const ServiceCard = ({ service }) => (
  <View style={styles.card}>
    <Text style={styles.title}>
      {service.name}
      {/* No maxFontSizeMultiplier - could overflow at extreme scales */}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    height: 120, // Fixed height clips scaled text!
  },
  title: {
    fontSize: 18,
    // No scaling considerations
  },
});
```

---

### Requirement: Color Contrast and Visual Accessibility

The system MUST meet WCAG AA color contrast requirements for all text and interactive elements.

**Rationale:** Users with low vision, color blindness, or viewing in bright sunlight need sufficient contrast to perceive text and UI elements.

**Technical Constraint:** All text and interactive elements MUST meet:
- **WCAG AA:** 4.5:1 contrast for normal text, 3:1 for large text (18pt+ or 14pt+ bold)
- **WCAG AAA (preferred):** 7:1 contrast for normal text, 4.5:1 for large text

#### Scenario: Text on Background

- GIVEN a service card with white background
- WHEN displaying primary text
- THEN the text color has minimum 4.5:1 contrast with background
- AND secondary text (smaller/lighter) still meets 4.5:1 or uses larger font

#### Scenario: Button Contrast

- GIVEN a primary action button with blue background
- WHEN displaying button label text
- THEN the white text has minimum 4.5:1 contrast with button color
- AND in pressed state, contrast remains sufficient

#### Scenario: Dark Mode Support

- GIVEN the app supports dark mode
- WHEN switching to dark mode
- THEN all text/background combinations meet contrast requirements
- AND color adjustments maintain visual hierarchy

**Color Contrast Examples:**

| Foreground | Background | Contrast | WCAG AA | WCAG AAA |
|------------|------------|----------|---------|----------|
| #000000 | #FFFFFF | 21:1 | ✅ Pass | ✅ Pass |
| #333333 | #FFFFFF | 12.6:1 | ✅ Pass | ✅ Pass |
| #666666 | #FFFFFF | 5.74:1 | ✅ Pass | ✅ Pass |
| #8E8E93 (iOS gray) | #FFFFFF | 3.5:1 | ❌ Fail | ❌ Fail |
| #FFFFFF | #007AFF | 4.5:1 | ✅ Pass | ❌ Fail |

**Code Example:**

```tsx
// ✅ CORRECT: Sufficient contrast
const ServiceCard = ({ service }) => (
  <View style={styles.card}>
    <Text style={styles.title}>{service.name}</Text>
    <Text style={styles.subtitle}>{service.category}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF', // White background
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000', // 21:1 contrast - excellent
  },
  subtitle: {
    fontSize: 14,
    color: '#666666', // 5.74:1 contrast - passes AA
  },
});

// ❌ INCORRECT: Insufficient contrast
const ServiceCard = ({ service }) => (
  <View style={styles.card}>
    <Text style={styles.title}>{service.name}</Text>
    <Text style={styles.subtitle}>{service.category}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 18,
    color: '#CCCCCC', // 1.6:1 contrast - fails AA!
  },
  subtitle: {
    fontSize: 14,
    color: '#D3D3D3', // 1.5:1 contrast - fails AA!
  },
});
```

---

## Non-Functional Requirements

### Accessibility Coverage Targets

| Category | Target | Priority |
|----------|--------|----------|
| **Interactive Elements with Roles** | 100% | CRITICAL |
| **Interactive Elements with Labels** | 80%+ | HIGH |
| **Screens Tested with VoiceOver** | Top 10 user flows | HIGH |
| **Screens Tested with TalkBack** | Top 5 user flows | MEDIUM |
| **WCAG AA Color Contrast** | 100% of text | HIGH |
| **Dynamic Type Support** | All text components | MEDIUM |

### Platform Parity

- **VoiceOver (iOS):** Primary accessibility testing platform
- **TalkBack (Android):** Secondary testing platform
- Both MUST provide equivalent experiences where platform capabilities allow

---

## Testing Requirements

### Requirement: Screen Reader Testing

The system MUST validate screen reader announcements for key user flows.

#### Test Scenario: Manual VoiceOver Test

**Test Procedure:**
1. Enable VoiceOver on iOS device (Settings > Accessibility > VoiceOver)
2. Navigate to service catalog screen
3. Swipe right to navigate through elements
4. Verify each element announces its role and label
5. Double-tap service card to navigate
6. Verify focus moves logically

**Expected Results:**
- [ ] All interactive elements are focusable
- [ ] Role and label announced for each element
- [ ] Hints provide action context
- [ ] Navigation is logical and complete
- [ ] No focus traps or dead ends

#### Test Scenario: Automated Accessibility Audit

```typescript
// Test: Verify accessibility props are present
import { render } from '@testing-library/react-native';

describe('ServiceCard Accessibility', () => {
  it('has complete accessibility metadata', () => {
    const service = {
      id: '1',
      name: 'House Cleaning',
      category: 'Home Services',
      price: '$50/hr',
    };
    
    const { getByRole } = render(
      <ServiceCard service={service} onPress={jest.fn()} />
    );
    
    const card = getByRole('button');
    
    // Verify role
    expect(card.props.accessibilityRole).toBe('button');
    
    // Verify label includes key info
    expect(card.props.accessibilityLabel).toContain('House Cleaning');
    expect(card.props.accessibilityLabel).toContain('Home Services');
    
    // Verify hint
    expect(card.props.accessibilityHint).toBeTruthy();
  });
  
  it('announces disabled state', () => {
    const { getByRole } = render(
      <Button disabled onPress={jest.fn()}>
        Book Service
      </Button>
    );
    
    const button = getByRole('button');
    expect(button.props.accessibilityState.disabled).toBe(true);
  });
});
```

### Requirement: Color Contrast Validation

The system MUST validate color contrast ratios meet WCAG AA standards.

#### Test Scenario: Contrast Checker

```typescript
// Test: Verify color contrast ratios
import { getContrastRatio } from '@/utils/colorContrast';
import { theme } from '@/theme';

describe('Color Contrast', () => {
  it('meets WCAG AA for primary text', () => {
    const ratio = getContrastRatio(
      theme.colors.textPrimary,
      theme.colors.background
    );
    
    // WCAG AA: 4.5:1 minimum for normal text
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
  
  it('meets WCAG AA for button text', () => {
    const ratio = getContrastRatio(
      '#FFFFFF', // Button text
      theme.colors.primary // Button background
    );
    
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
  
  it('meets WCAG AA for secondary text', () => {
    const ratio = getContrastRatio(
      theme.colors.textSecondary,
      theme.colors.background
    );
    
    // If using smaller font, may need 4.5:1
    // If 18pt+ or 14pt+ bold, 3:1 is acceptable
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });
});
```

### Manual Testing Checklist

For each screen:

**Screen Reader Testing:**
- [ ] Enable VoiceOver (iOS) or TalkBack (Android)
- [ ] Navigate through screen using swipe gestures
- [ ] Verify all interactive elements are announced
- [ ] Verify announcements are clear and helpful
- [ ] Test all user flows (view, select, submit, cancel)
- [ ] Verify focus returns correctly after modals/navigation

**Dynamic Type Testing:**
- [ ] Set system font size to largest accessibility size
- [ ] Verify all text is visible (not clipped)
- [ ] Verify buttons remain tappable
- [ ] Verify layouts flex appropriately

**Color Contrast Testing:**
- [ ] Use contrast checker tool (e.g., WebAIM)
- [ ] Verify all text meets WCAG AA (4.5:1 minimum)
- [ ] Test in bright sunlight/outdoors
- [ ] Test with system dark mode enabled

---

## Migration Guide

### Adding Accessibility to Existing Components

**Step 1:** Add accessibility roles

```tsx
// Before
<Pressable onPress={handlePress}>
  <Text>Book Service</Text>
</Pressable>

// After
<Pressable 
  onPress={handlePress}
  accessibilityRole="button"
>
  <Text>Book Service</Text>
</Pressable>
```

**Step 2:** Add labels and hints

```tsx
// Before
<Pressable 
  onPress={handlePress}
  accessibilityRole="button"
>
  <Image source={require('./icon.png')} />
</Pressable>

// After
<Pressable 
  onPress={handlePress}
  accessibilityRole="button"
  accessibilityLabel="View service details"
  accessibilityHint="Opens detailed information about this service"
>
  <Image source={require('./icon.png')} />
</Pressable>
```

**Step 3:** Add state information

```tsx
// Before
<Pressable 
  onPress={handlePress}
  disabled={isLoading}
  accessibilityRole="button"
  accessibilityLabel="Book Service"
>
  <Text>Book Service</Text>
</Pressable>

// After
<Pressable 
  onPress={handlePress}
  disabled={isLoading}
  accessibilityRole="button"
  accessibilityLabel="Book Service"
  accessibilityState={{
    disabled: isLoading,
    busy: isLoading,
  }}
>
  <Text>Book Service</Text>
</Pressable>
```

**Step 4:** Test with screen reader

1. Enable VoiceOver or TalkBack
2. Navigate to the component
3. Listen to the announcement
4. Verify it makes sense without visual context
5. Iterate on labels/hints as needed

---

## Success Criteria

### Definition of Done for Accessibility

A component/screen meets accessibility requirements when:

1. ✅ All interactive elements have `accessibilityRole`
2. ✅ All interactive elements have descriptive `accessibilityLabel`
3. ✅ Non-obvious actions have `accessibilityHint`
4. ✅ Dynamic states use `accessibilityState`
5. ✅ VoiceOver navigation is logical and complete
6. ✅ TalkBack navigation is logical and complete (Android)
7. ✅ Color contrast meets WCAG AA (4.5:1 minimum)
8. ✅ Text supports Dynamic Type / font scaling
9. ✅ Modals manage focus correctly
10. ✅ Form inputs have labels and error announcements

### Accessibility Coverage Goals

By end of Phase 3:
- **80%+ of interactive elements** have accessibility labels
- **100% of buttons** have accessibility roles
- **Top 10 user flows** tested with VoiceOver
- **Top 5 user flows** tested with TalkBack
- **All text** meets WCAG AA color contrast

---

## Related Requirements

- See `mobile-ui-components` spec for Pressable accessibility integration
- See `mobile-styling` spec for color contrast requirements
- See `vercel-react-native-skills/` for additional accessibility patterns
- See WCAG 2.1 AA guidelines: https://www.w3.org/WAI/WCAG21/quickref/

---

**End of Specification**
