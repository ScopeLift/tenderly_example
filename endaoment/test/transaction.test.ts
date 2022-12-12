import { TestTransactionEvent, TestRuntime } from "@tenderly/actions-test";
import nock = require("nock");

import { transactionTrigger } from "../actions";

const testRuntime = new TestRuntime();

beforeAll(async () => {
  let tenderlyContractList = [
    {
      contract: {
        network_id: "5",
        address: "0x10fd9348136dcea154f752fe0b6db45fc298a589",
        display_name: "0x10fd9348136dcea154f752fe0b6db45fc298a589",
      },
    },
  ];

  nock("https://api.tenderly.co")
    .get("/api/v1/account/me/project/project/contracts?accountType=contract")
    .reply(200, tenderlyContractList);

  nock("https://api.tenderly.co")
    .post("/api/v1/account/me/project/project/address")
    .reply(200);
});

describe("transaction", () => {
  test("Should handle an ERC20 transaction event", async () => {
    const te = new TestTransactionEvent();
    te.to = "0x1111111111111111111111111111111111111111";
    te.from = "0x2222222222222222222222222222222222222222";

    await testRuntime.execute(transactionTrigger, te);
    console.log("test complete");
  });
});
