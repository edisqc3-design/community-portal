'use client'

import { useState } from 'react'
import Link from 'next/link'
import { register } from '@/lib/auth-actions'
import { useRouter } from 'next/navigation'

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.875rem',
  fontWeight: 700, color: 'var(--ink)', marginBottom: '6px',
}

export default function RegisterClient() {
  const router = useRouter()
  const [form, setForm] = useState({ nickname: '', email: '', password: '', passwordConfirm: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async () => {
    if (!form.nickname || !form.email || !form.password) {
      setErrorMsg('모든 필수 항목을 입력해 주세요.')
      setStatus('error'); return
    }
    if (form.password.length < 6) {
      setErrorMsg('비밀번호는 6자 이상이어야 합니다.')
      setStatus('error'); return
    }
    if (form.password !== form.passwordConfirm) {
      setErrorMsg('비밀번호가 일치하지 않습니다.')
      setStatus('error'); return
    }
    setStatus('loading')
    setErrorMsg('')
    const result = await register({ nickname: form.nickname, email: form.email, password: form.password })
    if (result.success) {
      router.push('/auth/login?registered=1')
    } else {
      setErrorMsg(result.error ?? '회원가입에 실패했습니다.')
      setStatus('error')
    }
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
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--ink)', marginBottom: '6px' }}>회원가입</h1>
          <p style={{ color: 'var(--ink-faint)', fontSize: '0.875rem', marginBottom: '28px' }}>가입 후 바로 로그인할 수 있습니다</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={labelStyle}>닉네임 <span style={{ color: 'var(--pin-red)' }}>*</span></label>
              <input name="nickname" value={form.nickname} onChange={handleChange} placeholder="게시판에서 사용할 닉네임" className="input-field" />
            </div>
            <div>
              <label style={labelStyle}>이메일 <span style={{ color: 'var(--pin-red)' }}>*</span></label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="example@email.com" className="input-field" />
            </div>
            <div>
              <label style={labelStyle}>비밀번호 <span style={{ color: 'var(--pin-red)' }}>*</span></label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="6자 이상 입력" className="input-field" />
              {form.password && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '3px' }}>
                    {[1, 2, 3].map(lv => (
                      <div key={lv} style={{ flex: 1, height: '3px', borderRadius: '2px',
                        background: form.password.length >= lv * 4 ? (lv === 1 ? 'var(--pin-red)' : lv === 2 ? 'var(--pin-yellow)' : 'var(--pin-green)') : 'var(--border)' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--ink-faint)' }}>
                    {form.password.length < 4 ? '약함' : form.password.length < 8 ? '보통' : '강함'}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label style={labelStyle}>비밀번호 확인 <span style={{ color: 'var(--pin-red)' }}>*</span></label>
              <input name="passwordConfirm" type="password" value={form.passwordConfirm} onChange={handleChange} placeholder="비밀번호 재입력" className="input-field"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
              {form.passwordConfirm && (
                <p style={{ fontSize: '0.72rem', marginTop: '4px', color: form.password === form.passwordConfirm ? 'var(--pin-green)' : 'var(--pin-red)' }}>
                  {form.password === form.passwordConfirm ? '✓ 일치합니다' : '✗ 비밀번호가 다릅니다'}
                </p>
              )}
            </div>
          </div>

          {status === 'error' && (
            <div style={{ padding: '12px 14px', background: '#fdeeee', border: '1px solid var(--pin-red)', borderRadius: '8px', color: '#8a2c26', fontSize: '0.875rem', marginBottom: '16px' }}>
              {errorMsg}
            </div>
          )}

          <button onClick={handleSubmit} disabled={status === 'loading'} className="btn-primary" style={{ width: '100%', padding: '13px' }}>
            {status === 'loading' ? '처리 중...' : '회원가입'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--ink-soft)', marginTop: '20px' }}>
            이미 계정이 있으신가요?{' '}
            <Link href="/auth/login" style={{ color: 'var(--pin-blue)', fontWeight: 700 }}>로그인</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link href="/" style={{ color: 'var(--ink-faint)', fontSize: '0.85rem' }}>← 홈으로 돌아가기</Link>
        </p>
      </div>
    </div>
  )
}
