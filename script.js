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

    this.category = null;

    this.updateShape_();

    this.setPreviousStatement(true, null);
    this.setColour(230);
  },

  updateShape_: function () {

    // 🔴 Remove all dynamic inputs
    if (this.getInput('duration')) this.removeInput('duration');
    if (this.getInput('growth')) this.removeInput('growth');
    if (this.getInput('stake')) this.removeInput('stake');

    // ✅ ACCU → ONLY dropdown (no value input)
    if (this.category === "ACCU") {

      this.appendDummyInput("growth")
        .appendField("Growth Rate :")
        .appendField(new Blockly.FieldDropdown([
          ["1%", "1"],
          ["2%", "2"],
          ["5%", "5"],
          ["10%", "10"]
        ]), "growth_unit");

    } else {

      // ✅ NORMAL → duration with value input
      this.appendValueInput("duration")
        .appendField("Duration :")
        .appendField(new Blockly.FieldDropdown([
          ["Ticks", "t"],
          ["Seconds", "s"],
          ["Minutes", "m"]
        ]), "duration_unit");
    }

    // ✅ Stake (keep as value input)
    this.appendValueInput("stake")
      .appendField("Stake :")
      .appendField(new Blockly.FieldDropdown([
        ["Stake", "stake"],
        ["Payout", "payout"]
      ]), "stake_unit");
  }
};
Blockly.Blocks['purchase'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Purchase")
        .appendField(new Blockly.FieldDropdown([
          ["Option", "OPTION"]
        ]), "purchase_direction");

    this.setPreviousStatement(true, null);
    this.setColour(230);
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

    // --- Dropdown cascade (only on field changes) ---
    const block = workspace.getBlockById(event.blockId);
    if (!block || block.type !== 'main_block') return;

    // Auto-initialise second dropdown when the block is first created / loaded
    if (event.type !== Blockly.Events.CHANGE || event.element !== 'field') {
        try {
            const secondValue = block.getFieldValue('second_market');
            if (secondValue === 'LOADING' || secondValue === 'OPTIONNAME') {
                const firstValue = block.getFieldValue('first_market');
                if (firstValue && globalMarketData[firstValue]) {
                    updateSecondDropdown(block, firstValue);
                }
            }
        } catch (_) { /* block may not have these fields yet */ }
        return;
    }

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
            console.log('[Contract] Second category changed to:', event.newValue);
            break;
        default:
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

    // Build de-duplicated list of main categories
    const seen   = new Set();
    const result = [];
    for (const item of contracts) {
        const display = item.contract_category_display;
        if (!seen.has(display)) {
            seen.add(display);
            result.push([display, item.contract_category]);
        }
    }

    // Build sub-category groups per category
    const tempSubData = {};
    for (const item of contracts) {
        const category  = item.contract_category;
        const groupName = _getContractGroupName(item);

        if (!tempSubData[category])             tempSubData[category] = {};
        if (!tempSubData[category][groupName])  tempSubData[category][groupName] = new Set();
        tempSubData[category][groupName].add(item.contract_display);
    }

    // Convert Sets → arrays and store in global subdata
    for (const [category, groups] of Object.entries(tempSubData)) {
        subdata[category] = Object.entries(groups).map(([name, types]) => [
            name, Array.from(types).join('/')
        ]);
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