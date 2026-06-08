# Implementation Tasks: UX/UI Complete Improvement

**Change ID:** ux-ui-complete-improvement  
**Status:** Tasks Ready  
**Created:** 2026-06-08  
**Project:** app-mobile-baraservices  
**Context:** Pre-production MVP quality improvement

---

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 3,750-4,400 lines across 12 PRs |
| 400-line budget risk | Medium (6 PRs at ~400 lines, rest under) |
| Chained PRs recommended | Yes |
| Suggested split | Phase 1 (5 PRs) → Phase 2 (4 PRs) → Phase 3 (3 PRs) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

**Rationale:** Total scope is ~3,900 lines split across 12 independent PRs. Each PR is domain-separated (FlashList, memoization, Pressable, images, etc.) and can be reviewed independently. The three-phase approach creates natural break points for integration testing. Six PRs approach the 400-line budget but stay within it.

**Review Budget Breakdown:**
- PR-1: 150 lines (Low risk)
- PR-2: 400 lines (Medium risk - core migration)
- PR-3: 400 lines (Medium risk - remaining screens)
- PR-4: 400 lines (Medium risk - logic complexity)
- PR-5: 400 lines (Medium risk - app-wide changes)
- PR-6: 400 lines (Medium risk - many files)
- PR-7: 400 lines (Medium risk - remaining TouchableOpacity)
- PR-8: 400 lines (Medium risk - all images)
- PR-9: 200 lines (Low risk - targeted changes)
- PR-10: 400 lines (Medium risk - repetitive work)
- PR-11: 300 lines (Low risk - additive feature)
- PR-12: 200 lines (Low risk - polish)

---

**Plain-text guard lines for automation:**

```text
Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium
```

---

## Phase 1: Performance Foundation

### PR-1: Setup & Infrastructure (~150 lines)
**Goal:** Establish theme system, install dependencies, create utilities  
**Dependencies:** None - START HERE  
**Review Budget:** 150 lines  
**Branch:** `perf/setup-theme-and-deps`

#### Tasks:

- [ ] **Task 1.1: Install FlashList dependency**
  - **Files:** `package.json`, `package-lock.json`
  - **Action:** Run `npm install @shopify/flash-list@^1.6.0`
  - **Lines:** ~10-15 (package.json changes)
  - **Test:** 
    ```bash
    npm list @shopify/flash-list
    # Should show @shopify/flash-list@1.6.x
    npx expo start
    # Should compile without errors
    ```
  - **Acceptance:** Dependency installed, Metro bundler starts cleanly

- [ ] **Task 1.2: Install expo-image dependency**
  - **Files:** `package.json`, `package-lock.json`
  - **Action:** Run `npx expo install expo-image`
  - **Lines:** ~5-10
  - **Test:**
    ```bash
    npm list expo-image
    # Should show expo-image@1.x
    ```
  - **Acceptance:** Dependency compatible with current Expo SDK version

- [ ] **Task 1.3: Create theme constants file**
  - **Files:** `constants/theme.ts` (NEW)
  - **Action:** Create design tokens file with:
    - Color palette (primary, secondary, semantic, text)
    - Spacing scale (xs through xxl)
    - Typography (fontSize, fontWeight, lineHeight)
    - Border radius values
    - Shadow definitions (Platform.select for iOS/Android)
  - **Lines:** ~80-90
  - **Test:**
    ```bash
    # Create test file
    import { theme } from '@/constants/theme';
    console.log(theme.colors.primary);
    # Should compile and show color value
    ```
  - **Acceptance:** 
    - TypeScript compilation passes
    - Theme object exports correctly
    - All tokens use `as const` for type safety

- [ ] **Task 1.4: Create theme types file**
  - **Files:** `constants/types.ts` (NEW)
  - **Action:** Export TypeScript types for theme object
  - **Lines:** ~10-15
  - **Test:** Import types in dummy component, verify autocomplete works
  - **Acceptance:** TypeScript intellisense shows theme token suggestions

- [ ] **Task 1.5: Create performance utilities**
  - **Files:** `utils/performance.ts` (NEW)
  - **Action:** Create helper functions:
    - `measureItemSize(ref)` - Log rendered item heights in dev mode
    - `logRenderTime(componentName)` - Performance.now() wrapper
  - **Lines:** ~30-40
  - **Test:** Import in test component, verify dev logs appear
  - **Acceptance:** Dev-only logging (guarded by `__DEV__`)

- [ ] **Task 1.6: Update tsconfig paths (if needed)**
  - **Files:** `tsconfig.json`
  - **Action:** Ensure `@/constants/*` and `@/utils/*` path aliases work
  - **Lines:** ~5
  - **Test:** Import theme from any file using `@/constants/theme`
  - **Acceptance:** No TypeScript path resolution errors

**PR-1 Acceptance Criteria:**
- [ ] All dependencies installed and lock file updated
- [ ] `constants/theme.ts` created with complete design tokens
- [ ] `utils/performance.ts` created with dev helpers
- [ ] TypeScript compiles with no errors
- [ ] No runtime errors on iOS/Android simulator startup

---

### PR-2: FlashList Core Screens (~400 lines)
**Goal:** Migrate highest-traffic list screens to FlashList  
**Dependencies:** PR-1 (needs FlashList installed)  
**Review Budget:** 400 lines  
**Branch:** `perf/flashlist-core-screens`  
**Priority Screens:** Orders, requests, proposals (high scroll volume)

#### Tasks:

