import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';
dotenvConfig({ path: resolve(__dirname, './.env') });

Error.stackTraceLimit = Infinity;
jest.setTimeout(1000000);

process.env.NETWORK = 'goerli';
