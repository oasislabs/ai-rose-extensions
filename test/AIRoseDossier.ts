import { FakeContract, smock } from '@defi-wonderland/smock';
import chai, { expect } from 'chai';
import { ethers } from 'hardhat';

import { AIRoseDossier, IERC721 } from '../typechain-types';

chai.use(smock.matchers);

type Address = string;

const AI_ROSE_ADDR = '0x0f4c5A429166608f9225E094F7E66B0bF68a53B9';

describe('AIRoseDossier', () => {
  let aiRose: FakeContract<IERC721>;

  let alice: Address;
  let bob: Address;

  let dossier: AIRoseDossier;
  let dossierByAlice: AIRoseDossier;
  let dossierByBob: AIRoseDossier;

  before(async () => {
    aiRose = await smock.fake('IERC721', { address: AI_ROSE_ADDR });
    const AIRoseDossier = await ethers.getContractFactory('AIRoseDossier');
    dossier = (await AIRoseDossier.deploy()) as AIRoseDossier;
    const signers = await ethers.getSigners();

    alice = signers[1].address;
    bob = signers[2].address;

    dossierByAlice = dossier.connect(signers[1]);
    dossierByBob = dossier.connect(signers[2]);
  });

  it('rejects non-owner', async () => {
    aiRose.ownerOf.returns(bob);
    await expect(dossierByAlice.writeDossier(1, 'hello')).revertedWith('not owner');
    aiRose.ownerOf.reverts();
    await expect(dossierByBob.writeDossier(1, 'first!!1one!')).reverted;
  });

  it('allows current owner', async () => {
    aiRose.ownerOf.whenCalledWith(0).returns(alice);
    aiRose.ownerOf.whenCalledWith(1).returns(bob);

    await expect(dossierByAlice.writeDossier(0, 'Alice was here'))
      .to.emit(dossier, 'DossierUpdated')
      .withArgs(0, alice);

    await expect(dossierByBob.writeDossier(1, 'Bob was here'))
      .to.emit(dossier, 'DossierUpdated')
      .withArgs(1, bob);

    aiRose.ownerOf.whenCalledWith(0).returns(bob);
    await expect(dossierByBob.writeDossier(0, 'Bob was here'))
      .to.emit(dossier, 'DossierUpdated')
      .withArgs(0, bob);
    await expect(dossierByBob.writeDossier(0, 'Bob was here, too'))
      .to.emit(dossier, 'DossierUpdated')
      .withArgs(0, bob);

    const dossierEntry0 = await dossier.callStatic.dossier(0 /* tokenId */, 0 /* index */);
    expect(dossierEntry0.writer).to.eql(alice);
    expect(dossierEntry0.note).to.eql('Alice was here');

    const dossierEntry1 = await dossier.callStatic.dossier(0 /* tokenId */, 1 /* index */);
    expect(dossierEntry1.writer).to.eql(bob);
    expect(dossierEntry1.note).to.eql('Bob was here, too');

    const latestDossierEntry = await dossier.callStatic.latestEntry(0 /* token id */);
    expect(latestDossierEntry).to.eql(dossierEntry1);

    await expect(dossierByBob.clearDossier(0)).to.emit(dossier, 'DossierUpdated').withArgs(0, bob);
    await expect(dossier.callStatic.dossier(0, 1)).reverted;
  });
});
