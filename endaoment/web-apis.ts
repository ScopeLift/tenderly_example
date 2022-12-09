import axios from 'axios';

/**
 * Make request of Tenderly Contracts Management API to fetch project contract addresses.
 * @returns res - axios get result.
 * @dev - Caller is expect to any thrown error.
 */
 export const tenderlyContractsGetter = async () => {
  const res = await axios.get('https://api.tenderly.co/api/v1/account/me/project/project/contracts?accountType=contract',
  {
    headers: { 'X-Access-Key': 'bC1rqQM2VD2h8edq1cK41OhXSOl-VxLs' },
  });
  return res;
}

/**
 * Send POST request to Tenderly Contracts Management API to add a new project contract addresses.
 * @param network_id - Blockchain network identifier ("1" for mainnet, "5" for Goerli).
 * @param contractAddress - New contract address to be added.
 * @dev - Caller is expect to any thrown error.
 */
 export const tenderlyContractPoster = async (networkId: string, contractAddress: string) => {
  await axios.post('https://api.tenderly.co/api/v1/account/me/project/project/address',
  { network_id: `${networkId}`, address: `${contractAddress}`, display_name: `${contractAddress}` }, {
    headers: {
      'content-type': 'text/json',
      'X-Access-Key': 'bC1rqQM2VD2h8edq1cK41OhXSOl-VxLs'
    },
  });
}

/**
 * Send POST request to Endaoment API to notify it of pertinent transaction hash.
 * @param transactionHash - Transaction hash to be sent.
 * @dev - Caller is expect to any thrown error.
 */
 export const endaomentTransactionPoster = async (transactionHash: string) => {
  await axios.post('https://b368-2603-7080-1b01-70e1-c14c-ec41-7716-beb8.ngrok.io//', { txhash: `${transactionHash}` }, {
    headers: {
      'content-type': 'text/json'
    }
  });
}