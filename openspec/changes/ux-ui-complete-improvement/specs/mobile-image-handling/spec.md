# Mobile Image Handling Specification

## Purpose

Establish optimized image loading, caching, and rendering patterns for the BaraServices mobile app using modern React Native image APIs. This specification defines requirements for delivering high-quality images with minimal memory pressure and fast loading times.

---

## Requirements

### Requirement: expo-image for All Image Rendering

The system MUST use `expo-image` for all image rendering instead of React Native's built-in `Image` component.

**Rationale:** `expo-image` provides superior caching, native blur placeholders, modern format support (WebP, AVIF), and better memory management compared to React Native's Image component. It's the recommended image solution for production Expo apps.

**Technical Constraint:** All `<Image>` components MUST import from `expo-image`, not `react-native`.

#### Scenario: Service Image with Placeholder

- GIVEN a service card displaying a remote image
- WHEN the image is loading
- THEN a blur placeholder appears instantly using blurhash
- AND the image fades in smoothly when loaded
- AND the placeholder is cached for subsequent views

#### Scenario: Image Caching Across Sessions

- GIVEN a user who has viewed a service image
- WHEN the user closes and reopens the app
- THEN the image loads instantly from disk cache
- AND no network request is made
- AND the cache respects the configured `cachePolicy`

#### Scenario: Image Loading Failure

- GIVEN a service with an invalid or unreachable image URL
- WHEN the image fails to load
- THEN the placeholder remains visible
- AND an optional error placeholder is shown
- AND no app crash occurs

**Edge Cases:**
- Offline mode: Cached images display; new images show placeholder
- Low memory: expo-image automatically manages cache eviction
- Large images: Downsampled automatically to fit view size

**Code Example:**

```tsx
// ✅ CORRECT: expo-image with placeholder and caching
import { Image } from 'expo-image';

const ServiceCard = ({ service }) => (
  <View style={styles.card}>
    <Image
      source={{ uri: service.imageUrl }}
      placeholder={service.blurhash} // Instant blur placeholder
      style={styles.image}
      contentFit="cover"
      transition={200} // Smooth fade-in
      cachePolicy="memory-disk" // Persistent cache
    />
    <Text>{service.name}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0', // Fallback while loading
  },
});

// ❌ INCORRECT: React Native Image (no caching, no placeholders)
import { Image } from 'react-native';

const ServiceCard = ({ service }) => (
  <View style={styles.card}>
    <Image
      source={{ uri: service.imageUrl }}
      style={styles.image}
      // No placeholder support
      // Poor caching
      // Higher memory usage
    />
    <Text>{service.name}</Text>
  </View>
);
```

---

### Requirement: Blur Placeholder Strategy

The system MUST provide instant visual feedback during image loading using blurhash placeholders.

**Rationale:** Blurhash generates compact, visually-representative placeholders that load instantly, providing better perceived performance than spinners or gray boxes.

**Technical Constraint:** All remote images SHOULD include a `placeholder` prop with blurhash string when available from backend.

#### Scenario: Service Catalog with Blurhash

- GIVEN a service catalog with 50+ items
- WHEN the user scrolls through the list
- THEN each image shows its unique blurhash placeholder instantly
- AND placeholders provide color/composition preview of actual images
- AND actual images fade in smoothly as they load

#### Scenario: Missing Blurhash Fallback

- GIVEN an image without a blurhash from the backend
- WHEN rendering the image
- THEN a solid color fallback (from backgroundColor style) is shown
- AND the image still fades in when loaded
- AND no errors are logged

**Code Example:**

