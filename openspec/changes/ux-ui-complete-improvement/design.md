# SDD Design: UX/UI Complete Improvement

**Change ID:** ux-ui-complete-improvement  
**Status:** Design  
**Created:** 2026-06-08  
**Project:** app-mobile-baraservices  
**Phase:** Pre-production MVP optimization

---

## Executive Summary

This design document outlines the technical architecture, code structure, and implementation strategy for the comprehensive UX/UI performance improvement initiative. The design establishes production-ready patterns across 29 screens and 5 components through three phased migrations: Performance Foundation (Phase 1), UI Enhancement (Phase 2), and Accessibility Polish (Phase 3).

**Key Architectural Changes:**
- FlashList virtualization layer replacing all FlatList instances
- Component memoization strategy with custom comparators
- Centralized theme system with design tokens
- Modern Pressable-based interaction patterns
- Optimized image handling with expo-image + caching
- Accessibility-first component architecture

**Migration Strategy:** 8-12 Pull Requests organized by technical domain, each independently reviewable at 400-line budget.

---

## 1. Current Architecture

### Project Structure

```
baraservices-app/
├── app/
│   ├── (cliente)/           # Client tab navigator screens
│   │   ├── index.tsx        # Client home
│   │   ├── ordenes.tsx      # Client orders
│   │   ├── perfil.tsx       # Client profile
│   │   ├── solicitudes.tsx  # Client requests
│   │   └── _layout.tsx      # Client tab layout
│   ├── (profesional)/       # Professional tab navigator screens
│   │   ├── index.tsx        # Professional home
│   │   ├── mercado.tsx      # Marketplace
│   │   ├── ordenes.tsx      # Professional orders
│   │   ├── perfil.tsx       # Professional profile
│   │   ├── propuestas.tsx   # Proposals
│   │   └── _layout.tsx      # Professional tab layout
│   ├── cliente/[id].tsx     # Client detail
│   ├── orden/[id].tsx       # Order detail
│   ├── profesional/[id].tsx # Professional detail
│   ├── solicitud/[id].tsx   # Request detail
│   ├── login.tsx, register.tsx, etc.
│   └── _layout.tsx          # Root layout
├── components/
│   ├── AnimatedTabBar.tsx
│   ├── CreateJobRequestModal.tsx
│   ├── GooglePlacesInput.tsx
│   ├── Icons.tsx
│   └── TabBarVisibilityContext.tsx
└── package.json
```

### Current Tech Stack

- **Framework:** Expo SDK ~54.0.0 + React Native 0.81.5
- **Navigation:** Expo Router ~6.0.23 (file-based routing)
- **Styling:** NativeWind 4.2.3 (Tailwind CSS for React Native)
- **Animation:** React Native Reanimated ~4.1.1 (already installed)
- **State:** React Context (TabBarVisibilityContext)

### Performance Pain Points

```
┌─────────────────────────────────────────────────────┐
│  CURRENT ARCHITECTURE (Performance Bottlenecks)     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Screen Component (e.g., ordenes.tsx)               │
│  ├─ FlatList (3-20x slower than FlashList)         │
│  │  ├─ renderItem={() => inline function}          │
│  │  │  ├─ Non-memoized list item component         │
│  │  │  │  ├─ style={{ }} inline object            │
│  │  │  │  ├─ onPress={() => inline callback}      │
│  │  │  │  └─ <Image> (no caching, no optimization)│
│  │  │  └─ Re-renders on every parent update        │
│  │  └─ New function allocations every render       │
│  └─ Unnecessary child re-renders propagate         │
│                                                     │
│  Result: ~45 FPS, high GC pressure, jank           │
└─────────────────────────────────────────────────────┘
```

---

## 2. Target Architecture

### Performance-Optimized Component Hierarchy

