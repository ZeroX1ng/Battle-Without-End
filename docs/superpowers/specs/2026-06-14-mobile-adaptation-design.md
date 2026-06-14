# Mobile Adaptation Design — BWE Capacitor Hybrid App

**Date:** 2026-06-14
**Status:** Draft (Phase 0 — pre-desktop-freeze)
**Scope:** Android + iOS mobile adaptation via Capacitor, built on top of shared `src/core/` and `src/state/`

---

## 1. Tech Stack & Architecture

### 1.1 Stack

| Layer | Desktop (current) | Mobile (target) |
|-------|-------------------|-----------------|
| Shell | Electron | Capacitor 7 |
| Renderer | React 18 + Vite | React 18 + Vite |
| State | useReducer + Context | Same (shared `src/state/`) |
| Game Logic | Pure TS (`src/core/`) | Same (shared `src/core/`) |
| Styling | CSS (desktop) | CSS (mobile) — separate files |
| Storage | localStorage | `@capacitor/preferences` |
| Notifications | — | `@capacitor/local-notifications` |
| Background/Awake | — | `@capacitor/app` (resume events) |

### 1.2 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   App Shell                          │
│  ┌───────────────────┐  ┌─────────────────────────┐ │
│  │  Electron main.cjs │  │  Capacitor Android/iOS   │ │
│  │  (desktop runtime) │  │  (mobile runtime)        │ │
│  └─────────┬─────────┘  └───────────┬─────────────┘ │
│            │                        │                │
│  ┌─────────▼────────────────────────▼─────────────┐ │
│  │            Platform Bridge (abstraction)        │ │
│  │  platformBridge.desktop.ts / .capacitor.ts      │ │
│  └────────────────────┬───────────────────────────┘ │
│                       │                              │
│  ┌────────────────────▼───────────────────────────┐ │
│  │         React App (Vite bundle)                 │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │ │
│  │  │ components│  │components│  │  core + state │ │ │
│  │  │ (desktop) │  │ -mobile  │  │  (shared)     │ │ │
│  │  └──────────┘  └──────────┘  └──────────────┘ │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 1.3 Code Sharing Strategy

**Shared (no changes needed):**
- `src/core/` — game logic, models, data, systems
- `src/state/` — GameContext reducer, actions, selectors

**Forked per platform:**
- `src/components/` → desktop UI
- `src/components-mobile/` → mobile UI
- `src/styles/` → desktop styles
- `src/styles-mobile/` → mobile styles
- `src/main.tsx` → desktop entry
- `src/main.mobile.tsx` → mobile entry

**Bridged:**
- `src/hooks/usePlatformBridge.ts` — unified platform API
- `src/hooks/useGameLoop.ts` — extended with catch-up scheduling

---

## 2. Platform Bridge

### 2.1 Abstract Interface

```ts
interface PlatformBridge {
  readonly isMobile: boolean

  // Lifecycle — app goes background / foreground
  onAppPause(callback: () => void): void
  onAppResume(callback: (backgroundedAt: number) => void): void

  // Local notifications (battle death, loot alert, etc.)
  sendLocalNotification(title: string, body: string): Promise<void>

  // Persistent storage (survives app uninstall on mobile if exported)
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>

  // Keep screen awake (optional, for AFK watching)
  setKeepAwake(keep: boolean): Promise<void>
}
```

### 2.2 Desktop Implementation (`platformBridge.desktop.ts`)

- `onAppPause/Resume` → `document.visibilitychange`
- Storage → `localStorage` (existing SaveSystem)
- Notifications → `new Notification()` (permission-gated)
- `setKeepAwake` → no-op

### 2.3 Capacitor Implementation (`platformBridge.capacitor.ts`)

- `onAppPause/Resume` → `App.addListener('pause'/'resume')` from `@capacitor/app`
- Storage → `@capacitor/preferences` (backed by SharedPreferences / NSUserDefaults)
- Notifications → `@capacitor/local-notifications`
- `setKeepAwake` → `@capacitor/screen-orientation` keepAwake or custom plugin

### 2.4 Build-Target Resolution

```ts
// src/utils/platformBridge.ts
let bridge: PlatformBridge

export async function getPlatformBridge(): Promise<PlatformBridge> {
  if (!bridge) {
    // Capacitor exposes window.Capacitor on mobile
    if (typeof (window as any).Capacitor !== 'undefined') {
      const mod = await import('./platformBridge.capacitor')
      bridge = mod.createCapacitorBridge()
    } else {
      const mod = await import('./platformBridge.desktop')
      bridge = mod.createDesktopBridge()
    }
  }
  return bridge
}
```

---

## 3. Offline Catch-Up (Background Hanging)

### 3.1 Principle

