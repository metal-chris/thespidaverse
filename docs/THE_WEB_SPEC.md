# The Web - Interactive Tree Visualization Specification

## Overview
"The Web" is an interactive, collapsible tree visualization that maps the relationships between all articles on The Spidaverse. Articles are organized hierarchically: **Root → Categories → Tags → Articles**. The tree starts fully collapsed showing only the root node, and users click to expand branches, revealing the site's content network.

---

## 🎯 Core Requirements

### 1. Collapsed Initial State
- **On load**: Only the root node ("The Web") is visible
- **User-driven expansion**: Click a node circle to expand/collapse its children
- **Progressive disclosure**: Users explore at their own pace

### 2. Category-Specific Colors
Each category branch has a distinct color that applies to the category node, its connecting lines, and all descendant nodes (tags & articles):

| Category | Color | Hex |
|---|---|---|
| Movies & TV | Red | `#E82334` |
| Video Games | Blue | `#1E50DC` |
| Anime & Manga | Purple | `#9333EA` |
| Music | Green | `#10B981` |
| Root (The Web) | Neutral Gray | `#6B7280` |

Colors apply to:
- Node circles (fill)
- Branch lines (stroke)
- All children inherit their category ancestor's color

### 3. Theme Awareness
The tree adapts to the site's three themes:

| Theme | Background | Text | Link/Branch Default |
|---|---|---|---|
| Miles (light) | `#FAFAFA` | `#1A1A1A` | `#D1D5DB` |
| Peter (red) | `#4A0A0A` | `#F5F5F5` | `#8B3A3A` |
| Venom (dark) | `#0A0A0A` | `#F5F5F5` | `#374151` |

Theme changes (via the theme toggle) update the tree in real-time without a page refresh.

### 4. Article Navigation
- Article names are clickable links
- Clicking an article name navigates to `/articles/{slug}`
- Links use Next.js client-side routing (no full page reload)

---

## 🏗️ Data Architecture

### Hierarchy Structure
```
The Web (root)
├── Movies & TV (category)
│   ├── Tag A
│   │   ├── Article 1 → /articles/slug-1
│   │   └── Article 2 → /articles/slug-2
│   └── Article 3 (no tag, directly under category)
├── Video Games (category)
│   ├── Tag B
│   │   └── Article 4
│   └── Tag C
│       └── Article 5
├── Anime & Manga (category)
│   └── ...
└── Music (category)
    └── ...
```

### Data Flow
1. **Server**: `page.tsx` fetches articles from Sanity CMS via `getArticlesForGraph()`
2. **Server**: `buildGraph()` creates flat node/edge arrays
3. **Client**: Component transforms flat graph into hierarchical tree structure
4. **Client**: Tree is rendered with `react-d3-tree`

### Input Props
```typescript
interface GraphNode {
  id: string;
  label: string;
  type: "article" | "media" | "collection" | "tag" | "category";
  category?: string;
  slug?: string;
  connections?: number;
}

interface GraphEdge {
  source: string;
  target: string;
  weight?: number;
}
```

### Transformed Tree Structure (for react-d3-tree)
```typescript
interface TreeNode {
  name: string;
  attributes?: {
    type: string;
    slug?: string;
    category?: string;
  };
  children?: TreeNode[];
  __rd3t?: { collapsed: boolean };  // react-d3-tree collapse state
}
```

---

## 🎨 Visual Design

### Node Rendering
Each node type has a distinct visual treatment:

#### Root Node ("The Web")
- **Circle**: 20px radius, filled `#6B7280`, 2px white stroke
- **Label**: Bold, 16px, positioned below circle
- **Behavior**: Always visible, click expands categories

#### Category Nodes (Movies & TV, Video Games, etc.)
- **Circle**: 14px radius, filled with category color, 2px stroke
- **Label**: Semi-bold, 14px, category color
- **Collapse indicator**: Filled circle = has hidden children

#### Tag Nodes
- **Circle**: 8px radius, filled with parent category color (lighter opacity)
- **Label**: Regular, 12px
- **Behavior**: Expandable to show articles

#### Article Nodes (Leaf)
- **Circle**: 6px radius, filled with ancestor category color
- **Label**: Regular, 12px, rendered as clickable link
- **Link color**: Category color with underline on hover
- **Behavior**: Click navigates to article page

### Branch Lines
- **Stroke width**: 2px for root→category, 1.5px for deeper
- **Stroke color**: Inherits category color
- **Path style**: Smooth bezier curves (diagonal pathFunc)
- **Opacity**: 0.7 for subtle effect

