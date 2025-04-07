import { useState } from 'react'
import { ethers } from 'ethers'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
function App() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        await provider.send("eth_requestAccounts", [])
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        setIsConnected(true)
        setWalletAddress(`${address.slice(0,6)}...${address.slice(-4)}`)
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
      <h1>Web3 钱包登录</h1>
      <div className="card">
        <button 
          onClick={isConnected ? disconnectWallet : connectWallet}
          style={{ marginBottom: '1rem' }}
        >
          {isConnected ? '断开连接钱包' : '连接钱包'}
        </button>
        {isConnected && (
          <p>已连接钱包：{walletAddress}</p>
        )}
      </div>
    </>
  )
}
export default App
