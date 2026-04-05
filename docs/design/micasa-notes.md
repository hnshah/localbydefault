# micasa design/architecture notes (for last30days TUI + future TUI framework)

Sources:
- https://micasa.dev/
- https://micasa.dev/docs/
- https://micasa.dev/docs/development/architecture/
- https://micasa.dev/docs/reference/keybindings/
- https://micasa.dev/docs/reference/configuration/
- Repo: https://github.com/micasa-dev/micasa (1183★, updated 2026-04-04)

## What to borrow

### 1) TEA (Elm Architecture) in Bubble Tea
- Model / Update / View discipline.
- TabHandler interface per entity (avoids switch-case dispatch).

### 2) Modal key handling
- Nav/Edit/Form modes.
- Central keymap + `key.Matches()`.
- Overlay-first dispatch chain (help/chat/calendar/etc.)

### 3) Overlays
- Uses `bubbletea-overlay` to stack help/dashboard/extraction progress/etc.

### 4) Table UX
- Multi-column sort, column hide/show, row pinning filters.

### 5) Styling
- Wong colorblind-safe palette.
- `lipgloss.AdaptiveColor{Light, Dark}` roles.

### 6) Config UX
- Minimal config, but `config get` outputs JSON (keys stripped).
- Uses TOML config file in XDG config dir.

## How to apply to last30days

### last30days TUI v0 (watchlist)
- Tabs: Watchlist / Runs / Quotes
- Modes: Nav/Edit
- Overlays: Run log, help, quote preview.

### “Rails for TUIs” vision
- Entity-driven tables + forms scaffolding.
- Opinionated keymaps + overlays.
- A design token file → lipgloss styles + ANSI mapping.
- Agent-friendly: declarative spec → generated Bubble Tea app.