- [ ] **Task 2.1: Migrate app/(cliente)/ordenes.tsx**
  - **Files:** `app/(cliente)/ordenes.tsx`
  - **Action:**
    1. Replace `import { FlatList } from 'react-native'` with `import { FlashList } from '@shopify/flash-list'`
    2. Change `<FlatList>` to `<FlashList>`
    3. Measure typical OrderCard height → add `estimatedItemSize` prop
    4. Test scroll performance
  - **Lines:** ~50-60 (minimal changes, mostly prop additions)
  - **Measurement:** 
    ```tsx
    // Temporary: measure OrderCard height
    // Card has: 16px padding + 3 text lines (~60px) + 8px margin = ~84px
    estimatedItemSize={84}
    ```
  - **Test:**
    ```bash
    # Enable debug mode temporarily
    <FlashList ... debug />
    # Scroll list, check console for "Blanks visible" warnings
    # Should see 0 blanks or minimal blanks
    # React DevTools Profiler: measure FPS during scroll
    ```
  - **Acceptance:** 
    - Scroll FPS 55+ (up from ~45)
    - No blank areas during rapid scroll
    - All orders render correctly

- [ ] **Task 2.2: Migrate app/(cliente)/solicitudes.tsx**
  - **Files:** `app/(cliente)/solicitudes.tsx`
  - **Action:** Same as Task 2.1, but for requests screen
  - **Lines:** ~60-70 (more complex cards)
  - **Measurement:**
    ```tsx
    // RequestCard height: 16px padding + title + description + metadata + 8px margin
    // Estimate: ~120px
    estimatedItemSize={120}
    ```
  - **Test:** Same as Task 2.1
  - **Acceptance:** 
    - Smooth scroll on list with 20+ items
    - Pull-to-refresh still works
    - Filter/sort functionality preserved

- [ ] **Task 2.3: Migrate app/(profesional)/propuestas.tsx**
  - **Files:** `app/(profesional)/propuestas.tsx`
  - **Action:** Same as Task 2.1
  - **Lines:** ~60-70
  - **Measurement:**
    ```tsx
    // ProposalCard: similar to OrderCard
    estimatedItemSize={88}
    ```
  - **Test:** Same as Task 2.1
  - **Acceptance:** Proposals list scrolls smoothly

- [ ] **Task 2.4: Migrate app/(profesional)/ordenes.tsx**
  - **Files:** `app/(profesional)/ordenes.tsx`
  - **Action:** Same as Task 2.1
  - **Lines:** ~50-60
  - **Measurement:**
    ```tsx
    estimatedItemSize={84}
    ```
  - **Test:** Same as Task 2.1
  - **Acceptance:** Professional orders list performs well

- [ ] **Task 2.5: Add dev logging for item size validation**
  - **Files:** All migrated screens
  - **Action:** Temporarily add `measureItemSize` calls to verify estimates
  - **Lines:** ~20 (spread across 4 files)
  - **Test:**
    ```tsx
    // In renderItem, temporarily:
    import { measureItemSize } from '@/utils/performance';
    const itemRef = useRef(null);
    // ... in render:
    <View ref={itemRef} onLayout={() => measureItemSize(itemRef)}>
    // Check console logs: [FlashList] Item size: 86px
    // Compare to estimatedItemSize, adjust if off by >20%
    ```
  - **Acceptance:** Logged sizes match estimates ±20%

- [ ] **Task 2.6: Remove debug props before merge**
  - **Files:** All migrated screens
  - **Action:** Remove `debug` prop from FlashList
  - **Lines:** ~4-5
  - **Test:** Verify no debug output in console
  - **Acceptance:** Clean production code

**PR-2 Acceptance Criteria:**
- [ ] 4 core screens migrated from FlatList to FlashList
- [ ] No FlatList imports remain in these files
- [ ] `estimatedItemSize` set for all lists
- [ ] Scroll FPS measured at 55+ in React DevTools Profiler
- [ ] No visual regressions (layout, styling, interactions unchanged)
- [ ] Pull-to-refresh and other list features work
- [ ] TypeScript compiles with no errors
- [ ] Manual smoke test on iOS and Android passes

---

### PR-3: FlashList Remaining Screens (~400 lines)
**Goal:** Complete FlashList migration for all list-based screens  
**Dependencies:** PR-2 (pattern established)  
**Review Budget:** 400 lines  
**Branch:** `perf/flashlist-remaining`

#### Tasks:

- [ ] **Task 3.1: Migrate app/(profesional)/mercado.tsx**
  - **Files:** `app/(profesional)/mercado.tsx`
  - **Action:** Replace FlatList with FlashList
  - **Lines:** ~70-80 (potentially heterogeneous items)
  - **Measurement:**
    ```tsx
    // ServiceCard in marketplace varies: with/without images
    // Use getItemType for heterogeneous lists if needed
    estimatedItemSize={140} // Average of variants
    // OR:
    getItemType={(item) => item.hasImage ? 'with-image' : 'simple'}
    overrideItemLayout={(layout, item) => {
      layout.size = item.hasImage ? 180 : 100;
    }}
    ```
  - **Test:** Scroll mixed content (services with/without images)
  - **Acceptance:** Smooth scroll despite varying item heights

- [ ] **Task 3.2: Migrate app/(cliente)/index.tsx (if has list)**
  - **Files:** `app/(cliente)/index.tsx`
  - **Action:** Check if home screen has list; migrate if present
  - **Lines:** ~50-60 or skip if no list
  - **Test:** Home feed scrolls smoothly
  - **Acceptance:** FlatList removed (or N/A if no list)

- [ ] **Task 3.3: Migrate app/(profesional)/index.tsx (if has list)**
  - **Files:** `app/(profesional)/index.tsx`
  - **Action:** Same as 3.2 for professional dashboard
  - **Lines:** ~60-70
  - **Test:** Dashboard list (if any) performs well
  - **Acceptance:** FlashList or N/A

- [ ] **Task 3.4: Audit remaining FlatList usage**
  - **Files:** Entire `app/` directory
  - **Action:** 
    ```bash
    grep -r "from 'react-native'" app/ | grep FlatList
    # Should return only non-list uses or empty
    ```
  - **Lines:** 0 (audit task)
  - **Test:** Search codebase for `<FlatList`
  - **Acceptance:** Zero FlatList tags in app code (except imported components if any)

