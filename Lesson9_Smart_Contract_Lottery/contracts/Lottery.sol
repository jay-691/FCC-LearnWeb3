// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// Contract on Etherscan
// https://rinkeby.etherscan.io/address/0x547D40BBfbD97a967b37CDF38F2BF7197da57ab7#code

/**
 * Objectives:
 * - Enter Lottery (paying amount to enter)
 * - Pick random winner (verifiably random)
 * - Winner to be selectedd every X minutes (automated)
 * - Use Chainlink Oracle. Randomness, Automated execution (Chainlink Keeper)
 */

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

error Lottery__NotEnoughEthEntered();
error Lottery__TransferFailed();
error Lottery__NotOpen();
error Lottery__UpkeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 LotteryState);

/// @title Lottery where players enter and after an amount of time a winner is chosen at random
/// @author Andrew Fletcher
/// @notice Creates Lottery contract
/// @dev Followed FreeCodeCamp Learn Blockchain, Solidity, and Full Stack Web3 Development
///      with JavaScript – 32-Hour Course
contract Lottery is VRFConsumerBaseV2, KeeperCompatibleInterface {
    /*//////////////////////////////////////////////////////////////
							   TYPES
    //////////////////////////////////////////////////////////////*/

    enum LotteryState {
        OPEN,
        CALCULATING
    } // Secrectly creating uint256 when 0 == OPEN, 1 == CALCULATING

    /*//////////////////////////////////////////////////////////////
							   STATE
    //////////////////////////////////////////////////////////////*/

    address payable[] private s_players;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    uint256 private immutable i_entranceFee;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;

    /*//////////////////////////////////////////////////////////////
						   LOTTERY STATE
    //////////////////////////////////////////////////////////////*/

    address private s_recentWinner;
    LotteryState private s_lotteryState;
    uint256 private s_lastTimestamp;
    uint256 private immutable i_interval;

    /*//////////////////////////////////////////////////////////////
                               EVENTS
    //////////////////////////////////////////////////////////////*/

    event LotteryEnter(address indexed player);
    event RequestedLotteryWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner);

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        address vrfCoordinatorV2, // contract
        uint256 entranceFee,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_entranceFee = entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_lotteryState = LotteryState.OPEN;
        s_lastTimestamp = block.timestamp;
        i_interval = interval;
    }

    /*//////////////////////////////////////////////////////////////
                           ENTERING LOGIC
    //////////////////////////////////////////////////////////////*/

    function enterLottery() public payable {
        if (msg.value < i_entranceFee) {
            revert Lottery__NotEnoughEthEntered();
        }
        if (s_lotteryState != LotteryState.OPEN) {
            revert Lottery__NotOpen();
        }
        s_players.push(payable(msg.sender));
        emit LotteryEnter(msg.sender);
    }

    /*//////////////////////////////////////////////////////////////
                          CHAINLINK LOGIC
    //////////////////////////////////////////////////////////////*/

    /// @dev This is the function that the Chainlink Keeper nodes call, they look for 'upkeepNeeded'
    ///      to return true.
    ///      The following hould be true in order to return true:
    ///       - Our time interval should have passed.
    ///       - The lottery should have at least 1 player, and have some ETH
    ///       - Our subscription is funded with LINK
    ///       - Lottery should be in open state
    function checkUpkeep(
        bytes memory /*checkData*/
    )
        public
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        bool isOpen = (LotteryState.OPEN == s_lotteryState);
        bool timePassed = ((block.timestamp - s_lastTimestamp) > i_interval);
        bool hasPlayers = (s_players.length > 0);
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (isOpen && timePassed && hasPlayers && hasBalance);
    }

    /// @notice Picks Winner
    /// @dev If its time to pick user (upkeepNeeded) set LotteryState to calculating then using
    ///      Chainlink return the request ID which we emit so frontend can use to pick winner from array.
    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert Lottery__UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_lotteryState)
            );
        }

        s_lotteryState = LotteryState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane, // keyHash - gas limit you're willing to pay
            i_subscriptionId,
            REQUEST_CONFIRMATIONS, // how many confirmations Chainlink should wait before res
            i_callbackGasLimit, // callbackGasLimit - how much gas to use for fulfillRandomWords()
            NUM_WORDS // how many words you want
        );

        // This is redundant as we can use the RequestId from the vrfCoordinator
        emit RequestedLotteryWinner(requestId);
    }

    function fulfillRandomWords(
        uint256, // requestId - Unused param so just put type in its place
        uint256[] memory randomWords
    ) internal override {
        /**
         * Use mod function to get random number out of players array.
         * Example:
         *  - s_players is size 10
         *  - randomNumber is 202
         *  202 % 10 = ?
         *  20 * 10 = 200
         *  2 is left over
         * 202 % 10 = 2
         */
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;
        s_lotteryState = LotteryState.OPEN;
        s_players = new address payable[](0); // reset players array after someones won
        s_lastTimestamp = block.timestamp;
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        if (!success) {
            revert Lottery__TransferFailed();
        }
        emit WinnerPicked(recentWinner);
    }

    /*//////////////////////////////////////////////////////////////
								GETS
    //////////////////////////////////////////////////////////////*/

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getLotteryState() public view returns (LotteryState) {
        return s_lotteryState;
    }

    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getLatestTimeStamp() public view returns (uint256) {
        return s_lastTimestamp;
    }

    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }
}
