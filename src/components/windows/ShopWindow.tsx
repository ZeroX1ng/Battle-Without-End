// Shop window.
// AS3 original: iPanel.iScene.iPanel.ShopPanel.as + ShopCell.as + GambleCell.as

import { useGameContext } from '../../state/GameContext'
import { EquipmentCell } from '../common/Common'
import { getEquipmentComparisonSlot } from '../../core/models/Player'

function getSlotLabel(position: string): string {
  if (position === 'one-handed') return '主手';
  if (position === 'two-handed') return '双手';
  if (position === 'off hand') return '副手';
  return position;
}

export function ShopWindow() {
  const { state, dispatch } = useGameContext();
  const p = state.player;
  const sellItems = state.shop.sellItems;
  const gambleItems = state.shop.gambleItems;

  const tick = p.caculate % 600;
  const remainTicks = 600 - tick;
  const mins = Math.floor(remainTicks / 120);
  const secs = Math.floor((remainTicks % 120) / 2);
  const timeStr = `${mins}:${String(secs).padStart(2, '0')}`;

  return (
    <div style={{ padding: 8, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <b style={{ color: 'var(--color-text)', fontSize: 15 }}>商店</b>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <span style={{ color: 'var(--color-teal)', fontSize: 12, fontFamily: 'monospace' }}>
            {timeStr}
          </span>
          <span style={{ color: 'var(--color-yellow)', fontSize: 12 }}>
            ${p.gold}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 8, overflow: 'hidden', minHeight: 0 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{
            color: 'var(--color-text-bright)', fontSize: 13, fontWeight: 'bold',
            marginBottom: 4, paddingBottom: 4,
            borderBottom: '1px solid var(--color-border)'
          }}>
            出售
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {sellItems.map((item, idx) => {
              const affordable = p.gold >= item.price;
              const equip = item.equip;
              return (
                <EquipmentCell
                  key={`${equip.name}-${idx}`}
                  equip={equip}
                  currentEquip={getEquipmentComparisonSlot(equip, p)}
                  getDescription={(equip) => `${equip.getSellDesciption()}${affordable ? '' : "<font color='#ff4040'>Can't afford</font>"}`}
                  showEquipAction={false}
                  sellLabel="$"
                  disabled={!affordable}
                  onSell={() => dispatch({ type: 'SHOP_BUY_SELL', index: idx })}
                  style={{
                    marginBottom: 4,
                  }}
                />
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{
            color: 'var(--color-text-bright)', fontSize: 13, fontWeight: 'bold',
            marginBottom: 4, paddingBottom: 4,
            borderBottom: '1px solid var(--color-border)'
          }}>
            赌博
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {gambleItems.map((item, idx) => {
              const affordable = p.gold >= item.price;
              const equip = item.equip;
              return (
                <button
                  key={`${equip.name}-${idx}`}
                  onClick={() => dispatch({ type: 'SHOP_BUY_GAMBLE', index: idx })}
                  disabled={!affordable}
                  style={{
                    width: '100%',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '3px 6px', cursor: affordable ? 'pointer' : 'not-allowed',
                    border: 0,
                    borderBottom: '1px solid var(--color-border)',
                    background: 'transparent',
                    opacity: affordable ? 1 : 0.45,
                    fontSize: 12,
                    textAlign: 'left',
                  }}
                >
                  <span style={{ flex: 1, overflow: 'hidden' }}>
                    <span style={{ color: 'var(--color-text)' }}>{equip.realName}?</span>
                    <span style={{ color: 'var(--color-text-dim)', marginLeft: 6, fontSize: 10 }}>
                      ??? {getSlotLabel(equip.position)}
                    </span>
                  </span>
                  <span style={{
                    color: affordable ? 'var(--color-yellow)' : 'var(--color-red)',
                    fontSize: 12, fontWeight: 'bold', minWidth: 80, textAlign: 'right',
                    flexShrink: 0
                  }}>
                    ${item.price}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
