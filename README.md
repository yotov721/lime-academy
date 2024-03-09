# LimeAcademy
`npx hardhat deploy --network sepolia` <br/>

The BookLibrary contract is deployed to:  0xd973670e9aA4a14865eA806f618B0073C11d7965

`npx hardhat verify --network sepolia 0xd973670e9aA4a14865eA806f618B0073C11d7965` <br/>

Successfully submitted source code for contract
contracts/BookLibrary.sol:BookLibrary at 0xd973670e9aA4a14865eA806f618B0073C11d7965
for verification on the block explorer. Waiting for verification result...

Successfully verified contract BookLibrary on the block explorer.
https://sepolia.etherscan.io/address/0xd973670e9aA4a14865eA806f618B0073C11d7965#code

## Verified contract: 
https://sepolia.etherscan.io/address/0xd973670e9aA4a14865eA806f618B0073C11d7965#code

## Install slither
`pip install slither-analyzer` <br>
Add the following to path <br>
`C:\Users\{USER}\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.10_qbz5n2kfra8p0\LocalCache\Local-packages\Python310\Scripts`

Run locally: <br>
`slither . --checklist > checklist_report.md` <br>
