/* ─── Global Variables ─────────────────────────────────────────────────── */
let workspace = null;
let accountList = []; 
let lastModifiedTime = 'Never';
let currentAccountIndex = 0;
let accountBalances = {}; // Store balance for each account
let globalMarketData = {}; // Store categorized market data for dynamic dropdowns
let isCodePanelVisible = false;
let selectedAccCurruncy = "USD"

let app_id = '35751';
let socket = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${app_id}`);
let isLoadingScreenVisible = true;

// Ping tracking variables
let pingSentTime = null;
let previousPing = null;

/* ─── Blockly Theme & Block Override ────────────────────────────────────── */
const rootStyles = getComputedStyle(document.documentElement);
let THEME_CATEGORY_COLOR = rootStyles.getPropertyValue('--toolbox-category-color').trim() || '#04db81';

// This variable can be updated from anywhere in your script
let currentMarketOptions = [
  ["Initial Option", "OPTIONNAME"],
  ["Another Option", "OPTIONNAME2"]
];
let secondMarketData = [
      ["Initial Option", "OPTIONNAME"],
  ["Another Option", "OPTIONNAME2"]
]
let thirdMarketData = [
      ["Initial Option", "OPTIONNAME"],
  ["Another Option", "OPTIONNAME2"]
]


let mainContractTypes = [      
    ["Initial Option", "OPTIONNAME"],
    ["Another Option", "OPTIONNAME2"]
]
let subContractTypes = [      
    ["Initial Option", "OPTIONNAME"],
    ["Another Option", "OPTIONNAME2"]
]

// Example function to update the list from outside
function updateMarketList(newList) {
  currentMarketOptions = newList;
}


Blockly.Blocks['main_block'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("(1) Define your trade Contract");
    this.appendDummyInput()
        .appendField("Market")
        .appendField(new Blockly.FieldDropdown(() => {
          return currentMarketOptions;
        }), "frist_market")
        .appendField(">")
        .appendField(new Blockly.FieldDropdown(() => {
          return secondMarketData}), "second_market")
        .appendField(">")
        .appendField(new Blockly.FieldDropdown(() => {
          return thirdMarketData}), "third_market");
    this.appendDummyInput()
        .appendField("Trade Type")
        .appendField(new Blockly.FieldDropdown(() => {
          return mainContractTypes}), "frist_catogory")
        .appendField(">")
        .appendField(new Blockly.FieldDropdown(() => {
          return subContractTypes}), "second_catogory");
    this.appendDummyInput()
        .appendField("Contract Type")
        .appendField(new Blockly.FieldDropdown([["Both","both"], ["Single","single"]]), "contract_type");
    this.appendDummyInput()
        .appendField("Default Candle Interval")
        .appendField(new Blockly.FieldDropdown([["1 Minute","1m"], ["2 Minute","2m"], ["3 Minute","3m"], ["5 Minute","5m"], ["10 Minute","10m"], ["15 Minute","15m"], ["30 Minute","30m"], ["1 Hour","1h"], ["2 Hour","2h"], ["4 Hour","4h"], ["8 Hour","8h"], ["1 Day","1d"]]), "candle_interval");
    this.appendDummyInput()
        .appendField("Restart Buy Sell On Error  (Disable For Better Performance)")
        .appendField(new Blockly.FieldCheckbox("FALSE"), "buysellError");
    this.appendDummyInput()
        .appendField("Restart Last Trade On Error  (Bot Ignores Unsuccessful Trades)")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "lasttradeofError");
    this.appendDummyInput()
        .appendField("Run Once at Start");
    this.appendStatementInput("run_onece")
        .setCheck(null);
    this.appendDummyInput()
        .appendField("Define Trade Options");
    this.appendStatementInput("trade_options")
        .setCheck(null);
    this.appendDummyInput()
        .appendField("(2) Watch and Purchase your Contract");
    this.appendStatementInput("watch_purches")
        .setCheck(null);
    this.appendDummyInput()
        .appendField("(3) Watch and Sell your Perchased Contract");
    this.appendStatementInput("watch_sell")
        .setCheck(null);
    this.appendDummyInput()
        .appendField("(4) Get your Trade Result and Trade Again");
    this.appendStatementInput("trade_again")
        .setCheck(null);
    this.setInputsInline(false);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

/* ─── Initialize Blockly Function ────────────────────────────────────────── */
function initBlockly() {
    const container = document.querySelector('.blockly-container');
    if (!container) {
        console.error('blockly-container not found');
        return;
    }

    const toolboxXml = document.getElementById('toolbox');

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
            'premium_dark': {
                'colourPrimary': '#161b22',
                'colourSecondary': '#0d1117',
                'colourTertiary': '#21262d'
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

    const resizeObserver = new ResizeObserver(() => Blockly.svgResize(workspace));
    resizeObserver.observe(container);

    workspace.addChangeListener((event) => {
        trackBlockChanges(event);
        updateStats();
        if (isCodePanelVisible) {
            updateGeneratedCode();
        }
    });

    console.log('Blockly workspace initialised ✓');

    enforceSingleMainBlock(workspace);





    workspace.addChangeListener(function(event) {
            const block = workspace.getBlockById(event.blockId);
            try {
                var secondmarketvalue = block.getFieldValue('second_market');
                if(block.type === 'main_block' && secondmarketvalue === "OPTIONNAME"){
                    console.log("main_block initilizing occord");
                    var data = block.getFieldValue('frist_market');
                    edit_second_dropdown(block, data);
                }
            } catch (error) {
                
            }


    if (event.type !== Blockly.Events.CHANGE || event.element !== 'field') return;

    if (!block || block.type !== 'main_block') return;

    if (event.name === 'frist_market') {
        edit_second_dropdown(block, event.newValue);
    }

    if (event.name === 'second_market') {
        edit_third_dropdown(block, event.newValue);
    }
});
}

/* ─── WebSocket & Login Logic ───────────────────────────────────────────── */

function callingWebSocket() {
    socket.onopen = () => {
        console.log('WebSocket connection established');
        
        // Hide loading screen once WebSocket is connected
        hideLoadingScreen();
        
        // Wait 1s then check URL for credentials
        setTimeout(() => {
            getCurrentURL();
        }, 1000);

        // Standard Ping interval
        setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
                pingSentTime = Date.now();
                socket.send(JSON.stringify({ ping: 1 }));
            }
        }, 1000);
    };

    socket.onclose = () => {
        console.log('WebSocket connection closed');
        // Show error on loading screen if still visible
        if (isLoadingScreenVisible) {
            const loadingSubtitle = document.querySelector('.loading-subtitle');
            if (loadingSubtitle) {
                loadingSubtitle.textContent = 'Connection lost. Please refresh the page.';
                loadingSubtitle.style.color = 'var(--red-color)';
            }
        }
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Show error on loading screen if still visible
        if (isLoadingScreenVisible) {
            const loadingSubtitle = document.querySelector('.loading-subtitle');
            if (loadingSubtitle) {
                loadingSubtitle.textContent = 'Connection error. Please check your internet.';
                loadingSubtitle.style.color = 'var(--red-color)';
            }
            showError('WebSocket connection failed. Please check your internet connection.');
        }
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.msg_type === 'authorize') {
            if (data.error) {
                showError(data.error.message || 'Authorization failed');
                document.querySelector('.login').style.display = 'flex'; // Show login on error
            } else {
                after_authorized(data); // Hide login on success
                getActiveMarkets()
            }
        }

        // Handle balance response
        if (data.msg_type === 'balance' && data.balance) {
            const accountLoginid = data.balance.loginid;
            const balance = data.balance.balance;
            selectedAccCurruncy = data.balance.currency
            const currency = data.balance.currency || 'USD';
            
            // Store balance for this account
            accountBalances[accountLoginid] = `$${parseFloat(balance).toFixed(2)}`;
            
            //console.log(`Balance for ${accountLoginid}: ${accountBalances[accountLoginid]}`);
            
            // Update display if this is the current account
            if (accountList[currentAccountIndex] && accountList[currentAccountIndex].account === accountLoginid) {
                updateAccountDisplay();
            }
        }

        if (data.msg_type === 'ping') {
            if (pingSentTime) {
                const currentPing = Date.now() - pingSentTime;
                //console.log(`Ping: ${currentPing}ms`);
                const pingDiv = document.querySelector('.ping');
                if (pingDiv) {
                    let arrowHtml = '';
                    if (previousPing !== null) {
                        if (currentPing > previousPing) {
                            arrowHtml = '<span style="color: red; margin-left: 5px;">&#9650;</span>'; // Red up triangle
                        } else if (currentPing < previousPing) {
                            arrowHtml = '<span style="color: green; margin-left: 5px;">&#9660;</span>'; // Green down triangle
                        } else {
                            arrowHtml = '<span style="color: gray; margin-left: 5px;">-</span>'; // unchanged
                        }
                    }
                    pingDiv.innerHTML = `Ping: ${currentPing}ms ${arrowHtml}`;
                    previousPing = currentPing;
                }
            }
        }

        if (data.msg_type === 'active_symbols') {
            processActiveSymbols(data);
        }
        if (data.msg_type === 'asset_index') {
            //console.log('assest index reciving', data)
            //getAssetsWithMrket(data);
        }
        if (data.msg_type === 'contracts_for') {
            //console.log('Contract data Reciving')
            //console.log(data.contracts_for.available);
            processContractsFor(data)
            //initBlockly()
        }
    };
}



function getCurrentURL() {
    // YOUR SAMPLE URL
    const SAMPLE_URL = "https://binarylab.rf.gd/?acct1=CR2697040&token1=a1-qTVkA8wuwrwuC12TBl4G45sXHKdoU&cur1=USD&acct2=CR2932882&token2=a1-7krHsKJJaXLgRXKW2kdC3izD50M43&cur2=USDC&acct3=VRTC4545708&token3=a1-CTd8UkEJHdJPxBWnZMQWbdxW9HlgJ&cur3=USD";
    const currentUrl = window.location.href;
    const url = new URL(SAMPLE_URL); 
    const params = url.searchParams;
    
    accountList = []; 
    let i = 1;

    while (params.has(`acct${i}`)) {
        accountList.push({
            account: params.get(`acct${i}`),
            token: params.get(`token${i}`),
            currency: params.get(`cur${i}`)
        });
        i++;
    }

    const loginDiv = document.querySelector('.login');

    if (accountList.length === 0) {
        console.log('No accounts in URL, showing login screen');
        // Only show login screen after WebSocket is connected and no credentials found
        if (loginDiv) loginDiv.style.display = 'flex';
    } else {
        console.log('Accounts found, authorizing first account...');
        const firstAccount = accountList[0];
        // Send proper authorization object
        socket.send(JSON.stringify({ "authorize": firstAccount.token }));
    }
    //console.log('Account list:', accountList);
}

function loginWithToken(token) {
    if (!token) {
        showError('Please enter a token');
        return;
    }
    
    // Store token as a temporary account entry
    const tempAccount = {
        account: 'Token Login',
        token: token,
        currency: 'USD'
    };
    
    // Check if we already have this token
    const existingIndex = accountList.findIndex(acc => acc.token === token);
    
    if (existingIndex === -1) {
        // Add new account
        accountList.push(tempAccount);
        currentAccountIndex = accountList.length - 1;
    } else {
        // Use existing account
        currentAccountIndex = existingIndex;
    }
    
    showInfo('Attempting authorization...');
    socket.send(JSON.stringify({ "authorize": token }));
}

function after_authorized(data) {
    console.log('Authorized successfully!');
    
    // Get account info from authorization response
    if (data.authorize) {
        const accountLoginid = data.authorize.loginid;
        const currency = data.authorize.currency || 'USD';
        
        // Update current account with real account ID
        if (accountList.length > 0 && currentAccountIndex < accountList.length) {
            const currentAccount = accountList[currentAccountIndex];
            
            // If this was a token login with placeholder name, update it
            if (currentAccount.account === 'Token Login' || !currentAccount.account) {
                currentAccount.account = accountLoginid;
                currentAccount.currency = currency;
                console.log('Updated account:', accountLoginid);
            }
        }
    }
    
    // Hide the login screen (if it was shown)
    const loginDiv = document.querySelector('.login');
    if (loginDiv) loginDiv.style.display = 'none';
        
    // Update account display
    updateAccountDisplay();
    
    // Fetch balance after a short delay
    setTimeout(() => {
        fetchAccountBalance();
    }, 500);
    
    if (accountList.length > 0) {
        //showSuccess('Authorized successfully via URL', 2000);
    } else {
        //showSuccess('Authorized successfully via Token', 2000);
    }
    showSuccess('Authorized successfully', 2000);

}

/* ─── Stats & Tracking ──────────────────────────────────────────────────── */

// Hide loading screen when WebSocket connects successfully
function hideLoadingScreen() {
    if (isLoadingScreenVisible) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            isLoadingScreenVisible = false;
            
            // Remove from DOM after animation completes
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 600); // Match the fadeOut animation duration
        }
    }
}

// Update account display in top bar
function updateAccountDisplay() {
    const accountDisplay = document.getElementById('accountDisplay');
    const connectBtn = document.getElementById('connectAccountBtn');
    
    if (accountList.length > 0 && currentAccountIndex < accountList.length) {
        const currentAccount = accountList[currentAccountIndex];
        const balance = accountBalances[currentAccount.account] || '$0.00';
        
        // Show account display, hide connect button
        document.getElementById('currentAccountName').textContent = currentAccount.account;
        document.getElementById('currentAccountBalance').textContent = balance;
        document.getElementById('currentAccountBadge').textContent = currentAccount.account;
        
        if (accountDisplay) accountDisplay.style.display = 'flex';
        if (connectBtn) connectBtn.style.display = 'none';
    } else {
        // Show connect button if no accounts
        if (accountDisplay) accountDisplay.style.display = 'none';
        if (connectBtn) connectBtn.style.display = 'block';
    }
}

// Show account dropdown with all accounts
function showAccountDropdown() {
    const dropdown = document.getElementById('accountDropdown');
    const accountsList = document.getElementById('accountsList');
    
    if (!dropdown || !accountsList) return;
    
    // Clear existing content
    accountsList.innerHTML = '';
    
    if (accountList.length === 0) {
        accountsList.innerHTML = `
            <div class="no-accounts">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <p>No connected accounts</p>
                <p style="font-size: 0.85rem; opacity: 0.7;">Please login to view accounts</p>
            </div>
        `;
    } else {
        // Add each account
        accountList.forEach((account, index) => {
            const balance = accountBalances[account.account] || '$0.00';
            const isActive = index === currentAccountIndex;
            
            const accountItem = document.createElement('div');
            accountItem.className = 'account-item' + (isActive ? ' active' : '');
            accountItem.onclick = () => switchAccount(index);
            
            accountItem.innerHTML = `
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
                        <span class="account-detail-value">${account.token.substring(0, 8)}...</span>
                    </div>
                </div>
            `;
            
            accountsList.appendChild(accountItem);
        });
    }
    
    dropdown.style.display = 'block';
}

// Hide account dropdown
function hideAccountDropdown() {
    const dropdown = document.getElementById('accountDropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
}

// Switch to different account
function switchAccount(index) {
    if (index >= 0 && index < accountList.length) {
        currentAccountIndex = index;
        const account = accountList[index];
        
        console.log('Switching to account:', account.account);
        
        // Send authorization for new account
        socket.send(JSON.stringify({ "authorize": account.token }));
        
        // Update display
        updateAccountDisplay();
        hideAccountDropdown();
        
        showSuccess(`Switched to account ${account.account}`, 2000);
    }
}

// Fetch balance for current account
function fetchAccountBalance() {
    if (accountList.length > 0 && currentAccountIndex < accountList.length) {
        // Request balance - this will be handled in onmessage
        socket.send(JSON.stringify({ balance: 1, account: accountList[currentAccountIndex].account }));
    }
}

function updateStats() {
    if (!workspace) return;
    const allBlocks = workspace.getAllBlocks(false);
    const connectedBlocks = workspace.getTopBlocks(false).reduce((acc, tb) => acc + tb.getDescendants(false).length, 0);

    const blockCountEl = document.getElementById('blockCount');
    const connectedBlocksEl = document.getElementById('connectedBlocks');

    if (blockCountEl) blockCountEl.textContent = allBlocks.length;
    if (connectedBlocksEl) connectedBlocksEl.textContent = connectedBlocks;
}

function trackBlockChanges(event) {
    if ([Blockly.Events.BLOCK_CHANGE, Blockly.Events.BLOCK_CREATE, Blockly.Events.BLOCK_DELETE, Blockly.Events.BLOCK_MOVE].includes(event.type)) {
        lastModifiedTime = new Date().toLocaleString();
        const lastModifiedEl = document.getElementById('lastModified');
        if (lastModifiedEl) lastModifiedEl.textContent = lastModifiedTime;
    }
}

/* ─── Code Generation Logic ────────────────────────────────────────────── */

function updateGeneratedCode() {
    if (!workspace || !isCodePanelVisible) return;
    try {
        const code = javascript.javascriptGenerator.workspaceToCode(workspace);
        const codeElement = document.getElementById('generatedCode');
        if (codeElement) {
            codeElement.textContent = code || '// No blocks in workspace';
            // If you use a highlighter like Prism or Highlight.js, you'd call it here
        }
    } catch (e) {
        console.error('Code generation error:', e);
    }
}

function toggleCodePanel() {
    const panel = document.getElementById('botCodePanel');
    const btn = document.getElementById('toggleCodeBtn');
    if (!panel || !btn) return;

    isCodePanelVisible = !isCodePanelVisible;
    
    if (isCodePanelVisible) {
        panel.style.display = 'flex';
        btn.classList.add('active');
        updateGeneratedCode();
    } else {
        panel.style.display = 'none';
        btn.classList.remove('active');
    }
    
    // Trigger resize for Blockly
    setTimeout(() => {
        if (workspace) Blockly.svgResize(workspace);
    }, 300);
}

function copyGeneratedCode() {
    const code = document.getElementById('generatedCode').textContent;
    if (!code || code === '// No blocks in workspace') {
        showInfo('No code to copy');
        return;
    }
    
    navigator.clipboard.writeText(code).then(() => {
        showSuccess('Code copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy code:', err);
        showError('Failed to copy code');
    });
}

/* ─── Toast System ──────────────────────────────────────────────────────── */

function showToast(message, type = 'info', duration = 3000) {
    let container = document.querySelector('.toast-container') || Object.assign(document.createElement('div'), {className: 'toast-container'});
    if (!container.parentNode) document.body.appendChild(container);
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<div class="toast-message">${message}</div>`;
    
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('hiding');
        toast.addEventListener('animationend', () => toast.remove());
    }, duration);
}

