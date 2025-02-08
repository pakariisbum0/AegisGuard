export const therapyWalletPolicy = {
  version: "1.0",
  name: "Therapy Session Payments",
  chain_type: "ethereum",
  method_rules: [
    {
      method: "eth_sendTransaction",
      rules: [
        {
          name: "Restrict therapy payments",
          conditions: [
            {
              field_source: "ethereum_transaction",
              field: "to",
              operator: "eq",
              value: "0x60Cf886D3266cFa4C626aaeb9c59bB50dcebb21d",
            },
            {
              field_source: "ethereum_transaction",
              field: "value",
              operator: "lte",
              value: "100000000000000000",
            },
            {
              field_source: "ethereum_transaction",
              field: "chain_id",
              operator: "eq",
              value: "84532",
            },
          ],
          action: "ALLOW",
        },
      ],
    },
  ],
  default_action: "DENY",
};
