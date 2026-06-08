# Mobile List Performance Specification

## Purpose

Establish high-performance virtualized list rendering patterns for all React Native screens in the BaraServices mobile app. This specification defines requirements for achieving 60fps scroll performance with minimal memory pressure across all list-based UI.

---

## Requirements

### Requirement: Virtualized List Implementation

The system MUST use FlashList for all virtualized list rendering instead of FlatList.

**Rationale:** FlashList provides 3-20x better performance through more efficient recycling and smaller memory footprint. It is the industry standard for production React Native apps with large datasets.

**Technical Constraint:** All lists with >10 items or dynamic data MUST use `@shopify/flash-list`.

#### Scenario: Service Catalog Scrolling

- GIVEN a user viewing the service catalog with 100+ items
- WHEN the user scrolls rapidly through the list
- THEN the scroll maintains 58-60 FPS without frame drops
- AND virtualization is confirmed via FlashList debug mode

#### Scenario: Booking History with Mixed Item Heights

- GIVEN a booking history list with variable item heights (simple bookings vs. complex multi-service bookings)
- WHEN the user scrolls through the list
- THEN FlashList correctly calculates `estimatedItemSize` based on measured average
- AND no visual layout jumps occur during scroll

#### Scenario: Empty List State

- GIVEN a list with zero items
- WHEN the component renders
- THEN FlashList renders the `ListEmptyComponent` without errors
- AND no performance warnings appear in console

**Edge Cases:**
- Lists with 0-10 items: FlashList still acceptable, no need to switch to ScrollView
- Nested lists: Avoid FlashList inside FlashList; use sections instead
- Pull-to-refresh: Compatible with FlashList's `onRefresh` prop

**Code Example:**

```tsx
// ✅ CORRECT: FlashList with estimated item size
import { FlashList } from '@shopify/flash-list';

const ServiceCatalogScreen = () => {
  return (
    <FlashList
      data={services}
      renderItem={renderServiceItem}
      estimatedItemSize={120} // Measured from typical card height
      keyExtractor={(item) => item.id}
    />
  );
};

// ❌ INCORRECT: FlatList
import { FlatList } from 'react-native';

const ServiceCatalogScreen = () => {
  return (
    <FlatList // Slow, high memory usage
      data={services}
      renderItem={renderServiceItem}
    />
  );
};
```

---

### Requirement: List Item Memoization

The system MUST memoize all list item components to prevent unnecessary re-renders.

**Rationale:** Non-memoized list items re-render on every parent update, even when their props haven't changed. This creates exponential performance degradation in large lists.

**Technical Constraint:** All components passed to `renderItem` MUST be wrapped with `React.memo()` with appropriate comparison logic.

#### Scenario: Service Card in Catalog

- GIVEN a service catalog list with 50 items
- WHEN the user interacts with a single item (e.g., favorites it)
- THEN only that specific item's component re-renders
- AND React DevTools Profiler shows other items as "Did not render"

#### Scenario: Custom Props Comparison

- GIVEN a list item that receives complex objects (e.g., service details, user profile)
- WHEN a parent state update occurs (e.g., search filter changes)
- THEN the memo comparison function correctly identifies unchanged items
- AND only items with changed props re-render

#### Scenario: Key Extractor Stability

- GIVEN a list with stable item IDs
- WHEN the list re-renders due to parent state change
- THEN the `keyExtractor` function returns consistent keys for each item
- AND no "key changed" warnings appear in console

**Edge Cases:**
- Items with callbacks: Must stabilize callbacks with `useCallback` to prevent memo bypass
- Items with inline styles: Must extract to StyleSheet to prevent memo bypass
- Deep object props: May need custom `arePropsEqual` comparator

**Code Example:**