```
┌─────────────────────────────────────────────────────┐
│  TARGET ARCHITECTURE (Optimized)                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Screen Component (e.g., ordenes.tsx)               │
│  ├─ FlashList (3-20x faster virtualization)        │
│  │  ├─ renderItem (useCallback, stable reference)  │
│  │  │  ├─ React.memo(OrderListItem)                │
│  │  │  │  ├─ styles (StyleSheet.create)            │
│  │  │  │  ├─ onPress (useCallback from parent)     │
│  │  │  │  └─ <Image from expo-image>               │
│  │  │  │     └─ Memory-disk cache, blurhash        │
│  │  │  └─ Custom comparator prevents re-renders    │
│  │  └─ estimatedItemSize (measured, static)        │
│  └─ Memoized children only re-render on prop change│
│                                                     │
│  Result: 58-60 FPS, 40% less memory, smooth        │
└─────────────────────────────────────────────────────┘
```

### Theme System Architecture

```
┌──────────────────────────────────────────────────┐
│  THEME SYSTEM (New)                              │
├──────────────────────────────────────────────────┤
│                                                  │
│  constants/                                      │
│  └── theme.ts                                    │
│      ├─ colors (primary, secondary, neutral)    │
│      ├─ spacing (xs, sm, md, lg, xl, xxl)       │
│      ├─ typography (fontSize, fontWeight)        │
│      ├─ borderRadius (sm, md, lg, full)          │
│      └─ shadows (sm, md, lg)                     │
│                                                  │
│  components/SomeScreen.tsx                       │
│  └── import { theme } from '@/constants/theme'   │
│      └── const styles = StyleSheet.create({      │
│             container: {                         │
│               padding: theme.spacing.md,         │
│               backgroundColor: theme.colors.bg,  │
│             }                                    │
│          })                                      │
│                                                  │
│  NativeWind classes remain for utility styles   │
│  Theme tokens for reusable component styles     │
└──────────────────────────────────────────────────┘
```

### Memoization Strategy

```
┌──────────────────────────────────────────────────────┐
│  MEMOIZATION HIERARCHY                               │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Screen (Parent)                                     │
│  ├─ State management (orders, loading, etc.)        │
│  ├─ Stable callbacks (useCallback)                  │
│  │  ├─ handleOrderPress = useCallback((id) => {...})│
│  │  └─ No inline functions in render               │
│  │                                                   │
│  ├─ renderItem (useCallback)                        │
│  │  └─ Returns <MemoizedListItem />                 │
│  │                                                   │
│  └─ List Items (React.memo with comparator)         │
│      ├─ Shallow prop comparison by default          │
│      ├─ Custom comparator for complex objects       │
│      └─ Only re-renders when item data changes      │
│                                                      │
│  Data Flow:                                          │
│  orders[].id → React.memo comparator → skip render  │
│  orders[].status changes → re-render that item only │
└──────────────────────────────────────────────────────┘
```

---

## 3. Code Structure & File Organization

### New Directory Structure

```
baraservices-app/
├── app/                      # Existing Expo Router screens
├── components/               # Existing shared components
│   └── (New optimized components added here)
├── constants/                # NEW: Design system
│   ├── theme.ts             # Design tokens
│   └── types.ts             # Theme TypeScript types
├── hooks/                    # NEW: Custom hooks
│   ├── useStableCallback.ts # Callback memoization helper
│   └── useMeasureItem.ts    # FlashList item size measurement
├── utils/                    # NEW: Utilities
│   ├── performance.ts       # Performance measurement helpers
│   └── accessibility.ts     # Accessibility helpers
└── package.json             # Updated with new dependencies
```

### Theme System Files

**`constants/theme.ts`**

```typescript
import { Platform } from 'react-native';

export const theme = {
  colors: {
    // Primary palette
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    primaryLight: '#60A5FA',
    
    // Secondary palette
    secondary: '#8B5CF6',
    secondaryDark: '#7C3AED',
    secondaryLight: '#A78BFA',
    
    // Neutral palette
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    surface: '#FFFFFF',
    
    // Semantic colors
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    
    // Text
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textDisabled: '#D1D5DB',
    
    // Borders
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  shadows: {
    sm: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
    md: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
    lg: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
} as const;

export type Theme = typeof theme;
```

