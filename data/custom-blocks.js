// ===========================
// Deriv Custom Blockly Blocks
// ===========================

// ===========================
// TRADE PARAMETERS BLOCKS
// ===========================

Blockly.Blocks['trade_parameters'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Trade Parameters");
        this.appendValueInput("MARKET")
            .setCheck("String")
            .appendField("Market");
        this.appendValueInput("TRADE_TYPE")
            .setCheck("String")
            .appendField("Trade Type");
        this.appendValueInput("CONTRACT_TYPE")
            .setCheck("String")
            .appendField("Contract Type");
        this.appendValueInput("DURATION")
            .setCheck("Number")
            .appendField("Duration");
        this.appendValueInput("DURATION_UNIT")
            .setCheck("String")
            .appendField("Duration Unit");
        this.appendValueInput("STAKE")
            .setCheck("Number")
            .appendField("Stake Amount");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#2d3748');
        this.setTooltip("Define trade parameters including market, trade type, and stake");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['market_selector'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Market")
            .appendField(new Blockly.FieldDropdown([
                ["Forex", "forex"],
                ["Synthetic Indices", "synthetic_index"],
                ["Stock Indices", "stock_indices"],
                ["Commodities", "commodities"],
                ["Cryptocurrencies", "crypto"]
            ]), "MARKET");
        this.setOutput(true, "String");
        this.setColour('#2d3748');
        this.setTooltip("Select market type");
    }
};

Blockly.Blocks['trade_type_selector'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Trade Type")
            .appendField(new Blockly.FieldDropdown([
                ["Rise/Fall", "risefall"],
                ["Higher/Lower", "higherlower"],
                ["Matches/Differs", "matchesdiffers"],
                ["Even/Odd", "evenodd"],
                ["Over/Under", "overunder"],
                ["Touch/No Touch", "touchnotouch"],
                ["Ends In/Out", "endsinout"]
            ]), "TRADE_TYPE");
        this.setOutput(true, "String");
        this.setColour('#2d3748');
        this.setTooltip("Select trade type");
    }
};

Blockly.Blocks['contract_type'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Contract")
            .appendField(new Blockly.FieldDropdown([
                ["Rise", "CALL"],
                ["Fall", "PUT"],
                ["Higher", "CALLE"],
                ["Lower", "PUTE"],
                ["Matches", "DIGITMATCH"],
                ["Differs", "DIGITDIFF"],
                ["Even", "DIGITEVEN"],
                ["Odd", "DIGITODD"],
                ["Over", "DIGITOVER"],
                ["Under", "DIGITUNDER"]
            ]), "CONTRACT");
        this.setOutput(true, "String");
        this.setColour('#2d3748');
        this.setTooltip("Select contract type");
    }
};

Blockly.Blocks['duration_unit'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Duration Unit")
            .appendField(new Blockly.FieldDropdown([
                ["Ticks", "t"],
                ["Seconds", "s"],
                ["Minutes", "m"],
                ["Hours", "h"],
                ["Days", "d"]
            ]), "UNIT");
        this.setOutput(true, "String");
        this.setColour('#2d3748');
        this.setTooltip("Select duration unit");
    }
};

// ===========================
// PURCHASE CONDITIONS BLOCKS
// ===========================

