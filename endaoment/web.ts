import axios from 'axios';

export const contractsGetter = async (url: string) => {
  const res = await axios.get('https://api.tenderly.co/api/v1/account/me/project/project/contracts?accountType=contract',
  {
    headers: { 'X-Access-Key': 'bC1rqQM2VD2h8edq1cK41OhXSOl-VxLs' },
  });
  return res;
}

export const contractPoster = async (networkId: string, contractAddress: string) => {
  await axios.post('https://api.tenderly.co/api/v1/account/me/project/project/address',
  { network_id: `${networkId}`, address: `${contractAddress}`, display_name: `${contractAddress}` }, {
    headers: {
      'content-type': 'text/json',
      'X-Access-Key': 'bC1rqQM2VD2h8edq1cK41OhXSOl-VxLs'
    },
  });
}

export const transactionPoster = async (transactionHash: string) => {
  await axios.post('https://b368-2603-7080-1b01-70e1-c14c-ec41-7716-beb8.ngrok.io//', { txhash: `${transactionHash}` }, {
    headers: {
      'content-type': 'text/json'
    }
  });
}