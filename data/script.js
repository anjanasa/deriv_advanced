// ===========================
// Blockly Workspace Configuration
// ===========================

let workspace;
let lastModifiedTime = null;

// ===========================
// Suppress browser extension errors (useCache, polyfill messaging)
// ===========================
window.addEventListener('error', function (e) {
  if (e && e.filename && e.filename.includes('content.js')) return true;
  if (e && e.filename && e.filename.includes('polyfill.js')) return true;
}, true);

window.addEventListener('unhandledrejection', function (e) {
  const msg = e && e.reason && (e.reason.message || String(e.reason));
  if (msg && (
    msg.includes('useCache') ||
    msg.includes('Receiving end does not exist') ||
    msg.includes('Could not establish connection') ||
    msg.includes('message channel closed')
  )) {
    e.preventDefault();
    return;
  }
});

// ===========================
// Deriv OAuth Login (App ID: 76618)
// ===========================

const DERIV_APP_ID = "76618";
const DERIV_OAUTH_URL = `https://oauth.deriv.com/oauth2/authorize?app_id=${DERIV_APP_ID}`;
let socket = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${DERIV_APP_ID}`);

socket.onopen = function (e) {
  console.log('[open] Connection established');
  console.log('Sending to server');
  const sendMessage = JSON.stringify({ ping: 1 });
  socket.send(sendMessage);
  getActiveMarkets(); // Call to get active markets
};

socket.onmessage = function (event) {
  let response = JSON.parse(event.data);
  console.log(response);
  if (response.msg_type === "active_symbols") {
    console.log(response);
    extractMarketData(response);
  }
  if (response.msg_type === "contracts_for") {
    //handleContractsForResponse(response);
  }
};

socket.onclose = function (event) {
  if (event.wasClean) {
    console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  } else {
    console.log('[close] Connection died');
  }
};

socket.onerror = function (error) {
  console.log(`[error] ${error.message}`);
};



function getActiveMarkets() {
  let msg = {
    "active_symbols": "brief",
    "product_type": "basic"
  };
  socket.send(JSON.stringify(msg));
}
function extractMarketData(response) {
  if (!response || !response.active_symbols) return;

  const organizedMarkets = {};

  response.active_symbols.forEach(data => {
    // Include ALL markets regardless of exchange_is_open status
    // Previously filtered by exchange_is_open === 1, which excluded
    // Forex/Stocks/Commodities on weekends (only Derived stays open 24/7)
    const isCrypto = data.market.toLowerCase().includes('crypto') || data.market_display_name.toLowerCase().includes('crypto');
    if (data.exchange_is_open === 1 && !isCrypto) {
      const {
        display_name,
        market,
        market_display_name,
        pip,
        subgroup,
        subgroup_display_name,
        submarket,
        submarket_display_name,
        symbol,
        exchange_is_open
      } = data;

      // Group by market (e.g., "Synthetic Indices", "Forex")
      if (!organizedMarkets[market_display_name]) {
        organizedMarkets[market_display_name] = {
          name: market_display_name,
          category: market,
          submarkets: {}
        };
      }

      // Group by submarket under the market
      if (!organizedMarkets[market_display_name].submarkets[submarket_display_name]) {
        organizedMarkets[market_display_name].submarkets[submarket_display_name] = {
          name: submarket_display_name,
          category: submarket,
          symbols: []
        };
      }

      // Add the symbol details (including exchange_is_open for reference)
      organizedMarkets[market_display_name].submarkets[submarket_display_name].symbols.push({
        display_name,
        market,
        market_display_name,
        pip,
        subgroup,
        subgroup_display_name,
        submarket,
        submarket_display_name,
        symbol,
        exchange_is_open
      });
    }
  });

  let marketsArray = [];
  Object.values(organizedMarkets).forEach(marketObj => {
    marketsArray.push([marketObj.name, marketObj.category]);
  });

  if (marketsArray.length > 0) {
    dynamicMarketsList = marketsArray;
    globalOrganizedMarkets = organizedMarkets;
  }

  console.log("Organized Markets:", organizedMarkets);

  // Auto-fetch trade types for the currently selected symbol (or first available)
  autoFetchTradeTypesAfterMarketLoad();

  return organizedMarkets;
}

// Called after markets load to automatically populate trade types
function autoFetchTradeTypesAfterMarketLoad() {
  // First: check if the main_block already exists and has a symbol selected
  if (typeof workspace !== 'undefined' && workspace) {
    const mainBlocks = workspace.getBlocksByType('main_block', false);
    if (mainBlocks.length > 0) {
      const mainBlock = mainBlocks[0];
      const currentSymbol = mainBlock.getFieldValue('third_market');
      if (currentSymbol && currentSymbol !== 'none' && currentSymbol !== 'loading') {
        console.log(`[Auto] Fetching trade types for current symbol: ${currentSymbol}`);
        fetchContractsFor(currentSymbol);
        return;
      }
    }
  }

  // Fallback: find the first available symbol from the organized markets
  const firstMarket = Object.values(globalOrganizedMarkets)[0];
  if (firstMarket && firstMarket.submarkets) {
    const firstSubmarket = Object.values(firstMarket.submarkets)[0];
    if (firstSubmarket && firstSubmarket.symbols && firstSubmarket.symbols.length > 0) {
      const firstSymbol = firstSubmarket.symbols[0].symbol;
      console.log(`[Auto] Fetching trade types for first available symbol: ${firstSymbol}`);
      fetchContractsFor(firstSymbol);
    }
  }
}

// ===========================
// CONTRACTS_FOR API — Fetch trade types for selected symbol
// ===========================

let dynamicTradeCategories = [['Select Symbol First', 'none']];
let dynamicTradeSubcategories = [['Select Trade Type First', 'none']];
let globalContractsData = {}; // { contract_category_display: [{ contract_type, contract_display }] }

function fetchContractsFor(symbol) {
  if (!symbol || symbol === 'none' || symbol === 'loading') return;
  console.log(`[contracts_for] Fetching trade types for symbol: ${symbol}`);
  const msg = {
    "contracts_for": symbol,
    "product_type": "basic"
  };
  socket.send(JSON.stringify(msg));
}
const test =
  "https://trademaster.rf.gd/?acct1=CR2697040&token1=a1-tcBN0jJ9BRd7tcatA8zgSlI8Ybpxn&cur1=USD&acct2=CR2932882&token2=a1-MAedYYuB18RpLUoBxyDDcxYDb0IA7&cur2=USDC&acct3=VRTC4545708&token3=a1-jZOPxo9b5YmpBsHCbCQNBAdA0JBPE&cur3=USD&i=1";



// ===========================
// GLOBAL WebSocket (single connection, not inside any function)
// ===========================

let ws = null;              // THE single global WebSocket
let derivPingInterval = null;
let _wsCurrentToken = null;   // token used for current connection
let _wsCurrentAccountId = null; // accountId for balance subscription
let _wsReady = false;          // whether authorize is complete

// Called when ws opens — sends authorize
function _wsOnOpen() {
  _wsReady = false;
 // showToast('Connecting to Deriv...', 'loading', 0);
  if (_wsCurrentToken) {
  //  showToast('Authenticating account...', 'loading', 0);
    logToConsole('WebSocket connected — authenticating...', 'info');
    ws.send(JSON.stringify({ authorize: _wsCurrentToken }));
  }

  // Keep-alive ping
  if (derivPingInterval) clearInterval(derivPingInterval);
  derivPingInterval = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ ping: 1 }));
    }
  }, 5000);
}

// Single flat message dispatcher — all WS responses handled here
function _wsOnMessage(event) {
  let data;
  try { data = JSON.parse(event.data); } catch { return; }

  // Ping response — silent
  if (data.msg_type === 'ping') return;

  // Global error
  if (data.error) {
    const errMsg = data.error.message || 'Unknown Deriv error';
    logToConsole(`Deriv API error: ${errMsg}`, 'error');
  //  showToast(errMsg, 'error');
    updateBalanceUI(null);
    return;
  }

  // Authorize response
  if (data.msg_type === 'authorize') {
    _wsReady = true;
    const acct = data.authorize || {};
    logToConsole(`Authenticated: ${acct.loginid || _wsCurrentAccountId}`, 'success');
  //  showToast(`Authenticated as ${acct.loginid || _wsCurrentAccountId}`, 'success');

    // Now subscribe to balance stream
    if (_wsCurrentAccountId && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        balance: 1,
        account: _wsCurrentAccountId,
        subscribe: 1
      }));
    //  showToast('Fetching balance...', 'info', 2500);
    }
    return;
  }

  // Balance response
  if (data.msg_type === 'balance') {
    const bal = data.balance || {};
    updateBalanceUI(bal.balance, bal.currency);
    return;
  }
}

// WS error — only report if the socket was supposed to be open
function _wsOnError(e) {
  // Browsers fire onerror right before onclose on normal reconnects.
  // Only show if we were actually established.
  if (_wsReady) {
    logToConsole('WebSocket connection error', 'error');
  //   showToast('WebSocket connection lost', 'error');
  } else {
    logToConsole('WebSocket error during connect (retrying...)', 'warning');
  }
  _wsReady = false;
}

// WS close
function _wsOnClose(event) {
  _wsReady = false;
  if (derivPingInterval) {
    clearInterval(derivPingInterval);
    derivPingInterval = null;
  }
  // Normal close (code 1000) is silent
  if (event.code !== 1000) {
    logToConsole(`WebSocket closed (code: ${event.code})`, 'warning');
  }
}

// Open (or reopen) the global WebSocket for a given token/account
function openDerivWS(token, accountId) {
  // Close existing
  if (ws) {
    ws.onclose = null; // suppress spurious close events
    try { ws.close(1000, 'reconnect'); } catch (_) { }
    ws = null;
  }
  if (derivPingInterval) { clearInterval(derivPingInterval); derivPingInterval = null; }

  _wsCurrentToken = token;
  _wsCurrentAccountId = accountId;
  _wsReady = false;

  updateBalanceUI(null);

  try {
    ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${DERIV_APP_ID}`);
    ws.onopen = _wsOnOpen;
    ws.onmessage = _wsOnMessage;
    ws.onerror = _wsOnError;
    ws.onclose = _wsOnClose;
  } catch (err) {
    logToConsole(`Failed to open WebSocket: ${err.message}`, 'error');
   // showToast(`WebSocket failed: ${err.message}`, 'error');
    ws = null;
  }
}

