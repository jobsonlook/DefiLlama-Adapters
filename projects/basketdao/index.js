const sdk = require("@defillama/sdk");
const {unwrapUniswapLPs} = require('../helper/unwrapLPs')
const BigNumber = require('bignumber.js')

const dpiToken = '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b'
const dpiEthToken = '0x4d5ef58aAc27d99935E5b6B4A6778ff292059991'
const bDPISLP = '0x8d782C5806607E9AAFB2AC38c1DA3838Edf8BD03'
const bDPIToken = '0x0309c98B1bffA350bcb3F9fB9780970CA32a5060'
const masterChef = '0xDB9daa0a50B33e4fe9d0ac16a1Df1d335F96595e'
const weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const continuousMigrator = '0x3f436dE9ef3f07b770c4DB45F60f9f1d323Bbf36'

async function tvl(timestamp, block) {
  let balances = {};
  const dpiLocked = sdk.api.erc20.balanceOf({
    target: dpiToken,
    owner: masterChef,
    block
  })
  const dpiLockedOnMigrator = sdk.api.erc20.balanceOf({
    target: dpiToken,
    owner: continuousMigrator,
    block
  })
  const dpiLPLocked = sdk.api.erc20.balanceOf({
    target: dpiEthToken,
    owner: masterChef,
    block
  })
  const bdpiSupply = sdk.api.erc20.totalSupply({
    target: bDPIToken,
    block
  })
  await unwrapUniswapLPs(balances, [{
    token: dpiEthToken,
    balance: (await dpiLPLocked).output
  }], block)
  sdk.util.sumSingleBalance(balances, dpiToken, (await dpiLocked).output)
  sdk.util.sumSingleBalance(balances, dpiToken, (await dpiLockedOnMigrator).output)

  try{
    sdk.util.sumSingleBalance(balances, bDPIToken, (await bdpiSupply).output)
  }catch(e){}
  return balances
}

module.exports = {
  tvl
}
