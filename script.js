/* ─── Global Variables ─────────────────────────────────────────────────── */
'use strict';

let workspace = null;
let accountList = [];
let lastModifiedTime = 'Never';
let currentAccountIndex = 0;
let accountBalances = {};        // balance per loginid
let globalMarketData = {};       // categorized open-market data
let isCodePanelVisible = false;
let selectedAccountCurrency = 'USD';
const subdata = {};              // contract sub-categories built from contracts_for
let available_contracts = [];
let purchaseOptions = [
  ["Option", "OPTION"]
];
let isBlockinitials = false;
let GLOBAL_CATEGORY
let rawticklist
let trade_again = true

//trading settings
let bot_trade_settings = {
  duration: '',
  duration_unit: '',
  growth: '',
  stake: '',
  stake_unit: '',
  digit: '',
  single_barrier: '',
  barrier_direction: '',
  first_barrier: '',
  second_barrier: '',
  barrier_direction_1: '',
  barrier_direction_2: '',
  vanila_barriers: '',
  is_bot_running: false,
  is_bot_on_trade: false,
  bot_purchase_direction: '',
  proposal_data_called: false,
  currency: 'USD'
};

// Set to true when the user explicitly clicks Stop Bot.
// bot_trade_closed respects this flag and will NOT restart the loop.
let userStoppedBot = false;

let bot_functions = {
  assign_bot_variables_f: () => {
    console.log("assign_bot_variables");
  },
  runOnceAtStart_f: () => {
    console.log("runOnceAtStart");
  },
  watchAndPurchase_f: () => {
    console.log("watchAndPurchase");
  },
  watchAndSell_f: () => {
    console.log("watchAndSell");
  },
  tradeAgain_f: () => {
    console.log("tradeAgain");
  }
};

let assign_bot_variables;



const APP_ID = '35751';
const WS_URL = `wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`;

let socket = null;
let pingIntervalId = null;
let pingSentTime = null;
let previousPing = null;
let isLoadingScreenVisible = true;
let isReconnecting = false;
let pendingMarketSubscriptionResolve = null;
let pendingProposalResolves = {}; // Map of req_id to resolve functions
let isImporting = false; // Flag to prevent getContractForSymbol during import
let isAccountChanging = false; // Flag to prevent getContractForSymbol during account change
let isMarketDataReady = false; // Flag to track if market data is loaded
let pendingImportCallback = null; // Callback to run after markets are ready
let isContractDataReady = false; // Flag to track if contract data is loaded
let pendingContractCallback = null; // Callback to run after contracts are ready

/* ─── Blockly Dynamic Dropdown Data ─────────────────────────────────────── */
const PLACEHOLDER_OPTIONS = [['Loading…', 'LOADING']];

let currentMarketOptions = [...PLACEHOLDER_OPTIONS];
let secondMarketData = [...PLACEHOLDER_OPTIONS];
let thirdMarketData = [...PLACEHOLDER_OPTIONS];
let mainContractTypes = [...PLACEHOLDER_OPTIONS];
let subContractTypes = [...PLACEHOLDER_OPTIONS];

/* ─── Blockly Theme ──────────────────────────────────────────────────────── */
const rootStyles = getComputedStyle(document.documentElement);
const THEME_CATEGORY_COLOR = rootStyles.getPropertyValue('--toolbox-category-color').trim() || '#04db81';

/* ─── Main Block Definition ──────────────────────────────────────────────── */
Blockly.Blocks['main_block'] = {
  init() {
    this.appendDummyInput()
      .appendField('(1) Define your trade Contract');
    this.appendDummyInput()
      .appendField('Market')
      .appendField(new Blockly.FieldDropdown(() => currentMarketOptions), 'first_market')
      .appendField('>')
      .appendField(new Blockly.FieldDropdown(() => secondMarketData), 'second_market')
      .appendField('>')
      .appendField(new Blockly.FieldDropdown(() => thirdMarketData), 'third_market');
    this.appendDummyInput()
      .appendField('Trade Type')
      .appendField(new Blockly.FieldDropdown(() => mainContractTypes), 'first_category')
      .appendField('>')
      .appendField(new Blockly.FieldDropdown(() => subContractTypes), 'second_category');
    this.appendDummyInput()
      .appendField('Contract Type')
      .appendField(new Blockly.FieldDropdown([
        ['Single', 'single'],
        ['Both', 'both']
      ]), 'contract_type');
    this.appendDummyInput()
      .appendField('Default Candle Interval')
      .appendField(new Blockly.FieldDropdown([
        ['1 Minute', '1m'], ['2 Minute', '2m'], ['3 Minute', '3m'],
        ['5 Minute', '5m'], ['10 Minute', '10m'], ['15 Minute', '15m'],
        ['30 Minute', '30m'], ['1 Hour', '1h'], ['2 Hour', '2h'],
        ['4 Hour', '4h'], ['8 Hour', '8h'], ['1 Day', '1d']
      ]), 'candle_interval');
    this.appendDummyInput()
      .appendField('Restart Buy/Sell On Error  (Disable For Better Performance)')
      .appendField(new Blockly.FieldCheckbox('FALSE'), 'buySellError');
    this.appendDummyInput()
      .appendField('Restart Last Trade On Error  (Bot Ignores Unsuccessful Trades)')
      .appendField(new Blockly.FieldCheckbox('TRUE'), 'lastTradeOnError');
    this.appendDummyInput()
      .appendField('Run Once at Start');
    this.appendStatementInput('run_once').setCheck(null);
    this.appendDummyInput()
      .appendField('Define Trade Options');
    this.appendStatementInput('trade_options').setCheck(null);
    this.appendDummyInput()
      .appendField('(2) Watch and Purchase your Contract');
    this.appendStatementInput('watch_purchase').setCheck(null);
    this.appendDummyInput()
      .appendField('(3) Watch and Sell your Purchased Contract');
    this.appendStatementInput('watch_sell').setCheck(null);
    this.appendDummyInput()
      .appendField('(4) Get your Trade Result and Trade Again');
    this.appendStatementInput('trade_again').setCheck(null);
    this.setInputsInline(false);
    this.setColour(230);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['trade_settings'] = {

  init: function () {

    // ✅ Apply latest category when block is created
    this.category = GLOBAL_CATEGORY;

    this.setPreviousStatement(true, null);
    this.setColour(230);
    this.setInputsInline(false);

    this.updateShape_();
  },

  setCategory: function (category) {
    if (this.category !== category) {

      //this.category = category;

      // ✅ store globally
      //GLOBAL_CATEGORY = category;

      // ✅ Update ALL existing blocks (once)
      const blocks = this.workspace.getBlocksByType('trade_settings', false);
      blocks.forEach(block => {
        if (block !== this) {
          block.category = category;
          block.updateShape_();
        }
      });

      // ✅ Update THIS block
      this.updateShape_();

      // ✅ Refresh toolbox so new blocks follow latest category
      this.workspace.updateToolbox(this.workspace.options.languageTree);
    }
  },

  updateShape_: function () {

    // ✅ Remove all dynamic inputs safely
    [
      'duration',
      'growth',
      'stake',
      'digit',
      'single_barrier',
      'first_barrier',
      'second_barrier',
      'vanila_barriers'
    ].forEach(input => {
      if (this.getInput(input)) {
        this.removeInput(input);
      }
    });

    // ----------------------------
    // 🔧 Input Builders
    // ----------------------------

    const addDuration = (block) => {
      block.appendValueInput("duration")
        .appendField("Duration :")
        .appendField(new Blockly.FieldDropdown([
          ["Ticks", "t"],
          ["Seconds", "s"],
          ["Minutes", "m"]
        ]), "duration_unit");
    };

    const addStake = (block) => {
      block.appendValueInput("stake")
        .appendField("Stake :")
        .appendField(new Blockly.FieldDropdown([
          ["Stake", "stake"],
          ["Payout", "payout"]
        ]), "stake_unit");
    };

    const addDigit = (block) => {
      block.appendValueInput('digit')
        .appendField("Prediction :");
    };

    const addSingleBarrier = (block) => {
      block.appendValueInput('single_barrier')
        .appendField("Barrier :")
        .appendField(new Blockly.FieldDropdown([
          ["Offset +", "offset_plus"],
          ["Offset -", "offset_minus"]
        ]), "barrier_direction");
    };

    const addDoubleBarrier = (block) => {
      block.appendValueInput('first_barrier')
        .appendField("Barrier 1 :")
        .appendField(new Blockly.FieldDropdown([
          ["Offset +", "offset_plus"],
          ["Offset -", "offset_minus"]
        ]), "barrier_direction_1");

      block.appendValueInput('second_barrier')
        .appendField("Barrier 2 :")
        .appendField(new Blockly.FieldDropdown([
          ["Offset -", "offset_minus"],
          ["Offset +", "offset_plus"]
        ]), "barrier_direction_2");
    };

    const addGrowth = (block) => {
      block.appendDummyInput("growth")
        .appendField("Growth Rate :")
        .appendField(new Blockly.FieldDropdown([
          ["1%", "1"],
          ["2%", "2"],
          ["5%", "5"],
          ["10%", "10"]
        ]), "growth_unit");
    };

    const addVanilla = (block) => {
      block.appendDummyInput("vanila_barriers")
        .appendField("Spot :")
        .appendField(new Blockly.FieldDropdown([
          ["Up", "up"],
          ["Down", "down"]
        ]), "vanila_direction");
    };

    // ----------------------------
    // 🔧 Base Builders
    // ----------------------------

    const base = () => addDuration(this);
    const finalize = () => addStake(this);

    // ----------------------------
    // 🔧 Category Logic
    // ----------------------------

    let mainBlocks = workspace.getBlocksByType("main_block");
    let category = null;

    if (mainBlocks.length > 0) {
      category = mainBlocks[0].getFieldValue("second_category");
    }

    switch (category) {

      case "Accumulator Up":
      case "Accumulators":
        addGrowth(this);
        addStake(this);
        break;

      case "Digit Match/Digit Differs":
      case "High Tick/Low Tick":
        base();
        addDigit(this);
        finalize();
        break;

      case "One Touch/No Touch":
      case "Higher/Lower":
        base();
        addSingleBarrier(this);
        finalize();
        break;

      case "Ends Between/Ends Outside":
      case "Stay Between/Goes Outside":
        base();
        addDoubleBarrier(this);
        finalize();
        break;

      case "Vanilla Long Call/Vanilla Long Put":
        base();
        addVanilla(this);
        finalize();
        break;

      default:
        base();
        finalize();
        break;
    }

    // ✅ Force UI refresh (safe)
    if (this.rendered) {
      this.render();
    }
  }
};
Blockly.Blocks['purchase'] = {
  init: function () {

    this.appendDummyInput("main")
      .appendField("Purchase")
      .appendField(
        new Blockly.FieldDropdown(() => purchaseOptions),
        "purchase_direction"
      );

    this.setPreviousStatement(true, null);
    this.setColour(230);
  },

  updateShape_: function () {
    const field = this.getField('purchase_direction');
    if (field) {
      field.menuGenerator_ = purchaseOptions;
      field.setValue(purchaseOptions[0][1]); // reset safely
    }
  }

};
Blockly.Blocks['payout'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Payout")
      .appendField(
        new Blockly.FieldDropdown(() => purchaseOptions),
        "purchase_direction"
      );
    this.setInputsInline(false);
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  },
  updateShape_: function () {
    const field = this.getField('purchase_direction');
    if (field) {
      field.menuGenerator_ = purchaseOptions;
      field.setValue(purchaseOptions[0][1]); // reset safely
    }
  }
};
Blockly.Blocks['askprice'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Ask Price")
      .appendField(
        new Blockly.FieldDropdown(() => purchaseOptions),
        "purchase_direction"
      );
    this.setInputsInline(false);
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  },
  updateShape_: function () {
    const field = this.getField('purchase_direction');
    if (field) {
      field.menuGenerator_ = purchaseOptions;
      field.setValue(purchaseOptions[0][1]); // reset safely
    }
  }
};

