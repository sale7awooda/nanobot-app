import React, { useState, useEffect, useRef } from 'react'
import {
  MessageCircle, Send, User, Lock, LogOut, Sparkles,
  Zap, FileText, Cloud, Calendar, Github, Search, Bot, Globe, Clock, Terminal, BookOpen
} from 'lucide-react'

const STORAGE_KEY = 'nanobot_user'
const CHATS_KEY = 'nanobot_chats'
const DEFAULT_USER = { username: 'Awooda', password: 'Sale7k0cash' }

const API_URL = import.meta.env.VITE_API_URL || 'https://bunny-promiseful-beau.ngrok-free.dev'

const CAPABILITIES = [
  { icon: Bot, title: 'AI Chat', desc: 'Natural conversations' },
  { icon: Search, title: 'Web Search', desc: 'Find information' },
  { icon: FileText, title: 'Documents', desc: 'Process PDFs' },
  { icon: Calendar, title: 'Reminders', desc: 'Schedule tasks' },
  { icon: Cloud, title: 'Weather', desc: 'Get forecasts' },
  { icon: Github, title: 'GitHub', desc: 'Manage repos' },
  { icon: Globe, title: 'Web Fetch', desc: 'Extract content' },
  { icon: Terminal, title: 'Commands', desc: 'Run shell tasks' },
  { icon: BookOpen, title: 'Memory', desc: 'Remember context' },
  { icon: Zap, title: 'Automation', desc: 'Workflows' }
]

// Local storage helpers
const getStoredUser = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch { return null }
}

const setStoredUser = (user) => {
  if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  else localStorage.removeItem(STORAGE_KEY)
}

const getStoredChats = () => {
  try {
    const data = localStorage.getItem(CHATS_KEY)
    return data ? JSON.parse(data) : []
  } catch { return [] }
}

const saveChats = (chats) => {
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats))
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('home')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEnd = useRef(null)

  // Check for stored session on load
  useEffect(() => {
    const stored = getStoredUser()
    if (stored) {
      setUser(stored)
      setMessages(getStoredChats())
    }
    setLoading(false)
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const login = async (e) => {
    e.preventDefault()
    setAuthError('')
    
    if (username === DEFAULT_USER.username && password === DEFAULT_USER.password) {
      const userData = { username, createdAt: Date.now() }
      setStoredUser(userData)
      setUser(userData)
      setMessages(getStoredChats())
    } else {
      setAuthError('Invalid username or password')
    }
  }

  const logout = () => {
    setStoredUser(null)
    setUser(null)
    setUsername('')
    setPassword('')
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || sending) return
    
    const text = input.trim()
    setInput('')
    setSending(true)
    
    // Add user message
    const userMsg = { id: Date.now(), role: 'user', text, createdAt: Date.now() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    saveChats(newMessages)
    
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, userId: user.username })
      })
      const data = await res.json()
      
      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: data.reply || 'Sorry, I had an issue processing that.',
        createdAt: Date.now()
      }
      
      const updatedMessages = [...newMessages, assistantMsg]
      setMessages(updatedMessages)
      saveChats(updatedMessages)
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: `Error: Unable to connect to NanoBot. Make sure the server is running. (${err.message})`,
        createdAt: Date.now()
      }
      
      const updatedMessages = [...newMessages, errorMsg]
      setMessages(updatedMessages)
      saveChats(updatedMessages)
    }
    
    setSending(false)
  }

  // Biometric auth check
  const checkBiometric = async () => {
    if (window.PublicKeyCredential) {
      try {
        // Check if biometric is available
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        if (available && getStoredUser()) {
          // Auto-login with stored session
          // In a real app, you'd verify biometric here
          const stored = getStoredUser()
          if (stored) {
            setUser(stored)
            setMessages(getStoredChats())
            return true
          }
        }
      } catch (e) {
        // Biometric not available, fall back to password
      }
    }
    return false
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="text-6xl mb-4">🐱</div>
          <div className="text-indigo-400 animate-pulse">Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900 p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🐱</div>
            <h1 className="text-2xl font-bold text-white">NanoBot</h1>
            <p className="text-slate-400 text-sm mt-1">Your AI Assistant</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-slate-800 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none"
                autoComplete="username"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-800 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none"
                autoComplete="current-password"
              />
            </div>
            {authError && <p className="text-red-400 text-sm text-center">{authError}</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition"
            >
              Sign In
            </button>
          </form>
          <p className="text-slate-500 text-xs text-center mt-4">
            Use your NanoBot credentials
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐱</span>
          <span className="font-semibold text-white">NanoBot</span>
        </div>
        <button onClick={logout} className="p-2 text-slate-400 hover:text-white">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Content */}
      {view === 'home' && (
        <div className="flex-1 overflow-auto hide-scrollbar p-4">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🐱</div>
            <h2 className="text-xl font-bold text-white">Welcome back!</h2>
            <p className="text-slate-400 text-sm">What can I help you with?</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {CAPABILITIES.map((cap, i) => (
              <button
                key={i}
                onClick={() => setView('chat')}
                className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl text-left transition"
              >
                <cap.icon className="w-6 h-6 text-indigo-400 mb-2" />
                <div className="text-white font-medium text-sm">{cap.title}</div>
                <div className="text-slate-400 text-xs">{cap.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {view === 'chat' && (
        <>
          <div className="flex-1 overflow-auto hide-scrollbar p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
                <p>Start a conversation!</p>
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-md'
                    : 'bg-slate-700 text-slate-100 rounded-bl-md'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-slate-700 px-4 py-2 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEnd} />
          </div>
          <form onSubmit={sendMessage} className="p-4 bg-slate-800/50 border-t border-slate-700 safe-bottom">
            <div className="flex gap-2">
              <input
                type="text" placeholder="Type a message..." value={input}
                onChange={e => setInput(e.target.value)}
                className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-xl border border-slate-600 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit" disabled={sending || !input.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 text-white p-3 rounded-xl transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </>
      )}

      {/* Bottom Nav */}
      <nav className="flex justify-around py-3 bg-slate-800 border-t border-slate-700 safe-bottom">
        <button onClick={() => setView('home')} className={`flex flex-col items-center ${view === 'home' ? 'text-indigo-400' : 'text-slate-400'}`}>
          <Zap className="w-5 h-5" />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button onClick={() => setView('chat')} className={`flex flex-col items-center ${view === 'chat' ? 'text-indigo-400' : 'text-slate-400'}`}>
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs mt-1">Chat</span>
        </button>
        <button className="flex flex-col items-center text-slate-400">
          <User className="w-5 h-5" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </nav>
    </div>
  )
}