// ===========================
// Account / Balance helpers (use openDerivWS)
// ===========================

function getDerivCurrency() {
  return sessionStorage.getItem("deriv_currency") || "USD";
}

function updateBalanceUI(amount, currency) {
  const el = document.getElementById("balanceDisplay");
  if (!el) return;
  if (amount == null) {
    el.textContent = "--";
    el.title = "Balance not loaded";
  } else {
    const num = Number(amount);
    const formatted = Number.isFinite(num) ? num.toFixed(2) : amount;
    el.textContent = `${formatted} ${currency || getDerivCurrency()}`;
    el.title = "Current account balance";
  }
}

function fetchDerivBalance() {
  const token = getDerivToken();
  const accountId = getDerivAccountId();
  if (!token || !accountId) { updateBalanceUI(null); return; }
  subscribeBalanceWithToken(accountId, token);
}

// Legacy wrapper — just opens the global WS
function subscribeBalanceWithToken(accountId, token) {
  //showToast(`Switching to account ${accountId}...`, 'info', 3000);
  logToConsole(`Opening WebSocket for account ${accountId}`, 'info');
  openDerivWS(token, accountId);
}

// ===========================
// OAuth / Session helpers
// ===========================

function parseDerivAccounts(params) {
  const accounts = [];
  let index = 1;
  while (true) {
    const acct = params.get(`acct${index}`);
    const token = params.get(`token${index}`);
    const cur = params.get(`cur${index}`);
    if (!acct || !token) break;
    accounts.push({ id: acct, token, currency: cur || 'USD' });
    index++;
  }
  return accounts;
}

