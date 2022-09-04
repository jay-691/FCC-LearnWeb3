// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SafeMathTester {
	// 255 is the biggest number uint8 can store.
	uint8 public bigNumber = 255;

	function add() public {
		// Will cause bigNumber to be 0.
		// This is becuase it cannot go higher so it will wrap around back to 0.
		// If this function is called 8 times bigNumber will equal 7.
		// Thats why a library called SafeMath was used in version 0.7.6
		// but in 0.8.0 the value of bigNumber is checked first then will throw error because of
		// user setting it to a number bigger the uint8.
		bigNumber = bigNumber + 1;
		// can force error not to throw with unchecked which will cause it to wrap around like in past versions
		// This is used in contracts when the coder knows the value wont overflow.
		// This is used because it saves on gas.
		unchecked {
			bigNumber = bigNumber + 1;
		}
	}
}