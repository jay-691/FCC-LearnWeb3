const { getNamedAccounts, ethers } = require("hardhat");
const { getWeth, AMOUNT } = require("../scripts/getWeth");

async function getLendingPool(account) {
  const lendingPoolAddressesProvider = await ethers.getContractAt(
    "ILendingPoolAddressProvider",
    "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
    account
  );
  const lendingPoolAddress =
    await lendingPoolAddressesProvider.getLendingPool();
  const lendingPool = await ethers.getContractAt(
    "ILendingPool",
    lendingPoolAddress,
    account
  );
  return lendingPool;
}

async function approveErc20(
  erc20Address,
  spenderAddress,
  amountToSpend,
  account
) {
  const erc20Token = await ethers.getContractAt(
    "IERC20",
    erc20Address,
    account
  );
  const tx = await erc20Token.approve(spenderAddress, amountToSpend);
  await tx.wait(1);
  console.log("Approved!");
}

async function getBorrowUserData(lendingPoolContract, account) {
  const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
    await lendingPoolContract.getUserAccountData(account);
  console.log(`You have ${totalCollateralETH} worth of ETH deposited.`);
  console.log(`You have ${totalDebtETH} worth of ETH borrowed`);
  console.log(`You can borrow ${availableBorrowsETH} worth of ETH`);
  return { availableBorrowsETH, totalDebtETH };
}

async function getDIAPrice() {
  // dont need signer (deployer) as we're only reading
  const diaEthPriceFeed = await ethers.getContractAt(
    "AggregatorV3Interface",
    "0x773616E4d11A78F511299002da57A0a94577F1f4"
  );
  const price = await diaEthPriceFeed.latestRoundData()[1];
  console.log("The DAI/ETH price is", price);
}

async function borrowDia(
  diaAddress,
  lendingPool,
  amountDiaToBorrowWei,
  account
) {
  const borrowTx = await lendingPool.borrow(
    diaAddress,
    amountDiaToBorrowWei,
    1,
    0,
    account
  );
  await borrowTx.wait(1);
  console.log("Youve borrowed");
}

async function repay(amount, diaAddress, lendingPool, account) {
  await approveErc20(diaAddress, lendingPool.address, amount, account);

  const repayTx = await lendingPool.repay(diaAddress, amount, 1, account);
  await repayTx.wait(1);
  console.log("Repayed");
}

async function main() {
  // the protocol treats everything as an ERC20 token
  await getWeth();
  const { deployer } = await getNamedAccounts();
  // abi, address
  // Lending Pool Address Provider: 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
  const lendingPool = await getLendingPool(deployer);
  console.log("LendingPool address", lendingPool.address);

  // deposit
  const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  // approve aave contract
  await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer);
  console.log("Depositing...");
  // check AAVE documentation for deposit params
  await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0);
  console.log("Deposited!");
  let { availableBorrowsETH, totalDebtETH } = await getLendingPool(
    lendingPool,
    deployer
  );
  const diaPrice = await getDIAPrice();
  // converting eth to dia
  // 0.95 means getting 95% of what we can borrow
  const amountDiaToBorrow =
    availableBorrowsETH.toString() * 0.95 * (1 / diaPrice.toNumber());
  console.log("You can borrow s% DIA", amountToBorrow);
  const amountDiaToBorrowWei = ethers.utils.parseEther(
    amountDiaToBorrow.toString()
  );
  // Borrow
  const diaTokenAddress = "0x6b175474e89094c44da98b954eedeac495271d0f";
  await borrowDia(diaTokenAddress, lendingPool, amountDiaToBorrowWei, deployer);
  await getBorrowUserData(lendingPool, deployer);
  console.log("Borrowed!");

  // repay some of what we borrow
  await repay(amountDiaToBorrowWei, diaTokenAddress, lendingPool, deployer);
  await getBorrowUserData(lendingPool, deployer);
  // after this you will see that not all has been repayed.
  // this is because we accumilated interest
  // we need something like uniswap to turn our eth to dia to pay back the rest
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