function handleDerivOAuthCallback() {
  // For testing with a hard-coded URL:
  const params = new URLSearchParams(new URL(test).search);
  // For production, use:
  // const params = new URLSearchParams(window.location.search);

  const accounts = parseDerivAccounts(params);
  if (!accounts.length) return;

  sessionStorage.setItem('deriv_accounts', JSON.stringify(accounts));

  const primary = accounts[0];
  sessionStorage.setItem('deriv_account_id', primary.id);
  sessionStorage.setItem('deriv_token', primary.token);
  sessionStorage.setItem('deriv_currency', primary.currency);

  const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
  window.history.replaceState({}, document.title, cleanUrl);

  logToConsole(`Logged in to Deriv (Account: ${primary.id}, total: ${accounts.length})`, 'success');
  //showToast(`Welcome! Logged in as ${primary.id}`, 'success');
  updateLoginUI();
  fetchDerivBalance();
}

function derivLogin() {
  window.location.href = DERIV_OAUTH_URL;
}

function derivLogout() {
  // Close WS cleanly
  if (ws) {
    ws.onclose = null;
    try { ws.close(1000, 'logout'); } catch (_) { }
    ws = null;
  }
  if (derivPingInterval) { clearInterval(derivPingInterval); derivPingInterval = null; }

  sessionStorage.removeItem('deriv_account_id');
  sessionStorage.removeItem('deriv_token');
  sessionStorage.removeItem('deriv_currency');
  sessionStorage.removeItem('deriv_accounts');
  updateLoginUI();
  updateBalanceUI(null);
  //showToast('Logged out from Deriv', 'info');
  logToConsole('Logged out from Deriv', 'info');
}

