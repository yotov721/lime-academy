import { ethers } from "hardhat";
export async function main(_privateKey) {
    const wallet = new ethers.Wallet(_privateKey, ethers.provider); // New wallet with the privateKey passed from CLI as param
    const NFT_factory = await ethers.getContractFactory("NFT");
    console.log("Deploying contracts with the account:", wallet.address); // We are printing the address of the deployer
    const nft = await NFT_factory.connect(wallet).deploy();
    await nft.waitForDeployment();
    console.log(`The NFT contract is deployed to ${nft.target}`);

    const uri = "https://ipfs.io/ipfs/QmPcec8Ps5VBxc5VVJMuZ3DDwt7hNK6uBNaMDbGoEkDiyF";
    await nft.safeMint(uri, wallet.address);
    const uriFromContract = await nft.tokenURI(1);
    console.log("The toke URI is ", uriFromContract);
    const owner = await nft.ownerOf(1);
    console.log("The owner of the token with id 1 is ", owner);
}