/* ─── Initialize Blockly ─────────────────────────────────────────────────── */
function initBlockly() {
  const container = document.querySelector('.blockly-container');
  if (!container) {
    console.error('[Blockly] .blockly-container not found');
    return;
  }

  const toolboxXml = document.getElementById('toolbox');
  if (!toolboxXml) {
    console.error('[Blockly] #toolbox element not found');
    return;
  }

  const premiumTheme = Blockly.Theme.defineTheme('premiumTheme', {
    base: Blockly.Themes.Classic,
    componentStyles: {
      workspaceBackgroundColour: '#060910',
      toolboxBackgroundColour: '#0d1117',
      toolboxForegroundColour: '#8b949e',
      flyoutBackgroundColour: 'rgba(13, 17, 23, 0.97)',
      insertionMarkerColour: '#22d3ee',
      scrollbarColour: 'rgba(34, 211, 238, 0.2)',
    },
    blockStyles: {
      premium_dark: {
        colourPrimary: '#161b22',
        colourSecondary: '#0d1117',
        colourTertiary: '#21262d'
      }
    }
  });

  workspace = Blockly.inject(container, {
    toolbox: toolboxXml,
    renderer: 'thrasos',
    theme: premiumTheme,
    grid: { spacing: 25, length: 3, colour: 'rgba(4, 219, 129, 0.05)', snap: true },
    move: { scrollbars: true, drag: true, wheel: true },
    zoom: { wheel: true, startScale: 1.0, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 }
  });

  // Keep Blockly canvas in sync with container size changes
  const resizeObserver = new ResizeObserver(() => Blockly.svgResize(workspace));
  resizeObserver.observe(container);

  // Single consolidated change listener
  workspace.addChangeListener(onWorkspaceChange);

  enforceSingleMainBlock(workspace);

  console.log('[Blockly] Workspace initialised ✓');
  block_change_detect()

  isBlockinitials = true;
}

/**
 * Unified workspace change listener – replaces the two separate listeners
 * that existed previously, eliminating duplicate event handling.
 */
function onWorkspaceChange(event) {
  // --- Stats & code panel (always run) ---
  trackBlockChanges(event);
  updateStats();
  if (isCodePanelVisible) updateGeneratedCode();

  const block = workspace.getBlockById(event.blockId);
  if (!block) return;

  // ✅ Handle BLOCK_CREATE first
  if (event.type === Blockly.Events.BLOCK_CREATE) {
    switch (block.type) {
      case "purchase":
        console.log("[Block] Purchase block created");

        break;
      case "main_block":
        console.log("[Block] Main block created", isImporting);

        if (!isImporting) {
          // Optional: initialize dropdowns immediately
          const firstValue = block.getFieldValue('first_market');
          if (firstValue && globalMarketData[firstValue]) {
            updateSecondDropdown(block, firstValue);
          }
        }

        break;
    }
    return; // stop here for create events
  }

  // Only proceed for main_block after this
  if (block.type !== 'main_block') return;

  // Auto-init on load / non-field changes
  if (event.type !== Blockly.Events.CHANGE || event.element !== 'field') {
    try {
      const secondValue = block.getFieldValue('second_market');
      if (secondValue === 'LOADING' || secondValue === 'OPTIONNAME') {
        const firstValue = block.getFieldValue('first_market');
        if (firstValue && globalMarketData[firstValue]) {
          updateSecondDropdown(block, firstValue);
        }
      }
    } catch (_) { }
    return;
  }

  // --- Field change handling ---
  switch (event.name) {
    case 'first_market':
      updateSecondDropdown(block, event.newValue);
      break;

    case 'second_market':
      updateThirdDropdown(block, event.newValue);
      break;

    case 'third_market':
      console.log('[Market] Third market changed to:', event.newValue);
      getContractForSymbol(event.newValue);
      break;

    case 'first_category':
      console.log('[Contract] First category changed to:', event.newValue);
      updateSecondCategoryDropdown(block, event.newValue);
      break;

    case 'second_category':
      secondCatupdateTrigger(block, event.newValue);
      break;
  }
}
/* ─── WebSocket ──────────────────────────────────────────────────────────── */

/** Create (or recreate) the WebSocket and attach handlers. */
function connectWebSocket() {
  if (socket && socket.readyState === WebSocket.OPEN) return; // already open

  socket = new WebSocket(WS_URL);
  isReconnecting = false;

  socket.onopen = () => {
    console.log('[WS] Connection established');
    hideLoadingScreen();

    // Start ping heartbeat
    if (pingIntervalId) clearInterval(pingIntervalId);
    pingIntervalId = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        pingSentTime = Date.now();
        socket.send(JSON.stringify({ ping: 1 }));
      }
    }, 1000);

    // Give DOM a moment then parse credentials from URL
    setTimeout(parseAccountsFromURL, 1000);
  };

  socket.onclose = (evt) => {
    console.warn('[WS] Connection closed:', evt.code, evt.reason);
    clearInterval(pingIntervalId);

    if (isLoadingScreenVisible) {
      setLoadingMessage('Connection lost. Reconnecting…', 'var(--red-color)');
    }

    // Auto-reconnect with back-off (5 s)
    if (!isReconnecting) {
      isReconnecting = true;
      setTimeout(connectWebSocket, 5000);
    }
  };

  socket.onerror = (err) => {
    console.error('[WS] Error:', err);
    if (isLoadingScreenVisible) {
      setLoadingMessage('Connection error. Please check your internet.', 'var(--red-color)');
      showError('WebSocket connection failed. Please check your internet connection.');
    }
  };

  socket.onmessage = handleSocketMessage;
}

/** Route incoming WebSocket messages to the appropriate handler. */
function handleSocketMessage(event) {
  let data;
  try {
    data = JSON.parse(event.data);
  } catch (err) {
    console.error('[WS] Failed to parse message:', err);
    return;
  }

  // API-level error check (applies to most message types)
  if (data.error) {
    const ctx = data.msg_type || 'unknown';
    console.error(`[WS] API error (${ctx}):`, data.error.message);
    // Let individual handlers decide if they need to show UI feedback
  }

  switch (data.msg_type) {
    case 'authorize': handleAuthorize(data); break;
    case 'balance': handleBalance(data); break;
    case 'ping': handlePing(); break;
    case 'active_symbols': processActiveSymbols(data); break;
    case 'contracts_for': processContractsFor(data); break;
    case 'history': processTicksHistory(data); break;
    case 'ticks_history': processTicksHistory(data); break;
    case "tick": processTicks(data); break;
    case "buy": processBuy(data); break;
    case "proposal": processProposal(data); break;
    case "proposal_open_contract": processOpenContract(data); break;
    //case "sell": processSell(data); break;
    default:
      // Silently ignore message types we don't handle
      break;
  }
  if (data.msg_type === 'contracts_for') {
    console.log('[WS] Contracts for:', data);
  }
}

function handleAuthorize(data) {
  if (data.error) {
    showError(data.error.message || 'Authorization failed');
    const loginDiv = document.querySelector('.login');
    if (loginDiv) loginDiv.style.display = 'flex';
    // Reset account changing flag on auth error too
    isAccountChanging = false;
    return;
  }

  // Reset account changing flag on successful authorization
  isAccountChanging = false;
  console.log('[Auth] Authorization successful, isAccountChanging flag cleared');

  afterAuthorized(data);
  getActiveMarkets();
}

function processTicks(data) {
  //console.log("ticks received", data);
  rawticklist.push(data.tick.ask, data.tick.epoch);
  if (rawticklist.length > 100) {
    //console.log('data exceeded')
    rawticklist.splice(0, rawticklist.length - 100);
  }
  //console.log(rawticklist)
  BotCallingEachTick()
}

function processTicksHistory(data) {
  console.log("ticks_history received", data);
  rawticklist = [];
  if (typeof pendingMarketSubscriptionResolve === 'function') {
    pendingMarketSubscriptionResolve(data);
    pendingMarketSubscriptionResolve = null;
    let ticks = data.history;
    for (let i = 0; i < ticks.prices.length; i++) {
      const tick = ticks.prices[i];
      const time = ticks.times[i];
      rawticklist.push({ tick, time })
    }
    //console.log(rawticklist)
  }
}

function handleBalance(data) {
  if (!data.balance) return;
  const { loginid, balance, currency = 'USD' } = data.balance;
  selectedAccountCurrency = currency;
  accountBalances[loginid] = `${currency} ${parseFloat(balance).toFixed(2)}`;

  if (accountList[currentAccountIndex]?.account === loginid) {
    updateAccountDisplay();
  }
}

function handlePing() {
  if (pingSentTime === null) return;
  const currentPing = Date.now() - pingSentTime;
  const pingDiv = document.querySelector('.ping');
  if (!pingDiv) return;

  let arrowHtml = '';
  if (previousPing !== null) {
    if (currentPing > previousPing) {
      arrowHtml = '<span style="color:red;margin-left:5px">&#9650;</span>';
    } else if (currentPing < previousPing) {
      arrowHtml = '<span style="color:green;margin-left:5px">&#9660;</span>';
    } else {
      arrowHtml = '<span style="color:gray;margin-left:5px">&#8211;</span>';
    }
  }
  pingDiv.innerHTML = `Ping: ${currentPing}ms ${arrowHtml}`;
  previousPing = currentPing;
}

/* ─── URL / Login ────────────────────────────────────────────────────────── */
// NOTE: Replace SAMPLE_URL with `window.location.href` once the page is hosted
const SAMPLE_URL =
  'https://binarylab.rf.gd/?acct1=CR2697040&token1=a1-qTVkA8wuwrwuC12TBl4G45sXHKdoU&cur1=USD' +
  '&acct2=CR2932882&token2=a1-7krHsKJJaXLgRXKW2kdC3izD50M43&cur2=USDC' +
  '&acct3=VRTC4545708&token3=a1-CTd8UkEJHdJPxBWnZMQWbdxW9HlgJ&cur3=USD';

function parseAccountsFromURL() {
  let params;
  try {
    params = new URL(SAMPLE_URL).searchParams;
  } catch (err) {
    console.error('[Auth] Invalid URL:', err);
    showLoginScreen();
    return;
  }

  accountList = [];
  let i = 1;
  while (params.has(`acct${i}`)) {
    accountList.push({
      account: params.get(`acct${i}`),
      token: params.get(`token${i}`),
      currency: params.get(`cur${i}`) || 'USD'
    });
    i++;
  }

  if (accountList.length === 0) {
    console.log('[Auth] No accounts in URL — showing login screen');
    showLoginScreen();
  } else {
    console.log(`[Auth] Found ${accountList.length} account(s). Authorising…`);
    sendWS({ authorize: accountList[0].token });
  }
}

function showLoginScreen() {
  const loginDiv = document.querySelector('.login');
  if (loginDiv) loginDiv.style.display = 'flex';
}

function loginWithToken(token) {
  if (!token || !token.trim()) {
    showError('Please enter a valid token');
    return;
  }
  token = token.trim();

  // Reuse existing entry if token already known
  const existingIndex = accountList.findIndex(acc => acc.token === token);
  if (existingIndex !== -1) {
    currentAccountIndex = existingIndex;
  } else {
    accountList.push({ account: 'Token Login', token, currency: 'USD' });
    currentAccountIndex = accountList.length - 1;
  }

  showInfo('Attempting authorization…');
  sendWS({ authorize: token });
}

function afterAuthorized(data) {
  console.log('[Auth] Authorized successfully');

  if (data.authorize) {
    const { loginid, currency = 'USD' } = data.authorize;
    const current = accountList[currentAccountIndex];
    if (current && (!current.account || current.account === 'Token Login')) {
      current.account = loginid;
      current.currency = currency;
      bot_trade_settings.currency = currency
    }
  }

  const loginDiv = document.querySelector('.login');
  if (loginDiv) loginDiv.style.display = 'none';

  updateAccountDisplay();
  setTimeout(fetchAccountBalance, 500);
  showSuccess('Authorized successfully', 2000);
}

/* ─── Account UI ─────────────────────────────────────────────────────────── */

function updateAccountDisplay() {
  const accountDisplay = document.getElementById('accountDisplay');
  const connectBtn = document.getElementById('connectAccountBtn');
  const hasAccount = accountList.length > 0 && currentAccountIndex < accountList.length;

  if (hasAccount) {
    const current = accountList[currentAccountIndex];
    const balance = accountBalances[current.account] || '0.00';
    document.getElementById('currentAccountName')?.textContent !== undefined &&
      (document.getElementById('currentAccountName').textContent = current.account);
    document.getElementById('currentAccountBalance')?.textContent !== undefined &&
      (document.getElementById('currentAccountBalance').textContent = balance);
    document.getElementById('currentAccountBadge')?.textContent !== undefined &&
      (document.getElementById('currentAccountBadge').textContent = current.account);
    if (accountDisplay) accountDisplay.style.display = 'flex';
    if (connectBtn) connectBtn.style.display = 'none';
  } else {
    if (accountDisplay) accountDisplay.style.display = 'none';
    if (connectBtn) connectBtn.style.display = 'block';
  }
}