- [ ] **Task 3.5: Check shared components for FlatList**
  - **Files:** `components/` directory
  - **Action:** Check AnimatedTabBar, CreateJobRequestModal, etc. for FlatList
  - **Lines:** ~50 if found, 0 if not
  - **Test:** Import any components with lists, verify FlashList usage
  - **Acceptance:** No FlatList in shared components

- [ ] **Task 3.6: Update imports to use FlashList consistently**
  - **Files:** Any remaining files from audit
  - **Action:** Migrate any edge cases found
  - **Lines:** Variable
  - **Test:** Full app smoke test
  - **Acceptance:** Zero FlatList in codebase

**PR-3 Acceptance Criteria:**
- [ ] All list screens migrated to FlashList
- [ ] Grep for `FlatList` returns zero results in `app/` and `components/`
- [ ] Heterogeneous lists (if any) use `getItemType` + `overrideItemLayout`
- [ ] Performance stable across all screens
- [ ] Manual test: navigate through all tabs, no crashes

---

### PR-4: Memoization + Callbacks (~400 lines)
**Goal:** Stabilize list item components and callbacks to eliminate unnecessary re-renders  
**Dependencies:** PR-2, PR-3 (FlashList must be in place first)  
**Review Budget:** 400 lines  
**Branch:** `perf/memoization-callbacks`

#### Tasks:

- [ ] **Task 4.1: Create memoized OrderListItem component**
  - **Files:** `components/OrderListItem.tsx` (NEW)
  - **Action:**
    1. Extract inline renderItem from ordenes.tsx into separate component
    2. Wrap with `React.memo()`
    3. Add custom comparator for order object:
       ```tsx
       const arePropsEqual = (prev, next) => (
         prev.order.id === next.order.id &&
         prev.order.status === next.order.status &&
         prev.order.updatedAt === next.order.updatedAt
       );
       export const OrderListItem = memo(({ order, onPress }) => { ... }, arePropsEqual);
       ```
    4. Use StyleSheet.create for styles (reference theme.ts)
  - **Lines:** ~60-70
  - **Test:**
    ```tsx
    // Add dev logging:
    useEffect(() => {
      if (__DEV__) console.log(`[OrderListItem] Rendered: ${order.id}`);
    });
    // Scroll list → should see minimal log spam (only new items)
    // React DevTools Profiler: "Why did this render?" → should show props unchanged
    ```
  - **Acceptance:** 
    - Component memoized
    - Custom comparator prevents re-renders on parent updates
    - Styles use theme tokens

- [ ] **Task 4.2: Refactor app/(cliente)/ordenes.tsx to use memoized component**
  - **Files:** `app/(cliente)/ordenes.tsx`
  - **Action:**
    1. Import OrderListItem
    2. Wrap onPress in useCallback:
       ```tsx
       const handleOrderPress = useCallback((orderId: string) => {
         router.push(`/orden/${orderId}`);
       }, [router]);
       ```
    3. Extract renderItem to useCallback:
       ```tsx
       const renderItem = useCallback(({ item }) => (
         <OrderListItem order={item} onPress={handleOrderPress} />
       ), [handleOrderPress]);
       ```
    4. Pass renderItem to FlashList
  - **Lines:** ~40-50
  - **Test:** 
    - React DevTools: record scroll session → renderItem should have stable reference
    - Change parent state (e.g., refresh) → OrderListItem should NOT re-render unless data changed
  - **Acceptance:** 
    - useCallback wraps all callbacks
    - renderItem stable reference
    - List items don't re-render on parent state updates

- [ ] **Task 4.3: Create and integrate memoized RequestListItem**
  - **Files:** `components/RequestListItem.tsx` (NEW), `app/(cliente)/solicitudes.tsx`
  - **Action:** Same pattern as Task 4.1 + 4.2
  - **Lines:** ~80-90
  - **Test:** Same as Task 4.2
  - **Acceptance:** Requests list items memoized

- [ ] **Task 4.4: Create and integrate memoized ProposalListItem**
  - **Files:** `components/ProposalListItem.tsx` (NEW), `app/(profesional)/propuestas.tsx`
  - **Action:** Same pattern
  - **Lines:** ~80-90
  - **Test:** Same as Task 4.2
  - **Acceptance:** Proposals list items memoized

- [ ] **Task 4.5: Memoize professional orders list**
  - **Files:** `app/(profesional)/ordenes.tsx`
  - **Action:** Reuse OrderListItem component (same as Task 4.2)
  - **Lines:** ~40-50
  - **Test:** Same as Task 4.2
  - **Acceptance:** Professional orders memoized

- [ ] **Task 4.6: Validate memoization with React DevTools**
  - **Files:** All migrated screens
  - **Action:** 
    1. Open React DevTools Profiler
    2. Record 10-second scroll session on each screen
    3. Review flame graph: list items should show "memo" tag
    4. Force parent re-render (e.g., pull-to-refresh) → items should NOT render
  - **Lines:** 0 (validation task)
  - **Test:** Profiler shows 80%+ reduction in list item re-renders
  - **Acceptance:** Documented profiler screenshots or metrics

**PR-4 Acceptance Criteria:**
- [ ] All list item components extracted into separate files
- [ ] All list items wrapped with React.memo + custom comparators
- [ ] All callbacks use useCallback with correct dependencies
- [ ] renderItem functions use useCallback
- [ ] React DevTools Profiler shows stable component references
- [ ] Manual test: parent state changes don't cause list item flicker
- [ ] TypeScript compiles with no errors

---

### PR-5: StyleSheet Migration (~400 lines)
**Goal:** Eliminate all inline style objects, migrate to StyleSheet.create with theme tokens  
**Dependencies:** PR-1 (theme.ts must exist)  
**Review Budget:** 400 lines  
**Branch:** `perf/stylesheet-migration`

#### Tasks:

- [ ] **Task 5.1: Audit inline styles in app/ directory**
  - **Files:** Entire `app/` directory
  - **Action:**
    ```bash
    grep -r "style={{" app/ --include="*.tsx" | wc -l
    # Document baseline count
    ```
  - **Lines:** 0 (audit task)
  - **Test:** Baseline number of inline styles recorded
  - **Acceptance:** Count documented for tracking

