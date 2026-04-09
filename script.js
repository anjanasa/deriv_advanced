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
let GLOBAL_CATEGORY

let is_bot_running = false;
let is_bot_onTrade = false;

//trading settings
let bot_trade_settings = {
  duration: '',
  duration_unit: '',
  growth: '',
  stake: '',
  stake_unit: '',
  digit: '',
  single_barrier: '',
  first_barrier: '',
  second_barrier: '',
  vanila_barriers: '',
};

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

/* ─── Blockly Dynamic Dropdown Data ─────────────────────────────────────── */
const PLACEHOLDER_OPTIONS = [['Loading…', 'LOADING']];

let currentMarketOptions  = [...PLACEHOLDER_OPTIONS];
let secondMarketData      = [...PLACEHOLDER_OPTIONS];
let thirdMarketData       = [...PLACEHOLDER_OPTIONS];
let mainContractTypes     = [...PLACEHOLDER_OPTIONS];
let subContractTypes      = [...PLACEHOLDER_OPTIONS];

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
                ['Both',   'both']
            ]), 'contract_type');
        this.appendDummyInput()
            .appendField('Default Candle Interval')
            .appendField(new Blockly.FieldDropdown([
                ['1 Minute',  '1m'],  ['2 Minute',  '2m'],  ['3 Minute',  '3m'],
                ['5 Minute',  '5m'],  ['10 Minute', '10m'], ['15 Minute', '15m'],
                ['30 Minute', '30m'], ['1 Hour',    '1h'],  ['2 Hour',    '2h'],
                ['4 Hour',    '4h'],  ['8 Hour',    '8h'],  ['1 Day',     '1d']
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
  init: function() {

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
  init: function() {
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
  init: function() {
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
            toolboxBackgroundColour:   '#0d1117',
            toolboxForegroundColour:   '#8b949e',
            flyoutBackgroundColour:    'rgba(13, 17, 23, 0.97)',
            insertionMarkerColour:     '#22d3ee',
            scrollbarColour:           'rgba(34, 211, 238, 0.2)',
        },
        blockStyles: {
            premium_dark: {
                colourPrimary:   '#161b22',
                colourSecondary: '#0d1117',
                colourTertiary:  '#21262d'
            }
        }
    });

    workspace = Blockly.inject(container, {
        toolbox:   toolboxXml,
        renderer:  'thrasos',
        theme:     premiumTheme,
        grid:      { spacing: 25, length: 3, colour: 'rgba(4, 219, 129, 0.05)', snap: true },
        move:      { scrollbars: true, drag: true, wheel: true },
        zoom:      { wheel: true, startScale: 1.0, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 }
    });

    // Keep Blockly canvas in sync with container size changes
    const resizeObserver = new ResizeObserver(() => Blockly.svgResize(workspace));
    resizeObserver.observe(container);

    // Single consolidated change listener
    workspace.addChangeListener(onWorkspaceChange);

    enforceSingleMainBlock(workspace);

    console.log('[Blockly] Workspace initialised ✓');
    block_change_detect()
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
                console.log("[Block] Main block created");

                // Optional: initialize dropdowns immediately
                const firstValue = block.getFieldValue('first_market');
                if (firstValue && globalMarketData[firstValue]) {
                    updateSecondDropdown(block, firstValue);
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
        } catch (_) {}
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
        case 'authorize':      handleAuthorize(data);        break;
        case 'balance':        handleBalance(data);          break;
        case 'ping':           handlePing();                 break;
        case 'active_symbols': processActiveSymbols(data);   break;
        case 'contracts_for':  processContractsFor(data);    break;
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
        return;
    }
    afterAuthorized(data);
    getActiveMarkets();
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
            account:  params.get(`acct${i}`),
            token:    params.get(`token${i}`),
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
            current.account  = loginid;
            current.currency = currency;
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
    const connectBtn     = document.getElementById('connectAccountBtn');
    const hasAccount     = accountList.length > 0 && currentAccountIndex < accountList.length;

    if (hasAccount) {
        const current = accountList[currentAccountIndex];
        const balance = accountBalances[current.account] || '0.00';
        document.getElementById('currentAccountName')?.textContent    !== undefined &&
            (document.getElementById('currentAccountName').textContent    = current.account);
        document.getElementById('currentAccountBalance')?.textContent !== undefined &&
            (document.getElementById('currentAccountBalance').textContent = balance);
        document.getElementById('currentAccountBadge')?.textContent   !== undefined &&
            (document.getElementById('currentAccountBadge').textContent   = current.account);
        if (accountDisplay) accountDisplay.style.display = 'flex';
        if (connectBtn)     connectBtn.style.display     = 'none';
    } else {
        if (accountDisplay) accountDisplay.style.display = 'none';
        if (connectBtn)     connectBtn.style.display     = 'block';
    }
}

function showAccountDropdown() {
    const dropdown    = document.getElementById('accountDropdown');
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
            const balance  = accountBalances[account.account] || '0.00';
            const isActive = index === currentAccountIndex;
            const item     = document.createElement('div');
            item.className = `account-item${isActive ? ' active' : ''}`;
            item.onclick   = () => switchAccount(index);
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
    currentAccountIndex = index;
    const account = accountList[index];
    console.log('[Auth] Switching to account:', account.account);
    sendWS({ authorize: account.token });
    updateAccountDisplay();
    hideAccountDropdown();
    showSuccess(`Switched to account ${account.account}`, 2000);
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
    const allBlocks       = workspace.getAllBlocks(false);
    const connectedBlocks = workspace.getTopBlocks(false)
        .reduce((acc, tb) => acc + tb.getDescendants(false).length, 0);

    const blockCountEl     = document.getElementById('blockCount');
    const connectedBlocksEl = document.getElementById('connectedBlocks');
    if (blockCountEl)      blockCountEl.textContent      = allBlocks.length;
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
        const el   = document.getElementById('generatedCode');
        if (el) el.textContent = code || '// No blocks in workspace';
    } catch (err) {
        console.error('[Code] Generation error:', err);
    }
}