```tsx
// ✅ CORRECT: Blurhash placeholder with fallback
import { Image } from 'expo-image';

const ServiceImage = ({ imageUrl, blurhash }) => (
  <Image
    source={{ uri: imageUrl }}
    placeholder={blurhash || undefined} // Use blurhash if available
    style={styles.image}
    contentFit="cover"
    transition={200}
    cachePolicy="memory-disk"
  />
);

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E5EA', // iOS system gray as fallback
  },
});

// Alternative: Generate blurhash on device (expensive, use sparingly)
import { Blurhash } from 'expo-blurhash';

const ServiceImage = ({ imageUrl, blurhash }) => (
  <>
    {!blurhash && (
      <Blurhash
        blurhash="LEHV6nWB2yk8pyo0adR*.7kCMdnj" // Default fallback
        style={styles.blurhashFallback}
      />
    )}
    <Image
      source={{ uri: imageUrl }}
      placeholder={blurhash}
      style={styles.image}
      contentFit="cover"
      transition={200}
    />
  </>
);

// ❌ INCORRECT: No placeholder strategy
import { Image } from 'expo-image';

const ServiceImage = ({ imageUrl }) => (
  <Image
    source={{ uri: imageUrl }}
    style={styles.image}
    // Missing placeholder = blank space during load
  />
);
```

---

### Requirement: Cache Policy Configuration

The system MUST configure cache policies appropriate to each image use case.

**Rationale:** Different images have different caching needs. Profile pictures and service images benefit from persistent caching, while temporary images (e.g., upload previews) should not consume disk space.

**Technical Constraint:** All expo-image components MUST specify explicit `cachePolicy`.

#### Scenario: Service Catalog Images (Persistent Cache)

- GIVEN service catalog images that rarely change
- WHEN configuring expo-image
- THEN `cachePolicy="memory-disk"` is used
- AND images remain cached across app restarts
- AND cache persists until explicitly cleared or evicted by OS

#### Scenario: User-Generated Content (Memory-Only Cache)

- GIVEN a booking confirmation with a receipt image
- WHEN displaying the image
- THEN `cachePolicy="memory"` is used
- AND the image is cached only for current session
- AND disk space is not consumed

#### Scenario: No Cache (Temporary Uploads)

- GIVEN an image upload preview before submission
- WHEN displaying the preview
- THEN `cachePolicy="none"` is used
- AND the image is fetched fresh each time
- AND no cache pollution occurs

**Cache Policy Options:**

| Policy | Use Case | Persistence | Performance |
|--------|----------|-------------|-------------|
| `memory-disk` | Service images, product photos, user avatars | Persistent | Best |
| `memory` | Session-specific content, receipts | Session-only | Good |
| `none` | Upload previews, ephemeral content | No cache | Fair |

**Code Example:**

```tsx
// ✅ CORRECT: Explicit cache policies per use case
import { Image } from 'expo-image';

// Service images: persistent cache
const ServiceImage = ({ imageUrl, blurhash }) => (
  <Image
    source={{ uri: imageUrl }}
    placeholder={blurhash}
    style={styles.serviceImage}
    cachePolicy="memory-disk" // Best for repeated views
  />
);

// User avatar: persistent cache
const Avatar = ({ userImageUrl }) => (
  <Image
    source={{ uri: userImageUrl }}
    style={styles.avatar}
    cachePolicy="memory-disk"
    contentFit="cover"
  />
);

// Upload preview: no cache
const UploadPreview = ({ localUri }) => (
  <Image
    source={{ uri: localUri }}
    style={styles.preview}
    cachePolicy="none" // Don't cache temporary files
  />
);

// ❌ INCORRECT: No cache policy specified (uses default, unclear behavior)
const ServiceImage = ({ imageUrl }) => (
  <Image
    source={{ uri: imageUrl }}
    style={styles.image}
    // Missing cachePolicy = default behavior (inconsistent)
  />
);
```

---

### Requirement: Content Fit Strategy

The system MUST specify appropriate `contentFit` values for all images based on design intent.

**Rationale:** Incorrect `contentFit` causes images to appear stretched, cropped incorrectly, or misaligned. expo-image provides precise control over how images fill their containers.

**Technical Constraint:** All expo-image components MUST specify `contentFit` matching design requirements.

#### Scenario: Service Card Image (Cover)

