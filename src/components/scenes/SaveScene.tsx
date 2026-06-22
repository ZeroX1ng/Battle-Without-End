import { useState, useRef, useEffect } from 'react'
import { useGameContext } from '../../state/GameContext'
import {
  SAVE_LOCAL_STORAGE_KEYS,
  SAVE_PREFIX,
  fileImport,
  getBrowserSaveStorageHint,
  localLoad,
} from '../../core/systems/SaveSystem'
import { Button } from '../common/Common'

const SLOTS = ['slot1', 'slot2', 'slot3', 'slot4']

interface SlotData {
  userName: string
  time: string
}

function loadSlotData(slot: string): SlotData | null {
  const data = localLoad(slot)
  if (!data || !data.userName) return null
  return { userName: data.userName, time: data.time }
}

export function SaveScene() {
  const { dispatch } = useGameContext()
  const [names, setNames] = useState<Record<string, string>>({ slot1: '', slot2: '', slot3: '', slot4: '' })
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [slotData, setSlotData] = useState<Record<string, SlotData | null>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const data: Record<string, SlotData | null> = {}
    for (const slot of SLOTS) {
      data[slot] = loadSlotData(slot)
    }
    setSlotData(data)
  }, [])

  const refreshSlots = () => {
    const data: Record<string, SlotData | null> = {}
    for (const slot of SLOTS) {
      data[slot] = loadSlotData(slot)
    }
    setSlotData(data)
  }

  const handleNewGame = (slot: string) => {
    const name = names[slot].trim()
    if (!name || loading) return
    setLoading(true)
    dispatch({ type: 'PLAYER_SET_NAME', name, slot })
    dispatch({ type: 'SET_SCENE', scene: 'race' })
  }

  const handleLoad = (slot: string) => {
    if (loading) return
    setLoading(true)
    dispatch({ type: 'LOAD_GAME', slot })
  }

  const handleDelete = (slot: string) => {
    localStorage.removeItem(SAVE_PREFIX + slot)
    setConfirmDelete(null)
    refreshSlots()
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || loading) return
    setLoading(true)
    try {
      const data = await fileImport(file)
      dispatch({ type: 'MANUAL_LOAD', saveData: data })
      refreshSlots()
    } catch {
      setLoading(false)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: 30, height: '100%', justifyContent: 'center', gap: 16
    }}>
      <h1 style={{ color: 'var(--color-red)', fontSize: 36, margin: 0 }}>读取存档</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: 600 }}>

        {SLOTS.map((slot, idx) => {
          const data = slotData[slot]
          const num = idx + 1

          if (data) {
            return (
              <div key={slot} style={{
                border: '2px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 20px',
                background: 'var(--color-bg-panel)',
                display: 'flex', alignItems: 'center', gap: 14,
                position: 'relative',
              }}>
                <span style={{ color: 'var(--color-text-dim)', fontSize: 13, minWidth: 24 }}>
                  槽{num}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--color-text)', fontSize: 15, fontWeight: 'bold' }}>
                    {data.userName}
                  </div>
                  <div style={{ color: 'var(--color-text-dim)', fontSize: 11, marginTop: 2 }}>
                    {data.time}
                  </div>
                </div>
                <Button variant="primary" size="sm" onClick={() => handleLoad(slot)}>
                  读取
                </Button>
                <Button
                  variant="danger" size="sm"
                  onClick={() => setConfirmDelete(slot)}
                >
                  删除
                </Button>
              </div>
            )
          }

          return (
            <div key={slot} style={{
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 20px',
              background: 'var(--color-bg-panel)',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <span style={{ color: 'var(--color-text-dim)', fontSize: 13, minWidth: 24 }}>
                槽{num}
              </span>
              <input
                placeholder="输入角色名..."
                value={names[slot]}
                onChange={(e) => setNames({ ...names, [slot]: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') handleNewGame(slot) }}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  background: 'var(--color-bg-dark)',
                  color: 'var(--color-text)',
                  border: '2px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
              <Button
                variant="primary" size="sm"
                disabled={!names[slot].trim() || loading}
                onClick={() => handleNewGame(slot)}
              >
                新建
              </Button>
            </div>
          )
        })}

        <div style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 20px',
          background: 'var(--color-bg-panel)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <span style={{ color: 'var(--color-text-dim)', fontSize: 13 }}>📂 导入存档文件</span>
          <div style={{ flex: 1 }} />
          <Button
            variant="normal" size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            选择文件
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".boe"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
        </div>

        <div
          data-bwe-save-storage-hint
          style={{
            border: '1px solid rgba(205, 175, 95, 0.42)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.035)',
            color: 'var(--color-text-dim)',
            fontSize: 11,
            lineHeight: 1.5,
          }}
        >
          <div>{getBrowserSaveStorageHint()}</div>
          <div style={{ marginTop: 4 }}>
            keys: {SAVE_LOCAL_STORAGE_KEYS.join(' / ')}
          </div>
        </div>
      </div>

      <button
        onClick={() => dispatch({ type: 'SET_SCENE', scene: 'begin' })}
        style={{
          marginTop: 10,
          padding: '8px 24px',
          fontSize: 14,
          background: 'transparent',
          color: 'var(--color-text-dim)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        返回
      </button>

      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            background: 'var(--color-bg-panel)',
            border: '2px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '30px 40px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
          }}>
            <p style={{ color: 'var(--color-text)', fontSize: 16, margin: 0 }}>
              确定删除存档「{slotData[confirmDelete]?.userName ?? confirmDelete}」？
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button variant="danger" size="md" onClick={() => handleDelete(confirmDelete)}>
                确定删除
              </Button>
              <Button variant="normal" size="md" onClick={() => setConfirmDelete(null)}>
                取消
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
