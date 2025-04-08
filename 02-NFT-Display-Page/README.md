# Web3开发入门（2）：构建一个NFT展示页面

## 项目背景

在上一个项目中，我们实现了Web3钱包的连接功能，让用户能够通过MetaMask钱包与我们的应用进行交互。这为我们进一步开发Web3应用奠定了基础。

本项目将在此基础上，实现一个NFT资产展示页面。我们将连接到Jouleverse网络，并展示用户在该网络上拥有的CryptoJunks和BoredApes两个NFT系列的资产。

## 技术栈

- React + TypeScript：构建用户界面
- Vite：项目构建工具
- ethers.js：与区块链交互的Web3库
- CSS Grid：响应式布局

## 开发流程

### 1. 配置Jouleverse网络

首先，我们需要配置Jouleverse网络参数，让用户能够连接到正确的网络：

```typescript
export const JOULEVERSE_NETWORK = {
  chainId: '0xe52', // 3666的16进制表示
  chainName: 'Jouleverse',
  rpcUrls: ['https://rpc.jnsdao.com:8503'],
  nativeCurrency: {
    name: 'Joule',
    symbol: 'J',
    decimals: 18
  }
}
```

### 2. 智能合约集成

为了获取用户的NFT资产，我们需要与NFT智能合约进行交互。这里我们使用了两个NFT合约：

```typescript
// CryptoJunks NFT合约
export const CRYPTOJUNKS_ADDRESS = '0x1b1d15726d64c5027b627138f2bf051cc1EF2680'

// BoredApes NFT合约
export const BOREDAPES_ADDRESS = '0x6753a24b107Bc92af00a1F9995A6A6fbA6b12B73'

// 合约ABI（两个合约使用相同的接口）
export const CRYPTOJUNKS_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
]

// BoredApes NFT合约
export const BOREDAPES_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
]
```

### 3. 关键功能实现

#### 网络切换
在连接钱包后，我们需要确保用户在Jouleverse网络上：

```typescript
const switchNetwork = async () => {
  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [JOULEVERSE_NETWORK]
  })
}
```

#### NFT资产获取
通过合约方法获取用户的NFT：
1. `balanceOf`: 获取用户拥有的NFT数量
2. `tokenOfOwnerByIndex`: 获取用户拥有的NFT的tokenId
3. `tokenURI`: 获取NFT的元数据URI

#### 批量处理和并发控制
为了提高性能，我们实现了批量处理和并发控制：

```typescript
const batchSize = 5;
for (let i = 0; i < tokenPromises.length; i += batchSize) {
  const batch = tokenPromises.slice(i, i + batchSize);
  await Promise.all(batch.map(promise => promise()));
}
```

## 重要知识点

### 1. 网络切换
使用`wallet_addEthereumChain`方法添加和切换到Jouleverse网络。这个过程通常需要处理各种可能的错误情况：

```typescript
const switchNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [JOULEVERSE_NETWORK]
    })
  } catch (error) {
    console.error('Failed to switch network:', error)
  }
}
```

### 2. 合约交互
Web3开发中最关键的部分是与智能合约的交互。这里展示如何初始化合约和调用合约方法：

