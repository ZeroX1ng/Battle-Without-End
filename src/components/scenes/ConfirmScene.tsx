import { useGameContext } from '../../state/GameContext'

let _onConfirmCallback: (() => void) | null = null;

export function setConfirmCallback(cb: () => void) {
  _onConfirmCallback = cb;
}

export function ConfirmScene() {
  const { state, dispatch } = useGameContext();
  const { confirm } = state;

  const handleConfirm = () => {
    if (_onConfirmCallback) {
      _onConfirmCallback();
      _onConfirmCallback = null;
    }
    dispatch({ type: 'CLOSE_CONFIRM' });
  };

  const handleCancel = () => {
    _onConfirmCallback = null;
    dispatch({ type: 'CLOSE_CONFIRM' });
  };

  if (!confirm) return null;

  const message = confirm.message;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100%',
    }}>
      <div style={{
        width: 300, height: 200,
        background: 'var(--color-bg-panel)',
        border: '2px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-panel)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}>
        <div style={{
          color: 'var(--color-text)',
          fontSize: 15,
          textAlign: 'center',
          padding: '20px 25px',
          marginTop: 15,
          lineHeight: 1.6,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
        }}>
          {message}
        </div>

        <div style={{
          display: 'flex', gap: 40,
          paddingBottom: 25,
        }}>
          <button
            onClick={handleConfirm}
            style={{
              padding: '8px 28px', fontSize: 14,
              background: 'var(--color-green)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius-md)',
              cursor: 'pointer', fontWeight: 'bold',
              boxShadow: 'var(--shadow-button)',
            }}
          >
            确认
          </button>
          <button
            onClick={handleCancel}
            style={{
              padding: '8px 28px', fontSize: 14,
              background: 'var(--color-red)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius-md)',
              cursor: 'pointer', fontWeight: 'bold',
              boxShadow: 'var(--shadow-button)',
            }}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}