function showAccountDropdown() {
  const dropdown = document.getElementById('accountDropdown');
  const accountsList = document.getElementById('accountsList');
  if (!dropdown || !accountsList) return;

  if (accountList.length === 0) {
    accountsList.innerHTML = `
            <div class="no-accounts">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
                <p>No connected accounts</p>
                <p style="font-size:0.85rem;opacity:0.7">Please login to view accounts</p>
            </div>`;
  } else {
    accountsList.innerHTML = '';
    accountList.forEach((account, index) => {
      const balance = accountBalances[account.account] || '0.00';
      const isActive = index === currentAccountIndex;
      const item = document.createElement('div');
      item.className = `account-item${isActive ? ' active' : ''}`;
      item.onclick = () => switchAccount(index);
      item.innerHTML = `
                <div class="account-item-header">
                    <span class="account-item-badge">${account.account}</span>
                    <span class="account-item-type">${account.currency || 'USD'}</span>
                </div>
                <div class="account-item-details">
                    <div class="account-detail">
                        <span class="account-detail-label">Balance</span>
                        <span class="account-detail-value balance">${balance}</span>
                    </div>
                    <div class="account-detail">
                        <span class="account-detail-label">Token</span>
                        <span class="account-detail-value">${account.token.substring(0, 8)}…</span>
                    </div>
                </div>`;
      accountsList.appendChild(item);
    });
  }

  dropdown.style.display = 'block';
}

function hideAccountDropdown() {
  const dropdown = document.getElementById('accountDropdown');
  if (dropdown) dropdown.style.display = 'none';
}

function switchAccount(index) {
  if (index < 0 || index >= accountList.length) return;

  // Set flag to prevent getContractForSymbol during account change
  isAccountChanging = true;
  console.log('[Auth] Switching to account, setting isAccountChanging flag');

  currentAccountIndex = index;
  const account = accountList[index];
  console.log('[Auth] Switching to account:', account.account);
  sendWS({ authorize: account.token });
  updateAccountDisplay();
  hideAccountDropdown();
  showSuccess(`Switched to account ${account.account}`, 2000);

  // Reset flag after authorization completes (handled in handleAuthorize)
  // The flag will be cleared when authorization succeeds
}

function fetchAccountBalance() {
  if (!accountList.length || currentAccountIndex >= accountList.length) return;
  sendWS({ balance: 1, account: accountList[currentAccountIndex].account });
}

/* ─── Loading Screen ─────────────────────────────────────────────────────── */

function hideLoadingScreen() {
  if (!isLoadingScreenVisible) return;
  const screen = document.getElementById('loadingScreen');
  if (!screen) return;
  screen.classList.add('hidden');
  isLoadingScreenVisible = false;
  setTimeout(() => { screen.style.display = 'none'; }, 600);
}

function setLoadingMessage(text, color = '') {
  const el = document.querySelector('.loading-subtitle');
  if (!el) return;
  el.textContent = text;
  if (color) el.style.color = color;
}

/* ─── Stats & Tracking ───────────────────────────────────────────────────── */

function updateStats() {
  if (!workspace) return;
  const allBlocks = workspace.getAllBlocks(false);
  const connectedBlocks = workspace.getTopBlocks(false)
    .reduce((acc, tb) => acc + tb.getDescendants(false).length, 0);

  const blockCountEl = document.getElementById('blockCount');
  const connectedBlocksEl = document.getElementById('connectedBlocks');
  if (blockCountEl) blockCountEl.textContent = allBlocks.length;
  if (connectedBlocksEl) connectedBlocksEl.textContent = connectedBlocks;
}

function trackBlockChanges(event) {
  const trackedTypes = [
    Blockly.Events.BLOCK_CHANGE,
    Blockly.Events.BLOCK_CREATE,
    Blockly.Events.BLOCK_DELETE,
    Blockly.Events.BLOCK_MOVE
  ];
  if (!trackedTypes.includes(event.type)) return;
  lastModifiedTime = new Date().toLocaleString();
  const el = document.getElementById('lastModified');
  if (el) el.textContent = lastModifiedTime;
}

/* ─── Code Generation ────────────────────────────────────────────────────── */

function updateGeneratedCode() {
  if (!workspace || !isCodePanelVisible) return;
  try {
    const code = javascript.javascriptGenerator.workspaceToCode(workspace);
    const el = document.getElementById('generatedCode');
    if (el) el.textContent = code || '// No blocks in workspace';
  } catch (err) {
    console.error('[Code] Generation error:', err);
  }
}

function toggleCodePanel() {
  const panel = document.getElementById('botCodePanel');
  const btn = document.getElementById('toggleCodeBtn');
  if (!panel || !btn) return;

  isCodePanelVisible = !isCodePanelVisible;
  panel.style.display = isCodePanelVisible ? 'flex' : 'none';
  btn.classList.toggle('active', isCodePanelVisible);

  if (isCodePanelVisible) updateGeneratedCode();

  setTimeout(() => { if (workspace) Blockly.svgResize(workspace); }, 300);
}

function copyGeneratedCode() {
  const el = document.getElementById('generatedCode');
  if (!el) return;
  const code = el.textContent;
  if (!code || code === '// No blocks in workspace') {
    showInfo('No code to copy');
    return;
  }
  navigator.clipboard.writeText(code)
    .then(() => showSuccess('Code copied to clipboard!'))
    .catch(err => {
      console.error('[Code] Copy failed:', err);
      showError('Failed to copy code');
    });
}

/* ─── Toast System ───────────────────────────────────────────────────────── */

function showToast(message, type = 'info', duration = 3000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<div class="toast-message">${message}</div>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}

const showSuccess = (m, d) => showToast(m, 'success', d);
const showError = (m, d) => showToast(m, 'error', d);
const showInfo = (m, d) => showToast(m, 'info', d);

/* ─── Market Data ────────────────────────────────────────────────────────── */

function getActiveMarkets() {
  sendWS({ active_symbols: 'brief', product_type: 'basic' });
  showInfo('Fetching active markets…');
}

function processActiveSymbols(data) {
  if (!data.active_symbols || !Array.isArray(data.active_symbols)) {
    console.error('[Market] Invalid active_symbols response');
    return;
  }

  globalMarketData = extractAndCategorizeOpenMarkets(data.active_symbols);

  // Build first-level dropdown from categorized data
  const marketKeys = Object.keys(globalMarketData);
  if (marketKeys.length === 0) {
    console.warn('[Market] No open markets found');
    return;
  }

  currentMarketOptions = marketKeys.map(key => [
    capitalize(globalMarketData[key].name || key), key
  ]);

  // Pre-populate second and third dropdowns from the first market entry
  _preloadCascadingDropdowns(marketKeys[0]);

  showInfo('Active markets loaded.');
  console.log('[Market] Global market data ready');

  isMarketDataReady = true;
  if (pendingImportCallback) {
    console.log('[Market] Running pending import callback');
    pendingImportCallback();
    pendingImportCallback = null;
  }

  // Initialise Blockly after market data is available
  if (!isBlockinitials) {
    initBlockly();
  }
}

/**
 * Pre-load secondMarketData and thirdMarketData from the first available
 * market so the block dropdowns aren't empty on first render.
 */
function _preloadCascadingDropdowns(firstMarketKey) {
  const marketEntry = globalMarketData[firstMarketKey];
  if (!marketEntry) return;

  const submarkets = marketEntry.submarkets;
  const submarketKeys = Object.keys(submarkets);

  secondMarketData = submarketKeys.map(k => [submarkets[k].name, k]);

  if (submarketKeys.length > 0) {
    const firstSubmarketKey = submarketKeys[0];
    const symbols = submarkets[firstSubmarketKey].symbols;
    thirdMarketData = symbols.map(s => [capitalize(s.display_name), s.symbol]);

    if (thirdMarketData.length > 0) {
      getContractForSymbol(thirdMarketData[0][1]);
    }
  }
}

/**
 * Filter and group active symbols into a nested market → submarket → symbol
 * structure, keeping only exchanges that are currently open.
 */
function extractAndCategorizeOpenMarkets(activeSymbolsArray) {
  return activeSymbolsArray
    .filter(market => market.exchange_is_open === 1)
    .reduce((acc, market) => {
      const { market: mId, market_display_name: mName,
        submarket: smId, submarket_display_name: smName } = market;

      if (!acc[mId]) {
        acc[mId] = { name: mName, category: mId, submarkets: {} };
      }
      if (!acc[mId].submarkets[smId]) {
        acc[mId].submarkets[smId] = { name: smName, category: smId, symbols: [] };
      }
      acc[mId].submarkets[smId].symbols.push({
        display_name: market.display_name,
        pip: market.pip,
        symbol: market.symbol
      });

      return acc;
    }, {});
}

/* ─── Contract Data ──────────────────────────────────────────────────────── */

function getContractForSymbol(symbol) {
  // Skip if currently changing account to prevent data reset (but allow during import)
  if (isAccountChanging) {
    console.log('[Contract] Skipping getContractForSymbol during account change');
    return;
  }

  // Allow getContractForSymbol during import to load contracts for imported symbol
  // The isImporting flag only prevents cascading dropdown updates, not contract loading

  if (!symbol || symbol === 'LOADING' || symbol === 'NONE') return;
  console.log('[Contract] Requesting contracts for:', symbol);
  sendWS({
    contracts_for: symbol,
    currency: selectedAccountCurrency,
    landing_company: 'svg',
    product_type: 'basic'
  });
}

function processContractsFor(data) {
  available_contracts = data.contracts_for.available;
  if (data.error) {
    console.error('[Contract] API error:', data.error.message);
    showError(`Contract data error: ${data.error.message}`);
    return;
  }

  const contracts = data.contracts_for?.available;
  if (!Array.isArray(contracts) || contracts.length === 0) {
    console.warn('[Contract] No available contracts in response');
    return;
  }

  // Categories to hide entirely from the dropdowns
  const EXCLUDED_CATEGORIES = new Set(['lookback']);

  // Build de-duplicated list of main categories (excluding hidden ones)
  const seen = new Set();
  const result = [];
  for (const item of contracts) {
    if (EXCLUDED_CATEGORIES.has(item.contract_category)) continue;
    const display = item.contract_category_display;
    if (!seen.has(display)) {
      seen.add(display);
      result.push([display, item.contract_category]);
    }
  }

  // Build sub-category groups per category (excluding hidden ones)
  const tempSubData = {};
  for (const item of contracts) {
    if (EXCLUDED_CATEGORIES.has(item.contract_category)) continue;
    const category = item.contract_category;
    const groupName = _getContractGroupName(item);

    if (!tempSubData[category]) tempSubData[category] = {};
    if (!tempSubData[category][groupName]) tempSubData[category][groupName] = new Set();
    tempSubData[category][groupName].add(item.contract_display);
  }

  // Convert Sets → arrays and store in global subdata
  // Use the group *name* as the value so that entries like
  // "Higher/Lower" and "Higher/Lower (Equals)" are always distinct.
  // (Using contract_display strings caused both groups to resolve to the
  //  same "Higher/Lower" value, making setValue() always pick the first one.)
  for (const [category, groups] of Object.entries(tempSubData)) {
    subdata[category] = Object.entries(groups).map(([name]) => [
      name, name   // [display label, unique value]
    ]);

    // Explicitly add "Rise/Fall" alongside "Higher/Lower" for the Up/Down (callput) category
    if (category === 'callput') {
      if (!subdata[category].some(opt => opt[1] === 'Rise/Fall')) {
        subdata[category].unshift(['Rise/Fall', 'Rise/Fall']);
      }
    }
  }

  mainContractTypes = result;
  const firstCategory = Object.keys(subdata)[0];
  subContractTypes = firstCategory ? subdata[firstCategory] : [...PLACEHOLDER_OPTIONS];

  // Refresh main_block dropdowns
  if (!workspace) return;
  workspace.getBlocksByType('main_block').forEach(block => {
    const firstField = block.getField('first_category');
    const secondField = block.getField('second_category');
    const currentFirstValue = block.getFieldValue('first_category');
    const currentSecondValue = block.getFieldValue('second_category');

    if (firstField) {
      firstField.menuGenerator_ = result;
      // Only reset to first option if current value is a placeholder/empty
      const firstIsPlaceholder = !currentFirstValue || currentFirstValue === 'LOADING' || currentFirstValue === 'OPTIONNAME';
      if (firstIsPlaceholder) {
        firstField.setValue(result[0]?.[1] ?? '');
      } else {
        // Check if the current value exists in the new result data
        const isValidInResult = result.some(([, v]) => v === currentFirstValue);
        if (isValidInResult) {
          // Re-apply the existing value so it stays selected
          firstField.setValue(currentFirstValue);
        } else {
          // Current value doesn't exist in new data - reset to first option
          console.log('[Contract] Imported first_category not in new data, resetting to first option');
          firstField.setValue(result[0]?.[1] ?? '');
        }
      }
    }

    if (secondField) {
      const resolvedFirstValue = block.getFieldValue('first_category');
      const sub = subdata[resolvedFirstValue] || subContractTypes;
      secondField.menuGenerator_ = sub;
      // Only reset to first option if current value is a placeholder/empty
      const secondIsPlaceholder = !currentSecondValue || currentSecondValue === 'LOADING' || currentSecondValue === 'OPTIONNAME';
      if (secondIsPlaceholder) {
        secondField.setValue(sub[0]?.[1] ?? '');
      } else {
        // Check if the current value exists in the new sub data
        const isValidInSub = sub.some(([, v]) => v === currentSecondValue);
        if (isValidInSub) {
          // Keep the saved value — re-apply it so it stays selected
          secondField.setValue(currentSecondValue);
        } else {
          // Current value doesn't exist in new sub data - reset to first option
          console.log('[Contract] Imported second_category not in new subdata, resetting to first option');
          secondField.setValue(sub[0]?.[1] ?? '');
        }
      }
    }
  });


  console.log('[Contract] Contract types loaded successfully');

  isContractDataReady = true;
  if (pendingContractCallback) {
    console.log('[Contract] Running pending contract callback');
    pendingContractCallback();
    pendingContractCallback = null;
  }
}

