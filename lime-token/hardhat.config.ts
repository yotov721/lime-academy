import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const lazyImport = async (module: any) => {
  return await import(module);
};

task("deploy-lime", "Deploys LimeToken").setAction(async () => {
  const { main } = await lazyImport("./scripts/deploy-lime");
  await main();
});

task("deploy-nft", "Deploys LimeToken")
  .addParam("privateKey", "Please provide the private key")
  .setAction(async ({ privateKey }) => {
    const { main } = await lazyImport("./scripts/deploy-nft");
    await main(privateKey);
  });

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    // Sepolia Testnet
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at <https://etherscan.io/>
    apiKey: "CHIRAADNUI814XIT9ST36R63UFNBNDKBDY"
  }
};

export default config;