function isDerivLoggedIn() {
  return !!sessionStorage.getItem('deriv_token');
}

function getDerivToken() {
  return sessionStorage.getItem('deriv_token');
}

function getDerivAccountId() {
  return sessionStorage.getItem('deriv_account_id');
}

function getDerivAccounts() {
  const raw = sessionStorage.getItem('deriv_accounts');
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

// ===========================
// Account UI
// ===========================

function updateLoginUI() {
  const loginBtn = document.getElementById('loginBtn');
  const accountDisplay = document.getElementById('accountDisplay');
  if (!loginBtn || !accountDisplay) return;
  if (isDerivLoggedIn()) {
    const accountId = getDerivAccountId();
    loginBtn.textContent = 'Logout';
    accountDisplay.textContent = accountId || 'Select account';
    accountDisplay.style.display = 'inline-flex';
  } else {
    loginBtn.textContent = 'Login';
    accountDisplay.textContent = 'Not connected';
    accountDisplay.style.display = 'none';
  }
}

function hideAccountDropdown() {
  const dropdown = document.getElementById('accountDropdown');
  if (dropdown) dropdown.classList.remove('open');
}

function toggleAccountDropdown() {
  const dropdown = document.getElementById('accountDropdown');
  if (!dropdown) return;

  const accounts = getDerivAccounts();
  dropdown.innerHTML = '';

  if (!accounts.length) {
    const empty = document.createElement('div');
    empty.className = 'account-item';
    empty.textContent = 'No accounts available';
    dropdown.appendChild(empty);
  } else {
    accounts.forEach((account) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'account-item';

      // Badge showing currency type
      const isVirtual = account.id.startsWith('VR');
      btn.innerHTML = `
        <span class="account-item-id">${account.id}</span>
        <span class="account-item-cur ${isVirtual ? 'virtual' : ''}">${account.currency || 'USD'}</span>
      `;

      btn.addEventListener('click', () => {
        sessionStorage.setItem('deriv_account_id', account.id);
        sessionStorage.setItem('deriv_token', account.token);
        sessionStorage.setItem('deriv_currency', account.currency || 'USD');
        updateLoginUI();
        hideAccountDropdown();
        subscribeBalanceWithToken(account.id, account.token);
      });
      dropdown.appendChild(btn);
    });
  }

  dropdown.classList.toggle('open');
}

// Initialize Blockly workspace when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeBlockly();
  setupEventListeners();
  setupCodePreview();
  handleDerivOAuthCallback();
  updateLoginUI();
  if (isDerivLoggedIn()) {
    fetchDerivBalance();
  } else {
    updateBalanceUI(null);
  }
  logToConsole("Blockly workspace initialized successfully.", "success");
});

// ===========================
// Blockly Initialization
// ===========================