```tsx
// ✅ CORRECT: Memoized item with stable props
const ServiceCard = React.memo(({ 
  service, 
  onPress 
}: { 
  service: Service; 
  onPress: (id: string) => void 
}) => (
  <Pressable style={styles.card} onPress={() => onPress(service.id)}>
    <Text>{service.name}</Text>
  </Pressable>
));

const ServiceList = () => {
  const handlePress = useCallback((id: string) => {
    navigation.navigate('ServiceDetail', { id });
  }, [navigation]);

  const renderItem = useCallback(({ item }: { item: Service }) => (
    <ServiceCard service={item} onPress={handlePress} />
  ), [handlePress]);

  return (
    <FlashList
      data={services}
      renderItem={renderItem}
      estimatedItemSize={120}
    />
  );
};

// ❌ INCORRECT: Non-memoized component with unstable callback
const ServiceList = () => {
  return (
    <FlashList
      data={services}
      renderItem={({ item }) => (
        <View style={styles.card}> {/* Re-renders every time */}
          <Pressable onPress={() => navigate('Detail', { id: item.id })}>
            <Text>{item.name}</Text>
          </Pressable>
        </View>
      )}
    />
  );
};
```

---

### Requirement: Callback Stabilization

The system MUST stabilize all callback functions passed to list items using `useCallback` with correct dependencies.

**Rationale:** Callback functions recreated on every render force child component re-renders, bypassing memoization benefits.

**Technical Constraint:** All callbacks passed to memoized components MUST use `useCallback` or be defined outside the component.

#### Scenario: Navigation Callback

- GIVEN a list of services with navigation to detail screens
- WHEN the parent component re-renders due to unrelated state change
- THEN the `onPress` callback reference remains stable
- AND memoized list items do not re-render

#### Scenario: Multi-Parameter Callbacks

- GIVEN a callback that needs both item data and external context (e.g., current user ID)
- WHEN implementing with `useCallback`
- THEN all dependencies are correctly listed in the dependency array
- AND the callback correctly closes over current values

#### Scenario: Callback with No Dependencies

- GIVEN a callback that only uses passed parameters (e.g., `onPress={(id) => doSomething(id)}`)
- WHEN wrapped in `useCallback`
- THEN the dependency array is empty `[]`
- AND the callback is created only once

**Edge Cases:**
- Callbacks that use props: Include props in dependency array or use ref pattern
- Callbacks that need latest state: Use `useRef` for non-reactive values
- Event handlers with event object: Curry the item ID to avoid inline functions

**Code Example:**

```tsx
// ✅ CORRECT: Stable callbacks
const ServiceList = ({ userId }: { userId: string }) => {
  const handlePress = useCallback((serviceId: string) => {
    analytics.track('service_viewed', { userId, serviceId });
    navigation.navigate('ServiceDetail', { id: serviceId });
  }, [userId, navigation]); // Correct dependencies

  const handleFavorite = useCallback((serviceId: string) => {
    dispatch(toggleFavorite(serviceId));
  }, [dispatch]);

  const renderItem = useCallback(({ item }: { item: Service }) => (
    <ServiceCard 
      service={item} 
      onPress={handlePress}
      onFavorite={handleFavorite}
    />
  ), [handlePress, handleFavorite]);

  return <FlashList data={services} renderItem={renderItem} />;
};

// ❌ INCORRECT: Unstable callbacks
const ServiceList = ({ userId }: { userId: string }) => {
  return (
    <FlashList
      data={services}
      renderItem={({ item }) => (
        <ServiceCard 
          service={item}
          // New function every render!
          onPress={() => {
            analytics.track('service_viewed', { userId, serviceId: item.id });
            navigation.navigate('ServiceDetail', { id: item.id });
          }}
        />
      )}
    />
  );
};
```

---

### Requirement: Key Extractor Function Stability

The system MUST provide stable `keyExtractor` functions to FlashList.

**Rationale:** Unstable key extractor functions or inline definitions cause FlashList to recalculate keys on every render, negating performance benefits.

**Technical Constraint:** `keyExtractor` MUST be defined outside component or wrapped in `useCallback`.

#### Scenario: Simple ID Extraction

