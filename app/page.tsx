'use client';

import { useState } from 'react';
import { sendMessageToAI, type AIProfile } from '../lib/apiClient';

type Msg = { role: 'user' | 'assistant'; content: string };

export default function Page() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [profile, setProfile] = useState<AIProfile>('jason');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;

    const text = input.trim();
    setMessages(m => [...m, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendMessageToAI(text, profile);
      setMessages(m => [...m, { role: 'assistant', content: res.text }]);
    } catch (e: any) {
      setMessages(m => [...m, { role: 'assistant', content: 'Error: ' + e.message }]);
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 16, maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 16 }}>Jason + Ocean AI</h1>

      <div style={{ marginBottom: 16 }}>
        <label>Profile: </label>
        <select
          value={profile}
          onChange={e => setProfile(e.target.value as AIProfile)}
          style={{ padding: 6 }}
        >
          <option value="jason">Jason (Logic)</option>
          <option value="ocean">Ocean (Emotion)</option>
          <option value="merged">Merged (Both)</option>
        </select>
      </div>

      <div
        style={{
          border: '1px solid #444',
          padding: 12,
          borderRadius: 8,
          height: '60vh',
          overflowY: 'auto',
          marginBottom: 16
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              marginBottom: 12,
              textAlign: m.role === 'user' ? 'right' : 'left'
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: 12,
                background: m.role === 'user' ? '#4f46e5' : '#222',
                color: '#fff',
                maxWidth: '80%',
                whiteSpace: 'pre-wrap'
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Message Jason + Ocean..."
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: '1px solid #444',
            background: '#111',
            color: '#fff'
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            background: '#4f46e5',
            color: '#fff',
            border: 'none'
          }}
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
