import { useGameContext } from '../../state/GameContext'

export function BeginScene() {
  const { state, dispatch } = useGameContext();
  const { player } = state;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: 40, height: '100%', justifyContent: 'center', gap: 20
    }}>
      <h1 style={{ color: 'var(--color-red)', fontSize: 48, margin: 0 }}>BOE</h1>
      <h2 style={{ color: 'var(--color-text)', fontSize: 18, margin: 0 }}>
        Battle of Eternity
      </h2>
      <p style={{ color: 'var(--color-text-dim)', fontSize: 13 }}>
        Flash RPG · 现代重构版
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 30 }}>
        <button
          onClick={() => dispatch({ type: 'SET_SCENE', scene: 'race' })}
          style={{
            padding: '10px 40px', fontSize: 16,
            background: 'var(--color-green)', color: '#fff',
            border: 'none', borderRadius: 'var(--radius-md)',
            cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          新游戏
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_SCENE', scene: 'save' })}
          style={{
            padding: '10px 40px', fontSize: 16,
            background: 'var(--color-blue)', color: '#fff',
            border: 'none', borderRadius: 'var(--radius-md)',
            cursor: 'pointer'
          }}
        >
          读取存档
        </button>
      </div>
    </div>
  )
}
