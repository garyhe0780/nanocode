# NanoDB Design Specification

## Overview

NanoDB is an AI-native NoCode database platform with a refined, Linear/OpenAI-inspired dark aesthetic. Built on shadcn/ui (base-nova style, base-ui primitives, neutral baseColor).

## Design Principles

1. **Restrained & Functional** — Every element earns its place. No decoration for decoration's sake.
2. **High Contrast Dark** — Near-black backgrounds with white text for maximum clarity.
3. **Semantic Tokens** — All colors via CSS variables (`bg-primary`, `text-muted-foreground`), never raw values.
4. **Composed Components** — Build with shadcn primitives, not custom markup.
5. **Generous Whitespace** — Let content breathe. Quiet UI doesn't compete for attention.

---

## Color System

Uses **OKLCH** color space via shadcn CSS variables.

### Dark Theme (Default)

```css
--background:     oklch(0.11 0 0);      /* Near-black page background */
--foreground:     oklch(0.98 0 0);      /* Near-white text */
--card:           oklch(0.14 0 0);      /* Slightly lighter surface */
--card-foreground: oklch(0.98 0 0);
--primary:        oklch(0.65 0.19 265); /* Linear blue accent */
--primary-foreground: oklch(0.99 0 0);
--muted:          oklch(0.22 0 0);      /* Subtle backgrounds */
--muted-foreground: oklch(0.65 0 0);    /* Secondary text */
--accent:         oklch(0.24 0 0);
--accent-foreground: oklch(0.98 0 0);
--destructive:    oklch(0.65 0.22 25);  /* Error red */
--border:         oklch(0.28 0 0);       /* Subtle borders */
--input:          oklch(0.20 0 0);
--ring:           oklch(0.65 0.19 265); /* Focus ring matches primary */
--radius:         0.5rem;
```

### Semantic Color Usage

| Token | Usage |
|-------|-------|
| `--background` | Page background |
| `--foreground` | Primary text |
| `--muted-foreground` | Secondary/helper text |
| `--border` | Dividers, outlines |
| `--primary` | Buttons, links, focus rings |
| `--destructive` | Error states, destructive actions |

---

## Typography

**Font**: Inter Variable (via `@fontsource-variable/inter`)

| Role | Weight | Size |
|------|--------|------|
| Display | 600 | 1.5rem (24px) |
| Heading | 600 | 1.125rem (18px) |
| Body | 400 | 0.875rem (14px) |
| Small | 400 | 0.8125rem (13px) |
| Mono | 400 | 0.8125rem (13px) |

---

## Component Specifications

### Buttons

Use shadcn `Button` component with variants:

```tsx
<Button variant="default">  {/* Primary - blue background */}
<Button variant="outline">  {/* Ghost with border */}
<Button variant="ghost">    {/* No border, hover shows bg */}
<Button variant="destructive"> {/* Red for destructive actions */}
```

**Styling Rules:**
- Use `size-8` or `size-9` for standard buttons (h-8/h-9)
- Icon buttons: `size-8` with square aspect
- Use `data-icon="inline-start"` or `data-icon="inline-end"` for icons in buttons

### Inputs

Use shadcn `Input` component:

```tsx
<Input placeholder="Email" />
<Input type="password" placeholder="Password" />
```

**Styling Rules:**
- Never override component colors with raw Tailwind values
- Use `className` only for layout (width, margin, etc.)
- Focus states handled by component via `focus-visible:border-ring focus-visible:ring-2`

### Cards

Use shadcn Card composition:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* content */}
  </CardContent>
  <CardFooter>
    {/* actions */}
  </CardFooter>
</Card>
```

**Note:** For this project, we prefer **borderless cards** using only `--muted` background for subtle differentiation instead of shadows.

### Navigation Tabs

Use shadcn `Tabs` with `TabsList` + `TabsTrigger`:

```tsx
<Tabs defaultValue="workspaces">
  <TabsList>
    <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
    <TabsTrigger value="tables">Tables</TabsTrigger>
    <TabsTrigger value="agent">AI Agent</TabsTrigger>
  </TabsList>
</Tabs>
```

### Lists

Prefer **borderless list patterns** with dividers:

```tsx
<div className="border-y border-border">
  {items.map(item => (
    <div
      key={item.id}
      className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
    >
      {/* content */}
    </div>
  ))}
</div>
```

### Empty States

Use shadcn `Empty`:

```tsx
<Empty
  title="No workspaces"
  description="Create your first workspace to get started."