/** Map a contract item to its display group name. */
function _getContractGroupName(item) {
  const t = item.contract_type;
  if (t === 'ACCU') return 'Accumulators';
  if (t === 'CALL' || t === 'PUT') return 'Higher/Lower';
  if (t === 'CALLE' || t === 'PUTE') return 'Higher/Lower (Equals)';
  if (t === 'MULTUP' || t === 'MULTDOWN') return 'Multiply Up/Multiply Down';
  if (t === 'ASIANU' || t === 'ASIAND') return 'Asian Up/Asian Down';
  if (t === 'DIGITOVER' || t === 'DIGITUNDER') return 'Digit Over/Digit Under';
  if (t.includes('DIGITMATCH') || t.includes('DIGITDIFF')) return 'Digit Match/Digit Differs';
  if (t.includes('DIGITODD') || t.includes('DIGITEVEN')) return 'Digit Odd/Digit Even';
  if (t === 'EXPIRYRANGE' || t === 'EXPIRYMISS') return 'Ends Between/Ends Outside';
  if (t === 'TICKHIGH' || t === 'TICKLOW') return 'High Tick/Low Tick';
  if (t === 'RESETCALL' || t === 'RESETPUT') return 'Reset Call/Reset Put';
  if (t === 'RUNHIGH' || t === 'RUNLOW') return 'Only Up/Only Down';
  if (t === 'RANGE' || t === 'UPORDOWN') return 'Stay Between/Goes Outside';
  if (t === 'ONETOUCH' || t === 'NOTOUCH') return 'One Touch/No Touch';
  if (t === 'TURBOSLONG' || t === 'TURBOSSHORT') return 'Turbo Long/Turbo Short';
  if (t === 'VANILLALONGCALL' || t === 'VANILLALONGPUT') return 'Vanilla Long Call/Vanilla Long Put';
  return item.contract_display;
}

/* ─── Dropdown Cascade Helpers ───────────────────────────────────────────── */

function updateSecondDropdown(block, firstValue) {
  const secondField = block.getField('second_market');
  if (!secondField) return;

  const marketEntry = globalMarketData[firstValue];
  if (!marketEntry) {
    console.warn('[Dropdown] No market data for:', firstValue);
    return;
  }

  const options = Object.entries(marketEntry.submarkets)
    .map(([key, value]) => [value.name, key]);

  secondMarketData = options;
  secondField.menuGenerator_ = options;

  if (isImporting) {
    // During import: just register the options without overwriting the XML value.
    // The XML already restored the correct value — just make sure it is still valid.
    const existingValue = secondField.getValue();
    const isValid = options.some(([, v]) => v === existingValue);
    if (!isValid) secondField.setValue(options[0]?.[1] ?? '');
    // Also pre-load third-market options for the restored second value
    const targetSecond = isValid ? existingValue : options[0]?.[1];
    if (targetSecond) _preloadThirdMenuOnly(block, targetSecond);
    return;
  }

  secondField.setValue(options[0]?.[1] ?? '');

  // Cascade to third
  if (options.length > 0) {
    updateThirdDropdown(block, options[0][1]);
  }
}

function updateThirdDropdown(block, secondValue) {
  const thirdField = block.getField('third_market');
  const firstValue = block.getFieldValue('first_market');
  if (!thirdField) return;

  const marketEntry = globalMarketData[firstValue];
  const submarket = marketEntry?.submarkets[secondValue];

  if (!submarket) {
    console.warn('[Dropdown] No submarket data for:', secondValue);
    return;
  }

  const options = submarket.symbols.map(s => [capitalize(s.display_name), s.symbol]);

  thirdMarketData = options;
  thirdField.menuGenerator_ = options;

  if (isImporting) {
    // Just register the options; preserve the XML-restored third market value.
    const existingValue = thirdField.getValue();
    const isValid = options.some(([, v]) => v === existingValue);
    if (!isValid) thirdField.setValue(options[0]?.[1] ?? '');
    // getContractForSymbol is already guarded by isImporting — no need to call it here.
    return;
  }

  thirdField.setValue(options[0]?.[1] ?? '');

  if (options.length > 0) {
    getContractForSymbol(options[0][1]);
  }
}

/**
 * Pre-load the third-market dropdown options without changing its value.
 * Used during import to populate menuGenerator_ for the restored second value.
 */
function _preloadThirdMenuOnly(block, secondValue) {
  const thirdField = block.getField('third_market');
  const firstValue = block.getFieldValue('first_market');
  if (!thirdField) return;

  const marketEntry = globalMarketData[firstValue];
  const submarket = marketEntry?.submarkets[secondValue];
  if (!submarket) return;

  const options = submarket.symbols.map(s => [capitalize(s.display_name), s.symbol]);
  thirdMarketData = options;
  thirdField.menuGenerator_ = options;

  // Validate the existing value; reset only if not in the list.
  const existingValue = thirdField.getValue();
  const isValid = options.some(([, v]) => v === existingValue);
  if (!isValid) thirdField.setValue(options[0]?.[1] ?? '');
}

function updateSecondCategoryDropdown(block, firstCategoryValue) {
  const secondField = block.getField('second_category');
  if (!secondField) return;

  const sub = subdata[firstCategoryValue];
  if (!sub || sub.length === 0) {
    console.warn('[Dropdown] No sub-category data for:', firstCategoryValue);
    return;
  }

  subContractTypes = sub;
  secondField.menuGenerator_ = sub;

  if (isImporting) {
    // During import: preserve the XML-restored value; only reset if invalid.
    const existingValue = secondField.getValue();
    const isValid = sub.some(([, v]) => v === existingValue);
    if (!isValid) secondField.setValue(sub[0]?.[1] ?? '');
    return;
  }

  secondField.setValue(sub[0]?.[1] ?? '');
}

/* ─── Single main_block Enforcement ─────────────────────────────────────── */

function enforceSingleMainBlock(ws) {
  ws.addChangeListener(event => {
    if (event.type !== Blockly.Events.BLOCK_CREATE) return;
    const blocks = ws.getBlocksByType('main_block', false);
    if (blocks.length <= 1) return;

    // Remove any newly created duplicates
    (event.ids || []).forEach(id => {
      const block = ws.getBlockById(id);
      if (block && block.type === 'main_block') {
        block.dispose(false, true);
      }
    });
    showError('Only one Main Block is allowed per workspace.');
  });
}

/* ─── Utility ────────────────────────────────────────────────────────────── */

/** Title-case every word in a string. */
function capitalize(str) {
  if (!str) return '';
  return String(str)
    .trim()
    .split(/\s+/)
    .map(w => (w[0]?.toUpperCase() ?? '') + w.slice(1).toLowerCase())
    .join(' ');
}

/** Safe send – only dispatches if socket is open. */
function sendWS(payload) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn('[WS] Cannot send – socket is not open:', payload);
    return;
  }
  socket.send(JSON.stringify(payload));
}

/* ─── DOM Ready ──────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  // Live clock
  const clockDiv = document.querySelector('.clock');
  if (clockDiv) {
    const updateClock = () => { clockDiv.textContent = new Date().toLocaleTimeString(); };
    updateClock();
    setInterval(updateClock, 1000);
  }

  // Apply premium_dark style to all standard Blockly blocks before injection
  Object.values(Blockly.Blocks).forEach(blockDef => {
    if (typeof blockDef.init === 'function') {
      const originalInit = blockDef.init;
      blockDef.init = function () {
        originalInit.call(this);
        this.setStyle('premium_dark');
      };
    }
  });

  // Boot WebSocket (Blockly is initialised inside processActiveSymbols
  // after market data arrives, ensuring dropdowns are populated first)
  connectWebSocket();

  // ── Token login ──
  document.querySelector('.token-login-btn')?.addEventListener('click', () => {
    const token = document.getElementById('apiToken')?.value ?? '';
    loginWithToken(token);
  });

  // ── Account display / dropdown ──
  document.getElementById('accountDisplay')?.addEventListener('click', showAccountDropdown);
  document.getElementById('connectAccountBtn')?.addEventListener('click', showLoginScreen);
  document.getElementById('closeAccountDropdown')?.addEventListener('click', hideAccountDropdown);

  // Close dropdown when clicking outside
  document.addEventListener('click', e => {
    const dropdown = document.getElementById('accountDropdown');
    const accountDisplay = document.getElementById('accountDisplay');
    if (
      dropdown &&
      !dropdown.contains(e.target) &&
      accountDisplay &&
      !accountDisplay.contains(e.target)
    ) {
      hideAccountDropdown();
    }
  });

  // ── Workspace zoom controls ──
  document.querySelectorAll('.workspace-controls').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!workspace) return;
      switch (btn.textContent.trim()) {
        case 'Zoom +': workspace.zoomCenter(1); break;
        case 'Zoom -': workspace.zoomCenter(-1); break;
        case 'Focus': workspace.scrollCenter(); break;
        case 'Reset': workspace.setScale(1); workspace.scrollCenter(); break;
      }
    });
  });

  // ── Import / Export buttons ──
  document.getElementById('importBtn')?.addEventListener('click', importBot);
  document.getElementById('exportBtnTop')?.addEventListener('click', exportBot);
  document.getElementById('exportBtn')?.addEventListener('click', exportBot);

  // ── Code panel controls ──
  document.getElementById('toggleCodeBtn')?.addEventListener('click', toggleCodePanel);
  document.getElementById('copyCodeBtn')?.addEventListener('click', copyGeneratedCode);
});

/* ─── Import / Export Bot Functions ──────────────────────────────────────── */

/**
 * Export the current Blockly workspace as an XML file.
 * The file name is derived from the Bot Name input field.
 */