const showSuccess = (m, d) => showToast(m, 'success', d);
const showError = (m, d) => showToast(m, 'error', d);
const showInfo = (m, d) => showToast(m, 'info', d);

/* ─── DOM Ready ─────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
    // Setup Clock
    setInterval(() => {
        const clockDiv = document.querySelector('.clock');
        if (clockDiv) {
            const now = new Date();
            clockDiv.textContent = now.toLocaleTimeString();
        }
    }, 1000);


    // Apply theme to standard blocks before init
    Object.keys(Blockly.Blocks).forEach(blockType => {
        const blockDef = Blockly.Blocks[blockType];
        if (blockDef && typeof blockDef.init === 'function') {
            const originalInit = blockDef.init;
            blockDef.init = function () {
                originalInit.call(this);
                this.setStyle('premium_dark');
            };
        }
    });

    // Run Initializers

    callingWebSocket();

    // Setup Token Login Button
    const tokenLoginBtn = document.querySelector('.token-login-btn');
    if (tokenLoginBtn) {
        tokenLoginBtn.addEventListener('click', () => {
            const apiToken = document.getElementById('apiToken').value.trim();
            loginWithToken(apiToken);
        });
    }

    // Account Display Click Handler
    const accountDisplay = document.getElementById('accountDisplay');
    if (accountDisplay) {
        accountDisplay.addEventListener('click', () => {
            showAccountDropdown();
        });
    }

    // Connect Account Button Click Handler
    const connectBtn = document.getElementById('connectAccountBtn');
    if (connectBtn) {
        connectBtn.addEventListener('click', () => {
            // Show login screen
            const loginDiv = document.querySelector('.login');
            if (loginDiv) loginDiv.style.display = 'flex';
        });
    }

    // Close Account Dropdown Button
    const closeDropdownBtn = document.getElementById('closeAccountDropdown');
    if (closeDropdownBtn) {
        closeDropdownBtn.addEventListener('click', () => {
            hideAccountDropdown();
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('accountDropdown');
        const accountDisplay = document.getElementById('accountDisplay');
        
        if (dropdown && !dropdown.contains(e.target) && accountDisplay && !accountDisplay.contains(e.target)) {
            hideAccountDropdown();
        }
    });

    // Setup Workspace Controls (Zoom/Focus)
    document.querySelectorAll('.workspace-controls').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!workspace) return;
            const label = btn.textContent.trim();
            if (label === 'Zoom +') workspace.zoomCenter(1);
            else if (label === 'Zoom -') workspace.zoomCenter(-1);
            else if (label === 'Focus') workspace.scrollCenter();
            else if (label === 'Reset') {
                workspace.setScale(1);
                workspace.scrollCenter();
            }
        });
    });

    const importBtn = document.getElementById('importBtn');
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            console.log('Import button clicked');
        });
    }

    // Toggle Code Panel Button
    const toggleCodeBtn = document.getElementById('toggleCodeBtn');
    if (toggleCodeBtn) {
        toggleCodeBtn.addEventListener('click', toggleCodePanel);
    }

    // Copy Code Button
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    if (copyCodeBtn) {
        copyCodeBtn.addEventListener('click', copyGeneratedCode);
    }
});

function getActiveMarkets(){
    const msg = {
        "active_symbols": "brief",
        "product_type": "basic"
    };
    socket.send(JSON.stringify(msg));
    showInfo('Fetching active markets...');
}

var activeSymbols = [

];
function processActiveSymbols(data) {
    //console.log('Active markets:', data.active_symbols);
    let main = data.active_symbols;
    globalMarketData = extractAndCategorizeOpenMarkets(main);
    //console.log('Global market data updated:', globalMarketData);

    // When your app receives new market data:
const newMarkets = [
  ["Forex", "forex"],
  ["Crypto", "crypto"],
  ["Stocks", "stocks"]
];

updateMarketList(newMarkets);
    
    // Refresh all main_blocks on workspace to show the newly loaded data
    if (workspace) {
        const mainBlocks = workspace.getBlocksByType('main_block', false);
        mainBlocks.forEach(block => {
            const currentFirst = block.getFieldValue('frist_market');
            if (currentFirst === 'NONE' || !globalMarketData[currentFirst]) {
                const firstMarketId = Object.keys(globalMarketData)[0];
                if (firstMarketId) {
                    block.setFieldValue(firstMarketId, 'frist_market');
                }
            }
        });
    }
    
    showInfo('Active markets fetched successfully.');
    //get main markets from list
let testaray = [];
const mainMarkets = Object.keys(globalMarketData);

for (let i = 0; i < mainMarkets.length; i++) {
    const element = mainMarkets[i];

    const capitalized = element
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    testaray.push([capitalized, element]);
}
     //console.log(testaray);
    updateMarketList(testaray);
    //getAssets()


        updateInitialBlockData()
    function updateInitialBlockData(){
        let data = globalMarketData;
        const firstKey = Object.keys(data)[0];
        //console.log(firstKey); // "forex"
        //console.log(data[firstKey].name)

        //console.log(data[firstKey].submarkets, "Getting sub markets")
        const submarketFristKey = Object.keys(data[firstKey].submarkets)


        //console.log(data[firstKey].submarkets[submarketFristKey], "Getting Symbols")
        //console.log(data[firstKey].submarkets[submarketFristKey].symbols[0], "Getting last data")

    getSeondData()

        function getSeondData() {
            let options = [["erer", "dfdfdfd"],["erer", "dfdfdfd"],["ereer", "dfdfdfd"]];
            options = Object.entries(globalMarketData[firstKey].submarkets).map(([key, value]) => [
        value.name, key])
        //console.log(options)
        secondMarketData = options;
        }
    getThirdData()
        function getThirdData() {
            let secondValue = secondMarketData[0][1]
            //console.log(secondValue)
        let options = [];
        for (let i = 0; i < globalMarketData[firstKey].submarkets[secondValue].symbols.length; i++) {
            const element = globalMarketData[firstKey].submarkets[secondValue].symbols[i].display_name;
            const key = globalMarketData[firstKey].submarkets[secondValue].symbols[i].symbol;
            options.push([capitalize(element), key]);
        }
        thirdMarketData = options;

       // console.log(options)
        getContractForSymbols(options[0][1])
        }
    }


    console.log('Calling block initialzng')
    initBlockly();
}


function extractAndCategorizeOpenMarkets(activeSymbolsArray) {
    return activeSymbolsArray
        // 1. FILTER: Only keep markets where the exchange is currently open
        .filter(market => market.exchange_is_open === 1)
        
        // 2. CATEGORIZE: Group the remaining open markets
        .reduce((categorizedData, currentMarket) => {
            
            const marketId = currentMarket.market; 
            const marketName = currentMarket.market_display_name; 
            const submarketId = currentMarket.submarket; 
            const submarketName = currentMarket.submarket_display_name; 
            
            // Extract only the needed properties
            const symbolData = {
                display_name: currentMarket.display_name,
                pip: currentMarket.pip,
                symbol: currentMarket.symbol
            };

            // Create Main Category if it doesn't exist
            if (!categorizedData[marketId]) {
                categorizedData[marketId] = {
                    name: marketName,
                    category: marketId,
                    submarkets: {}
                };
            }

            // Create Sub Category if it doesn't exist
            if (!categorizedData[marketId].submarkets[submarketId]) {
                categorizedData[marketId].submarkets[submarketId] = {
                    name: submarketName,
                    category: submarketId,
                    symbols: []
                };
            }

            // Push the data into the correct category
            categorizedData[marketId].submarkets[submarketId].symbols.push(symbolData);

            return categorizedData;
        }, {});
}

function getContractForSymbols(symbol) {

    //send request to get contracts for selected market
    let request = {
    "contracts_for": symbol,
   // "contracts_for": "1HZ100V",
    "currency": selectedAccCurruncy,
    "landing_company": "svg",
    "product_type": "basic"
    }
    console.log('calling getContractForSymbols')
    socket.send(JSON.stringify(request));
}


function enforceSingleMainBlock(workspace) {
  workspace.addChangeListener(function(event) {
    // Only react when blocks are created
    if (event.type !== Blockly.Events.BLOCK_CREATE) return;

    const blocks = workspace.getBlocksByType('main_block', false);

    // If more than 1 exists → remove the newest one
    if (blocks.length > 1) {
      // The newly created block is in event.ids
      event.ids.forEach(id => {
        const block = workspace.getBlockById(id);
        if (block && block.type === 'main_block') {
          block.dispose(false, true); // remove without affecting others
        }
      });
    }
  });
}



function edit_second_dropdown(block, firstValue) {
    const secondField = block.getField('second_market');
    if (!secondField) return;

    let options = [["erer", "dfdfdfd"],["erer", "dfdfdfd"],["ereer", "dfdfdfd"]];
    options = Object.entries(globalMarketData[firstValue].submarkets).map(([key, value]) => [
    value.name, key
]);
    // Update dropdown
    secondField.menuGenerator_ = options;
    // Set first value
    secondField.setValue(options[0][1]);
}

function edit_third_dropdown(block, secondValue) {
    //console.log(secondValue)
    const firstValue = block.getFieldValue('frist_market');
    const thirdField = block.getField('third_market');
    if (!thirdField) return;

    let options = [["Select", "NONE"]];

    //console.log(firstValue,secondValue);
    //console.log(globalMarketData[firstValue].submarkets[secondValue].symbols);
    if (
        globalMarketData[firstValue] &&
        globalMarketData[firstValue].submarkets[secondValue]
    ) {
        options = [];
        for (let i = 0; i < globalMarketData[firstValue].submarkets[secondValue].symbols.length; i++) {
            const element = globalMarketData[firstValue].submarkets[secondValue].symbols[i].display_name;
            const key = globalMarketData[firstValue].submarkets[secondValue].symbols[i].symbol;
            options.push([capitalize(element), key]);
        }
    }

    //console.log(options[0][1]);

    getContractForSymbols(options[0][1])

    // Update dropdown
    
    thirdField.menuGenerator_ = options;

    // Set first value automatically
    thirdField.setValue(options[0][1]);
}

function capitalize(str) {
    return str
        .trim()
        .split(/\s+/)
        .map(w => w[0]?.toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
}



function processContractsFor(data) {
    let contracts = data.contracts_for.available;
var result = [];
var seen = new Set();

for (let i = 0; i < contracts.length; i++) {
  const element = contracts[i];
  const value = element.contract_category_display;

  if (seen.has(value)) {
    continue;
  } else {
    seen.add(value);
    result.push([value, element.contract_category]);
  }
}

//console.log('contracts types fetched successfully')
//console.log(result);
mainContractTypes = result;

workspace.getBlocksByType('main_block').forEach(block => {
    const firstField = block.getField('frist_catogory');
    if (firstField) {
        firstField.menuGenerator_ = result;
        firstField.setValue(result[0][1]);
    }
});

}


//second 