Blockly.defineBlocksWithJsonArray([
{
  "type": "virtual_hook",
  "message0": "Virtual Hook %1 Start When %2 %3 %4 Trigger : %5 Stake %6 Max Losses %7 Max Wins %8 Max trades %9",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "field_dropdown",
      "name": "virtualhook_start_when",
      "options": [
        [
          "Lost",
          "L"
        ],
        [
          "Win",
          "W"
        ],
        [
          "Custom",
          "C"
        ],
        [
          "Combined (W+L)",
          "WL"
        ],
        [
          "Combined (L+W)",
          "LW"
        ],
        [
          "Combined (W+L) || (L+W)",
          "WL||LW"
        ]
      ]
    },
    {
      "type": "input_end_row"
    },
    {
      "type": "input_value",
      "name": "trigger_val"
    },
    {
      "type": "input_value",
      "name": "hook_stake"
    },
    {
      "type": "input_value",
      "name": "max_loss"
    },
    {
      "type": "input_value",
      "name": "max_won"
    },
    {
      "type": "input_value",
      "name": "max_trades"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "payout",
  "message0": "Payout %1",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "payout_direction",
      "options": [
        [
          "option",
          "OPTIONNAME"
        ],
        [
          "option",
          "OPTIONNAME"
        ]
      ]
    }
  ],
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "askprice",
  "message0": "Ask Price %1",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "payout_direction",
      "options": [
        [
          "option",
          "OPTIONNAME"
        ],
        [
          "option",
          "OPTIONNAME"
        ]
      ]
    }
  ],
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "purchase",
  "message0": "Purchase %1",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "purchase_direction",
      "options": [
        [
          "option",
          "OPTIONNAME"
        ],
        [
          "option",
          "OPTIONNAME"
        ]
      ]
    }
  ],
  "inputsInline": false,
  "previousStatement": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "go__to_the_trade_option",
  "message0": "Go To The Trade Options",
  "inputsInline": false,
  "previousStatement": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "sell_avilable",
  "message0": "Sell Is Availble",
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "sell_profit_loss",
  "message0": "Sell Profit/Loss",
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "sell_at_market",
  "message0": "Sell at Market",
  "inputsInline": false,
  "previousStatement": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "result_is",
  "message0": "Result Is  %1",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "result_is_direction",
      "options": [
        [
          "Won",
          "won"
        ],
        [
          "Loss",
          "loss"
        ]
      ]
    }
  ],
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "contract_details",
  "message0": "Contract Details %1",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "result_is_direction",
      "options": [
        [
          "statement",
          "statement"
        ],
        [
          "Ask Price",
          "askprice"
        ],
        [
          "Payout",
          "payout"
        ],
        [
          "profit",
          "profit"
        ],
        [
          "contract type",
          "contract_type"
        ],
        [
          "entry spot",
          "entry_spot"
        ],
        [
          "entry value",
          "entry_value"
        ],
        [
          "entry value string",
          "entry_value_intring"
        ],
        [
          "exit spot",
          "exit_spot"
        ],
        [
          "exit value",
          "exit_value"
        ],
        [
          "exit value string",
          "exit_value_string"
        ],
        [
          "barrier",
          "barrier"
        ]
      ]
    }
  ],
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "trade_again",
  "message0": "Trade Again",
  "inputsInline": false,
  "previousStatement": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "last_tick",
  "message0": "Last Tick",
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "last_tick_string",
  "message0": "Last Tick String",
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "last_digit",
  "message0": "Last Digit",
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "tick_direction",
  "message0": "Direction Is  %1",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "tick_direction",
      "options": [
        [
          "Rise",
          "rise"
        ],
        [
          "Fall",
          "fall"
        ]
      ]
    }
  ],
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "tick_list",
  "message0": "Tick list",
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "tick_string_list",
  "message0": "Tick String list",
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "last_color_ticks",
  "message0": "Last Color Ticks",
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "last_digit_list",
  "message0": "Last Digit List",
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "last_color_digit_list",
  "message0": "Last Color Digit List",
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "check_digit_color_pattern",
  "message0": "Check Digit Color Pattern %1 input list %2 digit color list %3",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "input_list"
    },
    {
      "type": "input_value",
      "name": "digit_color_list"
    }
  ],
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "check_direction_pattern",
  "message0": "Check Direction Pattern %1 input list %2 direction list %3",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "input_list"
    },
    {
      "type": "input_value",
      "name": "digit_color_list"
    }
  ],
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "is_candle_black",
  "message0": "Is Candle Black? %1",
  "args0": [
    {
      "type": "input_value",
      "name": "is_candle_black"
    }
  ],
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "make_a_list_of_candle_values",
  "message0": "Make a list of  %1 Values From Candle List %2",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "candle_value_type",
      "options": [
        [
          "Open",
          "open"
        ],
        [
          "Close",
          "close"
        ],
        [
          "High",
          "high"
        ],
        [
          "Low",
          "low"
        ],
        [
          "Open Time",
          "opentime"
        ]
      ]
    },
    {
      "type": "input_value",
      "name": "listed_candle"
    }
  ],
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "read_values_from_candle",
  "message0": "Read %1 Value in Candle %2",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "candle_value_type",
      "options": [
        [
          "Open",
          "open"
        ],
        [
          "Close",
          "close"
        ],
        [
          "High",
          "high"
        ],
        [
          "Low",
          "low"
        ],
        [
          "Open Time",
          "opentime"
        ]
      ]
    },
    {
      "type": "input_value",
      "name": "read_values_from candle"
    }
  ],
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "in_candle_list_read",
  "message0": "In Candle List Read %1 # From end  %2 With intervals  %3",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "candle_value_type",
      "options": [
        [
          "Open",
          "open"
        ],
        [
          "Close",
          "close"
        ],
        [
          "High",
          "high"
        ],
        [
          "Low",
          "low"
        ],
        [
          "Open Time",
          "opentime"
        ]
      ]
    },
    {
      "type": "input_value",
      "name": "in_candle_list_read"
    },
    {
      "type": "field_dropdown",
      "name": "interval_type",
      "options": [
        [
          "Default",
          "default"
        ],
        [
          "1 min",
          "1min"
        ],
        [
          "2 min",
          "2min"
        ],
        [
          "3 min",
          "3min"
        ],
        [
          "5 min",
          "5min"
        ],
        [
          "10 min",
          "10min"
        ],
        [
          "15 min",
          "15min"
        ],
        [
          "30 min",
          "30min"
        ],
        [
          "1 hour",
          "1hour"
        ],
        [
          "2 hours",
          "2hours"
        ],
        [
          "4 hours",
          "4hours"
        ],
        [
          "8 hours",
          "8hours"
        ],
        [
          "1 day",
          "1day"
        ]
      ]
    }
  ],
  "inputsInline": true,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "in_candle_list_get_from_end",
  "message0": "In Candle List     Get # From end  %1 With intervals  %2",
  "args0": [
    {
      "type": "input_value",
      "name": "in_candle_list_get_from_end"
    },
    {
      "type": "field_dropdown",
      "name": "interval_type",
      "options": [
        [
          "Default",
          "default"
        ],
        [
          "1 min",
          "1min"
        ],
        [
          "2 min",
          "2min"
        ],
        [
          "3 min",
          "3min"
        ],
        [
          "5 min",
          "5min"
        ],
        [
          "10 min",
          "10min"
        ],
        [
          "15 min",
          "15min"
        ],
        [
          "30 min",
          "30min"
        ],
        [
          "1 hour",
          "1hour"
        ],
        [
          "2 hours",
          "2hours"
        ],
        [
          "4 hours",
          "4hours"
        ],
        [
          "8 hours",
          "8hours"
        ],
        [
          "1 day",
          "1day"
        ]
      ]
    }
  ],
  "inputsInline": true,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "candle_list_with_intervals",
  "message0": "Candle List     With intervals  %1",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "interval_type",
      "options": [
        [
          "Default",
          "default"
        ],
        [
          "1 min",
          "1min"
        ],
        [
          "2 min",
          "2min"
        ],
        [
          "3 min",
          "3min"
        ],
        [
          "5 min",
          "5min"
        ],
        [
          "10 min",
          "10min"
        ],
        [
          "15 min",
          "15min"
        ],
        [
          "30 min",
          "30min"
        ],
        [
          "1 hour",
          "1hour"
        ],
        [
          "2 hours",
          "2hours"
        ],
        [
          "4 hours",
          "4hours"
        ],
        [
          "8 hours",
          "8hours"
        ],
        [
          "1 day",
          "1day"
        ]
      ]
    }
  ],
  "inputsInline": true,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "candle_colors_with_intervals",
  "message0": "Candle Colors     With intervals  %1",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "interval_type",
      "options": [
        [
          "Default",
          "default"
        ],
        [
          "1 min",
          "1min"
        ],
        [
          "2 min",
          "2min"
        ],
        [
          "3 min",
          "3min"
        ],
        [
          "5 min",
          "5min"
        ],
        [
          "10 min",
          "10min"
        ],
        [
          "15 min",
          "15min"
        ],
        [
          "30 min",
          "30min"
        ],
        [
          "1 hour",
          "1hour"
        ],
        [
          "2 hours",
          "2hours"
        ],
        [
          "4 hours",
          "4hours"
        ],
        [
          "8 hours",
          "8hours"
        ],
        [
          "1 day",
          "1day"
        ]
      ]
    }
  ],
  "inputsInline": true,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "make_a_list_of_type_values_in_candle_list",
  "message0": "Make a List Of   %1 Values In candle list  With Intervals %2",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "candle_type",
      "options": [
        [
          "Open",
          "open"
        ],
        [
          "Close",
          "close"
        ],
        [
          "High",
          "high"
        ],
        [
          "Low",
          "low"
        ],
        [
          "Open Time",
          "opentime"
        ]
      ]
    },
    {
      "type": "field_dropdown",
      "name": "interval_type",
      "options": [
        [
          "Default",
          "default"
        ],
        [
          "1 min",
          "1min"
        ],
        [
          "2 min",
          "2min"
        ],
        [
          "3 min",
          "3min"
        ],
        [
          "5 min",
          "5min"
        ],
        [
          "10 min",
          "10min"
        ],
        [
          "15 min",
          "15min"
        ],
        [
          "30 min",
          "30min"
        ],
        [
          "1 hour",
          "1hour"
        ],
        [
          "2 hours",
          "2hours"
        ],
        [
          "4 hours",
          "4hours"
        ],
        [
          "8 hours",
          "8hours"
        ],
        [
          "1 day",
          "1day"
        ]
      ]
    }
  ],
  "inputsInline": true,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "macd",
  "message0": "MACD %1 %2 Input List  %3 Fast EMA Period %4 Slow EMA Period %5 Signel EMA Period %6",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "macd_type",
      "options": [
        [
          "Histrogram",
          "histrogram"
        ],
        [
          "MACD",
          "macd"
        ],
        [
          "Signel",
          "signel"
        ]
      ]
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "input_list"
    },
    {
      "type": "input_value",
      "name": "fast_ema"
    },
    {
      "type": "input_value",
      "name": "slow_ema"
    },
    {
      "type": "input_value",
      "name": "signel_ema"
    }
  ],
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "relative_strength",
  "message0": "Relative Strength index %1 Input List  %2 Period %3 Output As a  %4",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "input_list"
    },
    {
      "type": "input_value",
      "name": "period"
    },
    {
      "type": "field_dropdown",
      "name": "output_type",
      "options": [
        [
          "Number",
          "number"
        ],
        [
          "Array",
          "array"
        ]
      ]
    }
  ],
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "boolinger_bands",
  "message0": "Bolinger Bands %1 %2 Input List  %3 Std Dev. Up Multiplyer %4 Std Dev. Down Multiplyer %5 Output as   %6",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "bands_type",
      "options": [
        [
          "Upper",
          "upper"
        ],
        [
          "Middle",
          "middle"
        ],
        [
          "Lower",
          "lower"
        ]
      ]
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "input_list"
    },
    {
      "type": "input_value",
      "name": "up_mul"
    },
    {
      "type": "input_value",
      "name": "down_mul"
    },
    {
      "type": "field_dropdown",
      "name": "output_type",
      "options": [
        [
          "Number",
          "number"
        ],
        [
          "Array",
          "array"
        ]
      ]
    }
  ],
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "dochain_channels",
  "message0": "Donchain Channels  %1 %2 Input List  %3 Period %4 Output as   %5",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "bands_type",
      "options": [
        [
          "Upper",
          "upper"
        ],
        [
          "Middle",
          "middle"
        ],
        [
          "Lower",
          "lower"
        ]
      ]
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "input_list"
    },
    {
      "type": "input_value",
      "name": "period"
    },
    {
      "type": "field_dropdown",
      "name": "output_type",
      "options": [
        [
          "Number",
          "number"
        ],
        [
          "Array",
          "array"
        ]
      ]
    }
  ],
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "simple_moving",
  "message0": "Simple Moving Avarage %1 Input List  %2 Period %3 Output as   %4",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "input_list"
    },
    {
      "type": "input_value",
      "name": "period"
    },
    {
      "type": "field_dropdown",
      "name": "output_type",
      "options": [
        [
          "Number",
          "number"
        ],
        [
          "Array",
          "array"
        ]
      ]
    }
  ],
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "exponential_moving",
  "message0": "Exponential Moving Avarage %1 Input List  %2 Period %3 Output as   %4",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "input_list"
    },
    {
      "type": "input_value",
      "name": "period"
    },
    {
      "type": "field_dropdown",
      "name": "output_type",
      "options": [
        [
          "Number",
          "number"
        ],
        [
          "Array",
          "array"
        ]
      ]
    }
  ],
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "digit_stats",
  "message0": "Digit Status %1 Input List  %2 Period %3",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "input_list"
    },
    {
      "type": "input_value",
      "name": "period"
    }
  ],
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "worm",
  "message0": "Worm %1 Input List  %2 Period %3",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "input_list"
    },
    {
      "type": "input_value",
      "name": "period"
    }
  ],
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "trend",
  "message0": "Trend Detector %1 Input List  %2 Slow Moving Avarage %3 Fast Moving Avarage %4 Signel %5",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "input_list"
    },
    {
      "type": "input_value",
      "name": "slow_ma"
    },
    {
      "type": "input_value",
      "name": "fast_ma"
    },
    {
      "type": "input_value",
      "name": "signel_ma"
    }
  ],
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "pivot_points",
  "message0": "Pivot Points - Query %1 %2",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "type",
      "options": [
        [
          "Resistance 1",
          "r1"
        ],
        [
          "Resistance 2",
          "r2"
        ],
        [
          "Resistance 3",
          "r3"
        ],
        [
          "Pivot Potnt",
          "pp"
        ],
        [
          "Support 1",
          "s1"
        ],
        [
          "Support 2",
          "s2"
        ],
        [
          "Support 3",
          "s3"
        ]
      ]
    },
    {
      "type": "input_end_row"
    }
  ],
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "worm_query",
  "message0": "Worm Head - Query %1 From %2 %3",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "type",
      "options": [
        [
          "Head",
          "h"
        ],
        [
          "Support",
          "s"
        ],
        [
          "Resistance",
          "r"
        ],
        [
          "Support Breaked",
          "sb"
        ],
        [
          "Resistance Breaked",
          "rb"
        ]
      ]
    },
    {
      "type": "field_variable",
      "name": "worm_variable",
      "variable": "Worm"
    },
    {
      "type": "input_end_row"
    }
  ],
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "digit_query",
  "message0": "Digit Stats - Query %1 %2 Instance %3 Parameters %4",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "type",
      "options": [
        [
          "Less Frequent",
          "lf"
        ],
        [
          "Most Frequent",
          "mf"
        ],
        [
          "Sum of Percentages (dgits)",
          "r"
        ],
        [
          "Percentage (digit)",
          "pd"
        ],
        [
          "Percentage (even)",
          "pe"
        ],
        [
          "Percentage (odd)",
          "po"
        ],
        [
          "Count (digit)",
          "cd"
        ],
        [
          "Count (even)",
          "ce"
        ],
        [
          "Count (odd)",
          "co"
        ]
      ]
    },
    {
      "type": "input_end_row"
    },
    {
      "type": "input_value",
      "name": "instance"
    },
    {
      "type": "input_value",
      "name": "paameters"
    }
  ],
  "inputsInline": false,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "virtual_hook_reset",
  "message0": "Virtual Hook -RESET %1",
  "args0": [
    {
      "type": "input_end_row"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "virtual_hook_start_when",
  "message0": "Virtual Hook - Start When %1 %2",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "type",
      "options": [
        [
          "Loss",
          "l"
        ],
        [
          "Won",
          "w"
        ],
        [
          "Custom",
          "c"
        ],
        [
          "Combined W+L",
          "wl"
        ],
        [
          "Combined L+W",
          "lw"
        ],
        [
          "Combined L+W | W+L",
          "lwwl"
        ]
      ]
    },
    {
      "type": "input_end_row"
    }
  ],
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "virtual_hook_query",
  "message0": "Virtual Hook - Query %1 %2",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "type",
      "options": [
        [
          "Start When",
          "sw"
        ],
        [
          "Trigger",
          "t"
        ],
        [
          "Max Negative Streaked",
          "mns"
        ],
        [
          "Max Positive Streaks ",
          "mps"
        ],
        [
          "Max Trades",
          "mt"
        ],
        [
          "Status",
          "st"
        ]
      ]
    },
    {
      "type": "input_end_row"
    }
  ],
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "virtual_hook_change",
  "message0": "Virtual Hook - Change %1 By %2",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "type",
      "options": [
        [
          "Start When",
          "sw"
        ],
        [
          "Trigger",
          "t"
        ],
        [
          "Max Negative Streaked",
          "mns"
        ],
        [
          "Max Positive Streaks ",
          "mps"
        ],
        [
          "Max Trades",
          "mt"
        ],
        [
          "Status",
          "st"
        ]
      ]
    },
    {
      "type": "input_value",
      "name": "chnage_value"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "virtual_hook_change_status",
  "message0": "Virtual Hook - Change Status %1",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "type",
      "options": [
        [
          "Enable",
          "enable"
        ],
        [
          "Disable",
          "disable"
        ]
      ]
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "virtual_hook_token",
  "message0": "Virtual Hook - Account Token %1",
  "args0": [
    {
      "type": "field_input",
      "name": "token",
      "text": "Deriv Token"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "virtual_hook_change_account",
  "message0": "Virtual Hook - Change Account to %1",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "typr",
      "options": [
        [
          "Main",
          "main"
        ],
        [
          "Virtual",
          "virtual"
        ]
      ]
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "seconds_since_epoch",
  "message0": "Seconds Since Epoch",
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "to_timestamp",
  "message0": "To Times Stamp %1",
  "args0": [
    {
      "type": "input_value",
      "name": "input_time_date"
    }
  ],
  "inputsInline": true,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "run_after",
  "message0": "%1 Run After %2 Seconds (s)",
  "args0": [
    {
      "type": "input_statement",
      "name": "run_after"
    },
    {
      "type": "input_value",
      "name": "delay"
    }
  ],
  "inputsInline": true,
  "previousStatement": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "balance",
  "message0": "Balance :  %1",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "type",
      "options": [
        [
          "String",
          "string"
        ],
        [
          "Number",
          "number"
        ]
      ]
    }
  ],
  "inputsInline": true,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "total_profit",
  "message0": "Total Profit : %1",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "type",
      "options": [
        [
          "String",
          "string"
        ],
        [
          "Number",
          "number"
        ]
      ]
    }
  ],
  "inputsInline": true,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "number_of_runs",
  "message0": "No: of Runs",
  "inputsInline": true,
  "output": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "notify",
  "message0": "Notify %1  With Sound %2 %3",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "color",
      "options": [
        [
          "Green",
          "g"
        ],
        [
          "Blue",
          "b"
        ],
        [
          "Red",
          "r"
        ],
        [
          "Yellow",
          "y"
        ]
      ]
    },
    {
      "type": "field_dropdown",
      "name": "sound",
      "options": [
        [
          "Silent",
          "none"
        ],
        [
          "Announcement",
          "announcement"
        ],
        [
          "Earned Money",
          "earned_money"
        ],
        [
          "Job Done",
          "job_done"
        ],
        [
          "Error",
          "error"
        ],
        [
          "Server Error",
          "server_error"
        ]
      ]
    },
    {
      "type": "input_value",
      "name": "NAME"
    }
  ],
  "inputsInline": true,
  "previousStatement": null,
  "nextStatement": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