function exportBot() {
  if (!workspace) {
    showError('Workspace is not ready yet.');
    return;
  }

  const xml = Blockly.Xml.workspaceToDom(workspace);
  const xmlText = Blockly.Xml.domToText(xml);

  // Use the bot name for the filename, fallback to "untitled_bot"
  const botName = (document.getElementById('botName')?.value || 'Untitled Bot')
    .trim()
    .replace(/[^a-zA-Z0-9_\- ]/g, '')
    .replace(/\s+/g, '_') || 'untitled_bot';

  const blob = new Blob([xmlText], { type: 'text/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${botName}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log(`[Bot] Exported workspace as "${botName}.xml"`);
}


/**
 * Import a Blockly workspace from an XML file.
 * Opens the native file picker, reads the selected file,
 * clears the current workspace, and loads the XML blocks.
 */
function importBot() {
  isImporting = true;
  if (!workspace) {
    showError('Workspace is not ready yet.');
    return;
  }

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.xml';
  fileInput.style.display = 'none';

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const xmlText = event.target.result;
        const xml = Blockly.utils.xml.textToDom(xmlText);

        // Extract bot details from XML BEFORE loading blocks
        let importedFirstMarket = null;
        let importedSecondMarket = null;
        let importedThirdMarket = null;
        let importedFirstCategory = null;
        let importedSecondCategory = null;
        let importedContractType = null;
        let importedCandleInterval = null;
        let importedBuySellError = null;
        let importedLastTradeOnError = null;

        // Find main_block in XML and extract field values
        const mainBlockElement = xml.querySelector('block[type="main_block"]');
        if (mainBlockElement) {
          const getFieldValue = (fieldName) => {
            const field = mainBlockElement.querySelector(`field[name="${fieldName}"]`);
            return field ? field.textContent : null;
          };
          importedFirstMarket = getFieldValue('first_market');
          importedSecondMarket = getFieldValue('second_market');
          importedThirdMarket = getFieldValue('third_market');
          importedFirstCategory = getFieldValue('first_category');
          importedSecondCategory = getFieldValue('second_category');
          importedContractType = getFieldValue('contract_type');
          importedCandleInterval = getFieldValue('candle_interval');
          importedBuySellError = getFieldValue('buySellError');
          importedLastTradeOnError = getFieldValue('lastTradeOnError');
        }

        // Get bot name from filename
        const nameWithoutExt = file.name.replace(/\.xml$/i, '').replace(/_/g, ' ');
        const botNameInput = document.getElementById('botName');
        if (botNameInput) botNameInput.value = nameWithoutExt;

        console.log(`[Bot] Parsed bot details from "${file.name}"`);
        console.log('[Bot] first_market:', importedFirstMarket);
        console.log('[Bot] second_market:', importedSecondMarket);
        console.log('[Bot] third_market:', importedThirdMarket);
        console.log('[Bot] first_category:', importedFirstCategory);
        console.log('[Bot] second_category:', importedSecondCategory);

        // Store the XML for later loading
        const savedXml = xml;

        // Function to load blocks after both market AND contract data are ready
        function loadImportedBlocksWithData() {
          // Pre-populate dropdown data so XML values can be restored
          if (importedFirstMarket && globalMarketData[importedFirstMarket]) {
            const marketEntry = globalMarketData[importedFirstMarket];
            secondMarketData = Object.entries(marketEntry.submarkets)
              .map(([key, value]) => [value.name, key]);

            if (importedSecondMarket && marketEntry.submarkets[importedSecondMarket]) {
              const submarket = marketEntry.submarkets[importedSecondMarket];
              thirdMarketData = submarket.symbols.map(s => [capitalize(s.display_name), s.symbol]);
            }
          }

          // Load blocks exactly as they are - no value setting, no cascades
          workspace.clear();
          Blockly.Xml.domToWorkspace(savedXml, workspace);

          // Update bot name
          const botNameInput = document.getElementById('botName');
          if (botNameInput) botNameInput.value = nameWithoutExt;

          // Manually restore category values from imported data
          const mainBlocks = workspace.getBlocksByType('main_block', false);
          if (mainBlocks.length > 0) {
            const block = mainBlocks[0];
            const firstCatField = block.getField('first_category');
            const secondCatField = block.getField('second_category');

            // Set importing flag to prevent dropdown resets
            isImporting = true;

            // Step 1: Set first_category
            if (firstCatField && importedFirstCategory) {
              const isValidFirst = mainContractTypes.some(([, v]) => v === importedFirstCategory);
              if (isValidFirst) {
                firstCatField.setValue(importedFirstCategory);
              } else {
                // Find the category that contains our second_category
                let foundCategory = null;
                for (const [cat, subOptions] of Object.entries(subdata)) {
                  if (subOptions.some(([, v]) => v === importedSecondCategory)) {
                    foundCategory = cat;
                    break;
                  }
                }
                if (foundCategory) {
                  firstCatField.setValue(foundCategory);
                }
              }
            }

            // Step 2: Wait for first_category to update, then set second_category
            setTimeout(() => {
              // Update the second category dropdown
              const currentFirstCat = block.getFieldValue('first_category');
              updateSecondCategoryDropdown(block, currentFirstCat);

              // Step 3: Set the second_category value
              setTimeout(() => {
                if (secondCatField && importedSecondCategory) {
                  secondCatField.setValue(importedSecondCategory);
                  secondCatupdateTrigger(block, importedSecondCategory);
                }
                isImporting = false;
              }, 100);
            }, 100);
          }

          console.log('[Bot] Blocks loaded successfully with all data ready');
        }

        // Fetch contract data for the imported symbol first, then load blocks
        function fetchContractsAndLoadBlocks() {
          // Reset contract data to ensure we get fresh data for the imported symbol
          isContractDataReady = false;

          // Request contracts for the imported symbol
          if (importedThirdMarket) {
            console.log('[Bot] Fetching contracts for:', importedThirdMarket);
            getContractForSymbol(importedThirdMarket);
          }

          // Poll until NEW contract data is ready
          const checkAndLoad = () => {
            if (isContractDataReady) {
              console.log('[Bot] Contract data ready - loading blocks');
              loadImportedBlocksWithData();
            } else {
              setTimeout(checkAndLoad, 100);
            }
          };
          setTimeout(checkAndLoad, 100);
        }

        // Ensure market data is ready, then fetch contracts and load blocks
        function ensureMarketDataReady() {
          if (isMarketDataReady) {
            console.log('[Bot] Market data ready — fetching contracts and loading blocks');
            fetchContractsAndLoadBlocks();
          } else {
            console.log('[Bot] Fetching market data first...');
            pendingImportCallback = fetchContractsAndLoadBlocks;
            getActiveMarkets();
          }
        }

        // Start the process - ensure market data first
        ensureMarketDataReady();

      } catch (err) {
        console.error('[Bot] Failed to import workspace:', err);
        showError('Failed to import bot file. Make sure it is a valid Blockly XML file.');
        isImporting = false;
      }

    };
    reader.readAsText(file);

    // Clean up the file input
    document.body.removeChild(fileInput);
  });

  document.body.appendChild(fileInput);
  fileInput.click();
}



function block_change_detect() {
  workspace.addChangeListener(function (event) {

    // Ignore non-change events if needed
    if (event.type !== Blockly.Events.BLOCK_CHANGE) return;

    const block = workspace.getBlockById(event.blockId);
    if (!block) return;

    if (block.type === 'main_block') {
      /*console.log('Main block changed:', {
          blockId: event.blockId,
          field: event.name,
          value: event.newValue
      });*/
      if (event.name === 'second_category') {

        let blocks = workspace.getBlocksByType('trade_settings', false);

        blocks.forEach(block => {

          // 🔷 set category
          block.category = event.newValue;

          // 🔷 rebuild structure
          block.updateShape_();

          // 🔷 force UI refresh
          block.render();
        });
      }
    }

  });
}


function secondCatupdateTrigger(block, newValue) {
  console.log("secondCatupdateTrigger:", newValue);
  //console.log("available_contracts:", available_contracts);
  GLOBAL_CATEGORY = newValue;


  let options = [];

  switch (newValue) {
    case "Accumulator Up":
    case "Accumulators":
      options = [["Accumulator", "ACCU"]]
      break;
    case "Asian Up/Asian Down":
      options = [["Asian Up", "ASIANU"], ["Asian Down", "ASIAND"]]
      break;
    case "Rise/Fall":
      options = [["Rise", "CALL"], ["Fall", "PUT"]]
      break;
    case "Higher/Lower":
      options = [["Higher", "CALL"], ["Lower", "PUT"]]
      break;
    case "Higher/Lower (Equals)":
      options = [["Higher Equals", "CALLE"], ["Lower Equals", "PUTE"]]
      break;
    case "Digit Match/Digit Differs":
      options = [["Digit Match", "DIGITMATCH"], ["Digit Differs", "DIGITDIFF"]]
      break;
    case "Digit Odd/Digit Even":
      options = [["Digit Odd", "DIGITODD"], ["Digit Even", "DIGITEVEN"]]
      break;
    case "Digit Over/Digit Under":
      options = [["Digit Over", "DIGITOVER"], ["Digit Under", "DIGITUNDER"]]
      break;
    case "Ends Between/Ends Outside":
      options = [["Ends Between", "EXPIRYRANGE"], ["Ends Outside", "EXPIRYMISS"]]
      break;
    case "High Tick/Low Tick":
      options = [["High Tick", "TICKHIGH"], ["Low Tick", "TICKLOW"]]
      break;
    case "Multiply Up/Multiply Down":
      options = [["Multiply Up", "MULTUP"], ["Multiply Down", "MULTDOWN"]]
      break;
    case "Reset Call/Reset Put":
      options = [["Reset Call", "RESETCALL"], ["Reset Put", "RESETPUT"]]
      break;
    case "Only Up/Only Down":
      options = [["Only Up", "RUNHIGH"], ["Only Down", "RUNLOW"]]
      break;
    case "Stay Between/Goes Outside":
      options = [["Stay Between", "RANGE"], ["Goes Outside", "UPORDOWN"]]
      break;
    case "One Touch/No Touch":
      options = [["One Touch", "ONETOUCH"], ["No Touch", "NOTOUCH"]]
      break;
    case "Turbo Long/Turbo Short":
      options = [["Turbo Long", "TURBOSLONG"], ["Turbo Short", "TURBOSHORT"]]
      break;
    case "Vanilla Long Call/Vanilla Long Put":
      options = [["Vanilla Long Call", "VANILLALONGCALL"], ["Vanilla Long Put", "VANILLALONGPUT"]]
      break;
    default:
      break;
  }

  purchaseOptions = options

  // ✅ Update ALL existing blocks
  let blocks = workspace.getBlocksByType('purchase', false);
  blocks.forEach(block => {
    block.updateShape_();
  });
  blocks = workspace.getBlocksByType('payout', false);
  blocks.forEach(block => {
    block.updateShape_();
  });
  blocks = workspace.getBlocksByType('askprice', false);
  blocks.forEach(block => {
    block.updateShape_();
  });
  // ✅ Refresh toolbox so NEW blocks use updated dropdown
  workspace.updateToolbox(workspace.options.languageTree);


}







/** Sync the Start/Stop button UI to the current is_bot_running state. */
function updateBotButton() {
  const runBtn = document.getElementById('botRunBtn');
  if (!runBtn) return;
  const runBtnSpan = runBtn.querySelector('span');
  const runBtnSvg = runBtn.querySelector('svg');
  if (bot_trade_settings.is_bot_running) {
    if (runBtnSpan) runBtnSpan.textContent = 'STOP BOT';
    if (runBtnSvg) runBtnSvg.innerHTML = '<path d="M6 6h12v12H6z"/>';
    runBtn.classList.add('running');
  } else {
    if (runBtnSpan) runBtnSpan.textContent = 'START BOT';
    if (runBtnSvg) runBtnSvg.innerHTML = '<path d="M8 5v14l11-7z"/>';
    runBtn.classList.remove('running');
  }
}

async function runBot() {
  if (bot_trade_settings.is_bot_running) {
    // ── STOP BOT (user clicked Stop) ──
    userStoppedBot = true;                      // signal bot_trade_closed to not restart
    bot_trade_settings.is_bot_running = false;
    updateBotButton();
    console.log('[Bot] Bot stopped manually');
    return;
  }

  // ── START BOT ──
  userStoppedBot = false;                       // clear stop flag before starting
  console.log('[Bot] Starting bot...');
  try {
    let code = javascript.javascriptGenerator.workspaceToCode(workspace);
    if (!code || code.trim() === '' || code.trim() === ';') {
      console.warn('[Bot] Generated code is empty or invalid');
      throw new Error('No valid code generated from workspace');
    }
    eval(code);
    bot_functions.assign_bot_variables_f();
    //console.log(bot_trade_settings);
    await unsubscribeFromMarket();
    await subscribeToMarket();
    await call_run_once();
    console.log('[Bot] Ready to call trade options');

    bot_trade_settings.is_bot_running = true;
    bot_trade_settings.is_bot_on_trade = false;
    updateBotButton();

    if (trade_again) {
      await tradeOption();
    }

  } catch (err) {
    console.warn('[Bot] Error during runBot:', err);
    bot_trade_settings.is_bot_running = false;
    updateBotButton();
  }
}


function BotCallingEachTick() {
  if (!bot_trade_settings.is_bot_running) return; // guard – bot was stopped

  if (bot_trade_settings.is_bot_on_trade === false && bot_trade_settings.proposal_data_called === true) {
    console.log('[Bot] watchAndPurchase called');
    bot_functions.watchAndPurchase_f();
  }
  if (bot_trade_settings.is_bot_on_trade === true && bot_trade_settings.proposal_data_called === true) {
    console.log('[Bot] watchAndSell called');
    bot_functions.watchAndSell_f();
  }
}

