const solc = require("solc");
const fs = require("fs");
const {Web3} = require("web3");

const web3 = new Web3(new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545"));

// Reading the file contents of the smart contract asynchronously
fs.readFile("demo.sol", "utf8", (err, fileContent) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  console.log("File Content:", fileContent);

  // Create an input structure for the Solidity compiler
  const input = {
    language: "Solidity",
    sources: {
      "demo.sol": {
        content: fileContent,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["*"],
        },
      },
    },
  };

  // Compile the Solidity code
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  console.log("Output:", output);

  // Extract ABI and bytecode from the compiled output
  const ABI = output.contracts["demo.sol"]["demo"].abi;
  const bytecode = output.contracts["demo.sol"]["demo"].evm.bytecode.object;
  console.log("Bytecode:", bytecode);
  console.log("ABI:", ABI);

  // Deploy the contract
  const contract = new web3.eth.Contract(ABI);
  let defaultAccount;
  web3.eth.getAccounts().then((accounts) => {
    console.log("Accounts:", accounts);

    defaultAccount = accounts[0];
    console.log("Default Account:", defaultAccount);
    contract
      .deploy({ data: "0x" + bytecode }) // Prefix bytecode with "0x"
      .send({ from: defaultAccount, gas: 470000 })
      .on("receipt", (receipt) => {
        console.log("Contract Address:", receipt.contractAddress);
      })
      .then((demoContract) => {
        // Since you're deploying a new contract, you won't have a contract instance here
        console.log("Contract Deployed Successfully!");
      })
      .catch((error) => {
        console.error("Error deploying contract:", error);
      });
  });
});
