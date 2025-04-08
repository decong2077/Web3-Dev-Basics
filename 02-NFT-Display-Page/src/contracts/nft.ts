// NFT合约接口定义

// CryptoJunks NFT合约
export const CRYPTOJUNKS_ADDRESS = '0x1b1d15726d64c5027b627138f2bf051cc1EF2680'
export const CRYPTOJUNKS_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
]

// BoredApes NFT合约
export const BOREDAPES_ADDRESS = '0x6753a24b107Bc92af00a1F9995A6A6fbA6b12B73'
export const BOREDAPES_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
]

// Jouleverse网络配置
export const JOULEVERSE_NETWORK = {
  chainId: '0xe52',
  chainName: 'Jouleverse',
  rpcUrls: ['https://rpc.jnsdao.com:8503'],
  nativeCurrency: {
    name: 'Joule',
    symbol: 'J',
    decimals: 18
  }
}