async function bot_trade_closed(response) {
  console.log('[Bot] bot_trade_closed called', response);

  // Reset per-trade state
  bot_trade_settings.proposal_data_called = false;
  bot_trade_settings.currunt_subscribe_id = null;
  bot_trade_settings.currunt_purchase_id = null;
  bot_trade_settings.currunt_sell_id = null;
  bot_trade_settings.is_bot_on_trade = false;

  // ── Check if the user stopped the bot ──
  // Both the Stop button and mid-trade errors set is_bot_running=false / userStoppedBot=true.
  if (userStoppedBot || !bot_trade_settings.is_bot_running) {
    console.log('[Bot] Bot was stopped — not restarting trade loop.');
    bot_trade_settings.is_bot_running = false;
    userStoppedBot = false;   // reset for next Start
    updateBotButton();
    return;
  }

  // ── Bot is still running — check if we should trade again ──
  trade_again = false;
  bot_functions.tradeAgain_f();

  if (trade_again) {
    // Guard again in case user pressed Stop while tradeAgain_f was executing
    if (userStoppedBot || !bot_trade_settings.is_bot_running) {
      console.log('[Bot] Bot stopped during tradeAgain check — aborting.');
      bot_trade_settings.is_bot_running = false;
      userStoppedBot = false;
      updateBotButton();
      return;
    }
    await tradeOption();
    console.log('[Bot] Trade option called again');
    bot_trade_settings.is_bot_on_trade = false;
  } else {
    // tradeAgain block returned false — stop the bot cleanly
    console.log('[Bot] tradeAgain returned false — stopping bot.');
    bot_trade_settings.is_bot_running = false;
    updateBotButton();
  }
}
async function unsubscribeFromMarket() {
  if (!bot_trade_settings.currunt_subscribe_id) return;
  await new Promise((resolve) => {
    socket.send(JSON.stringify({
      forget_all: "ticks"
    }));
    console.log("unsubscribing from market");
    console.log("unsubscribed from market");
    resolve();
  });
}
async function subscribeToMarket() {
  await new Promise((resolve, reject) => {
    pendingMarketSubscriptionResolve = resolve;
    const timeout = setTimeout(() => {
      if (pendingMarketSubscriptionResolve) {
        pendingMarketSubscriptionResolve = null;
        reject(new Error("Timed out waiting for market history"));
      }
    }, 10000);

    const originalResolve = resolve;
    pendingMarketSubscriptionResolve = (payload) => {
      clearTimeout(timeout);
      originalResolve(payload);
    };

    socket.send(JSON.stringify({
      "ticks_history": bot_trade_settings.market,
      "adjust_start_time": 1,
      "count": 100,
      "end": "latest",
      "start": 1,
      "style": "ticks",
      "subscribe": 1
    }));
    console.log("subscribing to market");
  });
}
async function call_run_once() {
  bot_functions.runOnceAtStart_f()
  console.log('called run once')
}
async function tradeOption() {
  await bot_functions.tradeOptions_f()
  console.log('calledtrade options')

  // Call getProposalData after trade options are defined
  // Use values from bot_trade_settings where available, fallback to example values
  try {
    console.log('Calling getProposalData...');
    const proposalData = await getProposalData({
      amount: bot_trade_settings.stake || 100,
      basis: bot_trade_settings.stake_unit || "payout",
      contract_type: "CALL", // Example contract type
      currency: "USD",
      duration: bot_trade_settings.duration || 60,
      duration_unit: bot_trade_settings.duration_unit || "s",
      symbol: bot_trade_settings.market || "R_100"
    });
    //console.log('Proposal data received:', proposalData);
    // You can use the proposal data here for further processing
    bot_trade_settings.proposal_data_called = true;
  } catch (error) {
    console.error('Failed to get proposal data:', error);
    // Don't throw, continue with normal flow
  }
}
async function getProposalData(params) {
  return new Promise((resolve, reject) => {
    // Generate a unique request ID
    const req_id = Date.now() + Math.floor(Math.random() * 1000);

    const req1 = {
      proposal: 1,
      symbol: params.symbol,
      req_id: req_id
    };
    const req2 = {
      proposal: 1,
      symbol: params.symbol,
      req_id: req_id
    };

    // Apply defaults if not set by blocks
    if (!bot_trade_settings.duration) bot_trade_settings.duration = 5;
    if (!bot_trade_settings.duration_unit) bot_trade_settings.duration_unit = 't';
    if (!bot_trade_settings.currency) bot_trade_settings.currency = 'USD';
    if (!bot_trade_settings.stake) bot_trade_settings.stake = 1;
    if (!bot_trade_settings.stake_unit) bot_trade_settings.stake_unit = 'stake';

    switch (GLOBAL_CATEGORY) {
      case "Accumulator Up":
      case "Accumulators":
        req1.contract_type = "ACCU";
        req1.amount = bot_trade_settings.stake;
        req1.basis = bot_trade_settings.stake_unit;
        req1.currency = bot_trade_settings.currency || "USD";
        req1.growth_rate = bot_trade_settings.growth || 0.03;
        break;
      case "Rise/Fall":
        req1.contract_type = "PUT";
        req1.amount = bot_trade_settings.stake;
        req1.basis = bot_trade_settings.stake_unit;
        req1.currency = bot_trade_settings.currency || "USD";
        req1.duration = bot_trade_settings.duration;
        req1.duration_unit = bot_trade_settings.duration_unit;

        req2.contract_type = "CALL";
        req2.amount = bot_trade_settings.stake;
        req2.basis = bot_trade_settings.stake_unit;
        req2.currency = bot_trade_settings.currency || "USD";
        req2.duration = bot_trade_settings.duration;
        req2.duration_unit = bot_trade_settings.duration_unit;
        break;
      case "Higher/Lower":
        req1.contract_type = "CALL";
        req1.amount = bot_trade_settings.stake;
        req1.basis = bot_trade_settings.stake_unit;
        req1.currency = bot_trade_settings.currency;
        req1.duration = bot_trade_settings.duration;
        req1.duration_unit = bot_trade_settings.duration_unit;
        req1.barrier = (bot_trade_settings.barrier_direction || "+") + bot_trade_settings.single_barrier;

        req2.contract_type = "PUT";
        req2.amount = bot_trade_settings.stake;
        req2.basis = bot_trade_settings.stake_unit;
        req2.currency = bot_trade_settings.currency;
        req2.duration = bot_trade_settings.duration;
        req2.duration_unit = bot_trade_settings.duration_unit;
        req2.barrier = (bot_trade_settings.barrier_direction || "-") + bot_trade_settings.single_barrier;
        break;
      case "Higher/Lower (Equals)":
        req1.contract_type = "CALLE";
        req1.amount = bot_trade_settings.stake;
        req1.basis = bot_trade_settings.stake_unit;
        req1.currency = bot_trade_settings.currency;
        req1.duration = bot_trade_settings.duration;
        req1.duration_unit = bot_trade_settings.duration_unit;
        req1.barrier = (bot_trade_settings.barrier_direction || "+") + bot_trade_settings.single_barrier;

        req2.contract_type = "PUTE";
        req2.amount = bot_trade_settings.stake;
        req2.basis = bot_trade_settings.stake_unit;
        req2.currency = bot_trade_settings.currency;
        req2.duration = bot_trade_settings.duration;
        req2.duration_unit = bot_trade_settings.duration_unit;
        req2.barrier = (bot_trade_settings.barrier_direction || "-") + bot_trade_settings.single_barrier;
        break;
      case "Multiply Up/Multiply Down":
        req1.contract_type = "MULTUP";
        req1.amount = bot_trade_settings.stake;
        req1.basis = bot_trade_settings.stake_unit;
        req1.currency = bot_trade_settings.currency;
        req1.duration = bot_trade_settings.duration;
        req1.duration_unit = bot_trade_settings.duration_unit;

        req2.contract_type = "MULTDOWN";
        req2.amount = bot_trade_settings.stake;
        req2.basis = bot_trade_settings.stake_unit;
        req2.currency = bot_trade_settings.currency;
        req2.duration = bot_trade_settings.duration;
        req2.duration_unit = bot_trade_settings.duration_unit;
        break;
      case "Asian Up/Asian Down":
        req1.contract_type = "ASIANU";
        req1.amount = bot_trade_settings.stake;
        req1.basis = bot_trade_settings.stake_unit;
        req1.currency = bot_trade_settings.currency;
        req1.duration = bot_trade_settings.duration;
        req1.duration_unit = bot_trade_settings.duration_unit;

        req2.contract_type = "ASIAND";
        req2.amount = bot_trade_settings.stake;
        req2.basis = bot_trade_settings.stake_unit;
        req2.currency = bot_trade_settings.currency;
        req2.duration = bot_trade_settings.duration;
        req2.duration_unit = bot_trade_settings.duration_unit;
        break;
      case "Digit Over/Digit Under":
        req1.contract_type = "DIGITOVER";
        req1.amount = bot_trade_settings.stake;
        req1.basis = bot_trade_settings.stake_unit;
        req1.currency = bot_trade_settings.currency;
        req1.duration = bot_trade_settings.duration;
        req1.duration_unit = bot_trade_settings.duration_unit;
        req1.barrier = String(bot_trade_settings.digit || 0);

        req2.contract_type = "DIGITUNDER";
        req2.amount = bot_trade_settings.stake;
        req2.basis = bot_trade_settings.stake_unit;
        req2.currency = bot_trade_settings.currency;
        req2.duration = bot_trade_settings.duration;
        req2.duration_unit = bot_trade_settings.duration_unit;
        req2.barrier = String(bot_trade_settings.digit || 0);
        break;
      case "Digit Match/Digit Differs":
        req1.contract_type = "DIGITMATCH";
        req1.amount = bot_trade_settings.stake;
        req1.basis = bot_trade_settings.stake_unit;
        req1.currency = bot_trade_settings.currency;
        req1.duration = bot_trade_settings.duration;
        req1.duration_unit = bot_trade_settings.duration_unit;
        req1.barrier = String(bot_trade_settings.digit || 0);

        req2.contract_type = "DIGITDIFF";
        req2.amount = bot_trade_settings.stake;
        req2.basis = bot_trade_settings.stake_unit;
        req2.currency = bot_trade_settings.currency;
        req2.duration = bot_trade_settings.duration;
        req2.duration_unit = bot_trade_settings.duration_unit;
        req2.barrier = String(bot_trade_settings.digit || 0);
        break;
      case "Digit Odd/Digit Even":
        req1.contract_type = "DIGITODD";
        req1.amount = bot_trade_settings.stake;
        req1.basis = bot_trade_settings.stake_unit;
        req1.currency = bot_trade_settings.currency;
        req1.duration = bot_trade_settings.duration;
        req1.duration_unit = bot_trade_settings.duration_unit;

        req2.contract_type = "DIGITEVEN";
        req2.amount = bot_trade_settings.stake;
        req2.basis = bot_trade_settings.stake_unit;
        req2.currency = bot_trade_settings.currency;
        req2.duration = bot_trade_settings.duration;
        req2.duration_unit = bot_trade_settings.duration_unit;
        break;
      case "Ends Between/Ends Outside":
        const barrier_high1 = bot_trade_settings.first_barrier;
        const barrier_high2 = bot_trade_settings.second_barrier;
        req1.contract_type = "EXPIRYRANGE";
        req1.amount = bot_trade_settings.stake;
        req1.basis = bot_trade_settings.stake_unit;
        req1.currency = bot_trade_settings.currency;
        req1.duration = bot_trade_settings.duration;
        req1.duration_unit = bot_trade_settings.duration_unit;
        req1.barrier = "+" + barrier_high1;
        req1.barrier2 = "-" + Math.abs(barrier_high2);

        req2.contract_type = "EXPIRYMISS";
        req2.amount = bot_trade_settings.stake;
        req2.basis = bot_trade_settings.stake_unit;
        req2.currency = bot_trade_settings.currency;
        req2.duration = bot_trade_settings.duration;
        req2.duration_unit = bot_trade_settings.duration_unit;
        req2.barrier = "+" + barrier_high1;
        req2.barrier2 = "-" + Math.abs(barrier_high2);
        break;
      case "Stay Between/Goes Outside":
        const barrier2_1 = bot_trade_settings.first_barrier;
        const barrier2_2 = bot_trade_settings.second_barrier;
        req1.contract_type = "RANGE";
        req1.amount = bot_trade_settings.stake;
        req1.basis = bot_trade_settings.stake_unit;
        req1.currency = bot_trade_settings.currency;
        req1.duration = bot_trade_settings.duration;
        req1.duration_unit = bot_trade_settings.duration_unit;
        req1.barrier = "+" + barrier2_1;
        req1.barrier2 = "-" + Math.abs(barrier2_2);

        req2.contract_type = "UPORDOWN";
        req2.amount = bot_trade_settings.stake;
        req2.basis = bot_trade_settings.stake_unit;
        req2.currency = bot_trade_settings.currency;
        req2.duration = bot_trade_settings.duration;
        req2.duration_unit = bot_trade_settings.duration_unit;
        req2.barrier = "+" + barrier2_1;
        req2.barrier2 = "-" + Math.abs(barrier2_2);
        break;
      case "High Tick/Low Tick":
        req1.contract_type = "TICKHIGH";
        req1.amount = bot_trade_settings.stake;
        req1.basis = bot_trade_settings.stake_unit;
        req1.currency = bot_trade_settings.currency;
        req1.duration = bot_trade_settings.duration;
        req1.duration_unit = bot_trade_settings.duration_unit;

        req2.contract_type = "TICKLOW";
        req2.amount = bot_trade_settings.stake;
        req2.basis = bot_trade_settings.stake_unit;
        req2.currency = bot_trade_settings.currency;
        req2.duration = bot_trade_settings.duration;
        req2.duration_unit = bot_trade_settings.duration_unit;
        break;
      case "Reset Call/Reset Put":
        req1.contract_type = "RESETCALL";
        req1.amount = bot_trade_settings.stake;
        req1.basis = bot_trade_settings.stake_unit;
        req1.currency = bot_trade_settings.currency;
        req1.duration = bot_trade_settings.duration;
        req1.duration_unit = bot_trade_settings.duration_unit;

        req2.contract_type = "RESETPUT";
        req2.amount = bot_trade_settings.stake;
        req2.basis = bot_trade_settings.stake_unit;
        req2.currency = bot_trade_settings.currency;
        req2.duration = bot_trade_settings.duration;
        req2.duration_unit = bot_trade_settings.duration_unit;
        break;
      case "Only Up/Only Down":
        req1.contract_type = "RUNHIGH";
        req1.amount = bot_trade_settings.stake;
        req1.basis = bot_trade_settings.stake_unit;
        req1.currency = bot_trade_settings.currency;
        req1.duration = bot_trade_settings.duration;
        req1.duration_unit = bot_trade_settings.duration_unit;

        req2.contract_type = "RUNLOW";
        req2.amount = bot_trade_settings.stake;
        req2.basis = bot_trade_settings.stake_unit;
        req2.currency = bot_trade_settings.currency;
        req2.duration = bot_trade_settings.duration;
        req2.duration_unit = bot_trade_settings.duration_unit;
        break;
      case "One Touch/No Touch":
        const touch_barrier = (bot_trade_settings.barrier_direction || "+") + bot_trade_settings.single_barrier;
        req1.contract_type = "ONETOUCH";
        req1.amount = bot_trade_settings.stake;
        req1.basis = bot_trade_settings.stake_unit;
        req1.currency = bot_trade_settings.currency;
        req1.duration = bot_trade_settings.duration;
        req1.duration_unit = bot_trade_settings.duration_unit;
        req1.barrier = touch_barrier;

        req2.contract_type = "NOTOUCH";
        req2.amount = bot_trade_settings.stake;
        req2.basis = bot_trade_settings.stake_unit;
        req2.currency = bot_trade_settings.currency;
        req2.duration = bot_trade_settings.duration;
        req2.duration_unit = bot_trade_settings.duration_unit;
        req2.barrier = touch_barrier;
        break;
      case "Turbo Long/Turbo Short":
        const turbo_barrier = (bot_trade_settings.barrier_direction || "+") + bot_trade_settings.single_barrier;
        req1.contract_type = "TURBOSLONG";
        req1.amount = bot_trade_settings.stake;
        req1.basis = bot_trade_settings.stake_unit;
        req1.currency = bot_trade_settings.currency;
        req1.duration = bot_trade_settings.duration;
        req1.duration_unit = bot_trade_settings.duration_unit;
        req1.barrier = turbo_barrier;

        req2.contract_type = "TURBOSSHORT";
        req2.amount = bot_trade_settings.stake;
        req2.basis = bot_trade_settings.stake_unit;
        req2.currency = bot_trade_settings.currency;
        req2.duration = bot_trade_settings.duration;
        req2.duration_unit = bot_trade_settings.duration_unit;
        req2.barrier = turbo_barrier;
        break;
      case "Vanilla Long Call/Vanilla Long Put":
        const vanilla_barrier = bot_trade_settings.vanila_barriers || "+0.00";
        req1.contract_type = "VANILLALONGCALL";
        req1.amount = bot_trade_settings.stake;
        req1.basis = bot_trade_settings.stake_unit;
        req1.currency = bot_trade_settings.currency;
        req1.duration = bot_trade_settings.duration;
        req1.duration_unit = bot_trade_settings.duration_unit;
        req1.barrier = vanilla_barrier;

        req2.contract_type = "VANILLALONGPUT";
        req2.amount = bot_trade_settings.stake;
        req2.basis = bot_trade_settings.stake_unit;
        req2.currency = bot_trade_settings.currency;
        req2.duration = bot_trade_settings.duration;
        req2.duration_unit = bot_trade_settings.duration_unit;
        req2.barrier = vanilla_barrier;
        break;
      default:
        req1.contract_type = "CALL";
        req1.amount = bot_trade_settings.stake;
        req1.basis = bot_trade_settings.stake_unit;
        req1.currency = bot_trade_settings.currency;
        req1.duration = bot_trade_settings.duration;
        req1.duration_unit = bot_trade_settings.duration_unit;
        console.warn('[Bot] GLOBAL_CATEGORY not recognized, using CALL as default');
        break;
    }

    //console.log(req1)
    //console.log(req2)
    // Store resolve/reject functions
    pendingProposalResolves[req_id] = { resolve, reject };

    // Send request
    //console.log('[WS] Sending proposal request1:', req1);
    socket.send(JSON.stringify(req1));
    if (req2.contract_type) {
      //console.log('[WS] Sending proposal request2:', req2);
      socket.send(JSON.stringify(req2));
    }

    // Set timeout for safety
    setTimeout(() => {
      if (pendingProposalResolves[req_id]) {
        pendingProposalResolves[req_id].reject(new Error('Proposal request timeout'));
        delete pendingProposalResolves[req_id];
      }
    }, 10000); // 10 second timeout
  });
}
async function bot_place_trade(direction) {
  console.log('calling to purchase ', direction, GLOBAL_CATEGORY);
  let data;

  if (GLOBAL_CATEGORY == "Rise/Fall") {
    data = {
      "buy": 1,
      "price": bot_trade_settings.stake, // Max price you are willing to pay
      "subscribe": 1,
      "parameters": {
        "amount": bot_trade_settings.stake,
        "basis": bot_trade_settings.stake_unit, // usually "stake"
        "contract_type": direction, // "CALL" or "PUT"
        "currency": "USD",
        "duration": bot_trade_settings.duration,
        "duration_unit": bot_trade_settings.duration_unit,
        "symbol": bot_trade_settings.market
      },
      "req_id": 100 // Optional: helps track requests
    };
  }

  console.log(data);
  socket.send(JSON.stringify(data));
  bot_trade_settings.is_bot_on_trade = true;
}







