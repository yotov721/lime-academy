import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const lazyImport = async (module: any) => {
  return await import(module);
};

task("deploy", "Deploys contracts").setAction(async () => {
  const { deploy } = await lazyImport("./tasks/index");
  await deploy();
});

task("deploy-locally", "Deploys contracts").setAction(async () => {
  const { deployLocally } = await lazyImport("./tasks/index");
  await deployLocally();
});

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
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