function initializeBlockly() {
  // Use the XML toolbox from toolbox (4).xml (injected as hidden element)
  const toolboxXml = document.getElementById("blocklyToolbox");
  const toolbox = toolboxXml || buildFallbackToolbox();

  function buildFallbackToolbox() {
    return {
      kind: "categoryToolbox",
      contents: [
        {
          kind: "category",
          name: "Logic",
          colour: "#5b80a5",
          contents: [
            { kind: "block", type: "controls_if" },
            { kind: "block", type: "logic_compare" },
            { kind: "block", type: "logic_operation" },
            { kind: "block", type: "logic_negate" },
            { kind: "block", type: "logic_boolean" },
          ],
        },
        {
          kind: "category",
          name: "Math",
          colour: "#5b67a5",
          contents: [
            { kind: "block", type: "math_number" },
            { kind: "block", type: "math_arithmetic" },
            { kind: "block", type: "math_single" },
            { kind: "block", type: "math_round" },
          ],
        },
        {
          kind: "category",
          name: "Variables",
          colour: "#a55b80",
          custom: "VARIABLE",
        },
        {
          kind: "category",
          name: "Functions",
          colour: "#995ba5",
          custom: "PROCEDURE",
        },
      ],
    };
  }

  // Blockly workspace options
  const options = {
    toolbox: toolbox,
    collapse: true,
    comments: true,
    disable: true,
    maxBlocks: Infinity,
    trashcan: true,
    horizontalLayout: false,
    toolboxPosition: "start",
    css: true,
    media: "https://unpkg.com/blockly/media/",
    rtl: false,
    scrollbars: true,
    sounds: true,
    oneBasedIndex: true,
    grid: {
      spacing: 20,
      length: 2,
      colour: "rgba(34, 211, 238, 0.06)",
      snap: true,
    },
    zoom: {
      controls: true,
      wheel: true,
      startScale: 1.0,
      maxScale: 3,
      minScale: 0.3,
      scaleSpeed: 1.2,
    },
    renderer: "thrasos",
    theme: createCustomTheme(),
  };

  // Inject Blockly into the div
  workspace = Blockly.inject("blocklyDiv", options);

  // Force SVG resize after DOM fully lays out so flyout scrollbars work
  requestAnimationFrame(() => {
    Blockly.svgResize(workspace);
    requestAnimationFrame(() => {
      Blockly.svgResize(workspace);
    });
  });

  // Fix: Keep flyout blocks at FIXED size — workspace zoom must NOT affect flyout.
  function getFlyout() {
    if (workspace.getToolbox && workspace.getToolbox()) {
      return workspace.getToolbox().getFlyout();
    }
    return workspace.getFlyout ? workspace.getFlyout() : null;
  }
  function lockFlyoutScale() {
    const flyout = getFlyout();
    if (flyout) {
      const flyoutWs =
        flyout.workspace_ || (flyout.getWorkspace && flyout.getWorkspace());
      if (flyoutWs && flyoutWs.scale !== 1.0) {
        flyoutWs.setScale(1.0);
      }
    }
  }
  workspace.addChangeListener(function (event) {
    if (
      event.type === Blockly.Events.VIEWPORT_CHANGE ||
      event.type === "viewport_change"
    ) {
      lockFlyoutScale();
      requestAnimationFrame(lockFlyoutScale);
    }
    if (
      event.type === Blockly.Events.TOOLBOX_ITEM_SELECT ||
      event.type === "toolbox_item_select"
    ) {
      lockFlyoutScale();
      requestAnimationFrame(() => {
        lockFlyoutScale();
        Blockly.svgResize(workspace);
        setTimeout(() => {
          Blockly.svgResize(workspace);
          lockFlyoutScale();
        }, 100);
      });
    }
  });

  // Add workspace change listener
  workspace.addChangeListener(onWorkspaceChange);
}

// ===========================
// Custom Blockly Theme
// ===========================