- GIVEN a service card with fixed aspect ratio (16:9)
- WHEN the image has different dimensions
- THEN `contentFit="cover"` crops the image to fill the area
- AND the image's focal point remains centered
- AND no stretching occurs

#### Scenario: Product Detail Image (Contain)

- GIVEN a product detail screen showing full item image
- WHEN the image has variable aspect ratios
- THEN `contentFit="contain"` shows the entire image
- AND letterboxing/pillarboxing fills extra space
- AND no cropping occurs

#### Scenario: User Avatar (Cover with Circle Mask)

- GIVEN a circular user avatar
- WHEN the uploaded image is not square
- THEN `contentFit="cover"` crops to fill the circle
- AND the center of the image is prioritized
- AND the circle mask is applied via `style.borderRadius`

**Content Fit Options:**

| Value | Behavior | Use Case |
|-------|----------|----------|
| `cover` | Fill container, crop edges if needed | Cards, thumbnails, avatars |
| `contain` | Fit entire image, add letterboxing | Product detail, full-screen views |
| `fill` | Stretch to fill container | Avoid unless intentional |
| `none` | Original size, no scaling | Icons, graphics at exact size |
| `scale-down` | Contain, but never scale up | Small images in large containers |

**Code Example:**

```tsx
// ✅ CORRECT: Appropriate contentFit per use case
import { Image } from 'expo-image';

// Service card: cover (fill the card, crop if needed)
const ServiceCard = ({ service }) => (
  <Image
    source={{ uri: service.imageUrl }}
    style={styles.cardImage}
    contentFit="cover"
    placeholder={service.blurhash}
  />
);

// Product detail: contain (show entire image)
const ProductDetail = ({ product }) => (
  <Image
    source={{ uri: product.imageUrl }}
    style={styles.detailImage}
    contentFit="contain"
    placeholder={product.blurhash}
  />
);

// User avatar: cover with circle
const Avatar = ({ user }) => (
  <Image
    source={{ uri: user.avatarUrl }}
    style={styles.avatar}
    contentFit="cover"
    placeholder={user.blurhash}
  />
);

const styles = StyleSheet.create({
  cardImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  detailImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#000', // Black background for letterboxing
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24, // Circular mask
  },
});

// ❌ INCORRECT: No contentFit specified (defaults to 'cover', unclear intent)
const ServiceCard = ({ service }) => (
  <Image
    source={{ uri: service.imageUrl }}
    style={styles.cardImage}
    // Missing contentFit = unclear behavior
  />
);
```

---

### Requirement: Image Gallery with Zoom

The system MUST provide image gallery functionality with zoom, pan, and lightbox capabilities for media-heavy screens.

**Rationale:** Users expect to zoom and pan high-resolution images, especially for product photos and service galleries. Basic Image components don't support gestures.

**Technical Constraint:** Image galleries MUST use `react-native-reanimated-galeria` for performant gesture-based interactions.

#### Scenario: Service Gallery Lightbox

- GIVEN a service detail screen with multiple images
- WHEN the user taps an image thumbnail
- THEN a fullscreen lightbox opens showing the image
- AND the user can pinch to zoom in/out
- AND the user can pan around the zoomed image
- AND the user can swipe to next/previous images

#### Scenario: Zoom Gesture Performance

- GIVEN a user zooming into a high-resolution service image
- WHEN performing pinch gestures
- THEN the zoom is smooth at 60fps
- AND the zoom uses native Reanimated transforms
- AND no JavaScript thread blocking occurs

#### Scenario: Close Gallery

- GIVEN a user viewing an image in the gallery
- WHEN the user taps the close button or swipes down
- THEN the gallery closes with smooth animation
- AND the user returns to the previous screen
- AND scroll position is preserved

**Code Example:**