function processBuy(data) {
  console.log(data)
}

function processProposal(data) {
  console.log('[WS] Proposal response:', data);

  // Check for error
  if (data.error) {
    console.error('[WS] Proposal error:', data.error.message);
    // Resolve any pending promises with error
    if (data.echo_req && data.echo_req.req_id && pendingProposalResolves[data.echo_req.req_id]) {
      pendingProposalResolves[data.echo_req.req_id].reject(new Error(data.error.message));
      delete pendingProposalResolves[data.echo_req.req_id];
    }
    return;
  }

  // Resolve pending promise with proposal data
  if (data.echo_req && data.echo_req.req_id && pendingProposalResolves[data.echo_req.req_id]) {
    pendingProposalResolves[data.echo_req.req_id].resolve(data.proposal);
    delete pendingProposalResolves[data.echo_req.req_id];
  }
}

function processOpenContract(data) {
  const contract = data.proposal_open_contract;

  if (!contract) return;

  // 1. If it's expired but not sold yet, just wait.
  if (contract.is_expired === 1 && contract.is_sold === 0) {
    console.log('[WS] Trade finished, waiting for server settlement...');
    return; // Do nothing, wait for the next message
  }

  // 2. Once is_sold is exactly 1, the trade is 100% closed and settled!
  if (contract.is_sold === 1) {
    console.log('✅ Trade Officially Closed!');

    // contract.status will now be "won" or "lost"
    if (contract.status === 'won') {
      console.log(`🤑 WIN! Profit: $${contract.profit}`);
    } else {
      console.log(`😭 LOSS. Lost: $${contract.profit}`);
    }

    console.log('New Account Balance:', contract.balance_after);

    // Forget the stream so it stops sending messages
    if (contract.id) {
      socket.send(JSON.stringify({
        "forget": contract.id
      }));
    }

    bot_trade_closed(contract)
  }
  else {
    // 3. Trade is still running (is_sold === 0 and is_expired === 0)
    console.log(`Live Profit: $${contract.profit}`);
  }
}




















javascript.javascriptGenerator.forBlock['trade_settings'] = function (block, generator) {
  const category = block.category;
  const dropdown_stake_unit = block.getFieldValue('stake_unit');
  const value_stake = generator.valueToCode(block, 'stake', javascript.Order.ATOMIC);
  const stakeLines =
    '\n    bot_trade_settings.stake_unit = "' + dropdown_stake_unit + '";' +
    '\n    bot_trade_settings.stake = ' + value_stake + ';';

  switch (category) {
    case "Accumulator Up":
    case "Accumulators": {
      const growth_unit = block.getFieldValue('growth_unit');
      return (
        '\n    bot_trade_settings.growth = "' + growth_unit + '";' +
        stakeLines
      );
    }
    case "Digit Match/Digit Differs":
    case "Digit Over/Digit Under": {
      const dropdown_duration_unit = block.getFieldValue('duration_unit');
      const value_duration = generator.valueToCode(block, 'duration', javascript.Order.ATOMIC);
      const value_digit = generator.valueToCode(block, 'digit', javascript.Order.ATOMIC);
      return (
        '\n    bot_trade_settings.duration_unit = "' + dropdown_duration_unit + '";' +
        '\n    bot_trade_settings.duration = ' + value_duration + ';' +
        '\n    bot_trade_settings.digit = ' + value_digit + ';' +
        stakeLines
      );
    }
    case "High Tick/Low Tick": {
      const dropdown_duration_unit = block.getFieldValue('duration_unit');
      const value_duration = generator.valueToCode(block, 'duration', javascript.Order.ATOMIC);
      return (
        '\n    bot_trade_settings.duration_unit = "' + dropdown_duration_unit + '";' +
        '\n    bot_trade_settings.duration = ' + value_duration + ';' +
        stakeLines
      );
    }
    case "One Touch/No Touch":
    case "Higher/Lower": {
      const dropdown_duration_unit = block.getFieldValue('duration_unit');
      const value_duration = generator.valueToCode(block, 'duration', javascript.Order.ATOMIC);
      const barrier_direction = block.getFieldValue('barrier_direction');
      const value_single_barrier = generator.valueToCode(block, 'single_barrier', javascript.Order.ATOMIC);
      return (
        '\n    bot_trade_settings.duration_unit = "' + dropdown_duration_unit + '";' +
        '\n    bot_trade_settings.duration = ' + value_duration + ';' +
        '\n    bot_trade_settings.barrier_direction = "' + barrier_direction + '";' +
        '\n    bot_trade_settings.single_barrier = ' + value_single_barrier + ';' +
        stakeLines
      );
    }
    case "Ends Between/Ends Outside":
    case "Stay Between/Goes Outside": {
      const dropdown_duration_unit = block.getFieldValue('duration_unit');
      const value_duration = generator.valueToCode(block, 'duration', javascript.Order.ATOMIC);
      const barrier_direction_1 = block.getFieldValue('barrier_direction_1');
      const barrier_direction_2 = block.getFieldValue('barrier_direction_2');
      const value_first_barrier = generator.valueToCode(block, 'first_barrier', javascript.Order.ATOMIC);
      const value_second_barrier = generator.valueToCode(block, 'second_barrier', javascript.Order.ATOMIC);
      return (
        '\n    bot_trade_settings.duration_unit = "' + dropdown_duration_unit + '";' +
        '\n    bot_trade_settings.duration = ' + value_duration + ';' +
        '\n    bot_trade_settings.barrier_direction_1 = "' + barrier_direction_1 + '";' +
        '\n    bot_trade_settings.barrier_direction_2 = "' + barrier_direction_2 + '";' +
        '\n    bot_trade_settings.first_barrier = ' + value_first_barrier + ';' +
        '\n    bot_trade_settings.second_barrier = ' + value_second_barrier + ';' +
        stakeLines
      );
    }
    case "Vanilla Long Call/Vanilla Long Put": {
      const dropdown_duration_unit = block.getFieldValue('duration_unit');
      const value_duration = generator.valueToCode(block, 'duration', javascript.Order.ATOMIC);
      const vanila_direction = block.getFieldValue('vanila_direction');
      return (
        '\n    bot_trade_settings.duration_unit = "' + dropdown_duration_unit + '";' +
        '\n    bot_trade_settings.duration = ' + value_duration + ';' +
        '\n    bot_trade_settings.vanila_barriers = "' + vanila_direction + '";' +
        stakeLines
      );
    }
    default: {
      const dropdown_duration_unit = block.getFieldValue('duration_unit');
      const value_duration = generator.valueToCode(block, 'duration', javascript.Order.ATOMIC);
      return (
        '\n    bot_trade_settings.duration_unit = "' + dropdown_duration_unit + '";' +
        '\n    bot_trade_settings.duration = ' + value_duration + ';' +
        stakeLines
      );
    }
  }
};