function toggleCodePanel() {
    const panel = document.getElementById('botCodePanel');
    const btn   = document.getElementById('toggleCodeBtn');
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
        .then(()  => showSuccess('Code copied to clipboard!'))
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
const showError   = (m, d) => showToast(m, 'error',   d);
const showInfo    = (m, d) => showToast(m, 'info',    d);

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

    // Initialise Blockly after market data is available
    initBlockly();
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
                pip:          market.pip,
                symbol:       market.symbol
            });

            return acc;
        }, {});
}

/* ─── Contract Data ──────────────────────────────────────────────────────── */

function getContractForSymbol(symbol) {
    if (!symbol || symbol === 'LOADING' || symbol === 'NONE') return;
    console.log('[Contract] Requesting contracts for:', symbol);
    sendWS({
        contracts_for:   symbol,
        currency:        selectedAccountCurrency,
        landing_company: 'svg',
        product_type:    'basic'
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
    const seen   = new Set();
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
        const category  = item.contract_category;
        const groupName = _getContractGroupName(item);

        if (!tempSubData[category])             tempSubData[category] = {};
        if (!tempSubData[category][groupName])  tempSubData[category][groupName] = new Set();
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
        const firstField  = block.getField('first_category');
        const secondField = block.getField('second_category');
        const firstValue  = block.getFieldValue('first_category');

        if (firstField) {
            firstField.menuGenerator_ = result;
            firstField.setValue(result[0]?.[1] ?? '');
        }
        if (secondField) {
            const sub = subdata[firstValue] || subContractTypes;
            secondField.menuGenerator_ = sub;
            secondField.setValue(sub[0]?.[1] ?? '');
        }
    });

    console.log('[Contract] Contract types loaded successfully');
}

