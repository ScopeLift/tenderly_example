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

// type Element = {
// 	id: string;
// 	contract: ContractElement;
// }

const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48".toLowerCase();
const usdt = "0xdAC17F958D2ee523a2206206994597C13D831ec7".toLowerCase();
const someAddress = "0xC2F51C9DF556AF3742888aEd683981510aD57D5e".toLowerCase();
const someOtherAddress = "0xCD531Ae9EFCCE479654c4926dec5F6209531Ca7b".toLowerCase();

const transferSig = keccak256(toUtf8Bytes("Transfer(address,address,uint256)"));

let targetList = [usdc, usdt, someAddress, someOtherAddress];

export const blockHelloWorldFn: ActionFn = async (context: Context, event: Event) => {
  let blockEvent = event as BlockEvent;
  console.log(`Got a block event.. its number is: ${blockEvent.blockNumber}`);
//   try {
//     const res = await axios.get('https://api.tenderly.co/api/v1/account/me/project/project/contracts?accountType=contract',
// 	  {
// 	    headers: {
// 	    'X-Access-Key': 'bC1rqQM2VD2h8edq1cK41OhXSOl-VxLs',
// 	  },
//     });
//     console.log(`We have ${res.data.length} configured contracts for monitoring`);
// 	const elements: [] = res.data;
//     elements.forEach(element => {
// 		Object.keys(element).forEach(key => {
// 		  console.log(`element key is: ${key}`);
// 		  const contract = element.contract;
// 		})
// 		const contract = elemen
// 		console.log(`contract address: ${element?.contract?.address}`);
// 	});
//   } catch (e) {
//     console.log(`We got a POST error ${e}`)
//   }
}

export const transactionExample: ActionFn = async (context: Context, event: Event) => {
	let txEvent = event as TransactionEvent;
	console.log(`Transaction has ${txEvent.logs.length} logs`);
	let foundMatch = false;
    txEvent.logs.forEach(async (log) =>  {
	  const topics = log.topics;
	  if ( (topics.length == 3) && (topics[0] == transferSig) ) {
		console.log(`Transaction has and ERC20 transfer in it: ${txEvent.hash}`);
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
