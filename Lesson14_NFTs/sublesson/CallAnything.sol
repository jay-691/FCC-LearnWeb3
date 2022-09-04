// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.9;

// For more details visit:
// https://github.com/PatrickAlphaC/hardhat-nft-fcc/blob/main/contracts/sublesson/CallAnything.sol

contract CallAnything {
    address public s_someAddress;
    uint256 public s_amount;

    function transfer(address someAddress, uint256 amount) public {
        s_someAddress = someAddress;
        s_amount = amount;
    }

    // turns string into function selector
    // e.g. 0xa9059cbb
    function getSelectorOne() public pure returns (bytes4 selector) {
        selector = bytes4(keccak256(bytes("transfer(address,uint256)")));
    }

    // encodes the selector and its params, address and amount
    function getDataToCallTransfer(address someAddress, uint256 amount)
        public
        pure
        returns (bytes memory)
    {
        return abi.encodeWithSelector(getSelectorOne(), someAddress, amount);
    }

    // call the transfer function and auto populate its params using the encoded selector
    function callTransferFunctionWithBinary(address someAddress, uint256 amount)
        public
        returns (bytes4, bool)
    {
        (bool success, bytes memory returnData) = address(this).call(
            abi.encodeWithSelector(getSelectorOne(), someAddress, amount)
        );
        return (bytes4(returnData), success);
    }

    // With signature does the same thing but without have to do
    // bytes4(keccak256(bytes())) first
    // Best not to do calls like this as it is low level
    // you cant rely on the saftey of the compiler this way
    function callTransferFunctionWithBinarySignature(
        address someAddress,
        uint256 amount
    ) public returns (bytes4, bool) {
        (bool success, bytes memory returnData) = address(this).call(
            abi.encodeWithSignature(
                "transfer(address,uint256)",
                someAddress,
                amount
            )
        );
        return (bytes4(returnData), success);
    }
}
