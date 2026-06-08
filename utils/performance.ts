/**
 * Performance measurement utilities
 * Dev-only helpers for profiling and debugging
 */

/**
 * Measures and logs the rendered height of a component
 * Use in FlashList items to verify estimatedItemSize accuracy
 * 
 * @param ref - React ref to the component
 * @param componentName - Optional name for logging clarity
 * 
 * @example
 * const itemRef = useRef(null);
 * useEffect(() => {
 *   measureItemSize(itemRef, 'OrderCard');
 * }, []);
 * return <View ref={itemRef}>...</View>;
 */
export function measureItemSize(
  ref: React.RefObject<any>,
  componentName?: string
): void {
  if (!__DEV__) return;
  
  if (!ref.current) {
    console.warn('[Performance] measureItemSize: ref is null');
    return;
  }
  
  ref.current.measure(
    (x: number, y: number, width: number, height: number) => {
      const name = componentName ? `[${componentName}]` : '';
      console.log(`[FlashList Item Size] ${name} ${Math.round(height)}px`);
    }
  );
}

/**
 * Logs component render time
 * Wrap around expensive operations to identify bottlenecks
 * 
 * @param componentName - Name to identify in logs
 * @param operation - Function to measure
 * 
 * @example
 * const result = logRenderTime('ExpensiveCalculation', () => {
 *   return heavyComputation(data);
 * });
 */
export function logRenderTime<T>(
  componentName: string,
  operation: () => T
): T {
  if (!__DEV__) return operation();
  
  const start = performance.now();
  const result = operation();
  const duration = performance.now() - start;
  
  if (duration > 16) { // Only log if slower than 60fps frame budget
    console.warn(
      `[Performance] ${componentName} took ${duration.toFixed(2)}ms (budget: 16ms)`
    );
  }
  
  return result;
}

/**
 * Creates a performance marker for component renders
 * Use to track how often components re-render
 * 
 * @param componentName - Name to identify in logs
 * 
 * @example
 * function MyComponent() {
 *   useEffect(() => {
 *     logComponentRender('MyComponent');
 *   });
 * }
 */
export function logComponentRender(componentName: string): void {
  if (!__DEV__) return;
  console.log(`[Render] ${componentName}`);
}
