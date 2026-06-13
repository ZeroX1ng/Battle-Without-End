// ═══ 特殊商店窗口 ═══
// AS3 原始: iPanel.iScene.iPanel.SpecialShopPanel.as
// 用金币购买背包拓展（上限 100 格）和宠物栏拓展（上限 20 格）
// 费用随当前容量递增：背包 = (BAGMAX-49)*100万，宠物 = (PETMAX-9)*500万

import { useGameContext } from '../../state/GameContext'

const BAG_COST_BASE = 1000000;
const PET_COST_BASE = 5000000;
const BAG_MAX = 100;
const PET_MAX = 20;

export function SpecialShopWindow() {
  const { state, dispatch } = useGameContext();
  const p = state.player;

  const bagMaxed = p.BAGMAX >= BAG_MAX;
  const petMaxed = p.PETMAX >= PET_MAX;
  const bagCost = bagMaxed ? -1 : (p.BAGMAX - 49) * BAG_COST_BASE;
  const petCost = petMaxed ? -1 : (p.PETMAX - 9) * PET_COST_BASE;
  const bagAfford = !bagMaxed && p.gold >= bagCost;
  const petAfford = !petMaxed && p.gold >= petCost;

  const formatCost = (cost: number) => {
    if (cost >= 10000000) return `${(cost / 10000000).toFixed(1)}千万`;
    if (cost >= 10000) return `${Math.floor(cost / 10000)}万`;
    return `$${cost}`;
  };

  return (
    <div style={{ padding: 8, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <b style={{ color: 'var(--color-text)', fontSize: 15 }}>特殊商店</b>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: 'var(--color-yellow)', fontSize: 12 }}>💰 {p.gold}</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {/* 背包拓展卡片 */}
        <div style={{
          flex: 1, background: 'var(--color-bg-panel)', borderRadius: 'var(--radius-md)',
          padding: 12, textAlign: 'center'
        }}>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: 'var(--color-text-bright)', marginBottom: 6 }}>
            🎒 背包拓展
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-dim)', marginBottom: 4 }}>
            容量 {p.BAGMAX} / {BAG_MAX}
          </div>
          <div style={{
            fontSize: 16, fontWeight: 'bold', marginBottom: 10,
            color: bagMaxed ? 'var(--color-text-dim)' : bagAfford ? 'var(--color-yellow)' : 'var(--color-red)'
          }}>
            {bagMaxed ? '已达到上限' : formatCost(bagCost)}
          </div>
          <button
            onClick={() => dispatch({ type: 'BAG_EXPAND', cost: bagCost })}
            disabled={!bagAfford}
            style={{
              padding: '6px 20px', fontSize: 13, fontWeight: 'bold',
              border: 'none', borderRadius: 'var(--radius-sm)',
              background: bagAfford ? 'var(--color-green)' : 'var(--color-bg-dark)',
              color: bagAfford ? '#fff' : 'var(--color-text-dim)',
              cursor: bagAfford ? 'pointer' : 'not-allowed',
              opacity: bagAfford ? 1 : 0.5,
            }}>
            购买
          </button>
        </div>

        {/* 宠物栏拓展卡片 */}
        <div style={{
          flex: 1, background: 'var(--color-bg-panel)', borderRadius: 'var(--radius-md)',
          padding: 12, textAlign: 'center'
        }}>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: 'var(--color-text-bright)', marginBottom: 6 }}>
            🐾 宠物栏拓展
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-dim)', marginBottom: 4 }}>
            容量 {p.PETMAX} / {PET_MAX}
          </div>
          <div style={{
            fontSize: 16, fontWeight: 'bold', marginBottom: 10,
            color: petMaxed ? 'var(--color-text-dim)' : petAfford ? 'var(--color-yellow)' : 'var(--color-red)'
          }}>
            {petMaxed ? '已达到上限' : formatCost(petCost)}
          </div>
          <button
            onClick={() => dispatch({ type: 'PET_EXPAND', cost: petCost })}
            disabled={!petAfford}
            style={{
              padding: '6px 20px', fontSize: 13, fontWeight: 'bold',
              border: 'none', borderRadius: 'var(--radius-sm)',
              background: petAfford ? 'var(--color-teal)' : 'var(--color-bg-dark)',
              color: petAfford ? '#fff' : 'var(--color-text-dim)',
              cursor: petAfford ? 'pointer' : 'not-allowed',
              opacity: petAfford ? 1 : 0.5,
            }}>
            购买
          </button>
        </div>
      </div>
    </div>
  );
}
