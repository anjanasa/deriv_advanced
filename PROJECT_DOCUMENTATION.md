# JarvisLab Trading Bot Platform Documentation

## Project Overview

**JarvisLab Official Deriv Partner** is a web-based visual programming interface for automated trading on the Deriv platform (binary options/contracts). The platform uses Google Blockly to allow users to create trading strategies through visual programming blocks without writing code.

### Key Features
- Visual programming with Google Blockly
- Real-time trading on Deriv platform
- Multiple contract types and trading strategies
- WebSocket API integration
- Account management and balance tracking
- Custom block library for advanced trading logic

## Architecture

### Technology Stack
- **Frontend**: Pure HTML/CSS/JavaScript (no framework)
- **Visual Programming**: Google Blockly
- **Communication**: WebSocket API
- **Styling**: Custom CSS with modern design system
- **API**: Deriv Trading Platform API

### System Architecture
```
index.html (Main Entry Point)
├── Blockly Integration (Google Blockly CDN)
├── Block_Definition.js (Custom Blocks)
├── Generator_Stub.js (Code Generation)
├── script.js (Main Application Logic)
├── data/custom-blocks.js (Additional Blocks)
├── data/blockly-custom.css (Styling)
└── styles.css (Main Application Styling)
```

## File Structure

### Core Files

#### `index.html`
- Main entry point for the application
- Includes Blockly libraries and custom scripts
- Defines toolbox XML for block categories
- Forces dark theme and makes all blocks draggable/deletable

#### `script.js` (3,486 lines)
**Main application logic containing:**
- Global state management
- WebSocket communication handlers
- Trading logic and API integration
- UI event handlers
- Market data management
- Account management

#### `Block_Definition.js` (2,077 lines)
**Custom Blockly block definitions:**
- Virtual Hook blocks for trading strategies
- Trade parameter blocks
- Market and contract type selectors
- Custom trading logic blocks

#### `Generator_Stub.js` (554 lines)
**Blockly code generation:**
- Converts visual blocks to executable JavaScript
- Many blocks have placeholder implementations (`'...'`)
- Needs completion for full functionality

#### `styles.css` (2,359 lines)
**Main application styling:**
- Modern dark theme design system
- Responsive layout
- Custom UI components
- Trading interface styling

### Data Directory

#### `data/custom-blocks.js`
Additional custom block definitions for advanced trading scenarios.

#### `data/blockly-custom.css`
Custom Blockly styling with futuristic dark theme.

## Key Components

### 1. Global State Management

#### `bot_trade_settings` Object
Central trading configuration object:
```javascript
let bot_trade_settings = {
  duration: '',           // Trade duration
  duration_unit: '',      // 's', 'm', 'h', 'd'
  growth: '',            // For accumulator contracts
  stake: '',             // Trade amount
  stake_unit: '',        // Currency unit
  digit: '',             // Digit contracts
  single_barrier: '',    // Single barrier value
  barrier_direction: '', // '+' or '-'
  first_barrier: '',     // First barrier
  second_barrier: '',    // Second barrier
  vanila_barriers: '',   // Vanilla options barriers
  is_bot_running: false,
  is_bot_on_trade: false,
  bot_purchase_direction: '',
  proposal_data_called: false,
  currency: 'USD',
  can_sell: false,
  current_contract_id: null,
  current_profit: 0
};
```

#### `GLOBAL_CATEGORY` Variable
Determines contract type and must be set before trade execution.

### 2. Contract Category System

#### Main Contract Types
- **Rise/Fall**: Basic up/down trading
- **Higher/Lower**: Range-based trading
- **Touch/No Touch**: Barrier-based trading
- **Ends Between/Outside**: Range exit conditions
- **Accumulator**: Multi-step accumulation contracts
- **Digit**: Digit-based outcomes
- **Vanilla**: Traditional options

#### Contract Category Mapping (Lines 2105-2432 in script.js)
Each category has specific parameter requirements:
- Barrier directions require "+" or "-" prefix
- Digit barriers must be stringified: `String(bot_trade_settings.digit)`
- Accumulator contracts use `growth_rate` parameter
- Vanilla options use `vanila_barriers` (note misspelling)

### 3. Trading Logic

#### Direct vs Indirect Trading
- **Direct Trade (`isDirectTrade == true`)**: Full contract parameters sent via `bot_place_trade()`
- **Indirect Trade (`isDirectTrade == false`)**: Uses pre-obtained proposal IDs

#### Proposal System
- `getProposalData()` function handles contract proposals
- Proposal IDs stored after requests with req_id 99 (under) and 11 (over)
- 10-second timeout for proposal requests

