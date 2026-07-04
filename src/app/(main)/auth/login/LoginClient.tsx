'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function LoginClient({ searchParams }: { searchParams: Promise<{ next?: string; registered?: string }> }) {
  const params = use(searchParams)
  const next = params.next
  const justRegistered = params.registered === '1'

  const [form, setForm] = useState({ email: '', password: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setErrorMsg('이메일과 비밀번호를 입력해 주세요.')
      setStatus('error'); return
    }
    setStatus('loading')
    setErrorMsg('')

    const sb = createClient()
    const { error } = await sb.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) {
      setErrorMsg('이메일 또는 비밀번호가 올바르지 않습니다.')
      setStatus('error')
      return
    }

    router.push(next ?? '/')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.8rem' }}>🏘️</span>
            <span style={{ color: 'var(--brand)', fontWeight: 900, fontSize: '1.5rem' }}>Community Portal</span>
          </Link>
        </div>

        <div style={{ background: 'var(--paper)', borderRadius: '10px', padding: 'clamp(24px, 6vw, 40px) clamp(20px, 5vw, 36px)', boxShadow: '0 8px 24px var(--paper-shadow)' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--ink)', marginBottom: '6px' }}>로그인</h1>
          <p style={{ color: 'var(--ink-faint)', fontSize: '0.875rem', marginBottom: '28px' }}>계정에 로그인하여 서비스를 이용하세요</p>

          {justRegistered && (
            <div style={{ padding: '12px 14px', background: '#eef5ea', border: '1px solid var(--pin-green)', borderRadius: '8px', color: '#33532f', fontSize: '0.875rem', marginBottom: '20px' }}>
              ✅ 회원가입이 완료되었습니다. 로그인해 주세요.
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>이메일</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="example@email.com" className="input-field"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>비밀번호</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" className="input-field"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>

          {status === 'error' && (
            <div style={{ padding: '12px 14px', background: '#fdeeee', border: '1px solid var(--pin-red)', borderRadius: '8px', color: '#8a2c26', fontSize: '0.875rem', marginBottom: '16px' }}>
              {errorMsg}
            </div>
          )}

          <button onClick={handleSubmit} disabled={status === 'loading'} className="btn-primary" style={{ width: '100%', padding: '13px' }}>
            {status === 'loading' ? '로그인 중...' : '로그인'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--ink-soft)', marginTop: '20px' }}>
            계정이 없으신가요?{' '}
            <Link href="/auth/register" style={{ color: 'var(--pin-blue)', fontWeight: 700 }}>회원가입</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link href="/" style={{ color: 'var(--ink-faint)', fontSize: '0.85rem' }}>← 홈으로 돌아가기</Link>
        </p>
      </div>
    </div>
  )
}