No true background processing. Instead:
1. App goes background → record `backgroundedAt = Date.now()`
2. App comes foreground → `elapsedMs = Date.now() - backgroundedAt`
3. Call `calcOfflineProgress(state, elapsedMs)` → pure function
4. Dispatch accumulated results (loot, logs, level-ups, death) in one batch
5. Show a summary screen: "你离开了 X 分钟，获得了..."
6. If elapsedMs exceeds a safety cap (e.g., 8 hours), cap it to prevent balance issues

### 3.2 Implementation

```ts
// src/core/systems/OfflineProgress.ts (new — shared)
export function calcOfflineProgress(
  state: GameState,
  elapsedMs: number,
  capMs: number = 8 * 60 * 60 * 1000
): OfflineResult {
  const effectiveMs = Math.min(elapsedMs, capMs)
  const ticks = Math.floor(effectiveMs / TICK_INTERVAL)
  // Run battle.run() for N ticks, accumulate loot/logs/damage
  // Return accumulated state
}
```

### 3.3 Integration with GameLoop

`useGameLoop` already supports tick catching-up via `planGameLoopSchedule`. Extend it to accept a `catchUpTicks` parameter on resume, so the same scheduling logic can batch-process offline ticks with animation-frame pacing (avoid freezing UI on resume).

### 3.4 Platform-Specific Behavior

| Scenario | Desktop (Electron) | Mobile (Capacitor) |
|----------|-------------------|---------------------|
| Window minimized | `visibilitychange` → pause; resume catches up | — |
| App backgrounded | — | `App.pause` → record time; `App.resume` → catch up |
| OS kills app while backgrounded | — | Loss of unsaved ticks is acceptable (last save on pause) |
| Device reboot | — | Next launch loads last save normally |

---

## 4. UI Layout — Mobile

### 4.1 Vertical Layout (portrait, primary orientation)

```
┌──────────────────────────────┐
│  ┌────────────┬────────────┐ │  ← Player + Monster dual-card row
│  │ Player     │ Monster    │ │    (compact: name, Lv, HP/MP bars)
│  │ Compact    │ Info       │ │
│  └────────────┴────────────┘ │    Tap card → full detail Popover
├──────────────────────────────┤
│  ┌────────────┬────────────┐ │  ← Pet + Battle Skill
│  │ Pet Info   │ Skill Panel│ │
│  └────────────┴────────────┘ │
├──────────────────────────────┤
│                              │
│  Battle Log (scrollable)     │  ← Dominant area, collapsible
│  Full-width, resizable       │
│                              │
├──────────────────────────────┤
│ [⚔掉洛]                      │  ← Loot shortcut button with badge count
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │  底部 Tab Bar              │ │  ← Contextual panel area
│ │  [背包] [装备] [宠物] [...] │ │     Selected equip → Forge + Compare
│ └──────────────────────────┘ │     stacked in this zone
└──────────────────────────────┘
```

### 4.2 Horizontal Layout (landscape, secondary)

```
┌──────────┬───────────────────┬──────────┐
│ Player   │  Battle + Loot    │ Pet      │
│ Compact  │  (scrollable)     │ Skill    │
│          │                   │          │
│ Monster  │                   │ [掉落]   │
│          │                   │          │
├──────────┴───────────────────┴──────────┤
│  Bottom Tab Bar (compact, icon-only)     │
└──────────────────────────────────────────┘
```

### 4.3 CSS Strategy

- `src/styles-mobile/variables.css` — scaled font sizes, touch-friendly spacing
- `src/styles-mobile/main-scene.css` — portrait + landscape media queries
- Use `dvh` (dynamic viewport height) for safe area compatibility
- `env(safe-area-inset-*)` for notch/home-indicator padding
- Minimum touch target: 44×44px (Apple HIG)

---

## 5. Interaction Model — Touch Adaptation

| Desktop Pattern | Mobile Pattern | Implementation |
|-----------------|----------------|----------------|
| `onMouseEnter` → hover tooltip | `onClick` → Popover at target position | Replace all `onMouseEnter/Leave` pairs |
| `onMouseMove` → following tooltip | No following. Popover anchored to tap point, fixed. | Remove `GlobalMouseTracker` on mobile |
| `onClick` button | `onClick` button | Reuse directly; ensure 44×44 min area |
| Right-click context menu | Long-press → context actions | Custom `useLongPress` hook (500ms threshold) |
| Scroll wheel | Native touch scroll | Keep existing `ScrollPanel`; test overflow behavior |
| Hover state styling | No visual hover; use `:active` for tap feedback | Replace `:hover` with `:active` in mobile styles |

### 5.1 `useLongPress` Hook

