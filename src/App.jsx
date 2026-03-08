import React, { useState, useEffect, useRef } from 'react'
import { auth, db } from './firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'
import {
  MessageCircle, Send, User, Mail, Lock, LogOut, Sparkles,
  Zap, FileText, Cloud, Calendar, Github, Search, Bot, Globe, Clock, Terminal, BookOpen
} from 'lucide-react'

const API_URL = 'http://localhost:18790'

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

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('home')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEnd = useRef(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { setUser(u); setLoading(false) })
    return unsub
  }, [])

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'chats'), where('uid', '==', user.uid), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
    })
    return unsub
  }, [user])

  const login = async e => {
    e.preventDefault()
    try { await signInWithEmailAndPassword(auth, email, password) }
    catch (err) { setAuthError(err.message) }
  }

  const signup = async e => {
    e.preventDefault()
    try { await createUserWithEmailAndPassword(auth, email, password) }
    catch (err) { setAuthError(err.message) }
  }

  const logout = () => signOut(auth)

  const sendMessage = async e => {
    e.preventDefault()
    if (!input.trim() || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)
    try {
      await addDoc(collection(db, 'chats'), {
        uid: user.uid, role: 'user', text, createdAt: serverTimestamp()
      })
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, userId: user.uid })
      })
      const data = await res.json()
      await addDoc(collection(db, 'chats'), {
        uid: user.uid, role: 'assistant', text: data.reply || 'Sorry, I had an issue.',
        createdAt: serverTimestamp()
      })
    } catch (err) {
      await addDoc(collection(db, 'chats'), {
        uid: user.uid, role: 'assistant', text: `Error: ${err.message}`, createdAt: serverTimestamp()
      })
    }
    setSending(false)
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
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="email" placeholder="Email" value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-800 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="password" placeholder="Password" value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-800 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            {authError && <p className="text-red-400 text-sm text-center">{authError}</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition"
            >
              Sign In
            </button>
            <button
              type="button" onClick={signup}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-medium transition"
            >
              Create Account
            </button>
          </form>
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