/** Map a contract item to its display group name. */
function _getContractGroupName(item) {
    const t = item.contract_type;
    if (t === 'CALL' || t === 'PUT')                                  return 'Higher/Lower';
    if (t === 'CALLE' || t === 'PUTE')                                return 'Higher/Lower (Equals)';
    if (t === 'MULTUP' || t === 'MULTDOWN')                           return 'Multiply Up/Multiply Down';
    if (t === 'ASIANU' || t === 'ASIAND')                             return 'Asian Up/Asian Down';
    if (t === 'DIGITOVER' || t === 'DIGITUNDER')                      return 'Digit Over/Digit Under';
    if (t.includes('DIGITMATCH') || t.includes('DIGITDIFF'))          return 'Digit Match/Digit Differs';
    if (t.includes('DIGITODD')   || t.includes('DIGITEVEN'))          return 'Digit Odd/Digit Even';
    if (t === 'EXPIRYRANGE' || t === 'EXPIRYMISS' ||
        t === 'EXPIRYRANGEE' || t === 'EXPIRYMISSE')                  return 'Ends Between/Ends Outside';
    if (t === 'TICKHIGH' || t === 'TICKLOW')                          return 'High Tick/Low Tick';
    if (t === 'RESETCALL' || t === 'RESETPUT')                        return 'Reset Call/Reset Put';
    if (t === 'RUNHIGH'   || t === 'RUNLOW')                          return 'Only Up/Only Down';
    if (t === 'RANGE'          || t === 'UPORDOWN')                   return 'Stay Between/Goes Outside';
    if (t === 'ONETOUCH'       || t === 'NOTOUCH')                    return 'One Touch/No Touch';
    if (t === 'TURBOSLONG'     || t === 'TURBOSSHORT')                return 'Turbo Long/Turbo Short';
    if (t === 'VANILLALONGCALL'|| t === 'VANILLALONGPUT')             return 'Vanilla Long Call/Vanilla Long Put';
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

    secondMarketData            = options;
    secondField.menuGenerator_  = options;
    secondField.setValue(options[0]?.[1] ?? '');

    // Cascade to third
    if (options.length > 0) {
        updateThirdDropdown(block, options[0][1]);
    }
}

function updateThirdDropdown(block, secondValue) {
    const thirdField  = block.getField('third_market');
    const firstValue  = block.getFieldValue('first_market');
    if (!thirdField) return;

    const marketEntry = globalMarketData[firstValue];
    const submarket   = marketEntry?.submarkets[secondValue];

    if (!submarket) {
        console.warn('[Dropdown] No submarket data for:', secondValue);
        return;
    }

    const options = submarket.symbols.map(s => [capitalize(s.display_name), s.symbol]);

    thirdMarketData            = options;
    thirdField.menuGenerator_  = options;
    thirdField.setValue(options[0]?.[1] ?? '');

    if (options.length > 0) {
        getContractForSymbol(options[0][1]);
    }
}

function updateSecondCategoryDropdown(block, firstCategoryValue) {
    const secondField = block.getField('second_category');
    if (!secondField) return;

    const sub = subdata[firstCategoryValue];
    if (!sub || sub.length === 0) {
        console.warn('[Dropdown] No sub-category data for:', firstCategoryValue);
        return;
    }

    subContractTypes           = sub;
    secondField.menuGenerator_ = sub;
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
        const dropdown      = document.getElementById('accountDropdown');
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
                case 'Zoom +': workspace.zoomCenter(1);                          break;
                case 'Zoom -': workspace.zoomCenter(-1);                         break;
                case 'Focus':  workspace.scrollCenter();                         break;
                case 'Reset':  workspace.setScale(1); workspace.scrollCenter();  break;
            }
        });
    });

    // ── Import button (placeholder) ──
    document.getElementById('importBtn')?.addEventListener('click', () => {
        console.log('[UI] Import button clicked (not yet implemented)');
    });

    // ── Code panel controls ──
    document.getElementById('toggleCodeBtn')?.addEventListener('click', toggleCodePanel);
    document.getElementById('copyCodeBtn')?.addEventListener('click', copyGeneratedCode);
});





