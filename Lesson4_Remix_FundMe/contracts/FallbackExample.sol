// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract FallbackExample {
	uint256 public result;

	// can send this ETH through Low Level Interactions in Remix
	// because fund() wasn't called this receive function will be called.
	receive() external payable {
		result = 1;
	}

	// if the contract doesn't know what the user is trying to do it will
	// then it will just fallback to this function
	fallback() external payable {
		result = 2;
	}

	// How it decides
	// Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \ 
    //         yes  no
    //         /     \
    //    receive()?  fallback() 
    //     /   \ 
    //   yes   no
    //  /        \
    //receive()  fallback()
}