### Layout
- **Orientation**: Horizontal (root on left, leaves on right)
- **Node spacing**: 40px vertical, 200px horizontal
- **Container**: Full viewport width, `calc(100vh - 140px)` height
- **Zoom/Pan**: Enabled with mouse wheel + drag
- **Initial position**: Root centered vertically, offset 20% from left

---

## 🔧 Technical Implementation

### Library: `react-d3-tree`
**Why this library:**
- Native React component — no SSR issues with `"use client"`
- Built-in collapse/expand with `__rd3t.collapsed` property
- Custom node rendering via `renderCustomNodeElement`
- Configurable pathFunc, separation, nodeSize
- Pan + zoom built-in
- Well-maintained (1M+ weekly downloads)

### Component Structure
```
WebGraphTree.tsx (main component)
├── Transforms flat graph → hierarchical tree data
├── Custom node renderer with category colors
├── Theme detection via MutationObserver
├── Click handler for article navigation
└── Responsive container with zoom/pan
```

### Key Implementation Details

#### 1. Graph → Tree Transformation
```typescript
function buildTreeData(nodes, edges): TreeNode {
  // Build adjacency from edges
  // Group articles under tags, tags under categories
  // Articles without tags go directly under category
  // Return single root node with nested children
  // Set __rd3t.collapsed = true on all non-root nodes
}
```

#### 2. Custom Node Renderer
```typescript
function renderNode({ nodeDatum, toggleNode }) {
  const type = nodeDatum.attributes?.type;
  const category = nodeDatum.attributes?.category;
  const color = getCategoryColor(category);
  
  // Render circle with category-specific color
  // Render label with appropriate styling
  // Article nodes: render as <a> link
  // Non-leaf nodes: click circle to toggle
}
```

#### 3. Theme Observer
```typescript
useEffect(() => {
  const observer = new MutationObserver(() => {
    setThemeColors(getThemeColors());
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}, []);
```

### Dependencies
```json
{
  "react-d3-tree": "^3.6.0"
}
```

No other new dependencies required. D3 is bundled within react-d3-tree.

---

## 📱 Responsive Behavior

### Desktop (> 1024px)
- Full horizontal tree layout
- Zoom/pan enabled
- Hover effects on nodes
- 200px horizontal spacing

### Tablet (640px - 1024px)
- Same layout, slightly tighter spacing (160px horizontal)
- Touch-friendly node targets (min 44px tap area)

### Mobile (< 640px)
- Same layout (horizontal scroll via pan)
- Larger touch targets
- Reduced initial zoom to show more of tree
- 120px horizontal spacing

---

## ♿ Accessibility

- **Keyboard navigation**: Tab through nodes, Enter to expand/collapse
- **ARIA labels**: Nodes have descriptive aria-labels
- **Reduced motion**: Respect `prefers-reduced-motion` (disable transitions)
- **Color contrast**: All text meets WCAG AA against theme backgrounds
- **Focus indicators**: Visible focus rings on interactive nodes

---

## 🚀 Performance

### Targets
- **Render time**: < 500ms for initial collapsed tree
- **Expand animation**: < 300ms transition
- **Memory**: Minimal — only visible nodes in DOM (react-d3-tree handles this)

### Optimizations
- Dynamic import of react-d3-tree (code splitting)
- Tree data computed once on mount, not on every render
- useMemo for tree transformation
- useCallback for handlers

---

## 📐 Page Layout

```
┌─────────────────────────────────────────────┐
│  /// The Web                                 │  ← Header (text-center, pt-4 pb-3)
│  Click to expand. Click articles to visit.   │  ← Subtitle
├─────────────────────────────────────────────┤
│                                              │
│                                              │
│         [Interactive Tree Area]              │  ← calc(100vh - 140px)
│         - zoom/pan enabled                   │
│         - root centered-left                 │
│                                              │
│                                              │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Implementation Checklist

- [ ] Install `react-d3-tree` dependency
- [ ] Create `WebGraphTree.tsx` component
- [ ] Implement graph → tree data transformation
- [ ] Set all non-root nodes to collapsed initial state
- [ ] Implement custom node renderer with category colors
- [ ] Add article link navigation with Next.js router
- [ ] Add theme detection and real-time updates
- [ ] Wire up to `the-web/page.tsx`
- [ ] Remove old Markmap component and `markmap-lib`/`markmap-view` deps
- [ ] Test Miles theme (light background)
- [ ] Test Peter theme (red background)
- [ ] Test Venom theme (dark background)
- [ ] Test collapse/expand behavior
- [ ] Test article navigation
- [ ] Verify responsive behavior
- [ ] Performance check

---

*This specification replaces the previous Markmap-based implementation which proved unable to reliably support custom colors and collapsed initial state.*
