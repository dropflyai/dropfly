# 03B_CHARTING_AND_VISUAL_CONTEXT — Specification

**Commit ID:** COMMIT-0006
**Status:** Approved
**Last Updated:** 2025-12-19

---

## 1) Purpose

Responsible for defining visual chart models, overlay specifications, zone rendering, and annotation schemas that translate raw market data and computed features into human-readable visual context. This folder produces **visual metadata and rendering specifications**—not actual charts or images, but the structured definitions that describe how data should be visualized. Supports both human review (UI/charts) and potential visual pattern recognition (future ML applications).

---

## 2) Owns / Does Not Own

### Owns
- Chart model definitions (candlestick, bar, line, volume schemas)
- Overlay specifications (moving averages, Bollinger bands, volume profile visual layout)
- Zone rendering specs (support/resistance boxes, value areas, gap zones, no-trade zones, range zones)
- Annotation schemas (swing labels, pivot markers, level touch indicators)
- Color/style mappings (trend-based coloring, strength gradients, alert highlighting)
- Multi-timeframe visual alignment (how to display D1 levels on M5 chart)
- Visual context metadata (what to show/hide based on regime or setup state)

### Does Not Own
- Indicator computation (that's `03_feature_engineering`)
- Raw data ingestion (that's `01_data_ingestion`)
- Setup or pattern detection logic (that's `04b_setup_and_pattern_library`)
- Signal generation (that's `08_signal_generation`)
- Actual chart rendering or UI implementation (that's platform/frontend responsibility)
- Regime classification (that's `04_market_regime`)
- Zone detection (consolidation, range-bound areas—detected upstream, only rendered here)

---

## 3) Inputs

**From 02_data_store:**
- `NormalizedBar[]` → Price data for candlestick/bar rendering
- `DerivedSeries` → Indicator values for overlays (EMA, VWAP, Bollinger bands)
- `PriceStructure` → Levels for zone rendering (S/R, POC, VAH, VAL, swings)
- `TrendMetrics` → Trend state for color mapping

**From 03_feature_engineering:**
- Volume profile outputs (POC, VAH, VAL, HVN, LVN) for visual zones
- Swing points for annotation placement
- Gap zones for highlight boxes

**From 04_market_regime (future):**
- Regime state for context-aware styling (e.g., high-volatility theme)

**From 04b_setup_and_pattern_library (future):**
- Detected patterns/setups for visual highlighting
- Range zones (consolidation areas) for rendering

**From 00_core:**
- `Logger` → Structured logging
- `ConfigContract` → Visual preferences (color schemes, default overlays, zone opacity)
- `Timestamp`, `Symbol`, `Timeframe` types

**From configuration:**
- Visual style definitions (color palettes, line widths, zone transparency)
- Default overlay sets per timeframe (e.g., D1: 20/50/200 EMA; M5: VWAP + value area)
- Annotation rules (when to show swing labels, pivot markers)

---

## 4) Outputs

**Schemas/Contracts (written to `02_data_store` → processed/ or served to UI):**

- `ChartModel` → symbol, timeframe, chart_type (candlestick/bar/line), data_range, overlays[], zones[], annotations[]
- `OverlaySpec` → overlay_type (EMA/SMA/Bollinger/VWAP/etc.), parameters, color, line_width, z_order
- `ZoneSpec` → zone_type (support/resistance/value_area/gap/no_trade/range), price_range (top, bottom), color, opacity, label
- `AnnotationSpec` → annotation_type (swing_high/swing_low/pivot/level_touch), timestamp, price, label_text, color, icon
- `VisualContext` → symbol, timeframe, timestamp, visible_overlays[], visible_zones[], visible_annotations[], color_scheme
- `RenderSpec` → Complete rendering instructions for a given symbol + timeframe + time range (chart + all overlays + zones + annotations)

**Metadata:**
- `VisualProvenance` → chart_model_version, style_version, last_updated
- `StyleCatalog` → Available color schemes, themes (dark/light/custom)

---

## 5) Submodules

### chart_models/
**Responsibility:** Defines chart types and data representation schemas.
**Key Artifacts:**
- `candlestick_model.py` → Candlestick chart schema (OHLC + volume, color rules for bull/bear candles)
- `bar_model.py` → OHLC bar chart schema
- `line_model.py` → Line chart schema (close-only, indicator lines)
- `volume_model.py` → Volume histogram schema (color-coded by price direction)
- `chart_registry.py` → Factory for loading chart models by type

### overlays/
**Responsibility:** Defines how indicators and derived series are visually overlaid on charts.
**Key Artifacts:**
- `moving_average_overlay.py` → EMA/SMA/WMA overlay specs (color, line style, width)
- `bollinger_overlay.py` → Bollinger bands overlay (upper/lower bands, fill opacity)
- `vwap_overlay.py` → VWAP line with optional standard deviation bands
- `volume_profile_overlay.py` → Volume profile histogram rendering (horizontal bars at price levels, POC highlight)
- `pivot_overlay.py` → Daily/weekly pivot lines (standard, Camarilla, Fibonacci)
- `overlay_registry.py` → Factory for loading overlays by type

### zones/
**Responsibility:** Defines visual zones (boxes, fills, highlights) for key price regions detected upstream.
**Key Artifacts:**
- `support_resistance_zones.py` → S/R zone boxes (price range, touch count display, recency fade)
- `value_area_zones.py` → VAH/VAL zones from volume profile (shaded area, POC line)
- `gap_zones.py` → Unfilled gap highlights (color-coded by gap type)
- `no_trade_zones.py` → Pre-defined zones to avoid (e.g., low liquidity hours, news blackout periods)
- `range_zone_renderer.py` → Renders range/consolidation zones detected by `04b_setup_and_pattern_library` (display-only, no detection logic)
- `zone_registry.py` → Factory for loading zones by type

### pattern_context/
**Responsibility:** Visual metadata for patterns (NOT detection logic, just how to display them if detected elsewhere).
**Key Artifacts:**
- `pattern_highlight.py` → Schema for highlighting detected patterns (e.g., head and shoulders, triangles—but detection happens in `04b`)
- `setup_visual_cues.py` → Visual cues for active setups (alert icons, background tints—setup logic in `04b`)
- `confluence_markers.py` → Markers for multi-factor confluence zones (when level + indicator + pattern align)

### render_specs/
**Responsibility:** Assembles complete rendering instructions for a given chart view.
**Key Artifacts:**
- `render_builder.py` → Builds `RenderSpec` from chart model + overlays + zones + annotations
- `timeframe_presets.py` → Default visual configurations per timeframe (D1 shows different overlays than M5)
- `theme_manager.py` → Manages color schemes and style themes (dark mode, light mode, custom)
- `visual_priority.py` → Z-order and visibility priority (what renders on top, what gets hidden when crowded)

---

## 6) Interfaces

### Upstream
- **02_data_store** → Reads bars, derived series, price structures
- **03_feature_engineering** → Reads computed features for overlay placement
- **04_market_regime** (future) → Reads regime state for context-aware styling
- **04b_setup_and_pattern_library** (future) → Reads detected patterns/setups/range zones for visual highlighting
- **00_core** → Config, Logger, Types

### This Folder
- Produces visual specifications (not actual rendered charts)

### Downstream (Strictly Leaf)
- **UI/Frontend** → Consumes `RenderSpec` to draw charts (outside brain scope)
- **15_post_trade_review** → Uses chart context for trade journaling (visual playback of trade setup)
- **17_docs** → Uses visual specs for documentation and examples

---

## 7) Validation & Failure Modes

### Validation Rules
- **Schema conformance:** All visual specs must match canonical schema (no missing required fields)
- **Color validity:** All colors must be valid hex/RGB values
- **Z-order consistency:** No overlapping z-orders for overlays/zones (must be unique or explicitly grouped)
- **Price range sanity:** Zone price ranges must be valid (top > bottom, within reasonable bounds)
- **Overlay parameter validity:** Overlay parameters must match source indicator parameters (e.g., EMA_20 overlay must reference EMA_20 derived series)
- **Security constraint:** Theme/style configs are schema-validated only; no dynamic code execution permitted

### Failure Modes

| Failure | Detection | Response |
|---------|-----------|----------|
| Missing source data | Overlay references non-existent indicator | Skip overlay, log warning, render chart without it |
| Invalid color spec | Color parsing failure | Use default color, log warning |
| Overlapping z-orders | Duplicate z-order values | Auto-assign based on priority rules, log warning |
| Zone price inversion | top < bottom | Skip zone, log error |
| Excessive overlays | > threshold (e.g., 20 overlays) | Warn, apply visibility priority (hide lowest priority) |
| Theme not found | Theme key missing | Fall back to default theme, log warning |
| Annotation placement conflict | Multiple annotations at same timestamp + price | Stack vertically, log info |
| Dynamic code in theme config | Code execution attempt detected | Reject config, halt startup, emit security alert |

---

## 8) Minimum Acceptance Criteria

✅ **Chart Models:**
- Candlestick model defined with OHLC schema and bull/bear color rules
- Bar chart and line chart models defined
- Volume histogram model defined with directional color coding
- Chart registry loads models by type from config

✅ **Overlays:**
- Moving average overlay (EMA/SMA/WMA) defined with color/width parameters
- Bollinger bands overlay defined with fill opacity
- VWAP overlay defined with optional deviation bands
- Volume profile overlay defined (horizontal histogram, POC highlight)
- Pivot overlay defined (daily/weekly, multiple pivot types)
- Overlay registry loads overlays by type

✅ **Zones:**
- Support/resistance zone spec defined (price range, touch count, recency fade)
- Value area zone spec defined (VAH/VAL shading, POC line)
- Gap zone spec defined (color-coded by gap type)
- No-trade zone spec defined (time-based or price-based blackout regions)
- Range zone renderer defined (display-only for upstream-detected consolidations)
- Zone registry loads zones by type

✅ **Pattern Context:**
- Pattern highlight schema defined (for patterns detected in `04b`)
- Setup visual cue schema defined (alert icons, background tints)
- Confluence marker schema defined (multi-factor alignment indicators)

✅ **Render Specs:**
- Render builder assembles complete `RenderSpec` from components
- Timeframe presets defined (D1, H1, M5 default visual configs)
- Theme manager supports at least 2 themes (dark, light)
- Visual priority/z-order system enforced

✅ **Security:**
- Theme/style configs validated as data-only (no code execution)
- Schema validation enforces static color/style definitions

✅ **Outputs:**
- All visual specs written to `02_data_store/processed/` or served directly to UI
- Schema includes version tracking for visual definitions
- Visual provenance tracked (model version, style version, last_updated)

✅ **Testing:**
- Unit tests for each visual spec builder (valid inputs → expected schema)
- Schema validation tests (reject invalid colors, price ranges, z-orders, code injection attempts)
- Render builder tests (assemble complete RenderSpec from components)
- Theme switching tests (verify color/style substitution)
- Edge case tests (missing overlays, excessive annotations, empty data ranges)

✅ **Documentation:**
- README in `03b_charting_and_visual_context/` explaining purpose and visual model philosophy
- Schema documentation for all visual specs (ChartModel, OverlaySpec, ZoneSpec, AnnotationSpec, RenderSpec)
- Theming guide (how to define custom color schemes)
- Timeframe preset configuration guide (how to customize default overlays per timeframe)
- Security note: theme/style configs are data-only, no dynamic execution

---

## 9) Deferred Design Notes

### Footprint Chart Model
**Deferred to:** Future (pending order-flow data contracts)

**Reason:** Footprint charts require bid/ask volume per price level (order flow data). This depends on upstream contracts from `01_data_ingestion` for tick-level bid/ask volume data, which are not yet defined.

**Future Capability:**
- `footprint_model.py` → Order flow footprint schema (bid/ask volume per price level, imbalance highlighting, delta profiles)
- Requires: `OrderFlowData` contract from `01_data_ingestion` (tick volume, bid/ask split, aggressive vs. passive classification)

**Action Required:** Define order-flow contracts in `01_data_ingestion` before implementing footprint model.