/>
```

### Loading States

Use shadcn `Skeleton` or `Spinner`:

```tsx
<Skeleton className="h-4 w-[200px]" />
// or
<Spinner />
```

**Never** use custom `animate-pulse` divs.

---

## View Layouts

### Auth View

Centered card, minimal, no decorations:

```
┌─────────────────────────────────────┐
│                                     │
│            NanoDB                    │  ← CardHeader + CardTitle
│                                     │
│     ┌─────────────────────────┐    │
│     │  Email                  │    │  ← Input
│     │  Password               │    │  ← Input (password type)
│     │  [   Sign In   ]        │    │  ← Button variant="default"
│     └─────────────────────────────┘    │
│                                     │
│      No account? Sign up            │  ← Ghost button link
│                                     │
└─────────────────────────────────────┘
```

### Main App Shell

```
┌─────────────────────────────────────────────────────────┐
│ HEADER (h-14, border-b border-border/50)               │
│ NanoDB                    user@email.com  [Sign out]   │
├─────────────────────────────────────────────────────────┤
│ TABS                                                  │
│ [Workspaces] [Tables*] [AI Agent*]                    │
├─────────────────────────────────────────────────────────┤
│ CONTENT (max-w-5xl mx-auto px-6 py-8)                 │
│                                                         │
│ Workspaces / Tables / Agent view content here          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Workspaces View

```
Your Workspaces                          [+ New]

┌─────────────────────────────────────────────────────────┐
│ Acme Corp                                    →         │
│ acme                                                     │
├─────────────────────────────────────────────────────────┤
│ Runner Analytics                              →         │
│ runner                                                    │
└─────────────────────────────────────────────────────────┘
```

### Agent View (AI Chat)

```
┌─────────────────────────────────────────────────────────┐
│ AI Data Analyst                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   How many records in users table?                     │  ← text-right, muted
│                                                         │
│   Found 150 records in the users table.                 │  ← text-muted-foreground
│                                                         │
│   ┌─────────────────────────────────────────────────┐ │
│   │ SELECT count(*) FROM "Record" WHERE...           │ │  ← bg-muted p-3 rounded-md
│   └─────────────────────────────────────────────────┘ │
│                                                         │
│   ┌─────────────────────────────────────────────────┐ │
│   │ [ {"count": "150"} ]                            │ │  ← bg-muted p-3 rounded-md
│   └─────────────────────────────────────────────────┘ │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ [Ask a question...                      ] [→]          │  ← Input + Button
└─────────────────────────────────────────────────────────┘
```

---

## Spacing System

| Token | Value |
|-------|-------|
| Container max-width | `max-w-5xl` (1024px) |
| Page padding | `px-6 py-8` |
| Section gap | `gap-8` or `mb-8` |
| Component gap | `gap-3` or `gap-4` |
| Button padding | `px-4 py-2` |
| Input padding | `px-3 py-2` |
| Card padding | `p-6` |
| List item padding | `px-4 py-3` |

---

## Motion

Minimal, purposeful only:

1. **Instant feedback** — Hover states: 100ms transitions
2. **Subtle fades** — Opacity, not transforms
3. **Loading** — Spinner or skeleton, no bouncing dots

---

## Polish Details

### Custom Scrollbar
```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb {
  background: var(--muted-foreground);
  border-radius: 3px;
}
```

### Selection
```css
::selection {
  background: oklch(0.65 0.19 265 / 0.3);
}
```

### Focus States
Components handle via `focus-visible:border-ring focus-visible:ring-2`. Never remove focus rings.

---

## Accessibility

- All interactive elements keyboard accessible
- Focus rings always visible (`focus-visible`)
- Color contrast: WCAG AA minimum (our dark theme exceeds 7:1)
- Use `aria-invalid` and `data-invalid` for form validation
- Respect `prefers-reduced-motion`

---

## Component Checklist

Required shadcn components for this project:

- [ ] Button (variants: default, outline, ghost, destructive)
- [ ] Input
- [ ] Card (CardHeader, CardTitle, CardDescription, CardContent)
- [ ] Tabs (TabsList, TabsTrigger, TabsContent)
- [ ] Empty
- [ ] Skeleton
- [ ] Spinner
- [ ] Badge (for status indicators)

---

## Implementation Notes

1. Use `bunx --bun shadcn@latest add <component>` to add components
2. Run `npx shadcn@latest docs <component>` before using for API reference
3. Never override component colors with raw Tailwind values
4. Use `cn()` utility for conditional classes
5. Prefer `size-*` over `w-* h-*` for equal dimensions
6. Use `gap-*` not `space-y-*` or `space-x-*`
