# UX/UI Complete Improvement - Specifications Index

**Change ID:** ux-ui-complete-improvement  
**Created:** 2026-06-08  
**Project:** app-mobile-baraservices  
**Status:** Specification Complete

---

## Overview

This change establishes production-ready performance and UX patterns across all 29 screens and 5 shared components before MVP launch. The specifications are organized into five domain-specific documents that define comprehensive requirements, scenarios, and acceptance criteria.

---

## Specification Documents

### 1. Mobile List Performance (CRITICAL - Phase 1)

**File:** `specs/mobile-list-performance/spec.md`  
**Purpose:** Achieve 60fps scroll performance with minimal memory pressure

**Key Requirements:**
- FlashList migration for all virtualized lists
- List item memoization with React.memo()
- Callback stabilization with useCallback
- Stable key extractor functions

**Performance Targets:**
- List Scroll FPS: 45fps → 58-60fps
- Memory Usage: 40% reduction in GC events
- Initial Render: <500ms
- Re-render Isolation: Single item updates only

**Applicable Screens:** All 29 screens with lists (service catalog, booking history, search results, etc.)

---

### 2. Mobile UI Components (HIGH - Phase 2)

**File:** `specs/mobile-ui-components/spec.md`  
**Purpose:** Modern touch interaction patterns with superior UX

**Key Requirements:**
- Pressable for all touch interactions (replace TouchableOpacity)
- Pressed state styling via style functions
- Hit area optimization with hitSlop
- Platform-specific feedback (iOS opacity/scale, Android ripple)
- Comprehensive accessibility integration

**User Impact:**
- Consistent touch feedback across all interactive elements
- Better accessibility for screen reader users
- Native-feeling interactions per platform

**Applicable Components:** ~60 TouchableOpacity instances across all screens + 5 shared components

---

### 3. Mobile Image Handling (HIGH - Phase 2)

**File:** `specs/mobile-image-handling/spec.md`  
**Purpose:** Optimized image loading, caching, and rendering

**Key Requirements:**
- expo-image for all image rendering
- Blurhash placeholders for instant visual feedback
- Cache policy configuration per use case
- Content fit strategies for proper scaling
- Image gallery with zoom/pan gestures (react-native-reanimated-galeria)

**Performance Targets:**
- Cached Image Load: <100ms
- Network Image Load: <2s on 3G
- Memory Usage: <150MB for 50 images
- Cache Hit Rate: >80% for repeat views

**Applicable Screens:** All screens with images (service cards, detail screens, booking confirmations, galleries)

---

### 4. Mobile Styling (CRITICAL - Phase 1)

**File:** `specs/mobile-styling/spec.md`  
**Purpose:** Consistent, performant styling patterns

**Key Requirements:**
- StyleSheet.create() for all styles (zero inline objects)
- Centralized design token system (theme.ts)
- Array-based style composition (no object spreading)
- Pre-defined style variants for dynamic props

**Code Quality Impact:**
- Eliminates object allocation churn during renders
- Enables memoization optimizations
- Provides type-safe design tokens
- Ensures visual consistency

**Applicable:** All 29 screens + 5 shared components

---

### 5. Mobile Accessibility (MEDIUM - Phase 3)

**File:** `specs/mobile-accessibility/spec.md`  
**Purpose:** Comprehensive accessibility for all users

**Key Requirements:**
- Screen reader support (accessibilityRole, accessibilityLabel, accessibilityHint)
- Semantic structure with proper roles
- Focus management for modals and navigation
- Dynamic Type / font scaling support
- WCAG AA color contrast (4.5:1 minimum)

**Coverage Targets:**
- Interactive Elements with Roles: 100%
- Interactive Elements with Labels: 80%+
- WCAG AA Color Contrast: 100% of text
- Top 10 user flows tested with VoiceOver
- Top 5 user flows tested with TalkBack

**Applicable:** All 29 screens + 5 shared components

---

## Implementation Phases

### Phase 1: Performance Foundation (CRITICAL)
**Specs:** mobile-list-performance, mobile-styling  
**PRs:** 4-5 PRs @ 400 lines each  
**Dependencies:** @shopify/flash-list ^1.6.0

**Goal:** Establish 60fps baseline with invisible optimizations
- FlashList migration (all FlatList → FlashList)
- List item memoization (all list components wrapped with React.memo)
- Callback stabilization (all callbacks use useCallback)
- StyleSheet extraction (all inline styles → StyleSheet.create)

---

### Phase 2: UI Enhancement (HIGH)
**Specs:** mobile-ui-components, mobile-image-handling  
**PRs:** 3-4 PRs @ 400 lines each  
**Dependencies:** expo-image ^1.10.0

**Goal:** Modern React Native patterns with better UX
- Pressable migration (60+ TouchableOpacity → Pressable)
- expo-image adoption (all Image → expo-image with caching)
- Blurhash placeholders
- ScrollView contentInset for safe areas

