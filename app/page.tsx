'use client';

import { useState } from 'react';
import { sendMessageToAI, type AIProfile } from '../lib/apiClient';

type Msg = { role: 'user' | 'assistant'; content: string; speaker?: 'jason' | 'ocean' | 'merged' };

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
      // For now, backend returns a single output; we tag it with profile
      setMessages(m => [
        ...m,
        { role: 'assistant', content: res.text, speaker: profile === 'merged' ? 'merged' : profile }
      ]);
    } catch (e: any) {
      setMessages(m => [...m, { role: 'assistant', content: 'Error: ' + e.message }]);
    }

    setLoading(false);
  }

  function avatarFor(msg: Msg) {
    if (msg.role === 'user') return '🧑';
    if (msg.speaker === 'jason') return '🧠';
    if (msg.speaker === 'ocean') return '💜';
    if (msg.speaker === 'merged') return '⚔️';
    return '🤖';
  }

  function labelFor(msg: Msg) {
    if (msg.role === 'user') return 'You';
    if (msg.speaker === 'jason') return 'Jason';
    if (msg.speaker === 'ocean') return 'Ocean';
    if (msg.speaker === 'merged') return 'Debate';
    return 'AI';
  }

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 800,
        margin: '0 auto',
        color: '#fff',
        background: '#050509',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>Jason + Ocean AI</h1>
        <p style={{ fontSize: 13, color: '#aaa' }}>
          Logic, emotion, and debate—running on your own stack.
        </p>
      </header>

      <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
        <label>Profile:</label>
        <select
          value={profile}
          onChange={e => setProfile(e.target.value as AIProfile)}
          style={{
            padding: 8,
            background: '#111',
            color: '#fff',
            borderRadius: 6,
            border: '1px solid #333'
          }}
        >
          <option value="jason">Jason (Logic)</option>
          <option value="ocean">Ocean (Emotion)</option>
          <option value="merged">Merged (Debate Mode)</option>
        </select>
      </div>

      <main
        style={{
          flex: 1,
          border: '1px solid #222',
          padding: 12,
          borderRadius: 10,
          overflowY: 'auto',
          marginBottom: 16,
          background: '#0b0b10'
        }}
      >
        {messages.map((m, i) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={i}
              style={{
                marginBottom: 12,
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start'
              }}
            >
              {!isUser && (
                <div style={{ marginRight: 8, fontSize: 18 }}>
                  {avatarFor(m)}
                </div>
              )}
              <div
                style={{
                  maxWidth: '70%',
                  background: isUser ? '#4f46e5' : '#1f2937',
                  padding: '10px 14px',
                  borderRadius: 14,
                  whiteSpace: 'pre-wrap',
                  fontSize: 15,
                  position: 'relative'
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      fontSize: 11,
                      color: '#9ca3af',
                      marginBottom: 4
                    }}
                  >
                    {labelFor(m)}
                  </div>
                )}
                {m.content}
              </div>
              {isUser && (
                <div style={{ marginLeft: 8, fontSize: 18 }}>
                  {avatarFor(m)}
                </div>
              )}
            </div>
          );
        })}
        {loading && (
          <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 8 }}>Thinking…</div>
        )}
      </main>

      <footer style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Message Jason + Ocean..."
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            border: '1px solid #333',
            background: '#111',
            color: '#fff'
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            padding: '12px 18px',
            borderRadius: 8,
            background: loading ? '#374151' : '#4f46e5',
            color: '#fff',
            border: 'none',
            fontWeight: 'bold',
            minWidth: 80
          }}
        >
          {loading ? '...' : 'Send'}
        </button>
      </footer>
    </div>
  );
}
