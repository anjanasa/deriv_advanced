javascript.javascriptGenerator.forBlock['trade_settings'] = function(block, generator) {
  var dropdown_duration_unit = block.getFieldValue('duration_unit');
  var value_duration = generator.valueToCode(block, 'duration', javascript.Order.ATOMIC);
  var dropdown_stake_unit = block.getFieldValue('stake_unit');
  var value_stake = generator.valueToCode(block, 'stake', javascript.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
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
  var code = '...\n';
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
  var code = '...\n';
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
  var dropdown_frist_market = block.getFieldValue('frist_market');
  var dropdown_second_market = block.getFieldValue('second_market');
  var dropdown_third_market = block.getFieldValue('third_market');
  var dropdown_frist_catogory = block.getFieldValue('frist_catogory');
  var dropdown_second_catogory = block.getFieldValue('second_catogory');
  var dropdown_contract_type = block.getFieldValue('contract_type');
  var dropdown_candle_interval = block.getFieldValue('candle_interval');
  var checkbox_buysellerror = block.getFieldValue('buysellError') === 'TRUE';
  var checkbox_lasttradeoferror = block.getFieldValue('lasttradeofError') === 'TRUE';
  var statements_run_onece = generator.statementToCode(block, 'run_onece');
  var statements_trade_options = generator.statementToCode(block, 'trade_options');
  var statements_watch_purches = generator.statementToCode(block, 'watch_purches');
  var statements_watch_sell = generator.statementToCode(block, 'watch_sell');
  var statements_trade_again = generator.statementToCode(block, 'trade_again');
  // TODO: Assemble javascript into code variable.
  var code = `
  let selected_market = ${dropdown_third_market}
  let trading_cat = ${dropdown_contract_type}
  let candle_interval = ${dropdown_candle_interval}

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