javascript.javascriptGenerator.forBlock['virtual_hook'] = function (block, generator) {
  var dropdown_virtualhook_start_when = block.getFieldValue('virtualhook_start_when');
  var value_trigger_val = generator.valueToCode(block, 'trigger_val', javascript.Order.ATOMIC);
  var value_hook_stake = generator.valueToCode(block, 'hook_stake', javascript.Order.ATOMIC);
  var value_max_loss = generator.valueToCode(block, 'max_loss', javascript.Order.ATOMIC);
  var value_max_won = generator.valueToCode(block, 'max_won', javascript.Order.ATOMIC);
  var value_max_trades = generator.valueToCode(block, 'max_trades', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = `...`;
  return code;
};

javascript.javascriptGenerator.forBlock['payout'] = function (block, generator) {
  var dropdown_payout_direction = block.getFieldValue('payout_direction');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['askprice'] = function (block, generator) {
  var dropdown_payout_direction = block.getFieldValue('payout_direction');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['purchase'] = function (block, generator) {
  var dropdown_purchase_direction = block.getFieldValue('purchase_direction');
  // TODO: Assemble javascript into code variable.
  var code = `
  bot_place_trade("${dropdown_purchase_direction}");
  `;
  return code;
};
javascript.javascriptGenerator.forBlock['go__to_the_trade_option'] = function (block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
  return code;
};

javascript.javascriptGenerator.forBlock['sell_avilable'] = function (block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['sell_profit_loss'] = function (block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['sell_at_market'] = function (block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
  return code;
};

javascript.javascriptGenerator.forBlock['result_is'] = function (block, generator) {
  var dropdown_result_is_direction = block.getFieldValue('result_is_direction');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['contract_details'] = function (block, generator) {
  var dropdown_result_is_direction = block.getFieldValue('result_is_direction');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['trade_again'] = function (block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = 'trade_again = true;';
  return code;
};

javascript.javascriptGenerator.forBlock['last_tick'] = function (block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['last_tick_string'] = function (block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['last_digit'] = function (block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['tick_direction'] = function (block, generator) {
  var dropdown_tick_direction = block.getFieldValue('tick_direction');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['tick_list'] = function (block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['tick_string_list'] = function (block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['last_color_ticks'] = function (block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['last_digit_list'] = function (block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['last_color_digit_list'] = function (block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['check_digit_color_pattern'] = function (block, generator) {
  var value_input_list = generator.valueToCode(block, 'input_list', javascript.Order.ATOMIC);
  var value_digit_color_list = generator.valueToCode(block, 'digit_color_list', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['check_direction_pattern'] = function (block, generator) {
  var value_input_list = generator.valueToCode(block, 'input_list', javascript.Order.ATOMIC);
  var value_digit_color_list = generator.valueToCode(block, 'digit_color_list', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['is_candle_black'] = function (block, generator) {
  var value_is_candle_black = generator.valueToCode(block, 'is_candle_black', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['make_a_list_of_candle_values'] = function (block, generator) {
  var dropdown_candle_value_type = block.getFieldValue('candle_value_type');
  var value_listed_candle = generator.valueToCode(block, 'listed_candle', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['read_values_from_candle'] = function (block, generator) {
  var dropdown_candle_value_type = block.getFieldValue('candle_value_type');
  var value_read_values_from_candle = generator.valueToCode(block, 'read_values_from candle', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['in_candle_list_read'] = function (block, generator) {
  var dropdown_candle_value_type = block.getFieldValue('candle_value_type');
  var value_in_candle_list_read = generator.valueToCode(block, 'in_candle_list_read', javascript.Order.ATOMIC);
  var dropdown_interval_type = block.getFieldValue('interval_type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['in_candle_list_get_from_end'] = function (block, generator) {
  var value_in_candle_list_get_from_end = generator.valueToCode(block, 'in_candle_list_get_from_end', javascript.Order.ATOMIC);
  var dropdown_interval_type = block.getFieldValue('interval_type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['candle_list_with_intervals'] = function (block, generator) {
  var dropdown_interval_type = block.getFieldValue('interval_type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['candle_colors_with_intervals'] = function (block, generator) {
  var dropdown_interval_type = block.getFieldValue('interval_type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['make_a_list_of_type_values_in_candle_list'] = function (block, generator) {
  var dropdown_candle_type = block.getFieldValue('candle_type');
  var dropdown_interval_type = block.getFieldValue('interval_type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['macd'] = function (block, generator) {
  var dropdown_macd_type = block.getFieldValue('macd_type');
  var value_input_list = generator.valueToCode(block, 'input_list', javascript.Order.ATOMIC);
  var value_fast_ema = generator.valueToCode(block, 'fast_ema', javascript.Order.ATOMIC);
  var value_slow_ema = generator.valueToCode(block, 'slow_ema', javascript.Order.ATOMIC);
  var value_signel_ema = generator.valueToCode(block, 'signel_ema', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['relative_strength'] = function (block, generator) {
  var value_input_list = generator.valueToCode(block, 'input_list', javascript.Order.ATOMIC);
  var value_period = generator.valueToCode(block, 'period', javascript.Order.ATOMIC);
  var dropdown_output_type = block.getFieldValue('output_type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['boolinger_bands'] = function (block, generator) {
  var dropdown_bands_type = block.getFieldValue('bands_type');
  var value_input_list = generator.valueToCode(block, 'input_list', javascript.Order.ATOMIC);
  var value_up_mul = generator.valueToCode(block, 'up_mul', javascript.Order.ATOMIC);
  var value_down_mul = generator.valueToCode(block, 'down_mul', javascript.Order.ATOMIC);
  var dropdown_output_type = block.getFieldValue('output_type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['dochain_channels'] = function (block, generator) {
  var dropdown_bands_type = block.getFieldValue('bands_type');
  var value_input_list = generator.valueToCode(block, 'input_list', javascript.Order.ATOMIC);
  var value_period = generator.valueToCode(block, 'period', javascript.Order.ATOMIC);
  var dropdown_output_type = block.getFieldValue('output_type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['simple_moving'] = function (block, generator) {
  var value_input_list = generator.valueToCode(block, 'input_list', javascript.Order.ATOMIC);
  var value_period = generator.valueToCode(block, 'period', javascript.Order.ATOMIC);
  var dropdown_output_type = block.getFieldValue('output_type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['exponential_moving'] = function (block, generator) {
  var value_input_list = generator.valueToCode(block, 'input_list', javascript.Order.ATOMIC);
  var value_period = generator.valueToCode(block, 'period', javascript.Order.ATOMIC);
  var dropdown_output_type = block.getFieldValue('output_type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['digit_stats'] = function (block, generator) {
  var value_input_list = generator.valueToCode(block, 'input_list', javascript.Order.ATOMIC);
  var value_period = generator.valueToCode(block, 'period', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['worm'] = function (block, generator) {
  var value_input_list = generator.valueToCode(block, 'input_list', javascript.Order.ATOMIC);
  var value_period = generator.valueToCode(block, 'period', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['trend'] = function (block, generator) {
  var value_input_list = generator.valueToCode(block, 'input_list', javascript.Order.ATOMIC);
  var value_slow_ma = generator.valueToCode(block, 'slow_ma', javascript.Order.ATOMIC);
  var value_fast_ma = generator.valueToCode(block, 'fast_ma', javascript.Order.ATOMIC);
  var value_signel_ma = generator.valueToCode(block, 'signel_ma', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['pivot_points'] = function (block, generator) {
  var dropdown_type = block.getFieldValue('type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['worm_query'] = function (block, generator) {
  var dropdown_type = block.getFieldValue('type');
  var variable_worm_variable = generator.nameDB_.getName(block.getFieldValue('worm_variable'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['digit_query'] = function (block, generator) {
  var dropdown_type = block.getFieldValue('type');
  var value_instance = generator.valueToCode(block, 'instance', javascript.Order.ATOMIC);
  var value_paameters = generator.valueToCode(block, 'paameters', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['virtual_hook_reset'] = function (block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
  return code;
};

javascript.javascriptGenerator.forBlock['virtual_hook_start_when'] = function (block, generator) {
  var dropdown_type = block.getFieldValue('type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['virtual_hook_query'] = function (block, generator) {
  var dropdown_type = block.getFieldValue('type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['virtual_hook_change'] = function (block, generator) {
  var dropdown_type = block.getFieldValue('type');
  var value_chnage_value = generator.valueToCode(block, 'chnage_value', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
  return code;
};

javascript.javascriptGenerator.forBlock['virtual_hook_change_status'] = function (block, generator) {
  var dropdown_type = block.getFieldValue('type');
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
  return code;
};

javascript.javascriptGenerator.forBlock['virtual_hook_token'] = function (block, generator) {
  var text_token = block.getFieldValue('token');
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
  return code;
};

javascript.javascriptGenerator.forBlock['virtual_hook_change_account'] = function (block, generator) {
  var dropdown_typr = block.getFieldValue('typr');
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
  return code;
};

javascript.javascriptGenerator.forBlock['seconds_since_epoch'] = function (block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['to_timestamp'] = function (block, generator) {
  var value_input_time_date = generator.valueToCode(block, 'input_time_date', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['run_after'] = function (block, generator) {
  var statements_run_after = generator.statementToCode(block, 'run_after');
  var value_delay = generator.valueToCode(block, 'delay', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
  return code;
};

javascript.javascriptGenerator.forBlock['balance'] = function (block, generator) {
  var dropdown_type = block.getFieldValue('type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['total_profit'] = function (block, generator) {
  var dropdown_type = block.getFieldValue('type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['number_of_runs'] = function (block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['notify'] = function (block, generator) {
  var dropdown_color = block.getFieldValue('color');
  var dropdown_sound = block.getFieldValue('sound');
  var value_name = generator.valueToCode(block, 'NAME', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
  return code;
};

javascript.javascriptGenerator.forBlock['main_block'] = function (block, generator) {
  var dropdown_first_market = block.getFieldValue('first_market');
  var dropdown_second_market = block.getFieldValue('second_market');
  var dropdown_third_market = block.getFieldValue('third_market');
  var dropdown_first_category = block.getFieldValue('first_category');
  var dropdown_second_category = block.getFieldValue('second_category');
  var dropdown_contract_type = block.getFieldValue('contract_type');
  var dropdown_candle_interval = block.getFieldValue('candle_interval');
  var checkbox_buy_sell_error = block.getFieldValue('buySellError') === 'TRUE';
  var checkbox_last_trade_on_error = block.getFieldValue('lastTradeOnError') === 'TRUE';
  var statements_run_once = generator.statementToCode(block, 'run_once');
  var statements_trade_options = generator.statementToCode(block, 'trade_options');
  var statements_watch_purchase = generator.statementToCode(block, 'watch_purchase');
  var statements_watch_sell = generator.statementToCode(block, 'watch_sell');
  var statements_trade_again = generator.statementToCode(block, 'trade_again');
  // TODO: Assemble javascript into code variable.

  var code = `

  bot_functions.assign_bot_variables_f = () => {
  bot_trade_settings.market = '${dropdown_third_market}'
  bot_trade_settings.category = '${dropdown_second_category}'
  bot_trade_settings.contract_type = '${dropdown_contract_type}'
  bot_trade_settings.candle_interval = '${dropdown_candle_interval}'
  bot_trade_settings.restart_buy_sell_on_error = ${checkbox_buy_sell_error},
  bot_trade_settings.restart_last_trade_on_error = ${checkbox_last_trade_on_error}
  }
  bot_functions.runOnceAtStart_f = () => {
    ${statements_run_once}
  }
  bot_functions.tradeOptions_f = () => {
    ${statements_trade_options}
    }
  bot_functions.watchAndPurchase_f = () => {
    ${statements_watch_purchase}
  }
  bot_functions.watchAndSell_f = () => {
    ${statements_watch_sell}  
  }
  bot_functions.tradeAgain_f = () => {
    ${statements_trade_again}
  }
  `;
  return code;
};

javascript.javascriptGenerator.forBlock['notify_telegram'] = function (block, generator) {
  var value_token = generator.valueToCode(block, 'token', javascript.Order.ATOMIC);
  var value_id = generator.valueToCode(block, 'id', javascript.Order.ATOMIC);
  var value_msg = generator.valueToCode(block, 'msg', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
  return code;
};


javascript.javascriptGenerator.forBlock['ignore'] = function (block, generator) {
  var statements_ignore = generator.statementToCode(block, 'ignore');
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
  return code;
};