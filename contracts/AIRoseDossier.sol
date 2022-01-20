// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/interfaces/IERC721.sol";

/// @title An extension to AI Rose that allows owners to record a message in their rose's dossier.
/// @custom:security-contact ai-rose@oasislabs.com
contract AIRoseDossier {
    /// @notice Emitted when a current AI Rose owner writes to their tokens' dossier.
    event DossierUpdated(uint256 indexed tokenId, address writer);

    struct DossierEntry {
        /// @dev The owner of the AI Rose that wrote this note.
        address writer;
        string note;
    }

    /// @notice The address of the AI Rose NFT contract.
    IERC721 public aiRose = IERC721(0x0f4c5A429166608f9225E094F7E66B0bF68a53B9);

    /// @notice The notes written by a current or past owner of AI Rose.
    /// @notice It is understood that re-purchasing an AI Rose grants a new dossier entry.
    /// @dev { tokenId => message }
    mapping(uint256 => DossierEntry[]) public dossier;

    /// @notice If you are the AI Rose owner, this method writes or updates your current note.
    /// @param tokenId Your AI Rose's `tokenId`.
    /// @param note Your dossier entry.
    function writeDossier(uint256 tokenId, string calldata note) external {
        require(aiRose.ownerOf(tokenId) == msg.sender, "not owner");
        DossierEntry[] storage tokenDossier = dossier[tokenId];
        uint256 dossierLen = tokenDossier.length;
        if (
            dossierLen == 0 || tokenDossier[dossierLen - 1].writer != msg.sender
        ) {
            tokenDossier.push(DossierEntry({writer: msg.sender, note: note}));
        } else {
            tokenDossier[dossierLen - 1].note = note;
        }
        emit DossierUpdated(tokenId, msg.sender);
    }

    /// @notice If you are the AI Rose owner, this method removes your most recent note.
    /// @param tokenId Your AI Rose's `tokenId`.
    function clearDossier(uint256 tokenId) external {
        // require(aiRose.ownerOf(tokenId) == msg.sender, "not owner");
        DossierEntry[] storage tokenDossier = dossier[tokenId];
        require(
            tokenDossier[tokenDossier.length - 1].writer == msg.sender,
            "no existing note"
        );
        tokenDossier.pop();
        emit DossierUpdated(tokenId, msg.sender);
    }

    /// @notice Returns the latest dossier entry for the AI Rose.
    /// @param tokenId The AI Rose's `tokenId`.
    function latestEntry(uint256 tokenId)
        external
        view
        returns (DossierEntry memory)
    {
        DossierEntry[] storage tokenDossier = dossier[tokenId];
        return tokenDossier[tokenDossier.length - 1];
    }
}