---

### Phase 3: Polish (MEDIUM)
**Specs:** mobile-accessibility  
**PRs:** 2-3 PRs @ 400 lines each  
**Dependencies:** react-native-reanimated-galeria ^1.0.0

**Goal:** Accessibility and edge case handling
- Accessibility labels (80%+ coverage of interactive elements)
- Image galleries with zoom/pan
- Edge cases (empty states, loading, errors)

---

## Cross-Cutting Requirements

### All Phases Must:
1. ✅ Maintain zero functional regressions
2. ✅ Pass manual smoke tests on iOS and Android
3. ✅ Include TypeScript type safety
4. ✅ Follow Vercel React Native Skills patterns
5. ✅ Document patterns for future reference

### Testing Requirements (Per Spec):
- **mobile-list-performance:** React DevTools Profiler verification, FPS benchmarks
- **mobile-ui-components:** VoiceOver/TalkBack testing, touch feedback validation
- **mobile-image-handling:** Cache validation, load time measurement, memory profiling
- **mobile-styling:** ESLint no-inline-styles, theme token coverage
- **mobile-accessibility:** Screen reader testing, contrast checker, Dynamic Type testing

---

## Dependencies

### NPM Packages
```json
{
  "dependencies": {
    "@shopify/flash-list": "^1.6.0",      // Phase 1
    "expo-image": "^1.10.0",               // Phase 2
    "react-native-reanimated-galeria": "^1.0.0"  // Phase 3
  }
}
```

### Verification Required
- React Native Reanimated: Already installed? (Required by Galeria)
- Expo SDK Version: Ensure compatibility with expo-image

---

## Success Metrics

### Performance (Phase 1)
- [ ] List Scroll FPS: 58-60 fps on React DevTools Profiler
- [ ] Memory: 40% reduction in GC events during 2-min scroll
- [ ] Initial Render: <500ms from navigation to interactive
- [ ] Zero FlatList instances remaining
- [ ] Zero inline style objects remaining

### UX (Phase 2)
- [ ] Smooth scrolling: No perceived jank on 3 test devices
- [ ] Touch feedback: Immediate visual response on all interactions
- [ ] Image loading: Blur placeholders visible during load
- [ ] Cache hit rate: >80% for repeat image views

### Accessibility (Phase 3)
- [ ] 80%+ interactive elements have accessibility labels
- [ ] 100% buttons have accessibility roles
- [ ] VoiceOver navigation logical on top 10 flows
- [ ] TalkBack navigation logical on top 5 flows
- [ ] All text meets WCAG AA contrast (4.5:1)

---

## Risk Assessment

### Technical Risks (LOW)
- **FlashList layout issues:** Mitigated by careful `estimatedItemSize` measurement
- **Memoization logic bugs:** Mitigated by custom comparators and dev logging
- **expo-image cache issues:** Mitigated by well-tested library and fallback plan

### Process Risks (MEDIUM)
- **PR review bottleneck:** Mitigated by 400-line budget, domain separation
- **Merge conflicts:** Mitigated by phase-based batching, team communication

### Pre-Production Context (ADVANTAGE)
- No rollback coordination needed
- No feature flags required
- No A/B testing infrastructure needed
- Changes establish baseline quality before launch

---

## Relationship to Vercel React Native Skills

All specifications implement patterns from the loaded skill:

| Spec | Skill Rules Applied |
|------|-------------------|
| **mobile-list-performance** | list-performance-virtualize, list-performance-item-memo, list-performance-callbacks, list-performance-inline-objects |
| **mobile-ui-components** | ui-pressable, ui-menus, ui-measure-views |
| **mobile-image-handling** | ui-expo-image, ui-image-gallery, list-performance-images |
| **mobile-styling** | ui-styling, list-performance-inline-objects |
| **mobile-accessibility** | (Cross-cutting pattern, applies to all components) |

**Skill Location:** `.agents/skills/vercel-react-native-skills/SKILL.md`

---

## Next Steps

### SDD Design Phase
Create architecture diagrams and code structure for:
- Component hierarchy and data flow
- Memoization strategy across screens
- Theme system structure
- Migration sequence and dependencies

### SDD Tasks Phase
Break down into concrete implementation tasks:
- PR-by-PR task breakdown
- File-level change inventory
- Testing checklist per PR
- Review criteria

### SDD Apply Phase
Execute PRs 1-12 in sequence:
- Phase 1: PRs 1-5 (Performance Foundation)
- Phase 2: PRs 6-9 (UI Enhancement)
- Phase 3: PRs 10-12 (Polish)

---

## Related Documentation

- **Proposal:** `openspec/changes/ux-ui-complete-improvement/proposal.md`
- **Vercel React Native Skills:** `.agents/skills/vercel-react-native-skills/`
- **OpenSpec Config:** `openspec/config.yaml`

---

**End of Index**