- [ ] **Task 5.2: Migrate order screens (cliente + profesional)**
  - **Files:** `app/(cliente)/ordenes.tsx`, `app/(profesional)/ordenes.tsx`
  - **Action:**
    1. Find all `style={{...}}` instances
    2. Extract to `StyleSheet.create()` at bottom of file
    3. Replace theme hardcoded values with `theme.spacing.md`, etc.
    4. Example:
       ```tsx
       // BEFORE:
       <View style={{ padding: 16, marginBottom: 8 }}>
       
       // AFTER:
       <View style={styles.container}>
       
       const styles = StyleSheet.create({
         container: {
           padding: theme.spacing.md,
           marginBottom: theme.spacing.sm,
         },
       });
       ```
  - **Lines:** ~60-80
  - **Test:** Visual regression check (screenshot before/after)
  - **Acceptance:** Zero inline styles in these files

- [ ] **Task 5.3: Migrate request/proposal screens**
  - **Files:** `app/(cliente)/solicitudes.tsx`, `app/(profesional)/propuestas.tsx`
  - **Action:** Same as Task 5.2
  - **Lines:** ~80-100
  - **Test:** Visual parity maintained
  - **Acceptance:** Zero inline styles

- [ ] **Task 5.4: Migrate detail screens**
  - **Files:** `app/orden/[id].tsx`, `app/solicitud/[id].tsx`
  - **Action:** Same as Task 5.2
  - **Lines:** ~80-100
  - **Test:** Detail views render correctly
  - **Acceptance:** Zero inline styles

- [ ] **Task 5.5: Migrate shared components**
  - **Files:** `components/OrderListItem.tsx`, `components/RequestListItem.tsx`, `components/ProposalListItem.tsx` (from PR-4)
  - **Action:** Ensure StyleSheet already used (should be from PR-4), verify theme tokens
  - **Lines:** ~20-30 (verification + adjustments)
  - **Test:** Components render consistently
  - **Acceptance:** All components use theme tokens

- [ ] **Task 5.6: Final inline style audit**
  - **Files:** Entire codebase
  - **Action:**
    ```bash
    grep -r "style={{" app/ components/ --include="*.tsx"
    # Should return zero or only NativeWind dynamic cases
    ```
  - **Lines:** 0 (audit)
  - **Test:** Grep returns empty or approved exceptions
  - **Acceptance:** Zero inline styles except NativeWind dynamic (documented)

**PR-5 Acceptance Criteria:**
- [ ] All inline `style={{}}` objects removed
- [ ] All styles use StyleSheet.create()
- [ ] All hardcoded values replaced with theme tokens
- [ ] Visual regression test: app looks identical before/after
- [ ] Performance: no measurable change (baseline validation)
- [ ] TypeScript compiles with no errors

---

## Phase 2: UI Enhancement

### PR-6: Pressable Migration Part 1 (~400 lines)
**Goal:** Migrate core interaction components from TouchableOpacity to Pressable  
**Dependencies:** Phase 1 complete (optional, can run parallel)  
**Review Budget:** 400 lines  
**Branch:** `ui/pressable-core`

#### Tasks:

- [ ] **Task 6.1: Audit TouchableOpacity usage**
  - **Files:** Entire codebase
  - **Action:**
    ```bash
    grep -r "TouchableOpacity" app/ components/ --include="*.tsx" | wc -l
    # Document baseline (expected ~60+ instances)
    ```
  - **Lines:** 0 (audit)
  - **Test:** Baseline count recorded
  - **Acceptance:** Target instances identified

- [ ] **Task 6.2: Create reusable Button component with Pressable**
  - **Files:** `components/Button.tsx` (NEW or update existing)
  - **Action:**
    1. Create Button component using Pressable
    2. Support variants: primary, secondary, outline, ghost
    3. Add pressed state styling:
       ```tsx
       <Pressable
         style={({ pressed }) => [
           styles.button,
           styles[variant],
           pressed && styles.pressed,
         ]}
       >
       ```
    4. Add accessibility props
  - **Lines:** ~80-100
  - **Test:**
    ```tsx
    <Button variant="primary" onPress={...}>Submit</Button>
    // Press → should show visual feedback
    // Screen reader → should announce "Button, Submit"
    ```
  - **Acceptance:** Reusable Button component with all variants

- [ ] **Task 6.3: Migrate OrderListItem to Pressable**
  - **Files:** `components/OrderListItem.tsx`
  - **Action:** Replace TouchableOpacity wrapper with Pressable
  - **Lines:** ~30-40
  - **Test:** List items show pressed state, onPress works
  - **Acceptance:** No TouchableOpacity in component

- [ ] **Task 6.4: Migrate RequestListItem and ProposalListItem**
  - **Files:** `components/RequestListItem.tsx`, `components/ProposalListItem.tsx`
  - **Action:** Same as Task 6.3
  - **Lines:** ~40-50
  - **Test:** Press feedback works on both list types
  - **Acceptance:** Pressable migration complete

- [ ] **Task 6.5: Migrate core action buttons in main screens**
  - **Files:** `app/(cliente)/index.tsx`, `app/(profesional)/index.tsx`, primary CTAs
  - **Action:** Replace TouchableOpacity with Button component or Pressable
  - **Lines:** ~80-100
  - **Test:** All primary buttons show pressed state
  - **Acceptance:** ~30-40 instances migrated

- [ ] **Task 6.6: Add hitSlop to small touch targets**
  - **Files:** All migrated components
  - **Action:** Add `hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}` to icon-only buttons
  - **Lines:** ~20-30
  - **Test:** Small buttons (< 44x44 dp) easy to tap
  - **Acceptance:** Hit areas meet accessibility guidelines