- GIVEN a list of items with unique `id` field
- WHEN providing `keyExtractor` to FlashList
- THEN the function is defined once and reused across renders
- AND no unnecessary key recalculations occur

#### Scenario: Composite Keys

- GIVEN items that need composite keys (e.g., `${categoryId}-${itemId}`)
- WHEN implementing `keyExtractor`
- THEN the function is stable via `useCallback` or external definition
- AND keys remain consistent across renders

**Code Example:**

```tsx
// ✅ CORRECT: Stable key extractor
const keyExtractor = (item: Service) => item.id; // Defined outside

const ServiceList = () => (
  <FlashList
    data={services}
    renderItem={renderItem}
    keyExtractor={keyExtractor}
  />
);

// Alternative: useCallback if logic depends on props
const ServiceList = ({ prefix }: { prefix: string }) => {
  const keyExtractor = useCallback(
    (item: Service) => `${prefix}-${item.id}`,
    [prefix]
  );

  return (
    <FlashList
      data={services}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
    />
  );
};

// ❌ INCORRECT: Inline key extractor
const ServiceList = () => (
  <FlashList
    data={services}
    renderItem={renderItem}
    keyExtractor={(item) => item.id} // New function every render
  />
);
```

---

## Non-Functional Requirements

### Performance Targets

| Metric | Baseline | Target | Priority |
|--------|----------|--------|----------|
| **List Scroll FPS** | 45-50 fps | 58-60 fps | CRITICAL |
| **Memory Usage (2min scroll)** | High GC pressure | 40% reduction in GC events | CRITICAL |
| **Initial List Render** | ~800ms | <500ms | HIGH |
| **Re-render Count (single item change)** | All items | 1 item only | CRITICAL |

**Measurement Method:**
- Use React DevTools Profiler for render counts and timing
- Use Xcode Instruments (iOS) or Android Studio Profiler for memory/FPS
- Record 30-second scroll sessions on mid-tier devices

### Compatibility Requirements

The system MUST maintain compatibility with:
- React Native 0.72+
- Expo SDK 50+
- TypeScript 5.x
- Existing navigation patterns (React Navigation)
- Existing state management (Redux/Context)

### Device Requirements

Optimizations MUST deliver target performance on:
- **iOS:** iPhone 11 or newer
- **Android:** Mid-tier devices with 4GB RAM (e.g., Samsung Galaxy A series)
- **Screen Sizes:** 4.7" to 6.7" displays

---

## Testing Requirements

### Requirement: Performance Benchmarking

The system MUST provide repeatable performance benchmarks for list rendering.

#### Test Scenario: Baseline Measurement

```typescript
// Test: Measure list scroll FPS
describe('ServiceCatalog Performance', () => {
  it('maintains 58+ FPS during rapid scroll', async () => {
    const { getByTestId } = render(<ServiceCatalogScreen />);
    const list = getByTestId('service-list');
    
    // Start profiler
    const profiler = startReactProfiler();
    
    // Simulate rapid scroll
    await scrollList(list, { duration: 5000, speed: 'fast' });
    
    // Get FPS metrics
    const metrics = profiler.stop();
    expect(metrics.averageFPS).toBeGreaterThanOrEqual(58);
  });
});
```

### Requirement: Memoization Validation

The system MUST validate that memoization prevents unnecessary re-renders.

#### Test Scenario: Item Isolation

```typescript
// Test: Verify only changed item re-renders
describe('ServiceCard Memoization', () => {
  it('prevents re-renders for unchanged items', () => {
    const renderSpy = jest.fn();
    const services = [
      { id: '1', name: 'Service 1' },
      { id: '2', name: 'Service 2' },
    ];
    
    const { rerender } = render(
      <ServiceList services={services} renderSpy={renderSpy} />
    );
    
    // Initial render: both items render once
    expect(renderSpy).toHaveBeenCalledTimes(2);
    
    // Change one item
    const updatedServices = [
      { id: '1', name: 'Service 1 Updated' },
      { id: '2', name: 'Service 2' }, // Unchanged
    ];
    
    renderSpy.mockClear();
    rerender(<ServiceList services={updatedServices} renderSpy={renderSpy} />);
    
    // Only changed item should re-render
    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(renderSpy).toHaveBeenCalledWith({ id: '1', name: 'Service 1 Updated' });
  });
});
```

