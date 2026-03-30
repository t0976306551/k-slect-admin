export default function SettingsPage() {
  return (
    <div className="p-8 flex flex-col gap-6">
      <h1
        className="text-[28px] font-medium tracking-[-0.5px]"
        style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
      >
        系統設定
      </h1>

      <div className="grid grid-cols-2 gap-6">
        {/* 商店資訊 */}
        <div
          className="flex flex-col gap-4 p-6"
          style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
        >
          <h2
            className="text-[16px] font-semibold"
            style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
          >
            商店資訊
          </h2>
          <div className="flex flex-col gap-3">
            {[
              { label: '商店名稱', value: 'K-slect 韓好物' },
              { label: '聯絡 Email', value: 'contact@k-slect.com' },
              { label: '聯絡電話', value: '02-1234-5678' },
            ].map(field => (
              <div key={field.label} className="flex flex-col gap-[6px]">
                <label
                  className="text-[12px] font-medium"
                  style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}
                >
                  {field.label}
                </label>
                <input
                  type="text"
                  defaultValue={field.value}
                  className="outline-none text-[13px] px-3"
                  style={{
                    background: '#F7F6F3',
                    borderRadius: 8,
                    border: '1px solid #F0EFEC',
                    height: 38,
                    fontFamily: 'var(--font-jakarta)',
                    color: '#2D2D2D',
                  }}
                />
              </div>
            ))}
            <button
              className="mt-2 px-5 py-[10px] text-[13px] font-semibold rounded-[10px] transition-opacity hover:opacity-80"
              style={{ background: '#7C9070', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
            >
              儲存設定
            </button>
          </div>
        </div>

        {/* 管理員帳號 */}
        <div
          className="flex flex-col gap-4 p-6"
          style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
        >
          <h2
            className="text-[16px] font-semibold"
            style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
          >
            修改密碼
          </h2>
          <div className="flex flex-col gap-3">
            {[
              { label: '目前密碼', type: 'password' },
              { label: '新密碼', type: 'password' },
              { label: '確認新密碼', type: 'password' },
            ].map(field => (
              <div key={field.label} className="flex flex-col gap-[6px]">
                <label
                  className="text-[12px] font-medium"
                  style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}
                >
                  {field.label}
                </label>
                <input
                  type={field.type}
                  className="outline-none text-[13px] px-3"
                  style={{
                    background: '#F7F6F3',
                    borderRadius: 8,
                    border: '1px solid #F0EFEC',
                    height: 38,
                    fontFamily: 'var(--font-jakarta)',
                    color: '#2D2D2D',
                  }}
                />
              </div>
            ))}
            <button
              className="mt-2 px-5 py-[10px] text-[13px] font-semibold rounded-[10px] transition-opacity hover:opacity-80"
              style={{ background: '#2D2D2D', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
            >
              更新密碼
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
