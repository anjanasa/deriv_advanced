# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview
- **Platform**: Web-based trading bot visual programming interface using Google Blockly
- **Target API**: Deriv trading platform (binary options/contracts)
- **Architecture**: Static HTML/JS with WebSocket connections to Deriv API

## Non-Obvious Patterns & Critical Information

### 1. Global State Management
- `GLOBAL_CATEGORY` variable determines contract type and must be set before trade execution
- `bot_trade_settings` object contains all trading parameters; modifications affect live trading
- `bot_trade_settings.isDirectTrade` boolean switches between direct API calls vs proposal-based trading

### 2. Contract Category Mapping
- Contract types are mapped in `getProposalData()` function (lines 2105-2432)
- Each category has specific parameter requirements (barrier, barrier2, growth_rate, etc.)
- "Higher/Lower (Equals)" uses contract types "CALLE"/"PUTE" not "CALL"/"PUT"
- "Rise/Fall" has reversed mapping: req1="PUT", req2="CALL" (counterintuitive)

### 3. Direct vs Indirect Trading
- When `isDirectTrade == true`: Full contract parameters sent via `bot_place_trade()`
- When `isDirectTrade == false`: Uses pre-obtained proposal IDs (`over_prop_id`, `under_prop_id`)
- Proposal IDs are stored after `getProposalData()` calls with req_id 99 (under) and 11 (over)

### 4. Blockly Integration
- Custom blocks defined in `Block_Definition.js` (2078 lines)
- Code generation in `Generator_Stub.js` (554 lines) - many blocks have placeholder code (`'...'`)
- Block colors forced to 'premium_dark' via override in `index.html` (lines 18-31)
- All blocks are forced draggable/deletable/editable regardless of original definition

### 5. WebSocket Communication
- Socket connection manages multiple message types: `proposal`, `buy`, `open_contract`, `tick`
- `pendingProposalResolves` object tracks async proposal requests by req_id
- Timeout handling: 10 seconds for proposal requests

### 6. Critical Paths & Files
- Main logic: `script.js` (3486 lines) - contains all trading logic and UI handlers
- Block definitions: `Block_Definition.js` - JSON array of Blockly block definitions
- Code generator: `Generator_Stub.js` - incomplete; many TODOs need implementation
- Custom CSS: `data/blockly-custom.css` - overrides Blockly default styles
- Custom blocks: `data/custom-blocks.js` - additional block definitions

### 7. Testing & Development
- No build system or package manager - pure static files
- Run by opening `index.html` directly in browser
- Debug via browser console; extensive `console.log` statements throughout
- WebSocket connection requires valid Deriv API token (not included in repo)

### 8. Common Pitfalls
- Missing `GLOBAL_CATEGORY` causes default "CALL"/"PUT" contract types
- Barrier directions require "+" or "-" prefix (e.g., "+100", "-50")
- Digit barriers must be stringified: `String(bot_trade_settings.digit)`
- Accumulator contracts use `growth_rate` parameter, not barrier
- Vanilla options use `vanila_barriers` (note misspelling in variable name)