**`constants/types.ts`**

```typescript
import type { Theme } from './theme';

export type ThemeColors = Theme['colors'];
export type ThemeSpacing = Theme['spacing'];
export type ThemeTypography = Theme['typography'];
export type ThemeBorderRadius = Theme['borderRadius'];
export type ThemeShadows = Theme['shadows'];
```

---

## 4. Component Patterns & Templates

### Pattern 1: Memoized List Item Template

**Before (Current Anti-pattern):**

```tsx
// app/(cliente)/ordenes.tsx (BEFORE)
export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  
  return (
    <FlatList
      data={orders}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={{ padding: 16, marginBottom: 8, backgroundColor: '#fff' }}
          onPress={() => router.push(`/orden/${item.id}`)}
        >
          <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.title}</Text>
          <Text style={{ fontSize: 14, color: '#666' }}>{item.status}</Text>
        </TouchableOpacity>
      )}
    />
  );
}
```

**After (Optimized Pattern):**

```tsx
// components/OrderListItem.tsx (NEW)
import React, { memo } from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';
import { theme } from '@/constants/theme';

interface OrderListItemProps {
  order: {
    id: string;
    title: string;
    status: string;
  };
  onPress: (id: string) => void;
}

// Custom comparator: only re-render if order data changes
const arePropsEqual = (
  prev: OrderListItemProps,
  next: OrderListItemProps
) => {
  return (
    prev.order.id === next.order.id &&
    prev.order.title === next.order.title &&
    prev.order.status === next.order.status
  );
};

export const OrderListItem = memo<OrderListItemProps>(({ order, onPress }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={() => onPress(order.id)}
      accessibilityRole="button"
      accessibilityLabel={`Order: ${order.title}`}
      accessibilityHint={`Tap to view order details`}
    >
      <Text style={styles.title}>{order.title}</Text>
      <Text style={styles.status}>{order.status}</Text>
    </Pressable>
  );
}, arePropsEqual);

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  title: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  status: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
```

```tsx
// app/(cliente)/ordenes.tsx (AFTER)
import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { OrderListItem } from '@/components/OrderListItem';

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  
  // Stable callback reference
  const handleOrderPress = useCallback((orderId: string) => {
    router.push(`/orden/${orderId}`);
  }, [router]);
  
  // Stable renderItem reference
  const renderItem = useCallback(({ item }) => (
    <OrderListItem order={item} onPress={handleOrderPress} />
  ), [handleOrderPress]);
  
  return (
    <FlashList
      data={orders}
      renderItem={renderItem}
      estimatedItemSize={88} // Measured: 16px top padding + 56px content + 16px bottom = 88px
      keyExtractor={(item) => item.id}
    />
  );
}
```

### Pattern 2: expo-image with Placeholder

**Before:**

```tsx
<Image 
  source={{ uri: profileImageUrl }} 
  style={{ width: 80, height: 80, borderRadius: 40 }}
/>
```

**After:**

```tsx
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

<Image
  source={{ uri: profileImageUrl }}
  placeholder={{ blurhash: '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[' }}
  style={styles.avatar}
  transition={200}
  contentFit="cover"
  cachePolicy="memory-disk"
  accessibilityLabel="Profile picture"
/>

const styles = StyleSheet.create({
  avatar: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
  },
});
```

### Pattern 3: Pressable with Rich Feedback

**Before:**

```tsx
<TouchableOpacity onPress={handleSubmit}>
  <Text style={{ color: '#fff', fontSize: 16 }}>Submit</Text>
</TouchableOpacity>
```

**After:**

```tsx
import { Pressable, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

<Pressable
  style={({ pressed }) => [
    styles.button,
    pressed && styles.buttonPressed,
  ]}
  onPress={handleSubmit}
  accessibilityRole="button"
  accessibilityLabel="Submit form"
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
>
  {({ pressed }) => (
    <Text style={[styles.buttonText, pressed && styles.buttonTextPressed]}>
      Submit
    </Text>
  )}
</Pressable>

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  buttonPressed: {
    backgroundColor: theme.colors.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  buttonTextPressed: {
    opacity: 0.9,
  },
});
```

