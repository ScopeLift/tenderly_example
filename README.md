Tenderly POC repo

tenderly.yaml contains the trigger definitions for the block trigger callback and the transaction trigger callback

endaoment/actions.ts contains the typescript code for the trigger callbacks

add_entities.sh is a shell script that will add 17 entity contract addresses to the tenderly project (free plan limit is 20)

entities.json is a JSON file of all of the mainnet entity addresses, formatted for import via curl POST to the tenderly contract management API [described in this document](https://www.notion.so/Contract-management-API-08be3d38fb9347b8afbbbeaaa6d6238f).

entity-addresses.txt is a raw text file containing all of the Endaoment entity addresses.



