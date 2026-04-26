# Project Debug Rules (Non-Obvious Only)

## Debugging Environment
- No build system or package manager - pure static files
- Run by opening `index.html` directly in browser
- Debug via browser console; extensive `console.log` statements throughout
- WebSocket connection requires valid Deriv API token (not included in repo)

## Common Pitfalls & Silent Failures
- Missing `GLOBAL_CATEGORY` causes default "CALL"/"PUT" contract types without error
- Barrier directions require "+" or "-" prefix (e.g., "+100", "-50") - missing prefix causes silent failure
- Digit barriers must be stringified: `String(bot_trade_settings.digit)` - numbers cause API errors
- Accumulator contracts use `growth_rate` parameter, not barrier - using barrier parameter fails silently
- Vanilla options use `vanila_barriers` (note misspelling in variable name)

## WebSocket Debugging
- Socket connection manages multiple message types: `proposal`, `buy`, `open_contract`, `tick`
- `pendingProposalResolves` object tracks async proposal requests by req_id
- Timeout: 10 seconds for proposal requests - check for unhandled rejections
- WebSocket errors may not surface in UI; check browser console network tab

## State Debugging
- `bot_trade_settings` object contains all trading parameters
- `GLOBAL_CATEGORY` determines contract type mapping
- `bot_trade_settings.isDirectTrade` switches between direct/indirect trading modes
- Proposal IDs (`over_prop_id`, `under_prop_id`) must be set before indirect trading

## Testing
- No automated test suite - manual testing required
- Test with mock WebSocket responses in browser console
- Check browser console for JavaScript errors and WebSocket messages