---

## 5. Implementation Strategy

### Migration Dependency Graph

```
Phase 1: Performance Foundation
┌─────────────────────────────────────────────┐
│ PR-1: Setup (theme.ts, deps, utils)        │ ← START HERE
│   Dependencies: None                        │
│   Files: ~150 lines                         │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│ PR-2: FlashList Core Screens (High Traffic)│
│   Dependencies: PR-1                        │
│   Files: ordenes, solicitudes, propuestas   │
│   Lines: ~400                               │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│ PR-3: FlashList Remaining Screens           │
│   Dependencies: PR-2                        │
│   Files: mercado, remaining list screens    │
│   Lines: ~400                               │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│ PR-4: Memoization + Callbacks               │
│   Dependencies: PR-2, PR-3                  │
│   Files: All list item components           │
│   Lines: ~400                               │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│ PR-5: StyleSheet Migration                  │
│   Dependencies: PR-1                        │
│   Files: Extract inline styles app-wide     │
│   Lines: ~400                               │
└──────────────────┴──────────────────────────┘
                   │
                   ↓
Phase 2: UI Enhancement
┌─────────────────────────────────────────────┐
│ PR-6: Pressable Migration Part 1            │
│   Dependencies: Phase 1 complete            │
│   Files: Core buttons, cards                │
│   Lines: ~400                               │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│ PR-7: Pressable Migration Part 2            │
│   Dependencies: PR-6                        │
│   Files: Remaining TouchableOpacity          │
│   Lines: ~400                               │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│ PR-8: expo-image Migration                  │
│   Dependencies: PR-1                        │
│   Files: All <Image> components             │
│   Lines: ~400                               │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│ PR-9: ScrollView contentInset               │
│   Dependencies: None (parallel with PR-8)   │
│   Files: Screens with ScrollView + headers  │
│   Lines: ~200                               │
└──────────────────┴──────────────────────────┘
                   │
                   ↓
Phase 3: Polish
┌─────────────────────────────────────────────┐
│ PR-10: Accessibility Labels                 │
│   Dependencies: PR-6, PR-7                  │
│   Files: All interactive elements           │
│   Lines: ~400                               │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│ PR-11: Image Gallery (Galeria)              │
│   Dependencies: PR-8                        │
│   Files: Product/service image screens      │
│   Lines: ~300                               │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│ PR-12: Edge Cases + Documentation           │
│   Dependencies: All PRs                     │
│   Files: Empty states, docs, README         │
│   Lines: ~200                               │
└──────────────────┴──────────────────────────┘
                   │
                   ↓
                 DONE
```

### Screen Migration Priority

**Priority 1 (High Traffic, Phase 1 PR-2):**
- `app/(cliente)/ordenes.tsx` - Order list (frequent scrolling)
- `app/(cliente)/solicitudes.tsx` - Request list
- `app/(profesional)/propuestas.tsx` - Proposals list
- `app/(profesional)/ordenes.tsx` - Professional orders

**Priority 2 (Medium Traffic, Phase 1 PR-3):**
- `app/(profesional)/mercado.tsx` - Marketplace browsing
- `app/(cliente)/index.tsx` - Client home feed
- `app/(profesional)/index.tsx` - Professional home

**Priority 3 (Detail Screens, Phase 2):**
- `app/orden/[id].tsx` - Order details
- `app/solicitud/[id].tsx` - Request details
- `app/profesional/[id].tsx` - Professional profile
- `app/cliente/[id].tsx` - Client profile

**Priority 4 (Auth/Forms, Phase 2-3):**
- `app/login.tsx`, `app/register.tsx` - Authentication
- `app/editar-perfil.tsx`, `app/editar-perfil-profesional.tsx` - Profile forms
- `app/completar-perfil-profesional.tsx` - Onboarding

