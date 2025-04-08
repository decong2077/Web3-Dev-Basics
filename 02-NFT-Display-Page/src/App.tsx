import { useState } from 'react'
import { ethers } from 'ethers'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { NFTList } from './components/NFTList'
import { JOULEVERSE_NETWORK } from './contracts/nft'
function App() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        await provider.send("eth_requestAccounts", [])
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [JOULEVERSE_NETWORK]
        })
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        setIsConnected(true)
        setWalletAddress(address)
      } else {
        alert('请安装MetaMask钱包!')
      }
    } catch (error) {
      console.error(error)
    }
  }
  const disconnectWallet = () => {
    setIsConnected(false)
    setWalletAddress('')
  }
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>NFT展示页面</h1>
      <div className="card">
        <button 
          onClick={isConnected ? disconnectWallet : connectWallet}
          style={{ marginBottom: '1rem' }}
        >
          {isConnected ? '断开连接钱包' : '连接钱包'}
        </button>
        {isConnected && (
          <>
            <p>已连接钱包：{`${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}`}</p>
            <NFTList address={walletAddress} />
          </>
        )}
      </div>
    </>
  )
}
export default App
