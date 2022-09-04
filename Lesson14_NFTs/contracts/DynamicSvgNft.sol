// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "base64-sol/base64.sol";

contract DynamicSvgNft is ERC721 {
    /*//////////////////////////////////////////////////////////////
						     CONSTANTS
    //////////////////////////////////////////////////////////////*/

    string private constant BASE64_ENCODED_SVG_PREFIX =
        "data:image/svg+xml;base64,";

    string private constant BASE64_ENCODED_JSON_PREFIX =
        "data:application/json;base64,";

    /*//////////////////////////////////////////////////////////////
							   STATE
    //////////////////////////////////////////////////////////////*/

    uint256 private s_tokenCounter;

    string private s_lowImageUri;

    string private s_highImageUri;

    AggregatorV3Interface internal immutable i_priceFeed;

    mapping(uint256 => int256) public s_tokenIdToHighValue;

    /*//////////////////////////////////////////////////////////////
							   EVENTS
    //////////////////////////////////////////////////////////////*/

    event CreatedNft(uint256 indexed tokenId, int256 highValue);

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721("DynamicSvgNft", "DSN") {
        s_tokenCounter = 0;
        s_lowImageUri = svgImageToUri(lowSvg);
        s_highImageUri = svgImageToUri(highSvg);
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    /*//////////////////////////////////////////////////////////////
                             SVG LOGIC
    //////////////////////////////////////////////////////////////*/

    function svgImageToUri(string memory svg)
        public
        pure
        returns (string memory)
    {
        // abi.encodePacked()
        // -
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );
        // combining 2 strings together
        return
            string(
                abi.encodePacked(BASE64_ENCODED_SVG_PREFIX, svgBase64Encoded)
            );
    }

    /*//////////////////////////////////////////////////////////////
                           MINTING LOGIC
    //////////////////////////////////////////////////////////////*/

    function mintNft(int256 highValue) public {
        s_tokenIdToHighValue[s_tokenCounter] = highValue;
        s_tokenCounter = s_tokenCounter + 1;

        _safeMint(msg.sender, s_tokenCounter);

        emit CreatedNft(s_tokenCounter, highValue);
    }

    /*//////////////////////////////////////////////////////////////
                               ERC721
    //////////////////////////////////////////////////////////////*/

    function _baseURI() internal pure override returns (string memory) {
        return BASE64_ENCODED_JSON_PREFIX;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        // _exists comes from the ERC721
        require(_exists(tokenId), "URI Query for non-existant token");
        // string memory imageUri = "Change Me";
        (, int256 price, , , ) = i_priceFeed.latestRoundData();

        string memory imageURI = s_lowImageUri;

        if (price >= s_tokenIdToHighValue[tokenId]) {
            imageURI = s_highImageUri;
        }

        // This encodes JSON to Base64 which we can use in the URL of browser
        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(),
                                '", "description":"An NFT that changes based on Chainlink feed", ',
                                '"attributes": [{"trait_type": "coolness", "value": 100}], "image": "',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    /*//////////////////////////////////////////////////////////////
								GETS
    //////////////////////////////////////////////////////////////*/
}