### Manual Testing Checklist

For each screen with FlashList:

- [ ] Scroll rapidly through list: No frame drops visible
- [ ] Enable FlashList debug overlay: Green cells indicate proper recycling
- [ ] React DevTools Profiler: Verify memoization working (gray bars for non-rendered items)
- [ ] Test on mid-tier device: Performance meets target
- [ ] Empty list: Renders empty state without errors
- [ ] Pull-to-refresh: Works smoothly without crashes
- [ ] Navigation back: List position restored correctly

---

## Migration Guide

### From FlatList to FlashList

**Step 1:** Install dependency

```bash
npx expo install @shopify/flash-list
```

**Step 2:** Measure typical item height

```tsx
// Use onLayout to measure in development
<View onLayout={(e) => console.log('Item height:', e.nativeEvent.layout.height)}>
  {/* Your item content */}
</View>
```

**Step 3:** Replace import and add estimatedItemSize

```tsx
// Before
import { FlatList } from 'react-native';

// After
import { FlashList } from '@shopify/flash-list';

// Add estimatedItemSize prop
<FlashList
  data={data}
  renderItem={renderItem}
  estimatedItemSize={120} // Use measured value
/>
```

**Step 4:** Verify in debug mode

```tsx
<FlashList
  data={data}
  renderItem={renderItem}
  estimatedItemSize={120}
  debug // Shows recycling overlay in development
/>
```

### Adding Memoization to Existing Components

**Step 1:** Extract item component

```tsx
// Before: Inline component
<FlashList
  data={items}
  renderItem={({ item }) => (
    <View>
      <Text>{item.name}</Text>
    </View>
  )}
/>

// After: Extracted component
const ListItem = ({ item }) => (
  <View>
    <Text>{item.name}</Text>
  </View>
);

<FlashList
  data={items}
  renderItem={({ item }) => <ListItem item={item} />}
/>
```

**Step 2:** Add React.memo

```tsx
const ListItem = React.memo(({ item }: { item: ItemType }) => (
  <View>
    <Text>{item.name}</Text>
  </View>
));
```

**Step 3:** Stabilize renderItem and callbacks

```tsx
const ListScreen = () => {
  const handlePress = useCallback((id: string) => {
    // Handle press
  }, []);

  const renderItem = useCallback(({ item }) => (
    <ListItem item={item} onPress={handlePress} />
  ), [handlePress]);

  return (
    <FlashList
      data={items}
      renderItem={renderItem}
      estimatedItemSize={80}
    />
  );
};
```

---

## Success Criteria

### Definition of Done for List Performance

A screen meets list performance requirements when:

1. ✅ Uses FlashList for all virtualized lists
2. ✅ All list items are memoized with `React.memo()`
3. ✅ All callbacks use `useCallback` or are defined outside component
4. ✅ `keyExtractor` is stable (not inline)
5. ✅ No inline style objects in list items
6. ✅ Scroll FPS measured at 58+ on React DevTools Profiler
7. ✅ React DevTools shows non-changed items as "Did not render"
8. ✅ Manual testing shows smooth scrolling on mid-tier devices
9. ✅ No console warnings from FlashList
10. ✅ Empty states render correctly

### Regression Prevention

The system MUST NOT:
- Break existing list functionality (sort, filter, search)
- Remove pull-to-refresh capability
- Break navigation from list items
- Cause layout shifts or visual regressions
- Introduce new console errors or warnings

---

## Related Requirements

- See `mobile-styling` spec for StyleSheet requirements
- See `mobile-ui-components` spec for Pressable requirements
- See `vercel-react-native-skills/rules/list-performance-*` for detailed rule explanations

---

**End of Specification**
