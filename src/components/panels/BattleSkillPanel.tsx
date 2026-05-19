// ═══ 战斗技能面板 ═══
// AS3 原始: iPanel.iCell.* (BattleSkillPanel)
// 原版尺寸: 170 × 165

import { useGameContext } from '../../state/GameContext'
import { getAttackSkillList, getDefenceSkillList, getSpellChance } from '../../core/models/Player'

function getSkillChance(player: any, skillCount: number, kind: 'attack' | 'defence'): string {
  if (skillCount <= 0) return '0%'
  let chance = kind === 'attack'
    ? getSpellChance(player) + 20 + skillCount * 5
    : getSpellChance(player) + skillCount * 20
  if (chance > 95) chance = 95
  return `${Math.trunc((chance / skillCount) * 100) / 100}%`
}

export function BattleSkillPanel() {
  const { state } = useGameContext();
  const battle = state.battle as any;
  if (!battle) return null;

  const attackSkills = getAttackSkillList(state.player);
  const defenceSkills = getDefenceSkillList(state.player);
  const attackChance = getSkillChance(state.player, attackSkills.length, 'attack')
  const defenceChance = getSkillChance(state.player, defenceSkills.length, 'defence')

  return (
    <div style={{
      background: 'var(--color-bg-dark)', borderRadius: 'var(--radius-md)',
      padding: '8px 10px', width: 170, minHeight: 165, fontSize: 11,
      boxSizing: 'border-box',
    }}>
      <div style={{ color: 'var(--color-text-bright)', fontWeight: 'bold', marginBottom: 4, textAlign: 'center' }}>
        战斗技能
      </div>

      <div style={{ color: 'var(--color-red)', fontWeight: 'bold', fontSize: 10, marginBottom: 2 }}>攻击</div>
      {attackSkills.length === 0 ? (
        <div style={{ color: 'var(--color-text-dim)', fontSize: 10, marginBottom: 6 }}>无</div>
      ) : (
        attackSkills.map(skill => (
          <div key={skill.skillData.name} style={{
            fontSize: 10, color: 'var(--color-text)', marginBottom: 1,
            display: 'flex', justifyContent: 'space-between'
          }}>
            <span>{skill.skillData.realName ?? skill.skillData.name} Lv.{skill.level}</span>
            <span style={{ color: 'var(--color-text-dim)' }}>{attackChance}</span>
          </div>
        ))
      )}

      <div style={{ color: 'var(--color-blue)', fontWeight: 'bold', fontSize: 10, marginBottom: 2, marginTop: 4 }}>防御</div>
      {defenceSkills.length === 0 ? (
        <div style={{ color: 'var(--color-text-dim)', fontSize: 10 }}>无</div>
      ) : (
        defenceSkills.map(skill => (
          <div key={skill.skillData.name} style={{
            fontSize: 10, color: 'var(--color-text)', marginBottom: 1,
            display: 'flex', justifyContent: 'space-between'
          }}>
            <span>{skill.skillData.realName ?? skill.skillData.name} Lv.{skill.level}</span>
            <span style={{ color: 'var(--color-text-dim)' }}>{defenceChance}</span>
          </div>
        ))
      )}
    </div>
  )
}
