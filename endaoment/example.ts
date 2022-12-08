import {
	ActionFn,
	Context,
	Event,
	BlockEvent,
	TransactionEvent,
} from '@tenderly/actions';

import axios from 'axios';

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

export const blockTrigger: ActionFn = async (context: Context, event: Event) => {
  let blockEvent = event as BlockEvent;
  console.log(`Got a block event.. its number is: ${blockEvent.blockNumber}`);
  console.log(`transfer sig is: ${transferSig}`);
  console.log(`entity deployed sig is: ${entityDeployedSig}`);
}

export const orgFundFactoryTrigger: ActionFn = async(context: Context, event: Event) => {
  let txEvent = event as TransactionEvent;
  if (txEvent.to == orgFundFactoryAddress) {
    console.log(`we have an orgFundFactoryEvent with ${txEvent.logs.length}`);
    let lognum = 0;
    txEvent.logs.forEach(log =>  {
      const topics = log.topics;
      console.log(`  log ${lognum} has ${topics.length} topics`);
      let topicnum = 0;
      topics.forEach(topic => {
        console.log(`    topicnum ${topicnum} is ${topic}`);
        topicnum++;
      });
      lognum++;
    });
    const sig = txEvent.logs[1].topics[0];
    if (sig == entityDeployedSig) {
      const newEntityAddress = txEvent.logs[1].topics[1].replace('0x000000000000000000000000', '0x')
      console.log(`we got an Entity address of ${newEntityAddress}`)
    }
  }  
}

export const erc20TransferTrigger: ActionFn = async (context: Context, event: Event) => {
  let txEvent = event as TransactionEvent;
  let targetList: string[] = [];
  try {
    const res = await axios.get('https://api.tenderly.co/api/v1/account/me/project/project/contracts?accountType=contract',
    {
      headers: { 'X-Access-Key': 'bC1rqQM2VD2h8edq1cK41OhXSOl-VxLs' },
    });
    const elements: Element[] = res.data;
    console.log(`We have ${elements.length} configured contracts for monitoring`);
    elements.forEach(element => {
      targetList.push(element.contract.address);
    });
  } catch (e) {
    console.log(`We got a POST error ${e}`)
  }
  console.log(`targetList has ${targetList.length} contract addresses in it.`)
  console.log(`Transaction has ${txEvent.logs.length} logs`);
  let foundMatch = false;
  txEvent.logs.forEach(async (log) =>  {
  const topics = log.topics;
    if ( (topics.length == 3) && (topics[0] == transferSig) ) {
      // include line below to send axios POST for every ERC20 transfer transaction hash (only target matches otherwise)
      // foundMatch = true;
      console.log(`Transaction has an ERC20 transfer in it: ${txEvent.hash}`);
      if (targetList.includes(topics[1].replace('0x000000000000000000000000', '0x'))) {
        foundMatch = true;
      }
      if (targetList.includes(topics[2].replace('0x000000000000000000000000', '0x'))) {
        foundMatch = true;
      }
    }
  });
  if (foundMatch) {
    try {
      console.log(`ERC20 transfer in tx hash: ${txEvent.hash} ****************************************`);
      await axios.post('https://b368-2603-7080-1b01-70e1-c14c-ec41-7716-beb8.ngrok.io//', { txhash: `${txEvent.hash}` }, {
        headers: {
          'content-type': 'text/json'
        }
      });
    } catch (e) {
      console.log(`We got a POST error ${e}`)
    }
  }
}
