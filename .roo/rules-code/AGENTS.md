# Project Coding Rules (Non-Obvious Only)

## Blockly Integration
- All block colors are forced to 'premium_dark' via override in `index.html` (lines 18-31)
- Blocks are forced draggable/deletable/editable regardless of original definition
- Custom blocks defined in `Block_Definition.js` use JSON array format
- Code generator in `Generator_Stub.js` has many TODOs - placeholder code (`'...'`) needs implementation

## Trading Logic
- `GLOBAL_CATEGORY` must be set before trade execution; missing causes default "CALL"/"PUT"
- Contract type mapping in `getProposalData()` (lines 2105-2432) has non-intuitive patterns:
  - "Higher/Lower (Equals)" uses "CALLE"/"PUTE" not "CALL"/"PUT"
  - "Rise/Fall" has reversed mapping: req1="PUT", req2="CALL"
- Barrier directions require "+" or "-" prefix (e.g., "+100", "-50")
- Digit barriers must be stringified: `String(bot_trade_settings.digit)`
- Accumulator contracts use `growth_rate` parameter, not barrier
- Vanilla options use `vanila_barriers` (note misspelling in variable name)

## Direct vs Indirect Trading
- `bot_trade_settings.isDirectTrade` switches between two trading modes:
  - `true`: Full contract parameters sent via `bot_place_trade()`
  - `false`: Uses pre-obtained proposal IDs (`over_prop_id`, `under_prop_id`)
- Proposal IDs stored after `getProposalData()` calls with req_id 99 (under) and 11 (over)

## WebSocket Communication
- Socket manages multiple message types: `proposal`, `buy`, `open_contract`, `tick`
- `pendingProposalResolves` object tracks async proposal requests by req_id
- Timeout: 10 seconds for proposal requests