```ts
function useLongPress(
  ref: RefObject<HTMLElement>,
  onLongPress: () => void,
  options?: { threshold?: number; onTap?: () => void }
): void
```

Used for: long-press equipment item → context menu (equip / forge / compare / sell).

### 5.2 Popover Component (new)

Replaces the floating InfoWindow on mobile:
- Anchored to tap coordinates
- Auto-flips direction if near screen edge
- Dismisses on tap outside or back button
- Supports Forge + Compare stacked layout when equipment is selected

---

## 6. Component Inventory & Migration Path

### 6.1 Scene Entry Points

| Desktop | Mobile | Notes |
|---------|--------|-------|
| `BeginScene` | `BeginSceneMobile` | Full-screen layout, name input + race select as large touch cards |
| `RaceScene` | `RaceSceneMobile` | Same general flow, touch-friendly option buttons |
| `MainScene` | `MainSceneMobile` | Complete layout restructure (Section 4) |
| `SaveScene` | `SaveSceneMobile` | Slot list with larger touch targets |
| `ConfirmScene` | `ConfirmSceneMobile` | Large yes/no buttons |

### 6.2 Panels (embedded in MainScene)

| Desktop | Mobile Strategy |
|---------|-----------------|
| `PlayerInfoPanel` | Compact card (default) + full Popover (on tap) |
| `MonsterInfoPanel` | Compact card (default) + full Popover (on tap) |
| `PetInfoPanel` | Compact card in middle row |
| `BattleSkillPanel` | Compact in middle row |
| `LootPanel` | Hidden by default; button opens Popover with badge count |
| `OtherPanel` | Converted to Bottom Tab Bar area |
| `AllInfoPanel` | Remove (not needed on mobile) or merge into Player Popover |

### 6.3 Windows (overlay modals)

| Desktop | Mobile |
|---------|--------|
| `EquipWindow` | Bottom Tab → opens in tab area, Forge+Compare panels stacked below |
| `ItemWindow` | Bottom Tab → opens in tab area, Forge panel contextually appears |
| `PetWindow` | Bottom Tab → opens in tab area |
| `SkillWindow` | Bottom Tab → opens in tab area |
| `ShopWindow` | Full-screen Modal, larger touch targets |
| `SpecialShopWindow` | Full-screen Modal |
| `MapWindow` | Full-screen Modal or Bottom Sheet |
| `SaveWindow` | Full-screen Modal |
| `HelpWindow` | Full-screen Modal, scrollable |

Modal vs. Bottom Tab: Windows that require dedicated attention (shop, save, map, help) become full-screen modals. Windows that are inspection/management (equip, item, pet, skill) become Bottom Tab panels.

### 6.4 Common Components

| Component | Mobile Notes |
|-----------|-------------|
| `InfoWindow` | Replaced by Popover; `GlobalMouseTracker` removed |
| `ScrollPanel` | Keep; verify touch scroll + momentum |
| `Common.tsx` (FlickerButton, etc.) | Port to mobile with 44pt touch targets |
| `StickFigure` | Keep as-is (svg/pixel rendering) |
| `ProgressBar` | Increase height for touch readability |

### 6.5 Debug (Disable on Mobile)

- `TestSpeedControl` — gated behind `TEST_SPEED_CONTROL_ENABLED`; build-time disabled for mobile release builds
- `FPSDisplay` — optional, keep for dev

---

## 7. Data Persistence & Save System

### 7.1 Current State

`SaveSystem.ts` uses `localStorage` (`SAVE_PREFIX + slot`). On mobile:
- iOS may evict localStorage under storage pressure (documented behavior)
- Android WebView is more tolerant but still not guaranteed

### 7.2 Migration Plan

**Phase 1 (launch):** Keep localStorage as primary, add `@capacitor/preferences` as backup. On save, write to both. On load, try `Preferences` first, fall back to localStorage.

**Phase 2 (post-launch):** Add save export/import buttons (already partially implemented via `MANUAL_SAVE`/`MANUAL_LOAD` actions). Encourage users to periodically export saves as `.boe` files.

**Phase 3 (if needed):** Switch entirely to `@capacitor/filesystem` for save storage (survives app deletion on iOS only if stored in iCloud-backed directory — not recommended as default).

### 7.3 Save Automerger

When desktop and mobile saves diverge (same player playing on two platforms): the desktop `MANUAL_EXPORT` / `MANUAL_IMPORT` actions already support file-based save transfer. No cloud sync needed for launch.

---

## 8. Build Configuration

### 8.1 Dependencies to Add

```json
{
  "@capacitor/core": "^7",
  "@capacitor/cli": "^7",
  "@capacitor/android": "^7",
  "@capacitor/ios": "^7",
  "@capacitor/app": "^7",
  "@capacitor/preferences": "^7",
  "@capacitor/local-notifications": "^7",
  "@capacitor/screen-orientation": "^7"
}
```