#### Virtual Hook System
Advanced trading strategy blocks:
- Start triggers: Win, Loss, Custom, Combined conditions
- Risk management: Max losses, wins, trades
- Stake management per hook

### 4. WebSocket Integration

#### Connection Management
```javascript
const APP_ID = '35751';
const WS_URL = `wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`;
```

#### Message Types
- `proposal`: Contract proposals
- `buy`: Trade execution confirmations
- `open_contract`: Active contract tracking
- `tick`: Real-time market data

#### State Tracking
- `pendingProposalResolves`: Map of req_id to resolve functions
- `isReconnecting`: Connection state management
- `isLoadingScreenVisible`: Loading state UI

### 5. Blockly Integration

#### Custom Block Features
- All blocks forced to 'premium_dark' theme
- All blocks are draggable, deletable, editable
- Dynamic dropdowns for markets and contract types
- Code generation with JavaScript generator

#### Main Block Types
1. **Main Block**: Primary trade definition
2. **Trade Settings**: Contract parameters
3. **Virtual Hook**: Trading strategies
4. **Market Selectors**: Market and contract type selection
5. **Logic Blocks**: Standard Blockly logic operations

### 6. UI Components

#### Main Interface Elements
- **Workspace**: Visual programming area
- **Toolbox**: Block categories and types
- **Control Panel**: Bot start/stop controls
- **Account Panel**: Balance and account management
- **Market Panel**: Real-time market data
- **Trade Panel**: Active trade monitoring

#### Design System
- Modern dark theme with cyan accents
- Responsive layout
- Custom fonts (Inter, DM Sans, Geist)
- Smooth animations and transitions

## API Integration

### Deriv API Endpoints
- **WebSocket**: Real-time data and trade execution
- **Authentication**: Token-based authentication
- **Market Data**: Real-time tick and contract data
- **Trade Execution**: Buy/sell operations
- **Account Management**: Balance and transaction history

### API Message Structure
```javascript
// Trade example
{
  "buy": 1,
  "price": 10,
  "parameters": {
    "amount": 10,
    "basis": "stake",
    "contract_id": 12345,
    "duration": 60,
    "duration_unit": "s",
    "symbol": "R_100"
  }
}
```

## Development Setup

### Running the Application
1. Open `index.html` directly in a browser
2. No build system or package manager required
3. Requires valid Deriv API token for live trading
4. Debug via browser console

### Testing
- No automated test framework
- Manual testing through browser console
- Extensive `console.log` statements throughout code
- Test file: `test_payout_fix.html`

### Common Development Commands
```bash
# View in browser
open index.html

# Check git status
git status

# View recent changes
git diff
```

## Critical Implementation Details

### 1. Global Category Dependencies
- `GLOBAL_CATEGORY` must be set before trade execution
- Missing category defaults to "CALL"/"PUT" contract types
- Category mapping affects all subsequent trading operations

### 2. Barrier Direction Rules
- Barrier values require "+" or "-" prefix
- Examples: "+100", "-50"
- Critical for proper contract execution

### 3. State Management
- `userStoppedBot` flag prevents automatic restart
- `isAccountChanging` prevents race conditions during account switches
- `isMarketDataReady` flag ensures data availability before trading

### 4. Error Handling
- Automatic reconnection on WebSocket failures
- Trade error recovery options
- Market data loading timeouts

### 5. Performance Considerations
- "Restart Buy/Sell On Error" can be disabled for better performance
- Efficient market data caching
- Minimal DOM manipulation

## Troubleshooting

### Common Issues
1. **Contract Type Errors**: Ensure `GLOBAL_CATEGORY` is properly set
2. **Barrier Direction**: Always use "+" or "-" prefix for barrier values
3. **API Token**: Valid Deriv API token required for live trading
4. **Market Data**: Wait for market data to load before trading
5. **Account Balance**: Ensure sufficient balance for desired stake amounts

### Debug Information
- Extensive console logging throughout application
- WebSocket connection status monitoring
- Account balance tracking
- Trade execution logging

## Future Enhancements

### Planned Features
- Complete Generator_Stub implementations
- Additional custom block types
- Advanced risk management tools
- Strategy backtesting capabilities
- Multi-account management
- Trading analytics dashboard

### Technical Improvements
- Implement missing code generator functions
- Add comprehensive error handling
- Optimize WebSocket reconnection logic
- Improve UI responsiveness
- Add automated testing framework

---

*This documentation covers the complete architecture and functionality of the JarvisLab Trading Bot Platform. For additional details, refer to the source code comments and inline documentation throughout the application files.*