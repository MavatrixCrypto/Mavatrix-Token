const Migrations = artifacts.require("Migrations");

module.exports = async (deployer, net, accounts) => {
    deployer.deploy(Migrations);
};