### 8.2 Build Scripts

```json
{
  "build:mobile": "vite build --config vite.config.mobile.mjs",
  "cap:sync": "npm run build:mobile && npx cap sync",
  "cap:open:android": "npx cap open android",
  "cap:open:ios": "npx cap open ios",
  "cap:run:android": "npm run cap:sync && npx cap run android",
  "cap:run:ios": "npm run cap:sync && npx cap run ios"
}
```

### 8.3 Vite Config for Mobile

- Set `base: './'` (Capacitor loads from file://, not http://)
- `publicDir: 'public-packaged'` (same as desktop build)
- No dev server needed for mobile — build → sync → run in Android Studio/Xcode

---

## 9. Implementation Phases

### Phase 0: Desktop Freeze (Current)
- Complete desktop UI finalization
- Ensure `src/core/` and `src/state/` APIs are stable
- `TEST_SPEED_CONTROL_ENABLED` defaulting to `false` in production builds

### Phase 1: Foundation (~1-2 weeks)
1. Init Capacitor project (`npx cap init`)
2. Create `platformBridge` abstraction + both implementations
3. Set up dual-build Vite config
4. Create `src/main.mobile.tsx` entry point
5. Port `GameProvider` to mobile (99% shared, just wire bridge)
6. Create `src/styles-mobile/variables.css` with mobile CSS variables

### Phase 2: Core Scenes (~1-2 weeks)
1. `BeginSceneMobile` — name input, race selection
2. `RaceSceneMobile` — age/race picker
3. `MainSceneMobile` — layout skeleton (Section 4)
4. `SaveSceneMobile` / `ConfirmSceneMobile`
5. Verify game loop (battle tick) works in WebView

### Phase 3: Panels & Interaction (~2-3 weeks)
1. `Popover` component + `useLongPress` hook
2. Convert all panels to mobile variants (per Section 6 inventory)
3. Bottom Tab Bar + panel switching
4. Loot button + badge
5. Forge + Compare contextual panel
6. Replace hover tooltips with tap-Popover throughout

### Phase 4: Windows as Modals (~1-2 weeks)
1. Modal wrapper component
2. Port Shop, Map, Save, Help, SpecialShop windows
3. Navigation back-button handling (Android hardware back)

### Phase 5: Offline Catch-Up (~1 week)
1. Implement `OfflineProgress.ts`
2. Integrate with `useGameLoop` catch-up scheduling
3. Wire platform bridge `onAppResume` → catch-up
4. Offline summary screen
5. Safety caps and edge cases

### Phase 6: Polish & Store Prep (~2 weeks)
1. Safe area / notch adaptation (`safe-area-inset-*`)
2. Landscape layout refinement
3. `@capacitor/local-notifications` wiring (battle death, rare loot)
4. App icon + splash screen assets
5. Privacy policy page (GitHub Pages, 1-paragraph)
6. Android: foreground service notification if keeping screen awake
7. iOS: ensure no `TEST_SPEED_CONTROL_ENABLED`, no hidden debug flags
8. Test on physical devices (Android 10+ phone, iOS 16+ phone)

### Phase 7: Store Submission (~1 week)
1. Google Play Console listing (screenshots, description, content rating)
2. App Store Connect listing
3. First submission review → iterate on rejections
4. Initial release as "Early Access" or "Beta" to limit expectations

**Total estimated effort: ~8-12 weeks** (one developer, after desktop freeze)

---

## 10. Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| iOS 4.2 "Minimum Functionality" rejection | High | Leverage offline catch-up, local notifications, and file save export as native-justifying features |
| WebView performance on low-end Android | Medium | Game is tick-based (500ms), no 60fps rendering. Minimal risk. |
| localStorage eviction on iOS | Medium | Dual-write to `@capacitor/preferences`; add manual export button prominently |
| Safe area / notch clipping | Medium | Use `dvh` + `safe-area-inset-*` from day one |
| Desktop ↔ mobile code drift during P0-P7 | Medium | Keep `src/core/` and `src/state/` changes additive-only after freeze |
| App Store review iteration time | Low | Plan for 2-3 review rounds; start iOS submission early |

---

## 11. Open Questions (Defer to Implementation)

- **Notification granularity:** Which events deserve push/local notifications? (Battle death? Rare drop? Forge success?)
- **Widget support:** iOS Lock Screen / Android home screen widget showing HP/gold/session stats?
- **Splash screen:** Reuse BOE branding or design dedicated mobile splash art?
- **Monetization:** Any IAP or ad strategy for mobile? (Current codebase has zero. Keep it that way or plan separately.)