**PR-6 Acceptance Criteria:**
- [ ] ~30-40 TouchableOpacity instances migrated to Pressable
- [ ] Reusable Button component created
- [ ] All migrated components show pressed state styling
- [ ] hitSlop added to small touch targets
- [ ] accessibilityRole="button" added to all Pressable
- [ ] Visual regression: buttons look identical (except pressed state enhancement)
- [ ] Manual test: press feedback feels responsive on iOS and Android

---

### PR-7: Pressable Migration Part 2 (~400 lines)
**Goal:** Complete TouchableOpacity removal  
**Dependencies:** PR-6 (pattern established)  
**Review Budget:** 400 lines  
**Branch:** `ui/pressable-complete`

#### Tasks:

- [ ] **Task 7.1: Migrate detail screens**
  - **Files:** `app/orden/[id].tsx`, `app/solicitud/[id].tsx`, `app/profesional/[id].tsx`, `app/cliente/[id].tsx`
  - **Action:** Replace all TouchableOpacity with Pressable
  - **Lines:** ~100-120
  - **Test:** All interactive elements in details work
  - **Acceptance:** Detail screens fully migrated

- [ ] **Task 7.2: Migrate form screens**
  - **Files:** `app/editar-perfil.tsx`, `app/editar-perfil-profesional.tsx`, `app/completar-perfil-profesional.tsx`
  - **Action:** Migrate form buttons and touchable elements
  - **Lines:** ~80-100
  - **Test:** Form submission buttons work, feedback clear
  - **Acceptance:** Forms use Pressable

- [ ] **Task 7.3: Migrate auth screens**
  - **Files:** `app/login.tsx`, `app/register.tsx`, `app/reset-password.tsx`
  - **Action:** Migrate auth buttons
  - **Lines:** ~60-80
  - **Test:** Login/register flows work, buttons responsive
  - **Acceptance:** Auth flows fully migrated

- [ ] **Task 7.4: Migrate remaining app screens**
  - **Files:** Any remaining screens with TouchableOpacity
  - **Action:** Complete migration
  - **Lines:** ~80-100
  - **Test:** Full app navigation, test all interactions
  - **Acceptance:** No TouchableOpacity in app/

- [ ] **Task 7.5: Check shared components**
  - **Files:** `components/` directory
  - **Action:** Migrate AnimatedTabBar, CreateJobRequestModal, etc. if needed
  - **Lines:** ~40-60
  - **Test:** Components work correctly
  - **Acceptance:** Components migrated or confirmed Pressable already used

- [ ] **Task 7.6: Final TouchableOpacity audit**
  - **Files:** Entire codebase
  - **Action:**
    ```bash
    grep -r "TouchableOpacity" app/ components/ --include="*.tsx"
    # Should return zero results
    ```
  - **Lines:** 0 (audit)
  - **Test:** Grep returns empty
  - **Acceptance:** Zero TouchableOpacity in codebase

**PR-7 Acceptance Criteria:**
- [ ] All remaining TouchableOpacity instances migrated
- [ ] Grep for TouchableOpacity returns zero results
- [ ] Full app smoke test: all screens navigable
- [ ] All buttons show consistent pressed state behavior
- [ ] No functional regressions (all onPress handlers work)
- [ ] TypeScript compiles with no errors

---

### PR-8: expo-image Migration (~400 lines)
**Goal:** Replace all React Native Image with expo-image for better performance and caching  
**Dependencies:** PR-1 (expo-image installed)  
**Review Budget:** 400 lines  
**Branch:** `ui/expo-image`

#### Tasks:

- [ ] **Task 8.1: Audit current Image usage**
  - **Files:** Entire codebase
  - **Action:**
    ```bash
    grep -r "from 'react-native'" app/ components/ | grep "Image"
    # Document count
    ```
  - **Lines:** 0 (audit)
  - **Test:** Baseline count recorded
  - **Acceptance:** Target images identified

- [ ] **Task 8.2: Create image configuration constants**
  - **Files:** `constants/image-config.ts` (NEW)
  - **Action:** 
    ```tsx
    export const IMAGE_CACHE_POLICY = 'memory-disk';
    export const IMAGE_TRANSITION = 200;
    export const DEFAULT_PLACEHOLDER = 'L00000fQfQfQfQfQfQfQfQfQfQfQ'; // Gray blurhash
    ```
  - **Lines:** ~20-30
  - **Test:** Import in component, values accessible
  - **Acceptance:** Centralized config exists

- [ ] **Task 8.3: Migrate profile/avatar images**
  - **Files:** `app/(cliente)/perfil.tsx`, `app/(profesional)/perfil.tsx`, `app/editar-perfil.tsx`, etc.
  - **Action:**
    1. Replace `import { Image } from 'react-native'` with `import { Image } from 'expo-image'`
    2. Add props:
       ```tsx
       <Image
         source={{ uri: imageUrl }}
         placeholder={DEFAULT_PLACEHOLDER}
         transition={IMAGE_TRANSITION}
         cachePolicy={IMAGE_CACHE_POLICY}
         contentFit="cover"
       />
       ```
    3. Keep existing style
  - **Lines:** ~60-80
  - **Test:** 
    - Profile images load with blur placeholder
    - Check Network tab: images cached (second load instant)
  - **Acceptance:** Profile images use expo-image

- [ ] **Task 8.4: Migrate list item images**
  - **Files:** `components/OrderListItem.tsx`, `components/RequestListItem.tsx`, `components/ProposalListItem.tsx`
  - **Action:** Same as Task 8.3
  - **Lines:** ~40-50
  - **Test:** Images in lists load smoothly, no blank frames
  - **Acceptance:** List images optimized

- [ ] **Task 8.5: Migrate detail screen images**
  - **Files:** `app/orden/[id].tsx`, `app/solicitud/[id].tsx`, `app/profesional/[id].tsx`, `app/cliente/[id].tsx`
  - **Action:** Same as Task 8.3, may have multiple images per screen
  - **Lines:** ~80-100
  - **Test:** Detail images show placeholder → transition smoothly
  - **Acceptance:** Detail images use expo-image