function createCustomTheme() {
  const root = document.documentElement;
  const getColor = (varName) =>
    getComputedStyle(root).getPropertyValue(varName).trim() || "";

  // Futuristic theme colors
  const blockColor = getColor("--blockly-block-base") || "#161b22";
  const toolboxCategoryColor = getColor("--blockly-accent") || "#22d3ee";

  return Blockly.Theme.defineTheme("deriv_futuristic", {
    base: Blockly.Themes.Classic,
    componentStyles: {
      workspaceBackgroundColour:
        getColor("--blockly-workspace-bg") || "#060910",
      toolboxBackgroundColour: getColor("--blockly-toolbox-bg") || "#0d1117",
      toolboxForegroundColour: "#8b949e",
      flyoutBackgroundColour:
        getColor("--blockly-flyout-bg") || "rgba(13, 17, 23, 0.97)",
      flyoutForegroundColour: "#8b949e",
      flyoutOpacity: 0.97,
      scrollbarColour: "rgba(34, 211, 238, 0.2)",
      scrollbarOpacity: 0.3,
      insertionMarkerColour: "#22d3ee",
      insertionMarkerOpacity: 0.25,
      markerColour: "#22d3ee",
      cursorColour: "#22d3ee",
      selectedGlowColour: "#22d3ee",
      selectedGlowOpacity: 0.35,
    },
    blockStyles: {
      trade_parameters_blocks: {
        colourPrimary: blockColor,
        colourSecondary: "#0d1117",
        colourTertiary: "#21262d",
      },
      site_blocks: {
        colourPrimary: blockColor,
        colourSecondary: "#0d1117",
        colourTertiary: "#21262d",
      },
      purchase_blocks: {
        colourPrimary: blockColor,
        colourSecondary: "#0d1117",
        colourTertiary: "#21262d",
      },
      indicator_blocks: {
        colourPrimary: blockColor,
        colourSecondary: "#0d1117",
        colourTertiary: "#21262d",
      },
      analysis_blocks: {
        colourPrimary: blockColor,
        colourSecondary: "#0d1117",
        colourTertiary: "#21262d",
      },
      account_blocks: {
        colourPrimary: blockColor,
        colourSecondary: "#0d1117",
        colourTertiary: "#21262d",
      },
      money_management_blocks: {
        colourPrimary: blockColor,
        colourSecondary: "#0d1117",
        colourTertiary: "#21262d",
      },
      utility_blocks: {
        colourPrimary: blockColor,
        colourSecondary: "#0d1117",
        colourTertiary: "#21262d",
      },
      logic_blocks: {
        colourPrimary: blockColor,
        colourSecondary: "#0d1117",
        colourTertiary: "#21262d",
      },
      math_blocks: {
        colourPrimary: blockColor,
        colourSecondary: "#0d1117",
        colourTertiary: "#21262d",
      },
      variable_blocks: {
        colourPrimary: blockColor,
        colourSecondary: "#0d1117",
        colourTertiary: "#21262d",
      },
      procedure_blocks: {
        colourPrimary: blockColor,
        colourSecondary: "#0d1117",
        colourTertiary: "#21262d",
      },
      loop_blocks: {
        colourPrimary: blockColor,
        colourSecondary: "#0d1117",
        colourTertiary: "#21262d",
      },
      text_blocks: {
        colourPrimary: blockColor,
        colourSecondary: "#0d1117",
        colourTertiary: "#21262d",
      },
      list_blocks: {
        colourPrimary: blockColor,
        colourSecondary: "#0d1117",
        colourTertiary: "#21262d",
      },
      colour_blocks: {
        colourPrimary: blockColor,
        colourSecondary: "#0d1117",
        colourTertiary: "#21262d",
      },
    },
    categoryStyles: {
      trade_params_category: { colour: toolboxCategoryColor },
      site_category: { colour: toolboxCategoryColor },
      purchase_category: { colour: toolboxCategoryColor },
      indicator_category: { colour: toolboxCategoryColor },
      analysis_category: { colour: toolboxCategoryColor },
      account_category: { colour: toolboxCategoryColor },
      money_mgmt_category: { colour: toolboxCategoryColor },
      utility_category: { colour: toolboxCategoryColor },
      logic_category: { colour: toolboxCategoryColor },
      math_category: { colour: toolboxCategoryColor },
      variable_category: { colour: toolboxCategoryColor },
      procedure_category: { colour: toolboxCategoryColor },
      loop_category: { colour: toolboxCategoryColor },
      text_category: { colour: toolboxCategoryColor },
      list_category: { colour: toolboxCategoryColor },
      colour_category: { colour: toolboxCategoryColor },
    },
    fontStyle: {
      family:
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      weight: "500",
      size: 12,
    },
    startHats: false,
  });
}

// ===========================
// Event Listeners
// ===========================

function setupEventListeners() {
  // Header buttons
  document.getElementById("saveBtn").addEventListener("click", saveWorkspace);
  document.getElementById("loadBtn").addEventListener("click", loadWorkspace);
  document.getElementById("runBtn").addEventListener("click", runBot);

  // Deriv Login
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", function () {
      if (isDerivLoggedIn()) derivLogout();
      else derivLogin();
    });
  }

  // Account dropdown
  const accountDisplay = document.getElementById("accountDisplay");
  if (accountDisplay) {
    accountDisplay.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleAccountDropdown();
    });
  }

  document.addEventListener("click", (event) => {
    const dropdown = document.getElementById("accountDropdown");
    const display = document.getElementById("accountDisplay");
    if (!dropdown || !display) return;
    if (
      !dropdown.contains(event.target) &&
      !display.contains(event.target)
    ) {
      hideAccountDropdown();
    }
  });

  // Sidebar buttons
  document.getElementById("clearBtn").addEventListener("click", clearWorkspace);
  document.getElementById("exportBtn").addEventListener("click", exportCode);

  // Workspace tools
  document.getElementById("zoomInBtn").addEventListener("click", () => {
    workspace.zoomCenter(1);
    logToConsole("Zoomed in", "info");
  });

  document.getElementById("zoomOutBtn").addEventListener("click", () => {
    workspace.zoomCenter(-1);
    logToConsole("Zoomed out", "info");
  });

  document.getElementById("centerBtn").addEventListener("click", () => {
    workspace.scrollCenter();
    logToConsole("Workspace centered", "info");
  });

  // Console
  document
    .getElementById("consoleClearBtn")
    .addEventListener("click", clearConsole);
}

