import {
	ActionFn,
	Context,
	Event,
	TransactionEvent,
} from '@tenderly/actions';

import { tenderlyContractsGetter, tenderlyContractPoster, endaomentTransactionPoster } from './web-apis';

const { ethers } = require("ethers");

const { keccak256, toUtf8Bytes } = ethers.utils;

type ContractElement = {
	id: string;
	address: string;
}

type Element = {
	id: string;
	contract: ContractElement;
}

const orgFundFactoryAddress = "0x10fd9348136dcea154f752fe0b6db45fc298a589";

const transferSig = keccak256(toUtf8Bytes("Transfer(address,address,uint256)"));
const entityDeployedSig = "0x1e3e29fb0c05e0c478577b9b3e207cbfe2952b1f9b239ed5d2535d4b24b6c577";

/**
 * Process OrgFundFactory "Entity Deployed" events and add new entity address to Tenderly Contracts Management API.
 * @param txEvent - Information about the transaction that the OrgFundFactory received.
 */
 const orgFundFactoryHandler = async(txEvent: TransactionEvent) => {
  console.log(`we have an orgFundFactoryEvent with ${txEvent.logs.length}`);
  const sig = txEvent.logs[1].topics[0];
  if (sig == entityDeployedSig) {
    const newEntityAddress = txEvent.logs[1].topics[1].replace('0x000000000000000000000000', '0x');
    console.log(`we got an Entity address of ${newEntityAddress}`);
    try {
      await tenderlyContractPoster("5", newEntityAddress);
    } catch (e) {
      console.log(`Error sending transaction hash ${txEvent.hash} to Endaoment API: ${e}`)
    }
  }
}

/**
 * Get Entity addresses from Tenderly Contracts Management API.
 * @returns entityList - Array of strings containing Entity contract addresses.
 */
 const getEntityAddresses = async (): Promise<string[]> => {
  let entityList: string[] = [];
  try {
    const res = await tenderlyContractsGetter();
    const elements: Element[] = res.data;
    elements.forEach(element => {
      entityList.push(element.contract.address);
    });
  } catch (e) {
    console.log(`Error retrieving Entity addresses from Tenderly Contracts Management API: ${e}`)
  }
  return entityList;
}

/**
 * Trigger action function invoked by Tenderly when a transaction matching "tenderly.yaml" filters is mined.
 * @param context - Tenderly execution context.
 * @param event - Information about the new transaction.
 * @dev - If anything about the transaction matches criteria for sending to the Endaoment API, the transaction hash is sent.
 */
 export const transactionTrigger: ActionFn = async (context: Context, event: Event) => {

  // initially assume no reason to send the transaction hash
  let foundMatch = false;

  // test for various reasons transaction hash should be sent (right now, OrgFundFactory transaction and ERC20 Entity transaction).
  let txEvent = event as TransactionEvent;
  if (txEvent.to == orgFundFactoryAddress) {
    foundMatch = true;
    orgFundFactoryHandler(txEvent);
  } else {
    let entityList = await getEntityAddresses();
    txEvent.logs.forEach(async (log) =>  {
    const topics = log.topics;
      if ( (topics.length == 3) && (topics[0] == transferSig) ) {
        console.log(`Transaction has an ERC20 transfer in it: ${txEvent.hash}`);
        if (entityList.includes(topics[1].replace('0x000000000000000000000000', '0x'))) {
          foundMatch = true;
        }
        if (entityList.includes(topics[2].replace('0x000000000000000000000000', '0x'))) {
          foundMatch = true;
        }
      }
    });
  }
  if (foundMatch) {
    try {
      console.log(`Endaoment oriented transaction found, tx hash: ${txEvent.hash}`);
      await endaomentTransactionPoster(txEvent.hash);
    } catch (e) {
      console.log(`Error sending transaction hash ${txEvent.hash} to Endaoment API: ${e}`)
    }
  }
}