/*{
  "type": "main_block",
  "message0": "(1) Define your trade Contract %1 Market %2 > %3 > %4 %5 Trade Type %6 > %7 %8 Contract Type %9 %10 Default Candle Interval %11 %12 Restart Buy Sell On Error  (Disable For Better Performance) %13 %14 Restart Last Trade On Error  (Bot Ignores Unsuccessful Trades) %15 %16 Run Once at Start %17 %18 Define Trade Options %19 %20 (2) Watch and Purchase your Contract %21 %22 (3) Watch and Sell your Perchased Contract %23 %24 (4) Get your Trade Result and Trade Again %25 %26",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "field_dropdown",
      "name": "frist_market",
      "options": [
        [
          "option",
          "OPTIONNAME"
        ],
        [
          "option",
          "OPTIONNAME"
        ],
        [
          "option",
          "OPTIONNAME"
        ]
      ]
    },
    {
      "type": "field_dropdown",
      "name": "second_market",
      "options": [
        [
          "option",
          "OPTIONNAME"
        ],
        [
          "option",
          "OPTIONNAME"
        ],
        [
          "option",
          "OPTIONNAME"
        ]
      ]
    },
    {
      "type": "field_dropdown",
      "name": "third_market",
      "options": [
        [
          "option",
          "OPTIONNAME"
        ],
        [
          "option",
          "OPTIONNAME"
        ],
        [
          "option",
          "OPTIONNAME"
        ]
      ]
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "field_dropdown",
      "name": "frist_catogory",
      "options": [
        [
          "option",
          "OPTIONNAME"
        ],
        [
          "option",
          "OPTIONNAME"
        ],
        [
          "option",
          "OPTIONNAME"
        ]
      ]
    },
    {
      "type": "field_dropdown",
      "name": "second_catogory",
      "options": [
        [
          "option",
          "OPTIONNAME"
        ],
        [
          "option",
          "OPTIONNAME"
        ],
        [
          "option",
          "OPTIONNAME"
        ]
      ]
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "field_dropdown",
      "name": "contract_type",
      "options": [
        [
          "Both",
          "both"
        ],
        [
          "Single",
          "single"
        ]
      ]
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "field_dropdown",
      "name": "candle_interval",
      "options": [
        [
          "1 Minute",
          "1m"
        ],
        [
          "2 Minute",
          "2m"
        ],
        [
          "3 Minute",
          "3m"
        ],
        [
          "5 Minute",
          "5m"
        ],
        [
          "10 Minute",
          "10m"
        ],
        [
          "15 Minute",
          "15m"
        ],
        [
          "30 Minute",
          "30m"
        ],
        [
          "1 Hour",
          "1h"
        ],
        [
          "2 Hour",
          "2h"
        ],
        [
          "4 Hour",
          "4h"
        ],
        [
          "8 Hour",
          "8h"
        ],
        [
          "1 Day",
          "1d"
        ]
      ]
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "field_checkbox",
      "name": "buysellError",
      "checked": false
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "field_checkbox",
      "name": "lasttradeofError",
      "checked": true
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "run_onece"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "trade_options"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "watch_purches"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "watch_sell"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "trade_again"
    }
  ],
  "inputsInline": false,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},*/
{
  "type": "notify_telegram",
  "message0": "Notify Telegram   Acces Token %1 Chat ID %2 Message %3",
  "args0": [
    {
      "type": "input_value",
      "name": "token"
    },
    {
      "type": "input_value",
      "name": "id"
    },
    {
      "type": "input_value",
      "name": "msg"
    }
  ],
  "inputsInline": true,
  "previousStatement": null,
  "nextStatement": null,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "ignore",
  "message0": "Blocks Inside Are Ignored %1 %2",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "ignore"
    }
  ],
  "inputsInline": false,
  "colour": "#04db81",
  "tooltip": "",
  "helpUrl": ""
}]);