// ===========================
// Workspace Event Handlers
// ===========================

function onWorkspaceChange(event) {
  // Update statistics
  updateStatistics();

  // Update code preview if enabled
  if (event.type !== Blockly.Events.UI) {
    updateCodePreview();
  }
}

function updateStatistics() {
  const allBlocks = workspace.getAllBlocks(false);
  const topBlocks = workspace.getTopBlocks(false);

  document.getElementById("blockCount").textContent = allBlocks.length;
  document.getElementById("connectedBlocks").textContent =
    allBlocks.length - topBlocks.length;
}

function updateLastModified() {
  const timeString = lastModifiedTime.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  document.getElementById("lastModified").textContent = timeString;
}

// ===========================
// Button Actions
// ===========================

function saveWorkspace() {
  try {
    const state = Blockly.serialization.workspaces.save(workspace);
    const botName = document.getElementById("botName").value || "Untitled Bot";
    const botDescription =
      document.getElementById("botDescription").value || "";

    const saveData = {
      name: botName,
      description: botDescription,
      workspace: state,
      timestamp: new Date().toISOString(),
    };

    const json = JSON.stringify(saveData, null, 2);
    downloadFile(
      json,
      `${botName.replace(/\s+/g, "_")}.json`,
      "application/json",
    );

    logToConsole(`Bot "${botName}" saved successfully!`, "success");
  } catch (error) {
    logToConsole(`Error saving workspace: ${error.message}`, "error");
  }
}

function loadWorkspace() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const saveData = JSON.parse(e.target.result);

        // Clear current workspace
        workspace.clear();

        // Load the saved state
        Blockly.serialization.workspaces.load(saveData.workspace, workspace);

        // Update bot info
        document.getElementById("botName").value =
          saveData.name || "Untitled Bot";
        document.getElementById("botDescription").value =
          saveData.description || "";

        logToConsole(`Bot "${saveData.name}" loaded successfully!`, "success");
      } catch (error) {
        logToConsole(`Error loading workspace: ${error.message}`, "error");
      }
    };

    reader.readAsText(file);
  };

  input.click();
}

function runBot() {
  try {
    // Generate JavaScript code from blocks
    const code = Blockly.JavaScript.workspaceToCode(workspace);

    if (!code.trim()) {
      logToConsole(
        "No blocks to run! Add some blocks to your workspace first.",
        "warning",
      );
      return;
    }

    logToConsole("Generated Code:", "info");
    logToConsole(code, "info");
    logToConsole(
      "Note: Execution functionality will be implemented with custom Deriv blocks.",
      "warning",
    );
  } catch (error) {
    logToConsole(`Error running bot: ${error.message}`, "error");
  }
}

function clearWorkspace() {
  if (
    confirm(
      "Are you sure you want to clear the entire workspace? This action cannot be undone.",
    )
  ) {
    try {
      // Disable events while clearing
      Blockly.Events.disable();
      workspace.clear();
      Blockly.Events.enable();

      // Reset statistics
      updateStatistics();
      lastModifiedTime = null;
      document.getElementById("lastModified").textContent = "Never";

      logToConsole("Workspace cleared successfully.", "success");
    } catch (error) {
      Blockly.Events.enable(); // Re-enable events in case of error
      logToConsole(`Error clearing workspace: ${error.message}`, "error");
    }
  }
}

function exportCode() {
  try {
    // Check if workspace has blocks
    const allBlocks = workspace.getAllBlocks(false);
    if (allBlocks.length === 0) {
      logToConsole(
        "No blocks to export! Add some blocks to your workspace first.",
        "warning",
      );
      return;
    }

    // Update last modified time on export
    lastModifiedTime = new Date();
    updateLastModified();

    // Export as JSON (same format as Save)
    const state = Blockly.serialization.workspaces.save(workspace);
    const botName = document.getElementById("botName").value || "Untitled Bot";
    const botDescription =
      document.getElementById("botDescription").value || "";

    const exportData = {
      name: botName,
      description: botDescription,
      workspace: state,
      timestamp: new Date().toISOString(),
      version: "1.0",
      platform: "Deriv Bot Builder",
    };

    const json = JSON.stringify(exportData, null, 2);
    downloadFile(
      json,
      `${botName.replace(/\s+/g, "_")}_export.json`,
      "application/json",
    );

    logToConsole(`Bot "${botName}" exported successfully as JSON!`, "success");
  } catch (error) {
    logToConsole(`Error exporting bot: ${error.message}`, "error");
  }
}