```tsx
// ✅ CORRECT: Gallery with zoom support
import { Image } from 'expo-image';
import { Galeria, GaleriaImage } from 'react-native-reanimated-galeria';

const ServiceDetail = ({ service }) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  const openGallery = (index: number) => {
    setInitialIndex(index);
    setIsGalleryOpen(true);
  };

  return (
    <View>
      {/* Thumbnail grid */}
      <View style={styles.thumbnailGrid}>
        {service.images.map((image, index) => (
          <Pressable key={image.id} onPress={() => openGallery(index)}>
            <Image
              source={{ uri: image.thumbnailUrl }}
              style={styles.thumbnail}
              contentFit="cover"
              placeholder={image.blurhash}
            />
          </Pressable>
        ))}
      </View>

      {/* Fullscreen gallery with zoom */}
      <Galeria
        visible={isGalleryOpen}
        onRequestClose={() => setIsGalleryOpen(false)}
        initialIndex={initialIndex}
      >
        {service.images.map((image) => (
          <GaleriaImage
            key={image.id}
            source={{ uri: image.fullUrl }}
            placeholder={image.blurhash}
          />
        ))}
      </Galeria>
    </View>
  );
};

const styles = StyleSheet.create({
  thumbnailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});

// ❌ INCORRECT: No zoom support, basic modal only
const ServiceDetail = ({ service }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <View>
      {service.images.map((image) => (
        <Pressable key={image.id} onPress={() => setSelectedImage(image)}>
          <Image source={{ uri: image.thumbnailUrl }} style={styles.thumbnail} />
        </Pressable>
      ))}

      <Modal visible={!!selectedImage} onRequestClose={() => setSelectedImage(null)}>
        <Image
          source={{ uri: selectedImage?.fullUrl }}
          style={styles.fullImage}
          // No zoom, no pan, no gestures
        />
      </Modal>
    </View>
  );
};
```

---

## Non-Functional Requirements

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Image Load Time (cached)** | <100ms | Time from mount to display |
| **Image Load Time (network)** | <2s on 3G | First contentful paint |
| **Memory Usage (50 images)** | <150MB | Xcode Instruments / Android Profiler |
| **Cache Hit Rate** | >80% for repeat views | Analytics tracking |

### Image Quality Requirements

- **Blurhash Size:** 32x32 pixel equivalent for balance of quality/size
- **Thumbnail Resolution:** 300x300px for list items
- **Full Image Resolution:** Max 1920x1920px (downsample larger images on backend)
- **Format Support:** WebP primary, JPEG fallback, PNG for transparency

### Caching Strategy

- **Disk Cache Limit:** 100MB default (expo-image manages automatically)
- **Memory Cache:** Proportional to device RAM (expo-image manages automatically)
- **Cache Eviction:** LRU (Least Recently Used) policy
- **Cache Clearing:** Provide user setting to clear cache (Storage section)

---

## Testing Requirements

### Requirement: Image Loading Validation

The system MUST validate image loading across network conditions.

#### Test Scenario: Cached Image Performance

```typescript
// Test: Verify cached images load instantly
import { render, waitFor } from '@testing-library/react-native';
import { Image } from 'expo-image';

describe('ServiceImage Caching', () => {
  it('loads cached image instantly', async () => {
    // Prime the cache
    const { rerender } = render(
      <ServiceImage imageUrl="https://example.com/service.jpg" />
    );
    
    await waitFor(() => expect(getImageLoadState()).toBe('loaded'));
    
    // Unmount and remount
    rerender(<View />);
    rerender(<ServiceImage imageUrl="https://example.com/service.jpg" />);
    
    // Should load instantly from cache
    const loadTime = measureImageLoadTime();
    expect(loadTime).toBeLessThan(100); // <100ms
  });
});
```

### Requirement: Placeholder Validation

The system MUST verify blurhash placeholders render correctly.

#### Test Scenario: Blurhash Display

