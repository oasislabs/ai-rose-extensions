import type { Signer } from 'ethers';
import type { Provider } from '@ethersproject/providers';

import { AIRoseDossier as AIRoseDossierContract } from '../typechain-types/AIRoseDossier';
import { AIRoseDossier__factory } from '../typechain-types/factories/AIRoseDossier__factory';

export const AIRoseDossier = {
  address: process.env.AI_ROSE_DOSSIER ?? 'TODO',

  connect(signerOrProvider: Signer | Provider): AIRoseDossierContract {
    return AIRoseDossier__factory.connect(AIRoseDossier.address, signerOrProvider);
  },
};
