// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.9;

// Understanding abi.encodePacked()

// For more details visit:
// https://github.com/PatrickAlphaC/hardhat-nft-fcc/blob/main/contracts/sublesson/Encoding.sol

contract Encoding {
    constructor() {}

    function concatStrings() public pure returns (string memory) {
        // in 0.8.12+ you can do string.concat(stringA, stringB);
        // but here it encodes both strings together
        // then the string() decodes the encodePacked into a string
        // because they were encoded together, they have now been combined.
        return stirng(abi.encodePacked("Hello ", "World!"));
    }

    function encodeNumber() public pure returns (bytes memory) {
        // Encodes number to how computer would read the number 1
        // e.g. 0x000000000000000000000001
        bytes memory number = abi.encode(1);
        return number;
    }

    function encodeString() public pure returns (bytes memory) {
        // e.g. 0x000000000002000000234fd874fvw700000000
        bytes memory someString = abi.encode("some string");
        return someString;
    }

    function encodePackedString() public pure returns (bytes memory) {
        // encodePacked does the same thing as encode
        // but returns with a lot less characters
        // mostly removes all those unneeded 0s first
        // e,g, 0x2234fd874fvw7
        // This will save gas
        bytes memory someString = abi.encodePacked("some string");
        return someString;
    }

    function encodeStringBytes() public pure returns (bytes memory) {
        // casting the string into bytes
        // returns the same value as encodePacked in this example
        // but both do different things under the hood
        bytes memory someString = bytes("some string");
        return someString;
    }

    function decodeString() public pure returns (string memory) {
        string memory someString = abi.decode(encodeString(), (string));
        return someString;
    }

    function mutliEncode() public pure returns (bytes memory) {
        bytes memory someString = abi.encode("some string", "another string");
        return someString;
    }

    function multiDecode() public pure returns (string memory, string memory) {
        // can decode multiple values from encoded string
        // as long as we know how many were encoded in the first place
        (string memory someString, string memory anotherString) = abi.decode(
            mutliEncode(),
            (string, string)
        );
        return (someString, anotherString);
    }

    function mutliEncodePacked() public pure returns (bytes memory) {
        bytes memory someString = abi.encodePacked(
            "some string",
            "another string"
        );
        return someString;
    }

    // Cannot decode Packed as it removes some data to minimize size
    function multiDecodePacked() public pure returns (string memory) {
        string memory someString = abi.decode(mutliEncodePacked(), (string));
        return someString;
    }

    // But we can decode Packed by casting it to string
    // but this way it will concat the strings so we wont be able to get 2 strings back
    function mutliStringCastPacked() public pure returns (string memory) {
        string memory someString = string(mutliEncodePacked());
        return someString;
    }
}
