// ═══ 战斗技能面板 ═══
// AS3 原始: iPanel.iCell.* (BattleSkillPanel)
// 原版尺寸: 170 × 165

import { useGameContext } from '../../state/GameContext'
import { getAttackSkillList, getDefenceSkillList, getSpellChance } from '../../core/models/Player'

const BATTLE_SKILL_PANEL_WIDTH = 170
const BATTLE_SKILL_ROW_FONT_SIZE = 14
const BATTLE_SKILL_GROUP_TITLE_FONT_SIZE = 17

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
    <div data-bwe-battle-skill-panel style={{
      background: 'var(--color-bg-dark)', borderRadius: 'var(--radius-md)',
      padding: '9px 12px', width: BATTLE_SKILL_PANEL_WIDTH, minHeight: 160, fontSize: BATTLE_SKILL_ROW_FONT_SIZE,
      boxSizing: 'border-box',
    }}>
      <div style={{ color: 'var(--color-red)', fontWeight: 'bold', fontSize: BATTLE_SKILL_GROUP_TITLE_FONT_SIZE, marginBottom: 4 }}>攻击</div>
      {attackSkills.length === 0 ? (
        <div style={{ color: 'var(--color-text-dim)', fontSize: BATTLE_SKILL_ROW_FONT_SIZE, marginBottom: 8 }}>无</div>
      ) : (
        attackSkills.map(skill => (
          <div key={skill.skillData.name} style={{
            fontSize: BATTLE_SKILL_ROW_FONT_SIZE, color: 'var(--color-text)', marginBottom: 2,
            display: 'flex', justifyContent: 'space-between'
          }}>
            <span>{skill.skillData.realName ?? skill.skillData.name} Lv.{skill.level}</span>
            <span style={{ color: 'var(--color-text-dim)' }}>{attackChance}</span>
          </div>
        ))
      )}

      <div style={{ color: 'var(--color-blue)', fontWeight: 'bold', fontSize: BATTLE_SKILL_GROUP_TITLE_FONT_SIZE, marginBottom: 4, marginTop: 8 }}>防御</div>
      {defenceSkills.length === 0 ? (
        <div style={{ color: 'var(--color-text-dim)', fontSize: BATTLE_SKILL_ROW_FONT_SIZE }}>无</div>
      ) : (
        defenceSkills.map(skill => (
          <div key={skill.skillData.name} style={{
            fontSize: BATTLE_SKILL_ROW_FONT_SIZE, color: 'var(--color-text)', marginBottom: 2,
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