- [ ] **Task 8.6: Migrate marketplace/catalog images**
  - **Files:** `app/(profesional)/mercado.tsx`, service/product list screens
  - **Action:** Same as Task 8.3
  - **Lines:** ~60-80
  - **Test:** Scroll catalog, images load efficiently
  - **Acceptance:** Marketplace images optimized

- [ ] **Task 8.7: Final Image audit**
  - **Files:** Entire codebase
  - **Action:**
    ```bash
    grep -r "from 'react-native'" app/ components/ | grep "Image"
    # Should return zero or only expo-image imports
    ```
  - **Lines:** 0 (audit)
  - **Test:** No react-native Image imports
  - **Acceptance:** All images use expo-image

**PR-8 Acceptance Criteria:**
- [ ] All Image components migrated to expo-image
- [ ] All images have cachePolicy, placeholder, transition props
- [ ] Visual test: images show blur placeholder during load
- [ ] Network test: second load uses cache (instant)
- [ ] No react-native Image imports remain
- [ ] TypeScript compiles with no errors
- [ ] Manual test: no broken images across app

---

### PR-9: ScrollView contentInset (~200 lines)
**Goal:** Add contentInset to ScrollViews for proper safe area handling with sticky headers  
**Dependencies:** None (can run parallel with PR-8)  
**Review Budget:** 200 lines  
**Branch:** `ui/scrollview-contentinset`

#### Tasks:

- [ ] **Task 9.1: Audit ScrollView usage with headers**
  - **Files:** Entire codebase
  - **Action:** Find screens with ScrollView + sticky/absolute headers
  - **Lines:** 0 (audit)
  - **Test:** Identify target screens (likely detail screens, forms)
  - **Acceptance:** List of screens documented

- [ ] **Task 9.2: Add contentInset to detail screens**
  - **Files:** `app/orden/[id].tsx`, `app/solicitud/[id].tsx`, `app/profesional/[id].tsx`
  - **Action:**
    ```tsx
    <ScrollView
      contentInset={{ top: headerHeight }}
      contentOffset={{ y: -headerHeight }}
      scrollIndicatorInsets={{ top: headerHeight }}
    >
    ```
  - **Lines:** ~60-80
  - **Test:** 
    - Test on iPhone 14 Pro (notch device)
    - Scroll to top → content not clipped under header
    - Pull-to-refresh → content offset correct
  - **Acceptance:** No content clipping under headers

- [ ] **Task 9.3: Add contentInset to profile screens**
  - **Files:** `app/(cliente)/perfil.tsx`, `app/(profesional)/perfil.tsx`
  - **Action:** Same as Task 9.2 if applicable
  - **Lines:** ~40-60
  - **Test:** Profile content fully visible
  - **Acceptance:** Safe area respected

- [ ] **Task 9.4: Add contentInset to form screens**
  - **Files:** `app/editar-perfil.tsx`, `app/completar-perfil-profesional.tsx`
  - **Action:** Same as Task 9.2 if applicable
  - **Lines:** ~40-60
  - **Test:** Form fields not hidden under keyboard or headers
  - **Acceptance:** Forms fully accessible

- [ ] **Task 9.5: Test on notched devices**
  - **Files:** All migrated screens
  - **Action:** Manual test on iPhone with notch, iPhone with Dynamic Island, Android with punch-hole
  - **Lines:** 0 (test task)
  - **Test:** Content visible on all devices
  - **Acceptance:** No clipping issues documented

**PR-9 Acceptance Criteria:**
- [ ] contentInset added to all ScrollViews with headers
- [ ] Manual test on 3 device types: iPhone notch, Android punch-hole, iPad
- [ ] No content clipping under headers
- [ ] Scroll indicators positioned correctly
- [ ] TypeScript compiles with no errors

---

## Phase 3: Polish

### PR-10: Accessibility Labels (~400 lines)
**Goal:** Add accessibility labels to all interactive elements for screen reader support  
**Dependencies:** PR-6, PR-7 (Pressable migration complete)  
**Review Budget:** 400 lines  
**Branch:** `a11y/labels`

#### Tasks:

- [ ] **Task 10.1: Add accessibility to list items**
  - **Files:** `components/OrderListItem.tsx`, `components/RequestListItem.tsx`, `components/ProposalListItem.tsx`
  - **Action:**
    ```tsx
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Order: ${order.title}`}
      accessibilityHint="Tap to view order details"
    >
    ```
  - **Lines:** ~40-50
  - **Test:** VoiceOver announces "Order: [title], button. Tap to view order details."
  - **Acceptance:** All list items have labels

- [ ] **Task 10.2: Add accessibility to navigation elements**
  - **Files:** `app/(cliente)/_layout.tsx`, `app/(profesional)/_layout.tsx`, tab bar components
  - **Action:** Add accessibilityLabel to tabs
  - **Lines:** ~30-40
  - **Test:** VoiceOver navigates tabs correctly
  - **Acceptance:** Tab navigation accessible

- [ ] **Task 10.3: Add accessibility to form inputs**
  - **Files:** `app/login.tsx`, `app/register.tsx`, `app/editar-perfil.tsx`, form screens
  - **Action:**
    ```tsx
    <TextInput
      accessibilityLabel="Email address"
      accessibilityHint="Enter your email to log in"
      placeholder="Email"
    />
    ```
  - **Lines:** ~80-100
  - **Test:** VoiceOver announces input purpose
  - **Acceptance:** All inputs labeled

- [ ] **Task 10.4: Add accessibility to action buttons**
  - **Files:** All screens with primary actions (submit, save, cancel, delete, etc.)
  - **Action:** Add descriptive labels
  - **Lines:** ~100-120
  - **Test:** VoiceOver announces button purpose clearly
  - **Acceptance:** All buttons have meaningful labels

- [ ] **Task 10.5: Add accessibility to images**
  - **Files:** All screens with meaningful images (profiles, products, icons)
  - **Action:**
    ```tsx
    <Image
      accessibilityLabel="Profile picture of John Doe"
      // OR for decorative:
      accessibilityElementsHidden={true}
    />
    ```
  - **Lines:** ~60-80
  - **Test:** VoiceOver describes images or skips decorative ones
  - **Acceptance:** Meaningful images labeled, decorative hidden

- [ ] **Task 10.6: Test with VoiceOver and TalkBack**
  - **Files:** All screens
  - **Action:**
    1. iOS: Enable VoiceOver, navigate through app
    2. Android: Enable TalkBack, navigate through app
    3. Document issues or confusing labels
  - **Lines:** 0 (test task)
  - **Test:** Top 10 user flows navigable with screen reader
  - **Acceptance:** Logical focus order, all elements announced

**PR-10 Acceptance Criteria:**
- [ ] 80%+ of interactive elements have accessibilityLabel
- [ ] All buttons have accessibilityRole="button"
- [ ] All form inputs have labels and hints
- [ ] Images have labels (meaningful) or hidden (decorative)
- [ ] VoiceOver test: 10 core flows navigable
- [ ] TalkBack test: same flows work on Android
- [ ] No critical accessibility issues found
- [ ] TypeScript compiles with no errors

---

### PR-11: Image Gallery (Galeria) (~300 lines)
**Goal:** Add zoom and lightbox functionality for product/service images  
**Dependencies:** PR-8 (expo-image should be in place)  
**Review Budget:** 300 lines  
**Branch:** `feature/image-gallery`

#### Tasks:

- [ ] **Task 11.1: Install Galeria dependency**
  - **Files:** `package.json`
  - **Action:** 
    ```bash
    npm install react-native-reanimated-galeria
    ```
  - **Lines:** ~5-10
  - **Test:** 
    ```bash
    npm list react-native-reanimated-galeria
    # Verify reanimated is also present (peer dependency)
    ```
  - **Acceptance:** Galeria installed, no peer dependency warnings

- [ ] **Task 11.2: Create ImageGallery wrapper component**
  - **Files:** `components/ImageGallery.tsx` (NEW)
  - **Action:** Create reusable gallery component wrapping Galeria
  - **Lines:** ~80-100
  - **Test:** Render with test images, verify zoom works
  - **Acceptance:** Reusable gallery component created

- [ ] **Task 11.3: Add gallery to order detail screen**
  - **Files:** `app/orden/[id].tsx`
  - **Action:** 
    1. Replace Image with ImageGallery for order photos
    2. Support multiple images (if applicable)
  - **Lines:** ~40-50
  - **Test:** 
    - Tap image → opens lightbox
    - Pinch to zoom → image scales
    - Swipe down → dismisses gallery
  - **Acceptance:** Order images zoomable

- [ ] **Task 11.4: Add gallery to request detail screen**
  - **Files:** `app/solicitud/[id].tsx`
  - **Action:** Same as Task 11.3
  - **Lines:** ~40-50
  - **Test:** Request images support lightbox
  - **Acceptance:** Gallery functional

- [ ] **Task 11.5: Add gallery to professional profile**
  - **Files:** `app/profesional/[id].tsx`
  - **Action:** Add gallery for portfolio/work images
  - **Lines:** ~50-60
  - **Test:** Professional portfolio images zoomable
  - **Acceptance:** Gallery integrated

- [ ] **Task 11.6: Add gallery to marketplace (if applicable)**
  - **Files:** `app/(profesional)/mercado.tsx` or service detail screens
  - **Action:** Add gallery for service images
  - **Lines:** ~40-50
  - **Test:** Service images open in lightbox
  - **Acceptance:** Gallery works in marketplace

**PR-11 Acceptance Criteria:**
- [ ] Galeria installed and working
- [ ] ImageGallery wrapper component created
- [ ] Gallery added to 3-5 key screens with images
- [ ] Pinch-to-zoom functional on all galleries
- [ ] Swipe-down to dismiss works
- [ ] Multiple images support (if applicable)
- [ ] No crashes during zoom/pan interactions
- [ ] Manual test: gallery works on iOS and Android

---

### PR-12: Edge Cases + Documentation (~200 lines)
**Goal:** Handle edge cases, add empty states, document patterns  
**Dependencies:** All PRs (final polish)  
**Review Budget:** 200 lines  
**Branch:** `polish/edge-cases-docs`

#### Tasks:

- [ ] **Task 12.1: Add empty states to lists**
  - **Files:** All list screens (ordenes, solicitudes, propuestas, mercado)
  - **Action:** 
    ```tsx
    <FlashList
      data={orders}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text>No orders yet</Text>
        </View>
      }
      renderItem={...}
    />
    ```
  - **Lines:** ~60-80
  - **Test:** Clear data → empty state shows
  - **Acceptance:** All lists have empty states

- [ ] **Task 12.2: Add loading skeletons**
  - **Files:** Create `components/LoadingSkeleton.tsx`, integrate in list screens
  - **Action:** Show skeleton UI while data loads
  - **Lines:** ~50-60
  - **Test:** Simulate slow network → skeletons appear
  - **Acceptance:** Loading states look polished

- [ ] **Task 12.3: Update README with performance patterns**
  - **Files:** `README.md` or create `docs/performance.md`
  - **Action:** Document:
    - FlashList usage guidelines
    - Memoization patterns
    - Theme system usage
    - Pressable best practices
  - **Lines:** ~40-50 (markdown)
  - **Test:** Review by team
  - **Acceptance:** Patterns documented for future reference

- [ ] **Task 12.4: Document performance baselines**
  - **Files:** `docs/performance.md` or README
  - **Action:** Add measured metrics:
    - FPS before/after
    - Memory usage improvements
    - Initial render times
  - **Lines:** ~20-30
  - **Test:** Metrics accurate based on profiler data
  - **Acceptance:** Baseline metrics documented

- [ ] **Task 12.5: Create component library examples**
  - **Files:** `docs/components.md` or Storybook (if available)
  - **Action:** Document Button, ImageGallery, list item patterns
  - **Lines:** ~30-40
  - **Test:** Examples match actual usage
  - **Acceptance:** Component usage documented

**PR-12 Acceptance Criteria:**
- [ ] All lists have empty states
- [ ] Loading skeletons added to async content
- [ ] Performance patterns documented
- [ ] Baseline metrics recorded
- [ ] Component examples documented
- [ ] README.md updated with key changes
- [ ] No outstanding TODOs or FIXMEs in code
- [ ] Full app smoke test passes

---

## Testing Strategy Summary

### Per-PR Testing Checklist

For each PR, complete this checklist before requesting review:

**Build & Compile:**
- [ ] TypeScript compiles with no errors
- [ ] No ESLint warnings introduced
- [ ] Metro bundler starts cleanly

**Manual Smoke Test:**
- [ ] iOS simulator: target screens work
- [ ] Android emulator: target screens work
- [ ] No crashes during 5-minute usage session
- [ ] Visual parity maintained (or intentional changes documented)

**Performance Validation (Phase 1 PRs):**
- [ ] React DevTools Profiler recording captured
- [ ] FPS measured (target: 58-60)
- [ ] Memory profiler shows no leaks
- [ ] Screenshots of profiler data attached to PR

**Accessibility Testing (PR-10):**
- [ ] VoiceOver enabled: top 3 flows navigable
- [ ] TalkBack enabled: same flows work
- [ ] Focus order logical
- [ ] All elements announced correctly

**Regression Tests:**
- [ ] Pull-to-refresh works (list screens)
- [ ] Navigation works (back button, tab switching)
- [ ] Forms submit correctly
- [ ] Auth flows complete

---

## Risk Mitigation & Rollback

### Independent Revertability

Each PR is independently revertable because:
- **Domain Separation:** PRs don't overlap (FlashList ≠ Pressable ≠ Images)
- **Small Size:** 150-400 lines = low conflict risk
- **Clear Boundaries:** Each PR has defined file scope

### Rollback Scenarios

**Scenario 1: Performance Regression**
```
Symptom: FPS drops after PR-2 merge
Action: Revert PR-2, analyze profiler data
Fix: Adjust estimatedItemSize, re-submit
```

**Scenario 2: Visual Regression**
```
Symptom: Layout broken on Android after PR-6
Action: Revert PR-6, isolate broken component
Fix: Platform-specific styling, re-submit
```

**Scenario 3: Crash on Specific Device**
```
Symptom: App crashes on Android 10 after PR-8
Action: Revert PR-8, reproduce on emulator
Fix: Add version check or cachePolicy fallback
```

---

## Success Metrics

### Phase 1 Success Criteria (Performance Foundation)
- [ ] All FlatList replaced with FlashList
- [ ] All list items memoized
- [ ] All callbacks stabilized with useCallback
- [ ] All inline styles removed
- [ ] FPS 58-60 measured
- [ ] 40% reduction in GC events

### Phase 2 Success Criteria (UI Enhancement)
- [ ] All TouchableOpacity replaced with Pressable
- [ ] All images using expo-image
- [ ] contentInset added to ScrollViews
- [ ] Visual consistency maintained
- [ ] Touch feedback responsive

### Phase 3 Success Criteria (Polish)
- [ ] 80%+ accessibility coverage
- [ ] Image galleries functional
- [ ] Empty states added
- [ ] Documentation complete
- [ ] No critical edge cases

### Global Validation (Post-All PRs)
- [ ] Performance targets met (FPS, memory, render time)
- [ ] Code quality: zero FlatList, TouchableOpacity, inline styles
- [ ] User feedback: no performance complaints in testing
- [ ] Team feedback: patterns easy to follow for future work

---

## Implementation Timeline

**Estimated Timeline:** 1-2 weeks (12 PRs @ 1-2 PRs/day with review)

**Week 1: Phase 1 (Performance Foundation)**
- Day 1: PR-1 (Setup)
- Day 2-3: PR-2 (FlashList core)
- Day 4: PR-3 (FlashList remaining)
- Day 5: PR-4 (Memoization)
- Day 6-7: PR-5 (StyleSheet)

**Week 2: Phase 2 + 3 (UI Enhancement + Polish)**
- Day 1-2: PR-6, PR-7 (Pressable)
- Day 3: PR-8 (expo-image)
- Day 4: PR-9 (contentInset), PR-10 (Accessibility)
- Day 5: PR-11 (Gallery), PR-12 (Edge cases + docs)

**Buffer:** +2-3 days for review cycles, fixes, integration testing

---

## Appendix: Useful Commands

### Performance Measurement
```bash
# React DevTools Profiler
npx expo start
# Open React DevTools > Profiler > Record

