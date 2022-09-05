import { ethers } from "./ethers-5.6.esm.min.js";
import { ABI, CONTRACT_ADDRESS } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
  if (typeof window.ethereum != null) {
    // connects to metamask
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    console.log("Wallet Connected");
    document.getElementById(
      "connectButton"
    ).innerHTML = `${accounts[0].substring(0, 6)}...${accounts[0].substr(
      accounts[0].length - 4
    )}`;
  } else {
    console.log("Please download an ethereum wallet.");
    document.getElementById("connectButton").innerHTML = "No Wallet";
  }
}

async function getBalance() {
  if (typeof window.ethereum != null) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(CONTRACT_ADDRESS);
    console.log(ethers.utils.formatEther(balance));
  }
}

async function withdraw() {
  if (typeof window.ethereum != null) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    try {
      const txResponse = await contract.withdraw();
      await listenForTransactionMined(txResponse, provider);
    } catch (error) {
      console.error(error);
    }
  }
}

async function fund() {
  const ethAmmount = document.getElementById("ethAmount").value;
  console.log(ethAmmount);
  if (typeof window.ethereum != null) {
    // provider / connection to blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // signer / wallet / someone with gas
    const signer = provider.getSigner();
    // console.log(signer);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    try {
      const txResponse = await contract.fund({
        value: ethers.utils.parseUnits(ethAmmount, 18),
      });
      await listenForTransactionMined(txResponse, provider);
    } catch (error) {
      console.error(error);
    }
  }
}

function listenForTransactionMined(txResponse, provider) {
  console.log("Mining %s...", txResponse.hash);
  // listen for transaction to finish
  // once listens for event and once event then it fires response
  return new Promise((resolve, reject) => {
    provider.once(txResponse.hash, (txReceipt) => {
      console.log("Completed with %s confirmations", txReceipt.confirmations);
    });
    resolve();
  });
}
