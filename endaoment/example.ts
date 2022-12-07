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

const transferSig = keccak256(toUtf8Bytes("Transfer(address,address,uint256)"));

export const blockHelloWorldFn: ActionFn = async (context: Context, event: Event) => {
  let blockEvent = event as BlockEvent;
  console.log(`Got a block event.. its number is: ${blockEvent.blockNumber}`);
	try {
	  const res = await axios.get('https://api.tenderly.co/api/v1/account/me/project/project/contracts?accountType=contract',
		{
		  headers: { 'X-Access-Key': 'bC1rqQM2VD2h8edq1cK41OhXSOl-VxLs' },
		});
		const elements: Element[] = res.data;
		console.log(`We have ${elements.length} configured contracts for monitoring`);
	    // THIS DOESN"T WORK
		// await context.storage.putJson("CONTRACTS", { elements } );
		// SO WE'RE DOING THIS FOR NOW
		let counter = 0;
		while (counter < elements.length) {
			console.log(`wrote an address ${elements[counter].contract.address} with Counter${counter}`);
			await context.storage.putStr(`Counter${counter}`, elements[counter].contract.address);
			counter = counter + 1;
		}
	} catch (e) {
	  console.log(`We got a POST error ${e}`)
	}
}

export const transactionExample: ActionFn = async (context: Context, event: Event) => {
	let targetList: string[] = [];
	// THIS DOESN"T WORK
	//   const elements: Element[] = await context.storage.getJson("CONTRACTS");
	//   elements.forEach(element => {
	// 	targetList.push(element.contract.address);
	//   });
	// SO WE'RE DOING THIS FOR NOW
	let counter = 0;
	while (counter < 50000) {
		try {
		  const contractAddress = await context.storage.getStr(`Counter${counter}`);
		  if ((contractAddress == null) || (!contractAddress.includes("0x"))) {
            counter = 50000;
			if (contractAddress == null) {
			  console.log("got a null in read loop");
			} else {
			  console.log(`read something unexpected in read loop: ${contractAddress}`);
			}
		  } else {
		    targetList.push(contractAddress)
		  }
		} catch {
			counter = 50000;
		}
		counter = counter + 1;
	}
    let txEvent = event as TransactionEvent;
	console.log(`targetList has ${targetList.length} contract addresses in it.`)
	console.log(`Transaction has ${txEvent.logs.length} logs`);
	let foundMatch = false;
    txEvent.logs.forEach(async (log) =>  {
	  const topics = log.topics;
	  if ( (topics.length == 3) && (topics[0] == transferSig) ) {
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
		console.log(`Entity ERC20 transfer in tx hash: ${txEvent.hash} ****************************************`);
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