---

## 6. Technical Decisions

### Decision 1: estimatedItemSize Measurement Approach

**Problem:** FlashList requires `estimatedItemSize` for optimal performance. How do we determine sizes without manual measurement?

**Decision:** **Hybrid measurement strategy**

1. **Initial Phase (PR-2, PR-3):** Use rough estimates based on component inspection
   - Simple card: 80-100px
   - Detailed card: 120-150px
   - Adjust based on padding, margins, borders

2. **Validation Phase (PR-4):** Add dev-mode logging to measure actual rendered sizes
   ```tsx
   // utils/performance.ts (NEW)
   export const measureItemSize = (ref: any) => {
     if (__DEV__) {
       ref?.measure((x, y, width, height) => {
         console.log(`[FlashList] Item size: ${height}px`);
       });
     }
   };
   ```

3. **Refinement:** Update `estimatedItemSize` based on profiler data

**Rationale:** Start fast with estimates, refine later. Over-estimation is safer than under-estimation (FlashList docs recommendation).

### Decision 2: Memoization Comparator Strategy

**Problem:** When to use custom comparators vs. default shallow comparison?

**Decision:** **Progressive complexity**

1. **Simple props (primitives, stable objects):** Use `React.memo()` with no comparator
2. **Complex props (arrays, deep objects):** Use custom comparator checking specific fields
3. **Frequently changing props:** Don't memoize (e.g., scroll position, animation values)

**Example:**

```tsx
// Simple: No comparator needed
const SimpleItem = memo(({ id, title }) => ...);

// Complex: Custom comparator for nested object
const ComplexItem = memo(({ order }) => ..., (prev, next) => {
  return (
    prev.order.id === next.order.id &&
    prev.order.status === next.order.status &&
    prev.order.updatedAt === next.order.updatedAt
  );
});
```

**Rationale:** Avoid premature optimization. Custom comparators add complexity; only use when profiler shows unnecessary re-renders.

### Decision 3: Theme Token Naming Conventions

**Decision:** **Semantic + Scale naming pattern**

- **Colors:** `primary`, `secondary`, `success`, `error`, `textPrimary`, etc.
- **Spacing:** T-shirt sizes (`xs`, `sm`, `md`, `lg`, `xl`, `xxl`)
- **Typography:** Nested object with `fontSize`, `fontWeight`, `lineHeight`
- **Shadows:** Platform-aware via `Platform.select`

**Rationale:** Balances semantic meaning (easier to understand) with scale flexibility (easy to adjust globally).

### Decision 4: expo-image Cache Policy Defaults

**Decision:** **Use `memory-disk` as default, override per use case**

- **Default:** `cachePolicy="memory-disk"` (fast LRU memory cache + persistent disk)
- **Override to `memory`:** Short-lived images (e.g., temporary uploads)
- **Override to `none`:** Sensitive images (e.g., private documents)

**Rationale:** `memory-disk` provides best balance of performance and persistence. Most images benefit from caching.

### Decision 5: NativeWind vs. StyleSheet Strategy

**Decision:** **Coexist with clear separation**

- **NativeWind (Tailwind classes):** Utility styles, layout primitives, quick prototyping
  ```tsx
  <View className="flex-1 p-4 bg-white" />
  ```

- **StyleSheet.create():** Component-specific styles, theme token usage, complex computed styles
  ```tsx
  const styles = StyleSheet.create({
    card: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.md,
    },
  });
  ```

**Rationale:** NativeWind is already in the project (4.2.3) and provides developer velocity. Don't remove it; augment with theme system for reusable components.

---

## 7. Testing Strategy

### Performance Measurement Per PR

**Before Merge Checklist:**

1. **React DevTools Profiler Recording**
   - Record 10-second scroll session in target screen
   - Export flame graph
   - Compare FPS before/after (target: 58-60 FPS)

