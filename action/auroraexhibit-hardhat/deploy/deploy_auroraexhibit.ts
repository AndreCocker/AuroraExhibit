import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, log } = hre.deployments;

  const deployed = await deploy("AuroraExhibit", {
    from: deployer,
    log: true,
  });

  log(`AuroraExhibit contract: ${deployed.address}`);
};

export default func;
func.id = "deploy_auroraexhibit"; // prevent reexecution
func.tags = ["AuroraExhibit"];


