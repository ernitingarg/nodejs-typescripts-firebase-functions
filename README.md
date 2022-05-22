# soteria-node-functions

- [Document](https://www.notion.so/Soteria-612e438f04044e6298297efaee8d17e4)

# commands

## set project

```sh
$ firebase use soteria-production
```

## deploy all CF

```sh
$ yarn deploy
```

## deploy one CF
```sh
$ FUNC_NAME=<cf name> yarn deploy:mono
```

### how to add test

https://www.notion.so/gssssss/CF-e2e-c91fb63c6ca3406291785c463c654313

## For failed broadcast
Decode payload
- https://live.blockcypher.com/btc/decodetx/

Need to send manually.
- https://blockchair.com/broadcast
- https://live.blockcypher.com/btc/pushtx/


# V0 Instructions
## Deployment
Following commands should be run by authorized user account.
### prod
```shell
firebase functions:config:set mnemonic.password=projects/924562074308/secrets/mnemonic-pwd/versions/1
firebase functions:config:set mnemonic.passphrase=projects/924562074308/secrets/mnemonic-production/versions/1
firebase functions:config:set destination.btc=projects/924562074308/secrets/Bitcoin-ftx-address/versions/1
firebase functions:config:set api.blockcypher=projects/924562074308/secrets/blockcypher-api-token/versions/1
yarn deploy
```
### staging
```shell
firebase functions:config:set mnemonic.password=projects/167835541928/secrets/mnemonic-phrase/versions/1
firebase functions:config:set mnemonic.passphrase=projects/167835541928/secrets/mnemonic-password/versions/1
firebase functions:config:set destination.btc=projects/167835541928/secrets/btc_dest_main/versions/2
firebase functions:config:set api.blockcypher=projects/167835541928/secrets/blockcypher_api_token/versions/1
yarn deploy
```

## How it works
1. chain watcher creates transaction document in `{coin_name}_transactions` collection. e.g. `btc_transactions`
    - chain watcher is in https://github.com/SoteriaTech/blockchain-functions
2. FirestoreCreateTrigger `{coin_name}DepositRecorder` is triggered by Create operation in `{coin_name}_transactions` collection.
3. This `{coin_name}DepositRecorder` function will create deposit document in `deposits` collection.
    - deposit document is in the format defined in `funcs/typings/deposit.ts`.
4. FirestoreCreateTrigger `sendFromDeposit` is triggered by Create operation in `deposits` collection.
5. This `sendFromDeposit` function will send received coin to FTX account.

### Remark
- chain watcher is implemented in separate project. It is basically doing finding customer related transaction and insert it into respective `{coin_name}_transactions` collection. 
- `sendFromDeposit` function takes care of all coin transfer from deposit address.
- sender logic for each coin is found in `funcs/functions/sender` directory.