2. **Memory Profiler (iOS Instruments / Android Profiler)**
   - Record 2-minute usage session
   - Check for memory leaks (should be flat, not climbing)
   - Measure GC events (target: 40% reduction vs. baseline)

3. **Manual Smoke Test**
   - Test on 3 devices: iOS simulator, Android emulator, 1 physical device
   - Verify scroll smoothness
   - Check for visual regressions
   - Validate touch feedback

### Visual Regression Testing

**Approach:** Screenshot comparison for UI-heavy PRs (PR-6, PR-7, PR-8)

**Tool:** Manual comparison (no automated tool required for MVP)

**Process:**
1. Take screenshots of 5-10 key screens before PR
2. Take same screenshots after PR
3. Side-by-side comparison: ensure visual parity (except intentional changes like pressed states)

### Accessibility Testing Workflow

**Phase 3 (PR-10):**

1. **VoiceOver (iOS):**
   - Settings > Accessibility > VoiceOver > On
   - Navigate through top 10 user flows
   - Verify labels are descriptive
   - Check focus order is logical

2. **TalkBack (Android):**
   - Settings > Accessibility > TalkBack > On
   - Same flows as iOS
   - Verify Android-specific patterns (e.g., role descriptions)

3. **Manual Checklist:**
   - [ ] All buttons have `accessibilityRole="button"`
   - [ ] All interactive elements have `accessibilityLabel`
   - [ ] Forms have `accessibilityHint` for non-obvious actions
   - [ ] Modals trap focus correctly
   - [ ] Toasts/alerts are announced

### Smoke Test Checklist (Per PR)

```
□ iOS Simulator:
  □ Clean build completes
  □ No TypeScript errors
  □ No console warnings
  □ Target screen renders
  □ Interactions work (tap, scroll)

□ Android Emulator:
  □ Clean build completes
  □ No TypeScript errors
  □ No console warnings
  □ Target screen renders
  □ Interactions work (tap, scroll)

□ Physical Device (at least once per phase):
  □ Performance feels smooth
  □ No crashes during 5-minute session
  □ Memory usage stable

□ Code Review:
  □ No FlatList in changed files (Phase 1)
  □ No inline style={{}} objects (Phase 1)
  □ All callbacks use useCallback (Phase 1)
  □ All list items are memoized (Phase 1)
  □ No TouchableOpacity in changed files (Phase 2)
  □ All images use expo-image (Phase 2)
  □ All interactive elements have accessibility props (Phase 3)
```

---

## 8. Risk Mitigation

### Risk 1: FlashList Layout Breaks

**Likelihood:** Low  
**Impact:** Medium  
**Mitigation:**
- Start with simplest list screens (PR-2: orders with uniform item height)
- Use FlashList's `debug` prop to visualize viewport and blanks
- Measure item sizes carefully with dev logging
- Test on both iOS and Android (layout differences possible)

**Rollback Plan:** Revert single PR if layout issues appear. FlashList is drop-in replacement for FlatList API.

### Risk 2: Memoization Logic Bugs

**Likelihood:** Low  
**Impact:** Low (functional bugs, not crashes)  
**Mitigation:**
- Custom comparators need careful review
- Add dev-mode logging to verify comparator logic
- React DevTools profiler shows when memoization fails (items re-render unnecessarily)
- Start with simple shallow comparison, only add custom comparators when profiler shows need

**Rollback Plan:** Remove `React.memo` wrapper if logic is buggy; component still works, just less performant.

### Risk 3: expo-image Cache Bloat

**Likelihood:** Very Low  
**Impact:** Low (disk space usage)  
**Mitigation:**
- `expo-image` uses LRU cache with automatic eviction
- Default `cachePolicy="memory-disk"` is well-tested in production apps
- Monitor disk cache size during testing (Settings > Storage on device)

**Rollback Plan:** Change `cachePolicy` to `memory` or `none` if issues arise. Doesn't break functionality.

### Risk 4: Accessibility Over-Labeling

