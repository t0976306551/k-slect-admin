'use client'

import { useState, useEffect } from 'react'
import { fetchSettings, updateSettings, changePassword } from '@/lib/api'
import { inputStyle } from '@/lib/styles'

export default function SettingsPage() {
  const [storeName, setStoreName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsMsg, setSettingsMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdMsg, setPwdMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    async function load() {
      const r = await fetchSettings()
      if (r.data) {
        setStoreName(r.data.storeName ?? '')
        setContactEmail(r.data.contactEmail ?? '')
        setContactPhone(r.data.contactPhone ?? '')
      }
    }
    load()
  }, [])

  const handleSaveSettings = async () => {
    setSettingsSaving(true)
    setSettingsMsg(null)
    const res = await updateSettings({ storeName, contactEmail, contactPhone })
    setSettingsSaving(false)
    if (res.error) {
      setSettingsMsg({ type: 'err', text: res.error.message })
    } else {
      setSettingsMsg({ type: 'ok', text: '設定已儲存' })
    }
  }

  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdMsg({ type: 'err', text: '請填寫所有欄位' }); return
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: 'err', text: '新密碼與確認密碼不一致' }); return
    }
    if (newPwd.length < 8) {
      setPwdMsg({ type: 'err', text: '新密碼至少需要 8 個字元' }); return
    }
    setPwdSaving(true)
    setPwdMsg(null)
    const res = await changePassword({ currentPassword: currentPwd, newPassword: newPwd })
    setPwdSaving(false)
    if (res.error) {
      setPwdMsg({ type: 'err', text: res.error.message })
    } else {
      setPwdMsg({ type: 'ok', text: '密碼已更新' })
      setCurrentPwd('')
      setNewPwd('')
      setConfirmPwd('')
    }
  }

  return (
    <div className="p-4 sm:p-8 flex flex-col gap-6">
      <h1
        className="text-[28px] font-medium tracking-[-0.5px]"
        style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
      >
        系統設定
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 商店資訊 */}
        <div
          className="flex flex-col gap-4 p-6"
          style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
        >
          <h2 className="text-[16px] font-semibold" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}>
            商店資訊
          </h2>
          <div className="flex flex-col gap-3">
            {[
              { label: '商店名稱', value: storeName, setter: setStoreName },
              { label: '聯絡 Email', value: contactEmail, setter: setContactEmail },
              { label: '聯絡電話', value: contactPhone, setter: setContactPhone },
            ].map(({ label, value, setter }) => (
              <div key={label} className="flex flex-col gap-[6px]">
                <label className="text-[12px] font-medium" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>
                  {label}
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={e => setter(e.target.value)}
                  style={inputStyle}
                />
              </div>
            ))}

            {settingsMsg && (
              <p className="text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: settingsMsg.type === 'ok' ? '#7C9070' : '#E53935' }}>
                {settingsMsg.text}
              </p>
            )}

            <button
              onClick={handleSaveSettings}
              disabled={settingsSaving}
              className="mt-2 px-5 py-[10px] text-[13px] font-semibold rounded-[10px] transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: '#7C9070', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
            >
              {settingsSaving ? '儲存中...' : '儲存設定'}
            </button>
          </div>
        </div>

        {/* 修改密碼 */}
        <div
          className="flex flex-col gap-4 p-6"
          style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
        >
          <h2 className="text-[16px] font-semibold" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}>
            修改密碼
          </h2>
          <div className="flex flex-col gap-3">
            {[
              { label: '目前密碼', value: currentPwd, setter: setCurrentPwd },
              { label: '新密碼', value: newPwd, setter: setNewPwd },
              { label: '確認新密碼', value: confirmPwd, setter: setConfirmPwd },
            ].map(({ label, value, setter }) => (
              <div key={label} className="flex flex-col gap-[6px]">
                <label className="text-[12px] font-medium" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>
                  {label}
                </label>
                <input
                  type="password"
                  value={value}
                  onChange={e => setter(e.target.value)}
                  style={inputStyle}
                />
              </div>
            ))}

            {pwdMsg && (
              <p className="text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: pwdMsg.type === 'ok' ? '#7C9070' : '#E53935' }}>
                {pwdMsg.text}
              </p>
            )}

            <button
              onClick={handleChangePassword}
              disabled={pwdSaving}
              className="mt-2 px-5 py-[10px] text-[13px] font-semibold rounded-[10px] transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: '#2D2D2D', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
            >
              {pwdSaving ? '更新中...' : '更新密碼'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