Blockly.Blocks['purchase_conditions'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Purchase Conditions");
        this.appendStatementInput("CONDITIONS")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#1e3a4c');
        this.setTooltip("Define when to purchase a contract");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['purchase'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Purchase")
            .appendField(new Blockly.FieldDropdown([
                ["Rise", "CALL"],
                ["Fall", "PUT"],
                ["Higher", "CALLE"],
                ["Lower", "PUTE"]
            ]), "CONTRACT_TYPE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#1e3a4c');
        this.setTooltip("Purchase a contract");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['sell_at_market'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Sell at market");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#1e3a4c');
        this.setTooltip("Sell current contract at market price");
        this.setHelpUrl("");
    }
};

// ===========================
// INDICATORS BLOCKS
// ===========================

Blockly.Blocks['indicator_rsi'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("RSI");
        this.appendValueInput("PERIOD")
            .setCheck("Number")
            .appendField("Period");
        this.appendValueInput("PRICE_TYPE")
            .setCheck("String")
            .appendField("Price");
        this.setOutput(true, "Number");
        this.setColour('#2d3343');
        this.setTooltip("Relative Strength Index indicator");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['indicator_sma'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("SMA (Simple Moving Average)");
        this.appendValueInput("PERIOD")
            .setCheck("Number")
            .appendField("Period");
        this.appendValueInput("PRICE_TYPE")
            .setCheck("String")
            .appendField("Price");
        this.setOutput(true, "Number");
        this.setColour('#2d3343');
        this.setTooltip("Simple Moving Average");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['indicator_ema'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("EMA (Exponential Moving Average)");
        this.appendValueInput("PERIOD")
            .setCheck("Number")
            .appendField("Period");
        this.appendValueInput("PRICE_TYPE")
            .setCheck("String")
            .appendField("Price");
        this.setOutput(true, "Number");
        this.setColour('#2d3343');
        this.setTooltip("Exponential Moving Average");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['indicator_bb'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Bollinger Bands");
        this.appendValueInput("PERIOD")
            .setCheck("Number")
            .appendField("Period");
        this.appendValueInput("STD_DEV")
            .setCheck("Number")
            .appendField("Standard Deviation");
        this.appendValueInput("BAND")
            .setCheck("String")
            .appendField("Band");
        this.setOutput(true, "Number");
        this.setColour('#2d3343');
        this.setTooltip("Bollinger Bands indicator");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['indicator_macd'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("MACD");
        this.appendValueInput("FAST_PERIOD")
            .setCheck("Number")
            .appendField("Fast EMA");
        this.appendValueInput("SLOW_PERIOD")
            .setCheck("Number")
            .appendField("Slow EMA");
        this.appendValueInput("SIGNAL_PERIOD")
            .setCheck("Number")
            .appendField("Signal");
        this.appendValueInput("OUTPUT")
            .setCheck("String")
            .appendField("Output");
        this.setOutput(true, "Number");
        this.setColour('#2d3343');
        this.setTooltip("MACD (Moving Average Convergence Divergence)");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['price_type'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Price")
            .appendField(new Blockly.FieldDropdown([
                ["Close", "close"],
                ["Open", "open"],
                ["High", "high"],
                ["Low", "low"],
                ["HL/2", "hl2"],
                ["HLC/3", "hlc3"],
                ["OHLC/4", "ohlc4"]
            ]), "PRICE_TYPE");
        this.setOutput(true, "String");
        this.setColour('#2d3343');
        this.setTooltip("Select price type for indicators");
    }
};

Blockly.Blocks['bb_band_selector'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("BB Band")
            .appendField(new Blockly.FieldDropdown([
                ["Upper", "upper"],
                ["Middle", "middle"],
                ["Lower", "lower"]
            ]), "BAND");
        this.setOutput(true, "String");
        this.setColour('#2d3343');
        this.setTooltip("Select Bollinger Band");
    }
};

Blockly.Blocks['macd_output'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("MACD Output")
            .appendField(new Blockly.FieldDropdown([
                ["MACD", "macd"],
                ["Signal", "signal"],
                ["Histogram", "histogram"]
            ]), "OUTPUT");
        this.setOutput(true, "String");
        this.setColour('#2d3343');
        this.setTooltip("Select MACD output");
    }
};

// ===========================
// TICK & CANDLE ANALYSIS BLOCKS
// ===========================

Blockly.Blocks['last_tick'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Last Tick");
        this.setOutput(true, "Number");
        this.setColour('#1e3d3a');
        this.setTooltip("Get the last tick value");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['last_digit'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Last Digit");
        this.setOutput(true, "Number");
        this.setColour('#1e3d3a');
        this.setTooltip("Get the last digit of the last tick");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['tick_direction'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Tick Direction");
        this.setOutput(true, "String");
        this.setColour('#1e3d3a');
        this.setTooltip("Get tick direction (up/down)");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['candle_open'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Candle")
            .appendField(new Blockly.FieldDropdown([
                ["1st", "0"],
                ["2nd", "1"],
                ["3rd", "2"],
                ["4th", "3"],
                ["5th", "4"]
            ]), "INDEX")
            .appendField("Open");
        this.setOutput(true, "Number");
        this.setColour('#1e3d3a');
        this.setTooltip("Get candle open price");
    }
};

Blockly.Blocks['candle_close'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Candle")
            .appendField(new Blockly.FieldDropdown([
                ["1st", "0"],
                ["2nd", "1"],
                ["3rd", "2"],
                ["4th", "3"],
                ["5th", "4"]
            ]), "INDEX")
            .appendField("Close");
        this.setOutput(true, "Number");
        this.setColour('#1e3d3a');
        this.setTooltip("Get candle close price");
    }
};

Blockly.Blocks['candle_high'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Candle")
            .appendField(new Blockly.FieldDropdown([
                ["1st", "0"],
                ["2nd", "1"],
                ["3rd", "2"],
                ["4th", "3"],
                ["5th", "4"]
            ]), "INDEX")
            .appendField("High");
        this.setOutput(true, "Number");
        this.setColour('#1e3d3a');
        this.setTooltip("Get candle high price");
    }
};

Blockly.Blocks['candle_low'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Candle")
            .appendField(new Blockly.FieldDropdown([
                ["1st", "0"],
                ["2nd", "1"],
                ["3rd", "2"],
                ["4th", "3"],
                ["5th", "4"]
            ]), "INDEX")
            .appendField("Low");
        this.setOutput(true, "Number");
        this.setColour('#1e3d3a');
        this.setTooltip("Get candle low price");
    }
};

// ===========================
// ACCOUNT & BALANCE BLOCKS
// ===========================

Blockly.Blocks['account_balance'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Account Balance");
        this.setOutput(true, "Number");
        this.setColour('#3a2d47');
        this.setTooltip("Get current account balance");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['total_profit'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Total Profit/Loss");
        this.setOutput(true, "Number");
        this.setColour('#3a2d47');
        this.setTooltip("Get total profit or loss");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['last_trade_result'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Last Trade Result");
        this.setOutput(true, "String");
        this.setColour('#3a2d47');
        this.setTooltip("Get last trade result (win/loss)");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['consecutive_wins'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Consecutive Wins");
        this.setOutput(true, "Number");
        this.setColour('#3a2d47');
        this.setTooltip("Get number of consecutive wins");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['consecutive_losses'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Consecutive Losses");
        this.setOutput(true, "Number");
        this.setColour('#3a2d47');
        this.setTooltip("Get number of consecutive losses");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['total_trades'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Total Trades");
        this.setOutput(true, "Number");
        this.setColour('#3a2d47');
        this.setTooltip("Get total number of trades");
        this.setHelpUrl("");
    }
};

// ===========================
// MONEY MANAGEMENT BLOCKS
// ===========================

Blockly.Blocks['martingale'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Martingale Strategy");
        this.appendValueInput("BASE_STAKE")
            .setCheck("Number")
            .appendField("Base Stake");
        this.appendValueInput("MULTIPLIER")
            .setCheck("Number")
            .appendField("Multiplier");
        this.setOutput(true, "Number");
        this.setColour('#3d2d3e');
        this.setTooltip("Calculate stake using Martingale strategy");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['anti_martingale'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Anti-Martingale Strategy");
        this.appendValueInput("BASE_STAKE")
            .setCheck("Number")
            .appendField("Base Stake");
        this.appendValueInput("MULTIPLIER")
            .setCheck("Number")
            .appendField("Multiplier");
        this.setOutput(true, "Number");
        this.setColour('#3d2d3e');
        this.setTooltip("Calculate stake using Anti-Martingale strategy");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['dalembert'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("D'Alembert Strategy");
        this.appendValueInput("BASE_STAKE")
            .setCheck("Number")
            .appendField("Base Stake");
        this.appendValueInput("INCREMENT")
            .setCheck("Number")
            .appendField("Increment");
        this.setOutput(true, "Number");
        this.setColour('#3d2d3e');
        this.setTooltip("Calculate stake using D'Alembert strategy");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['reset_stake'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Reset to Base Stake");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3d2d3e');
        this.setTooltip("Reset stake to base amount");
        this.setHelpUrl("");
    }
};

// ===========================
// UTILITY & TIME BLOCKS
// ===========================

Blockly.Blocks['trade_again'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Trade Again");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3d3028');
        this.setTooltip("Execute another trade");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['stop_trading'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Stop Trading");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3d3028');
        this.setTooltip("Stop the trading bot");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['notify'] = {
    init: function() {
        this.appendValueInput("MESSAGE")
            .setCheck("String")
            .appendField("Notify");
        this.appendDummyInput()
            .appendField("Type")
            .appendField(new Blockly.FieldDropdown([
                ["Info", "info"],
                ["Success", "success"],
                ["Warning", "warning"],
                ["Error", "error"]
            ]), "TYPE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3d3028');
        this.setTooltip("Send a notification");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['current_time'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Current Time");
        this.setOutput(true, "String");
        this.setColour('#3d3028');
        this.setTooltip("Get current time");
    }
};

Blockly.Blocks['session_profit_target'] = {
    init: function() {
        this.appendValueInput("TARGET")
            .setCheck("Number")
            .appendField("Stop if profit exceeds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3d3028');
        this.setTooltip("Set daily profit target");
    }
};

Blockly.Blocks['session_loss_limit'] = {
    init: function() {
        this.appendValueInput("LIMIT")
            .setCheck("Number")
            .appendField("Stop if loss exceeds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3d3028');
        this.setTooltip("Set daily loss limit");
    }
};

// ===========================
// RESTART CONDITIONS BLOCKS
// ===========================

Blockly.Blocks['restart_on_error'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Restart on Error");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3d3028');
        this.setTooltip("Restart bot on error");
    }
};

Blockly.Blocks['restart_on_loss'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Restart on Loss");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3d3028');
        this.setTooltip("Restart bot on loss");
    }
};

Blockly.Blocks['restart_on_win'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Restart on Win");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3d3028');
        this.setTooltip("Restart bot on win");
    }
};

// ===========================
// JavaScript Code Generators
// ===========================

Blockly.JavaScript['trade_parameters'] = function(block) {
    const market = Blockly.JavaScript.valueToCode(block, 'MARKET', Blockly.JavaScript.ORDER_ATOMIC);
    const tradeType = Blockly.JavaScript.valueToCode(block, 'TRADE_TYPE', Blockly.JavaScript.ORDER_ATOMIC);
    const contractType = Blockly.JavaScript.valueToCode(block, 'CONTRACT_TYPE', Blockly.JavaScript.ORDER_ATOMIC);
    const duration = Blockly.JavaScript.valueToCode(block, 'DURATION', Blockly.JavaScript.ORDER_ATOMIC);
    const durationUnit = Blockly.JavaScript.valueToCode(block, 'DURATION_UNIT', Blockly.JavaScript.ORDER_ATOMIC);
    const stake = Blockly.JavaScript.valueToCode(block, 'STAKE', Blockly.JavaScript.ORDER_ATOMIC);
    
    return `setTradeParameters(${market}, ${tradeType}, ${contractType}, ${duration}, ${durationUnit}, ${stake});\n`;
};

Blockly.JavaScript['market_selector'] = function(block) {
    const market = block.getFieldValue('MARKET');
    return [`'${market}'`, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['trade_type_selector'] = function(block) {
    const tradeType = block.getFieldValue('TRADE_TYPE');
    return [`'${tradeType}'`, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['contract_type'] = function(block) {
    const contract = block.getFieldValue('CONTRACT');
    return [`'${contract}'`, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['duration_unit'] = function(block) {
    const unit = block.getFieldValue('UNIT');
    return [`'${unit}'`, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['purchase'] = function(block) {
    const contractType = block.getFieldValue('CONTRACT_TYPE');
    return `purchase('${contractType}');\n`;
};

Blockly.JavaScript['last_tick'] = function(block) {
    return ['getLastTick()', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['last_digit'] = function(block) {
    return ['getLastDigit()', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['account_balance'] = function(block) {
    return ['getAccountBalance()', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['total_profit'] = function(block) {
    return ['getTotalProfit()', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['stop_trading'] = function(block) {
    return 'stopTrading();\n';
};

Blockly.JavaScript['notify'] = function(block) {
    const message = Blockly.JavaScript.valueToCode(block, 'MESSAGE', Blockly.JavaScript.ORDER_ATOMIC);
    const type = block.getFieldValue('TYPE');
    return `notify(${message}, '${type}');\n`;
};


