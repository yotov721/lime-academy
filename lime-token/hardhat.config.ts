import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const lazyImport = async (module: any) => {
  return await import(module);
};

task("deploy-lime", "Deploys LimeToken").setAction(async () => {
  const { main } = await lazyImport("./scripts/deploy-lime");
  await main();
});

const config: HardhatUserConfig = {
  solidity: "0.8.19",
};

export default config;
