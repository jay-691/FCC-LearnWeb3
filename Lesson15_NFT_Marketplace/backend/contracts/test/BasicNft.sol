// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNft is ERC721 {
    /*//////////////////////////////////////////////////////////////
							 CONSTANTS
    //////////////////////////////////////////////////////////////*/

    string public constant TOKEN_URI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

    /*//////////////////////////////////////////////////////////////
							   STATE
    //////////////////////////////////////////////////////////////*/

    uint256 private s_tokenCounter;

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor() ERC721("Kuriboh", "KROB") {}

    /*//////////////////////////////////////////////////////////////
                           MINTING LOGIC
    //////////////////////////////////////////////////////////////*/

    function mintNft() public returns (uint256) {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
        return s_tokenCounter;
    }

    function tokenUri(
        uint256 /* tokenId */
    ) public view returns (string memory) {
        return TOKEN_URI;
    }

    /*//////////////////////////////////////////////////////////////
								GETS
    //////////////////////////////////////////////////////////////*/

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
