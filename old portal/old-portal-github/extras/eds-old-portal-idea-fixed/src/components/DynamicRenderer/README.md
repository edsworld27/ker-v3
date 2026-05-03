# `src/components/DynamicRenderer/` — The config → JSX renderer

Tiny but architecturally critical. This folder holds the function that turns a `viewLayouts` config object into mounted React components.

## Files

```
DynamicRenderer/
├── DynamicRenderer.tsx    ← The renderer (~26 lines)
└── index.ts                ← Re-exports
```

## What it does

```tsx
import { componentMap, ComponentName } from '../componentMap';

export interface ComponentConfig {
  component: ComponentName;
  props: Record<string, any>;
}

export const DynamicRenderer: FC<{ config: ComponentConfig[] }> = ({ config }) => (
  <>
    {config.map((item, index) => {
      const Component = componentMap[item.component];
      if (!Component) {
        console.warn(`DynamicRenderer: "${item.component}" not found in componentMap.`);
        return null;
      }
      return <Component key={index} {...item.props} />;
    })}
  </>
);
```

That's the whole thing. Given an array like:

```ts
[
  { component: 'AdminStatsWidget', props: {} },
  { component: 'ClientListWidget', props: { limit: 5 } },
  { component: 'ActivityFeedWidget', props: {} },
]
```

…it mounts each component by string name (looked up in `componentMap`), passing the `props` object spread.

## How it's used

It's invoked by `src/components/DynamicViewRenderer.tsx`:

```tsx
const layout = agencyConfig.roles[roleId]?.viewLayouts?.[viewId];
if (layout) {
  return (
    <div className={`grid ${layout.layout} gap-6 p-6`}>
      <DynamicRenderer config={layout.components} />
    </div>
  );
}
// else fall back to the full View component
```

## The triad you must understand together

`DynamicRenderer` doesn't make sense in isolation. It's the third leg of:

1. **`componentMap.ts`** — string → component dictionary
2. **`agencyConfig.roles[X].viewLayouts[Y]`** — declarative `{ layout, components: [{ component, props }] }`
3. **`DynamicRenderer`** — the runtime that mounts the components

Together: **a JSON-ish config can describe a whole page**, lookup happens at render time, and views become composable from data. Add a new widget to `componentMap`, reference it in `viewLayouts`, and any role can include it in any page without touching layout code.

## When extracting

- **Lift this whole pattern as a single unit** — `componentMap` + `DynamicRenderer` + a `viewLayouts`-style config schema. Splitting them defeats the purpose.
- It pairs naturally with role-based access (each role gets its own layout per view).
- Limitations to be aware of:
  - No nested layouts (no `{ layout: 'flex', children: [...] }` recursion). Could be added.
  - No conditional rendering (`{ if: 'feature.analytics', component: 'X' }`). Could also be added.
  - No prop type-checking — `props: Record<string, any>` means typos in config silently pass `undefined`.
- For a production version, consider:
  - Wrapping each component in an `<ErrorBoundary>` so a bad widget doesn't blank the whole layout.
  - Memoizing the component lookup if `config` is stable.
  - Switching to lazy-loading via `React.lazy` for large widget libraries.