// ===========================
// Console Functions
// ===========================

function logToConsole(message, type = "info") {
  const consoleOutput = document.getElementById("consoleOutput");
  const messageElement = document.createElement("div");
  messageElement.className = `console-message ${type}`;

  const timestamp = new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  messageElement.innerHTML = `
        <span class="console-timestamp">[${timestamp}]</span>
        <span class="console-text">${escapeHtml(message)}</span>
    `;

  consoleOutput.appendChild(messageElement);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function clearConsole() {
  const consoleOutput = document.getElementById("consoleOutput");
  consoleOutput.innerHTML = "";
  logToConsole("Console cleared.", "info");
}

// ===========================
// Utility Functions
// ===========================

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ===========================
// Keyboard Shortcuts
// ===========================

document.addEventListener("keydown", function (e) {
  // Ctrl/Cmd + S: Save
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    saveWorkspace();
  }

  // Ctrl/Cmd + O: Open
  if ((e.ctrlKey || e.metaKey) && e.key === "o") {
    e.preventDefault();
    loadWorkspace();
  }

  // Ctrl/Cmd + Enter: Run
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    runBot();
  }

  // Ctrl/Cmd + E: Export
  if ((e.ctrlKey || e.metaKey) && e.key === "e") {
    e.preventDefault();
    exportCode();
  }
});

// ===========================
// Window Resize Handler
// ===========================

window.addEventListener("resize", function () {
  Blockly.svgResize(workspace);
});

// ===========================
// Code Preview Functionality
// ===========================

let codePreviewEnabled = false;

function setupCodePreview() {
  const toggleBtn = document.getElementById("codeToggleBtn");
  const panel = document.getElementById("codePreviewPanel");
  const copyBtn = document.getElementById("copyCodeBtn");

  // Toggle switch handler
  toggleBtn.addEventListener("change", function () {
    codePreviewEnabled = this.checked;
    if (codePreviewEnabled) {
      panel.classList.add("active");
      updateCodePreview(); // Immediate update
    } else {
      panel.classList.remove("active");
    }

    // Trigger resize to fix blockly rendering if needed
    setTimeout(() => {
      Blockly.svgResize(workspace);
    }, 300);
  });

  // Copy code button handler
  copyBtn.addEventListener("click", function () {
    const code = document.getElementById("generatedCode").innerText;
    navigator.clipboard.writeText(code).then(() => {
      // Visual feedback
      const originalHTML = copyBtn.innerHTML;
      copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#51cf66" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
      }, 2000);
    });
  });
}

function updateCodePreview() {
  if (!codePreviewEnabled) return;

  try {
    const code = Blockly.JavaScript.workspaceToCode(workspace);
    const codeElement = document.getElementById("generatedCode");

    if (!code.trim()) {
      codeElement.innerHTML =
        '<span class="token comment">// Add blocks to generate code...</span>';
      return;
    }

    // Simple syntax highlighting
    codeElement.innerHTML = highlightSyntax(code);
  } catch (e) {
    console.error("Code generation error:", e);
  }
}

function highlightSyntax(code) {
  // Basic syntax highlighting for preview
  let output = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Comments
  output = output.replace(/(\/\/.*)/g, '<span class="token comment">$1</span>');

  // Keywords
  output = output.replace(
    /\b(var|let|const|function|if|else|return|while|for|try|catch|true|false|new|this)\b/g,
    '<span class="token keyword">$1</span>',
  );

  // Numbers
  output = output.replace(/\b(\d+)\b/g, '<span class="token number">$1</span>');

  // Strings (Simple quoting)
  output = output.replace(/('.*?')/g, '<span class="token string">$1</span>');

  // Functions (heuristic)
  output = output.replace(
    /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\()/g,
    '<span class="token function">$1</span>',
  );

  return output;
}

// ===========================
// Window Resize Handler
// ===========================

window.addEventListener("resize", function () {
  Blockly.svgResize(workspace);
});
