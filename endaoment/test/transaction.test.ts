import { ethers } from 'ethers';
const { keccak256, toUtf8Bytes } = ethers.utils;

import { TestTransactionEvent, TestLog, TestRuntime } from "@tenderly/actions-test";
import nock = require("nock");

import { transactionTrigger } from "../actions";

const entityDeployedSig = "0x1e3e29fb0c05e0c478577b9b3e207cbfe2952b1f9b239ed5d2535d4b24b6c577";
const transferSig = keccak256(toUtf8Bytes("Transfer(address,address,uint256)"));

const orgFundFactoryAddress = "0x10fd9348136dcea154f752fe0b6db45fc298a589";
const anEndaomentEntityAddress = "0x10fd9348136dcea154f752fe0b6db45fc298a589";

const emptyTestLog: TestLog = {address: '', topics: [], data: ''};

const testRuntime = new TestRuntime();

beforeAll(async () => {
  let tenderlyContractList = [
    {
      contract: {
        network_id: "5",
        address: anEndaomentEntityAddress,
        display_name: "anEndaomentEntityAddress",
      },
    },
  ];

  // setup mocked Tenderly Contracts Management API endpoint to fetch list of contracts.
  nock("https://api.tenderly.co")
    .get("/api/v1/account/me/project/project/contracts?accountType=contract")
    .reply(200, tenderlyContractList)
    .persist();

  // setup mocked Tenderly Contracts Management API endpoint to accept new contract address into list.
  nock("https://api.tenderly.co")
    .post("/api/v1/account/me/project/project/address")
    .reply(200)
    .persist();

});

describe("transaction", () => {
  test("Should handle an EntityDeployed transaction event and send notification to Endaoment API", async () => {

    // setup a fake Entity Deployed event in the logs of simulated transaction to the OrgFundFactory.
    const testTransaction = new TestTransactionEvent();
    testTransaction.hash = "0xcbd8185be4387e68c94a782b374fdd62123a83c25a21ac6cc040a8931e9d4d3f";
    testTransaction.to = orgFundFactoryAddress;
    testTransaction.from =       "0x2222222222222222222222222222222222222222";
    const fakeNewEntityAddress = "0x1111111111111111111111111111111111111111";
    const newEntityAddressTopic = `0x000000000000000000000000${fakeNewEntityAddress.replace("0x","")}`
    const orgFundFactoryEventTestLog: TestLog = {address: '', topics: [entityDeployedSig, newEntityAddressTopic], data: ''}
    testTransaction.logs = [emptyTestLog, orgFundFactoryEventTestLog];

    // setup a scoped mock for the Endaoment API to receive a POST from the Event Listener when the EntityDeployed event occurs
    const scope = nock('https://b368-2603-7080-1b01-70e1-c14c-ec41-7716-beb8.ngrok.io//')
      .post('/', { txhash: `${testTransaction.hash}` } )
      .reply(200);

    // execute the action function with the faked transaction.
    await testRuntime.execute(transactionTrigger, testTransaction);

    // verify that the nock scoped mock of the Endaoment API was matched during the execution of the action funtion
    scope.isDone();
  });

  test("Should handle an ERC20 transfer event to an Endoament Entity and send notification to Endaoment API", async () => {

    // setup a fake Entity Deployed event in the logs of simulated transaction to the OrgFundFactory.
    const testTransaction = new TestTransactionEvent();
    testTransaction.hash = "0xcbd8185be4387e68c94a782b374fdd62123a83c25a21ac6cc040a8931e9d4d3f";
    testTransaction.to = "0x1111111111111111111111111111111111111111";;
    testTransaction.from = "0x2222222222222222222222222222222222222222";
    const randomSourceAddress =  "0x3333333333333333333333333333333333333333";
    const randomSourceAddressTopic = `0x000000000000000000000000${randomSourceAddress.replace("0x","")}`
    const entityAddressTopic = `0x000000000000000000000000${anEndaomentEntityAddress.replace("0x","")}`
    const orgFundFactoryEventTestLog: TestLog = {address: '', topics: [transferSig, randomSourceAddressTopic, entityAddressTopic], data: ''}
    testTransaction.logs = [orgFundFactoryEventTestLog];

    // setup a scoped mock for the Endaoment API to receive a POST from the Event Listener when the ERC20 transfer event occurs
    const scope = nock('https://b368-2603-7080-1b01-70e1-c14c-ec41-7716-beb8.ngrok.io//')
      .post('/', { txhash: `${testTransaction.hash}` } )
      .reply(200);

    // execute the action function with the faked transaction.
    await testRuntime.execute(transactionTrigger, testTransaction);

    // verify that the nock scoped mock of the Endaoment API was matched during the execution of the action funtion
    scope.isDone();
  });


});