```typescript
// Test: Verify blurhash appears before image loads
describe('ServiceImage Placeholder', () => {
  it('shows blurhash while loading', async () => {
    const { getByTestId } = render(
      <Image
        source={{ uri: 'https://example.com/slow-image.jpg' }}
        placeholder="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
        testID="service-image"
      />
    );
    
    const image = getByTestId('service-image');
    
    // Verify placeholder is visible immediately
    expect(image.props.placeholder).toBe('LEHV6nWB2yk8pyo0adR*.7kCMdnj');
    
    // Wait for actual image to load
    await waitFor(() => expect(getImageLoadState(image)).toBe('loaded'));
  });
});
```

### Manual Testing Checklist

For each screen with images:

- [ ] Images load with blurhash placeholder visible
- [ ] Cached images load instantly on second view
- [ ] Smooth fade-in transition when images load
- [ ] No memory warnings during extended scrolling
- [ ] Images scale correctly in different screen sizes
- [ ] Offline mode shows cached images
- [ ] Failed images show placeholder, no crashes
- [ ] Gallery opens and closes smoothly
- [ ] Zoom gestures are smooth (60fps)
- [ ] Pan gestures work when zoomed in

---

## Migration Guide

### From React Native Image to expo-image

**Step 1:** Install expo-image

```bash
npx expo install expo-image
```

**Step 2:** Replace import

```tsx
// Before
import { Image } from 'react-native';

// After
import { Image } from 'expo-image';
```

**Step 3:** Add placeholder and cache policy

```tsx
// Before
<Image
  source={{ uri: imageUrl }}
  style={styles.image}
/>

// After
<Image
  source={{ uri: imageUrl }}
  placeholder={blurhash}
  style={styles.image}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
/>
```

**Step 4:** Update styles to include backgroundColor

```tsx
const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E5EA', // Fallback color
    borderRadius: 12,
  },
});
```

**Step 5:** Verify caching in development

```tsx
// Temporary debug code
<Image
  source={{ uri: imageUrl }}
  placeholder={blurhash}
  style={styles.image}
  onLoad={() => console.log('Image loaded')}
  onError={(error) => console.log('Image error:', error)}
/>
```

### Adding Blurhash to Backend

If backend doesn't provide blurhash yet, generate placeholders:

```typescript
// Backend: Generate blurhash when uploading images
import { encode } from 'blurhash';
import sharp from 'sharp';

async function generateBlurhash(imageBuffer: Buffer): Promise<string> {
  const image = sharp(imageBuffer);
  const { data, info } = await image
    .raw()
    .ensureAlpha()
    .resize(32, 32, { fit: 'inside' })
    .toBuffer({ resolveWithObject: true });
  
  return encode(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    4, // componentX
    3  // componentY
  );
}
```

Return blurhash in API responses:

```json
{
  "id": "service-123",
  "name": "House Cleaning",
  "imageUrl": "https://cdn.example.com/service-123.jpg",
  "blurhash": "LEHV6nWB2yk8pyo0adR*.7kCMdnj"
}
```

---

## Success Criteria

### Definition of Done for Image Handling

An image implementation meets requirements when:

1. ✅ Uses `expo-image` (not React Native Image)
2. ✅ Includes `placeholder` prop with blurhash when available
3. ✅ Specifies explicit `cachePolicy`
4. ✅ Specifies explicit `contentFit`
5. ✅ Includes `transition` prop for smooth fade-in
6. ✅ Styles include `backgroundColor` for fallback
7. ✅ Gallery screens use Galeria for zoom support
8. ✅ Manual testing shows smooth loading and caching
9. ✅ No memory warnings during extended use
10. ✅ Cached images load instantly (<100ms)

### Regression Prevention

The system MUST NOT:
- Break existing image displays
- Increase memory usage vs. React Native Image
- Remove image loading feedback (spinners, placeholders)
- Cause crashes on image load failures
- Block main thread during image processing

---

## Related Requirements

- See `mobile-list-performance` spec for image optimization in lists
- See `mobile-styling` spec for image container styling patterns
- See `vercel-react-native-skills/rules/ui-expo-image.md` for detailed patterns
- See `vercel-react-native-skills/rules/ui-image-gallery.md` for gallery implementation

---

**End of Specification**