function block_change_detect() {
    workspace.addChangeListener(function(event) {

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
            options = [["Accumulator", "ACCU"]]
            break;
        case "Asian Up/Asian Down":
            options = [["Asian Up", "ASIANU"],["Asian Down", "ASIAND"]]
            break;
        case "Rise/Fall":
            options = [["Rise","CALL"],["Fall","PUT"]]
            break;
        case "Higher/Lower":
            options = [["Higher","CALL"],["Lower","PUT"]]
            break;
        case "Higher/Lower (Equals)":
            options = [["Higher Equals","CALLE"],["Lower Equals","PUTE"]]
            break;
        case "Digit Match/Digit Differs":
            options = [["Digit Match","DIGITMATCH"],["Digit Differs","DIGITDIFF"]]
            break;
        case "Digit Odd/Digit Even":
            options = [["Digit Odd","DIGITODD"],["Digit Even","DIGITEVEN"]]
            break;
        case "Digit Over/Digit Under":
            options = [["Digit Over","DIGITOVER"],["Digit Under","DIGITUNDER"]]
            break;
        case "Ends Between/Ends Outside":
            options = [["Ends Between","EXPIRYRANGE"],["Ends Outside","EXPIRYMISS"]]
            break;
        case "High Tick/Low Tick":
            options = [["High Tick","TICKHIGH"],["Low Tick","TICKLOW"]]
            break;
        case "Multiply Up/Multiply Down":
            options = [["Multiply Up","MULTUP"],["Multiply Down","MULTDOWN"]]
            break;
        case "Reset Call/Reset Put":
            options = [["Reset Call","RESETCALL"],["Reset Put","RESETPUT"]]
            break;
        case "Only Up/Only Down":
            options = [["Only Up","RUNHIGH"],["Only Down","RUNLOW"]]
            break;
        case "Stay Between/Goes Outside":
            options = [["Stay Between","RANGE"],["Goes Outside","UPORDOWN"]]
            break;
        case "One Touch/No Touch":
            options = [["One Touch","ONETOUCH"],["No Touch","NOTOUCH"]]
            break;
        case "Turbo Long/Turbo Short":
            options = [["Turbo Long","TURBOSLONG"],["Turbo Short","TURBOSHORT"]]
            break;
        case "Vanilla Long Call/Vanilla Long Put":
            options = [["Vanilla Long Call","VANILLALONGCALL"],["Vanilla Long Put","VANILLALONGPUT"]]
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







function runBot() {
  console.log("run bot clicked variables reset");

  is_bot_running = true;
  is_bot_onTrade = false;

  // Run code generation first — the main_block generator assigns assign_bot_variables as a side-effect.
  try {
    javascript.javascriptGenerator.workspaceToCode(workspace);
  } catch (err) {
    console.warn('[Bot] Code generation error during runBot:', err);
  }

  if (typeof assign_bot_variables !== 'function') {
    console.error('[Bot] assign_bot_variables is not set — make sure a Main Block exists in the workspace.');
    is_bot_running = false;
    return;
  }

  assign_bot_variables();
  console.log(bot_trade_settings);

  getMarketData()
    .then(() => {
      console.log("market data received");
      // startTradingCycle();
    })
    .catch((error) => {
      console.error("Error getting market data:", error);
      is_bot_running = false;
    });
}

function getMarketData() {
  return new Promise((resolve, reject) => {
    
  })
}






























javascript.javascriptGenerator.forBlock['trade_settings'] = function(block, generator) {
  if (block.category === "Accumulator Up") {
    var dropdown_duration_unit = block.getFieldValue('duration_unit');
    var dropdown_stake_unit = block.getFieldValue('stake_unit');
    var value_stake = generator.valueToCode(block, 'stake', javascript.Order.ATOMIC);
    var code = `
    duration_unit = "${dropdown_duration_unit}";
    stake_unit = "${dropdown_stake_unit}";
    stake = ${value_stake};
    `;
  }else{
    var dropdown_duration_unit = block.getFieldValue('duration_unit');
    var value_duration = generator.valueToCode(block, 'duration', javascript.Order.ATOMIC);
    var dropdown_stake_unit = block.getFieldValue('stake_unit');
    var value_stake = generator.valueToCode(block, 'stake', javascript.Order.ATOMIC);
    var code = `
    duration_unit = "${dropdown_duration_unit}";
    duration = ${value_duration};
    stake_unit = "${dropdown_stake_unit}";
    stake = ${value_stake};
    `;
  }
  // TODO: Assemble javascript into code variable.

  return code;
};

javascript.javascriptGenerator.forBlock['virtual_hook'] = function(block, generator) {
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

javascript.javascriptGenerator.forBlock['payout'] = function(block, generator) {
  var dropdown_payout_direction = block.getFieldValue('payout_direction');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['askprice'] = function(block, generator) {
  var dropdown_payout_direction = block.getFieldValue('payout_direction');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['purchase'] = function(block, generator) {
  var dropdown_purchase_direction = block.getFieldValue('purchase_direction');
  // TODO: Assemble javascript into code variable.
  var code = `
  let purchase_direction = "${dropdown_purchase_direction}";
  `;
  return code;
};

javascript.javascriptGenerator.forBlock['go__to_the_trade_option'] = function(block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
  return code;
};

javascript.javascriptGenerator.forBlock['sell_avilable'] = function(block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['sell_profit_loss'] = function(block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['sell_at_market'] = function(block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
  return code;
};

javascript.javascriptGenerator.forBlock['result_is'] = function(block, generator) {
  var dropdown_result_is_direction = block.getFieldValue('result_is_direction');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['contract_details'] = function(block, generator) {
  var dropdown_result_is_direction = block.getFieldValue('result_is_direction');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['trade_again'] = function(block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
  return code;
};

javascript.javascriptGenerator.forBlock['last_tick'] = function(block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['last_tick_string'] = function(block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['last_digit'] = function(block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['tick_direction'] = function(block, generator) {
  var dropdown_tick_direction = block.getFieldValue('tick_direction');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['tick_list'] = function(block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['tick_string_list'] = function(block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['last_color_ticks'] = function(block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['last_digit_list'] = function(block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['last_color_digit_list'] = function(block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['check_digit_color_pattern'] = function(block, generator) {
  var value_input_list = generator.valueToCode(block, 'input_list', javascript.Order.ATOMIC);
  var value_digit_color_list = generator.valueToCode(block, 'digit_color_list', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['check_direction_pattern'] = function(block, generator) {
  var value_input_list = generator.valueToCode(block, 'input_list', javascript.Order.ATOMIC);
  var value_digit_color_list = generator.valueToCode(block, 'digit_color_list', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['is_candle_black'] = function(block, generator) {
  var value_is_candle_black = generator.valueToCode(block, 'is_candle_black', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['make_a_list_of_candle_values'] = function(block, generator) {
  var dropdown_candle_value_type = block.getFieldValue('candle_value_type');
  var value_listed_candle = generator.valueToCode(block, 'listed_candle', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['read_values_from_candle'] = function(block, generator) {
  var dropdown_candle_value_type = block.getFieldValue('candle_value_type');
  var value_read_values_from_candle = generator.valueToCode(block, 'read_values_from candle', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['in_candle_list_read'] = function(block, generator) {
  var dropdown_candle_value_type = block.getFieldValue('candle_value_type');
  var value_in_candle_list_read = generator.valueToCode(block, 'in_candle_list_read', javascript.Order.ATOMIC);
  var dropdown_interval_type = block.getFieldValue('interval_type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['in_candle_list_get_from_end'] = function(block, generator) {
  var value_in_candle_list_get_from_end = generator.valueToCode(block, 'in_candle_list_get_from_end', javascript.Order.ATOMIC);
  var dropdown_interval_type = block.getFieldValue('interval_type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['candle_list_with_intervals'] = function(block, generator) {
  var dropdown_interval_type = block.getFieldValue('interval_type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['candle_colors_with_intervals'] = function(block, generator) {
  var dropdown_interval_type = block.getFieldValue('interval_type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['make_a_list_of_type_values_in_candle_list'] = function(block, generator) {
  var dropdown_candle_type = block.getFieldValue('candle_type');
  var dropdown_interval_type = block.getFieldValue('interval_type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['macd'] = function(block, generator) {
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

javascript.javascriptGenerator.forBlock['relative_strength'] = function(block, generator) {
  var value_input_list = generator.valueToCode(block, 'input_list', javascript.Order.ATOMIC);
  var value_period = generator.valueToCode(block, 'period', javascript.Order.ATOMIC);
  var dropdown_output_type = block.getFieldValue('output_type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['boolinger_bands'] = function(block, generator) {
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

javascript.javascriptGenerator.forBlock['dochain_channels'] = function(block, generator) {
  var dropdown_bands_type = block.getFieldValue('bands_type');
  var value_input_list = generator.valueToCode(block, 'input_list', javascript.Order.ATOMIC);
  var value_period = generator.valueToCode(block, 'period', javascript.Order.ATOMIC);
  var dropdown_output_type = block.getFieldValue('output_type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['simple_moving'] = function(block, generator) {
  var value_input_list = generator.valueToCode(block, 'input_list', javascript.Order.ATOMIC);
  var value_period = generator.valueToCode(block, 'period', javascript.Order.ATOMIC);
  var dropdown_output_type = block.getFieldValue('output_type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['exponential_moving'] = function(block, generator) {
  var value_input_list = generator.valueToCode(block, 'input_list', javascript.Order.ATOMIC);
  var value_period = generator.valueToCode(block, 'period', javascript.Order.ATOMIC);
  var dropdown_output_type = block.getFieldValue('output_type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['digit_stats'] = function(block, generator) {
  var value_input_list = generator.valueToCode(block, 'input_list', javascript.Order.ATOMIC);
  var value_period = generator.valueToCode(block, 'period', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['worm'] = function(block, generator) {
  var value_input_list = generator.valueToCode(block, 'input_list', javascript.Order.ATOMIC);
  var value_period = generator.valueToCode(block, 'period', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['trend'] = function(block, generator) {
  var value_input_list = generator.valueToCode(block, 'input_list', javascript.Order.ATOMIC);
  var value_slow_ma = generator.valueToCode(block, 'slow_ma', javascript.Order.ATOMIC);
  var value_fast_ma = generator.valueToCode(block, 'fast_ma', javascript.Order.ATOMIC);
  var value_signel_ma = generator.valueToCode(block, 'signel_ma', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['pivot_points'] = function(block, generator) {
  var dropdown_type = block.getFieldValue('type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['worm_query'] = function(block, generator) {
  var dropdown_type = block.getFieldValue('type');
  var variable_worm_variable = generator.nameDB_.getName(block.getFieldValue('worm_variable'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['digit_query'] = function(block, generator) {
  var dropdown_type = block.getFieldValue('type');
  var value_instance = generator.valueToCode(block, 'instance', javascript.Order.ATOMIC);
  var value_paameters = generator.valueToCode(block, 'paameters', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['virtual_hook_reset'] = function(block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
  return code;
};

javascript.javascriptGenerator.forBlock['virtual_hook_start_when'] = function(block, generator) {
  var dropdown_type = block.getFieldValue('type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['virtual_hook_query'] = function(block, generator) {
  var dropdown_type = block.getFieldValue('type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['virtual_hook_change'] = function(block, generator) {
  var dropdown_type = block.getFieldValue('type');
  var value_chnage_value = generator.valueToCode(block, 'chnage_value', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
  return code;
};

javascript.javascriptGenerator.forBlock['virtual_hook_change_status'] = function(block, generator) {
  var dropdown_type = block.getFieldValue('type');
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
  return code;
};

javascript.javascriptGenerator.forBlock['virtual_hook_token'] = function(block, generator) {
  var text_token = block.getFieldValue('token');
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
  return code;
};

javascript.javascriptGenerator.forBlock['virtual_hook_change_account'] = function(block, generator) {
  var dropdown_typr = block.getFieldValue('typr');
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
  return code;
};

javascript.javascriptGenerator.forBlock['seconds_since_epoch'] = function(block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['to_timestamp'] = function(block, generator) {
  var value_input_time_date = generator.valueToCode(block, 'input_time_date', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['run_after'] = function(block, generator) {
  var statements_run_after = generator.statementToCode(block, 'run_after');
  var value_delay = generator.valueToCode(block, 'delay', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
  return code;
};

javascript.javascriptGenerator.forBlock['balance'] = function(block, generator) {
  var dropdown_type = block.getFieldValue('type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['total_profit'] = function(block, generator) {
  var dropdown_type = block.getFieldValue('type');
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['number_of_runs'] = function(block, generator) {
  // TODO: Assemble javascript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.javascript.ORDER_NONE];
};

javascript.javascriptGenerator.forBlock['notify'] = function(block, generator) {
  var dropdown_color = block.getFieldValue('color');
  var dropdown_sound = block.getFieldValue('sound');
  var value_name = generator.valueToCode(block, 'NAME', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
  return code;
};

javascript.javascriptGenerator.forBlock['main_block'] = function(block, generator) {
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

javascript.javascriptGenerator.forBlock['notify_telegram'] = function(block, generator) {
  var value_token = generator.valueToCode(block, 'token', javascript.Order.ATOMIC);
  var value_id = generator.valueToCode(block, 'id', javascript.Order.ATOMIC);
  var value_msg = generator.valueToCode(block, 'msg', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
  return code;
};


javascript.javascriptGenerator.forBlock['ignore'] = function(block, generator) {
  var statements_ignore = generator.statementToCode(block, 'ignore');
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
  return code;
};