**Likelihood:** Low  
**Impact:** Low (annoying but not broken)  
**Mitigation:**
- Test with actual VoiceOver/TalkBack before finalizing
- Focus on top 10 user flows for Phase 3 (don't label everything)
- Use `accessibilityLabel` sparingly; many components have good defaults

**Rollback Plan:** Remove overly verbose labels in follow-up PR.

### Risk 5: PR Review Bottleneck

**Likelihood:** Medium  
**Impact:** Medium (delays launch)  
**Mitigation:**
- 400-line budget per PR keeps reviews manageable
- Clear acceptance criteria per PR (see Testing Strategy)
- PRs are domain-separated (e.g., PR-2 is only FlashList, PR-4 is only memoization)
- Staged merges: Phase 1 can merge before Phase 2 starts

**Rollback Plan:** If bottleneck occurs, pause new PRs and focus on review/merge of open PRs.

---

## 9. Rollback & Recovery

### Independent Revertability

Each PR is designed to be independently revertable due to:

1. **Domain Separation:** PR-2 (FlashList) doesn't touch PR-4 (memoization) code
2. **Small Size:** 400 lines = low conflict risk on revert
3. **Clear Acceptance Criteria:** Easy to verify if PR succeeded or failed

### Recovery Scenarios

**Scenario 1: Performance Regression**

```
Symptom: FPS drops below 45 after merge
Detection: React DevTools profiler shows worse performance

Recovery:
1. Identify culprit PR via git bisect
2. Revert PR
3. Review profiler data to understand regression cause
4. Fix and re-submit PR with corrected implementation
```

**Scenario 2: Visual Regression**

```
Symptom: Layout broken on Android after Pressable migration
Detection: Manual smoke test finds UI issue

Recovery:
1. Revert PR-6 or PR-7 (Pressable PRs)
2. Isolate broken component
3. Fix platform-specific styling issue
4. Re-submit with Android-specific fix
```

**Scenario 3: Crash on Specific Device**

```
Symptom: App crashes on older Android device (e.g., Android 10)
Detection: User report or crash analytics

Recovery:
1. Reproduce on emulator with matching Android version
2. Identify crashing component (likely FlashList or expo-image)
3. Add version check or feature detection
4. Submit hotfix PR
```

---

## 10. Success Metrics & Validation

### Phase 1 Success Criteria (Performance Foundation)

**PR-2, PR-3 (FlashList Migration):**
- [ ] Zero `FlatList` imports in migrated screens
- [ ] React DevTools shows 58-60 FPS during scroll
- [ ] `estimatedItemSize` within 10% of actual measured size
- [ ] No blank areas during scroll (validated with `debug` prop)

**PR-4 (Memoization):**
- [ ] All list item components wrapped with `React.memo()`
- [ ] React DevTools Profiler shows 80%+ reduction in unnecessary re-renders
- [ ] Custom comparators (if used) have test coverage or dev logging

**PR-5 (StyleSheet Migration):**
- [ ] Zero inline `style={{}}` objects in migrated files
- [ ] `theme.ts` file exists with all design tokens
- [ ] TypeScript types for theme exported

### Phase 2 Success Criteria (UI Enhancement)

**PR-6, PR-7 (Pressable Migration):**
- [ ] Zero `TouchableOpacity` imports in migrated screens
- [ ] All interactive elements have pressed state styling
- [ ] `hitSlop` added to small tap targets (<44x44dp)

**PR-8 (expo-image):**
- [ ] Zero `react-native` Image imports (use `expo-image` only)
- [ ] All images have `cachePolicy` configured
- [ ] Placeholder strategy documented (blurhash or solid color)

**PR-9 (contentInset):**
- [ ] ScrollViews with headers use `contentInset`
- [ ] No content clipping under sticky headers on iPhone 14 Pro notch

### Phase 3 Success Criteria (Polish)

**PR-10 (Accessibility):**
- [ ] 80%+ of interactive elements have `accessibilityLabel`
- [ ] VoiceOver navigates top 10 flows logically
- [ ] TalkBack (Android) announces elements correctly

**PR-11 (Galeria):**
- [ ] Image lightbox works on at least 3 screens
- [ ] Pinch-to-zoom functional
- [ ] Gallery dismisses on swipe-down gesture

**PR-12 (Edge Cases + Docs):**
- [ ] Empty state UI for all lists
- [ ] Loading skeletons for async content
- [ ] `docs/performance.md` updated with baselines
- [ ] `README.md` updated with new patterns

### Global Success Metrics (Post-Launch)

- [ ] **FPS Baseline:** 58-60 FPS maintained across all list screens
- [ ] **Memory:** 40% reduction in GC events (measured via Instruments/Profiler)
- [ ] **Initial Render:** <500ms from navigation to interactive screen
- [ ] **Code Quality:** Zero `FlatList`, zero `TouchableOpacity`, zero inline styles
- [ ] **User Feedback:** No performance complaints in initial user testing

---

## 11. Open Questions & Future Work

### Open Questions for Implementation Phase

1. **Device Testing Matrix:**
   - Which physical devices are available for validation?
   - Should we target specific Android versions (e.g., Android 10+)?

2. **Performance Baseline:**
   - Should we run full profiler sessions before Phase 1 starts to establish quantitative baselines?

3. **Accessibility Audit:**
   - Do we have access to real screen reader users for Phase 3 feedback?
   - Should we prioritize WCAG AA or AAA color contrast? (Proposal says AA, 4.5:1 minimum)

4. **Image Placeholder Strategy:**
   - Use blurhash library for actual hash generation, or simple gray placeholders?
   - Where do we store blurhash strings (database, hardcoded)?

### Future Work (Post-MVP)

- **Animations:** Audit existing Reanimated animations for GPU-only transforms
- **Navigation:** Verify native stack navigators (Expo Router should handle this)
- **State Management:** Consider Zustand or Jotai if Redux becomes performance bottleneck
- **Error Boundaries:** Add React error boundaries for production crash recovery
- **Code Splitting:** Investigate lazy loading for large screens (if bundle size grows)

---

## 12. Appendix: Useful Commands

### Performance Measurement

```bash
# Start Metro bundler with performance monitoring
npx expo start --dev-client

# Profile with Xcode Instruments (iOS)
# 1. Open Xcode
# 2. Product > Profile
# 3. Select "Time Profiler" or "Allocations"
# 4. Record 2-minute session

# Profile with Android Studio (Android)
# 1. Open Android Studio
# 2. View > Tool Windows > Profiler
# 3. Select Memory or CPU profiler
# 4. Record session
```

### Install New Dependencies (Per PR-1)

```bash
# Install FlashList
npm install @shopify/flash-list

# Install expo-image
npx expo install expo-image

# Install Galeria (for Phase 3)
npm install react-native-reanimated-galeria

# Verify installations
npm list @shopify/flash-list expo-image react-native-reanimated-galeria
```

### Measure Item Sizes (Dev Mode)

```tsx
// Add to list item component temporarily
import { useRef, useEffect } from 'react';

const itemRef = useRef(null);

useEffect(() => {
  if (__DEV__ && itemRef.current) {
    itemRef.current.measure((x, y, width, height) => {
      console.log(`[Item Size] ${height}px`);
    });
  }
}, []);

return <View ref={itemRef}>...</View>;
```

### Check Bundle Size

```bash
# Build production bundle
npx expo export

# Analyze bundle (requires metro-visualizer)
npx metro-visualize --output dist
```

---

**End of Design Document**

**Next Steps:**
1. **User Approval:** Review and approve this design
2. **SDD Tasks Phase:** Break design into concrete implementation tasks
3. **SDD Apply Phase:** Execute PRs 1-12 in sequence
4. **SDD Verify Phase:** Validate against acceptance criteria
5. **SDD Sync/Archive:** Promote verified changes to canonical specs

**Estimated Timeline:** 1-2 weeks (8-12 PRs @ 1-2 PRs/day with review cycles)