# iOS Memory Profiling
# Xcode > Product > Profile > Allocations

# Android Memory Profiling
# Android Studio > View > Tool Windows > Profiler
```

### Dependency Installation
```bash
# Phase 1 Setup (PR-1)
npm install @shopify/flash-list@^1.6.0
npx expo install expo-image
npm install react-native-reanimated-galeria  # PR-11

# Verify installations
npm list @shopify/flash-list expo-image
```

### Auditing Commands
```bash
# Find FlatList usage
grep -r "FlatList" app/ components/ --include="*.tsx"

# Find inline styles
grep -r "style={{" app/ components/ --include="*.tsx" | wc -l

# Find TouchableOpacity
grep -r "TouchableOpacity" app/ components/ --include="*.tsx" | wc -l

# Find react-native Image imports
grep -r "from 'react-native'" app/ components/ --include="*.tsx" | grep "Image"
```

### Item Size Measurement (Dev Mode)
```tsx
// Temporary logging in list items
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

---

**End of Tasks Document**

**Ready for Implementation:** This task breakdown provides concrete, reviewable, file-specific implementation steps for all 12 PRs. Each task includes acceptance criteria, testing steps, and line estimates to maintain the 400-line review budget.

**Next Phase:** SDD Apply - Execute PRs in sequence, following this task list as the implementation checklist.
