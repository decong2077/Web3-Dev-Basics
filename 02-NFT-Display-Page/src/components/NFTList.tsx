import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import {
  CRYPTOJUNKS_ADDRESS,
  CRYPTOJUNKS_ABI,
  BOREDAPES_ADDRESS,
  BOREDAPES_ABI,
  JOULEVERSE_NETWORK
} from '../contracts/nft'

interface NFTMetadata {
  name?: string
  description?: string
  image?: string
}

interface NFT {
  contractName: string
  tokenId: string
  tokenURI: string
  metadata?: NFTMetadata
}

export function NFTList({ address }: { address: string }) {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(false)
  const [loadedCount, setLoadedCount] = useState(0)
  const [processedNFTs, setProcessedNFTs] = useState(new Set<string>())

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

  const fetchNFTs = async () => {
    if (!address) return
    
    setLoading(true)
    setNfts([])
    setLoadedCount(0)
    setProcessedNFTs(new Set<string>())

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
            const nftKey = `${contract.name}-${tokenId.toString()}`
            
            // 检查NFT是否已经处理过
            let isProcessed = false
            setProcessedNFTs(prev => {
              if (prev.has(nftKey)) {
                isProcessed = true
                return prev
              }
              return new Set(prev).add(nftKey)
            })

            // 如果已经处理过，直接跳过
            if (isProcessed) return

            const tokenURI = await nftContract.tokenURI(tokenId)
            try {
              const response = await fetch(tokenURI)
              const metadata = await response.json()
              const newNFT = {
                contractName: contract.name,
                tokenId: tokenId.toString(),
                tokenURI,
                metadata
              }
              
              // 确保不重复添加NFT
              setNfts(prev => {
                const exists = prev.some(nft => 
                  nft.contractName === newNFT.contractName && 
                  nft.tokenId === newNFT.tokenId
                )
                if (exists) return prev
                return [...prev, newNFT]
              })
              setLoadedCount(prev => prev + 1)
            } catch (error) {
              console.error('Error fetching metadata:', error)
              setProcessedNFTs(prev => {
                const newSet = new Set(prev)
                newSet.delete(nftKey)
                return newSet
              })
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

  useEffect(() => {
    if (address) {
      fetchNFTs()
    }
  }, [address])

  if (!address) return null

  return (
    <div className="nft-list" style={{ padding: '20px' }}>
      <h2>我的NFT列表</h2>
      {loading ? (
        <p>已加载 {loadedCount} 个NFT...</p>
      ) : nfts.length > 0 ? (
        <div>
          {['CryptoJunks', 'BoredApes'].map(contractName => (
            <div key={contractName} className="nft-category">
              <h3>{contractName}</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                margin: '20px 0'
              }}>
                {nfts
                  .filter(nft => nft.contractName === contractName)
                  .map((nft, index) => (
                    <div key={index} style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '10px',
                      textAlign: 'center'
                    }}>
                      <p>NFT #{nft.tokenId}</p>
                      {nft.metadata?.image && (
                        <div style={{
                          width: '150px',
                          height: '150px',
                          margin: '0 auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <img 
                            src={nft.metadata.image} 
                            alt={`NFT #${nft.tokenId}`}
                            style={{
                              maxWidth: '150px',
                              maxHeight: '150px',
                              width: 'auto',
                              height: 'auto',
                              objectFit: 'contain'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>暂无NFT</p>
      )}
    </div>
  )
}