import { promises as fs } from 'fs';
import path from 'path';

import canonicalize from 'canonicalize';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import { HardhatUserConfig, task } from 'hardhat/config';

import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-watcher';
import 'solidity-coverage';

const TASK_EXPORT_ABIS = 'export-abis';

task(TASK_COMPILE, async (_args, hre, runSuper) => {
  await runSuper();
  await hre.run(TASK_EXPORT_ABIS);
});

task(TASK_EXPORT_ABIS, async (_args, hre) => {
  const srcDir = path.basename(hre.config.paths.sources);
  const outDir = path.join(hre.config.paths.root, 'abis');

  const [artifactNames] = await Promise.all([
    hre.artifacts.getAllFullyQualifiedNames(),
    fs.mkdir(outDir, { recursive: true }),
  ]);

  await Promise.all(
    artifactNames.map(async (fqn) => {
      const { abi, contractName, sourceName } = await hre.artifacts.readArtifact(fqn);
      if (abi.length === 0 || !sourceName.startsWith(srcDir)) return;
      await fs.writeFile(`${path.join(outDir, contractName)}.json`, `${canonicalize(abi)}\n`);
    }),
  );
});

const config: HardhatUserConfig = {
  paths: {
    sources: './contracts/',
  },
  solidity: {
    version: '0.8.9',
    settings: {
      optimizer: {
        enabled: true,
        runs: (1 << 32) - 1,
      },
    },
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {},
    ganache: {
      url: 'http://localhost:8545',
      accounts: {
        // --deterministic
        mnemonic: 'myth like bonus scare over problem client lizard pioneer submit female collect',
        count: 10,
      },
    },
    'emerald-testnet': {
      url: 'https://testnet.emerald.oasis.dev',
      accounts: process.env.EMERALD_TESTNET_PRIVATE_KEY
        ? [process.env.EMERALD_TESTNET_PRIVATE_KEY]
        : [],
    },
    'emerald-mainnet': {
      url: 'https://emerald.oasis.dev',
      accounts: process.env.EMERALD_MAINNET_PRIVATE_KEY
        ? [process.env.EMERALD_MAINNET_PRIVATE_KEY]
        : [],
    },
  },
  watcher: {
    compile: {
      tasks: ['compile'],
      files: ['./contracts/'],
    },
    test: {
      tasks: ['test'],
      files: ['./contracts/', './test'],
    },
    coverage: {
      tasks: ['coverage'],
      files: ['./contracts/', './test'],
    },
  },
  mocha: {
    require: ['ts-node/register/files'],
    timeout: 20000,
  },
};

export default config;