```typescript
import { ethers } from 'ethers'

// 初始化Provider
const provider = new ethers.BrowserProvider(window.ethereum)

// 初始化NFT合约
const nftContract = new ethers.Contract(contract.address, contract.abi, provider)

// 获取用户的NFT
const fetchNFTs = async () => {
  if (!address) return
  
  setLoading(true)
  setNfts([])
  setLoadedCount(0)

  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    await switchNetwork()
    
    const contracts = [
      { name: 'CryptoJunks', address: CRYPTOJUNKS_ADDRESS, abi: CRYPTOJUNKS_ABI },
      { name: 'BoredApes', address: BOREDAPES_ADDRESS, abi: BOREDAPES_ABI }
    ]

    for (const contract of contracts) {
      const nftContract = new ethers.Contract(contract.address, contract.abi, provider)
      const balance = await nftContract.balanceOf(address)

      const tokenPromises = []
      for (let i = 0; i < Number(balance); i++) {
        tokenPromises.push(async () => {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i)
          const tokenURI = await nftContract.tokenURI(tokenId)
          try {
            const response = await fetch(tokenURI)
            const metadata = await response.json()
            const nft = {
              contractName: contract.name,
              tokenId: tokenId.toString(),
              tokenURI,
              metadata
            }
            setNfts(prev => [...prev, nft])
            setLoadedCount(prev => prev + 1)
          } catch (error) {
            console.error('Error fetching metadata:', error)
          }
        })
      }

      // Execute promises concurrently with a limit of 5 at a time
      const batchSize = 5
      for (let i = 0; i < tokenPromises.length; i += batchSize) {
        const batch = tokenPromises.slice(i, i + batchSize)
        await Promise.all(batch.map(promise => promise()))
      }
    }
  } catch (error) {
    console.error('Error fetching NFTs:', error)
  } finally {
    setLoading(false)
  }
}
```

### 3. NFT元数据处理
获取和处理NFT元数据是展示NFT的关键步骤：

```typescript
const getNFTMetadata = async (tokenId: number) => {
  try {
    // 获取元数据URI
    const tokenURI = await nftContract.tokenURI(tokenId)
    
    // 获取元数据JSON
    const response = await fetch(tokenURI)
    const metadata = await response.json()
    
    return {
      id: tokenId,
      name: metadata.name,
      description: metadata.description,
      image: metadata.image
    }
  } catch (error) {
    console.error(`获取Token ${tokenId}的元数据失败:`, error)
    return null
  }
}
```

### 4. 批量处理与并发控制
在处理大量NFT时，需要考虑性能和并发控制：

```typescript
const batchLoadNFTs = async (tokenIds: number[]) => {
  const batchSize = 5
  const allNFTs = []
  
  for (let i = 0; i < tokenIds.length; i += batchSize) {
    const batch = tokenIds.slice(i, i + batchSize)
    const batchPromises = batch.map(id => getNFTMetadata(id))
    
    // 并发处理当前批次
    const batchResults = await Promise.all(batchPromises)
    allNFTs.push(...batchResults.filter(nft => nft !== null))
    
    // 添加延迟避免请求过于频繁
    if (i + batchSize < tokenIds.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  return allNFTs
}
```

### 5. React状态管理
在React组件中管理NFT数据和加载状态：

```typescript
const NFTGallery: React.FC = () => {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const loadNFTs = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const address = await signer.getAddress()
        const tokenIds = await getNFTs(address)
        const nftData = await batchLoadNFTs(tokenIds)
        
        setNfts(nftData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    loadNFTs()
  }, [])
  
  // 渲染逻辑...
}
```

### 6. 合约事件监听
监听NFT转移等事件以保持UI同步：

```typescript
const setupEventListeners = () => {
  // 监听Transfer事件
  nftContract.on('Transfer', (from, to, tokenId) => {
    if (to === currentAddress) {
      // 收到新的NFT，更新列表
      getNFTMetadata(tokenId).then(newNFT => {
        if (newNFT) {
          setNfts(prev => [...prev, newNFT])
        }
      })
    } else if (from === currentAddress) {
      // NFT被转出，从列表中移除
      setNfts(prev => prev.filter(nft => nft.id !== tokenId))
    }
  })
  
  // 清理函数
  return () => {
    nftContract.removeAllListeners()
  }
}
```

## 运行项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 扩展思考

完成NFT展示页面后，我们可以考虑添加更多功能：
1. NFT交易功能
2. NFT铸造功能
3. NFT详情页面

## 源代码获取

完整代码已经开源在GitHub上，大家可以访问我的GitHub仓库：[Web3-Dev-Basics](https://github.com/decong2077/Web3-Dev-Basics)，直接查看或下载完整的源代码和文档。

通过本项目，我们不仅学习了如何展示NFT，还掌握了与智能合约交互、处理区块链数据等重要的Web3开发技能。这些都为后续开发更复杂的DApp打下了基础。
