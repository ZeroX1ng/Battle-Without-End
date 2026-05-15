// ═══ 战斗技能面板 ═══
// AS3 原始: iPanel.iCell.* (BattleSkillPanel)

import { useGameContext } from '../../state/GameContext'
import { SkillType } from '../../core/constants'

export function BattleSkillPanel() {
  const { state } = useGameContext();
  const battle = state.battle as any;
  if (!battle) return null;

  const attackSkills = state.player.equipSkillList.filter(s => s.skillData.type === SkillType.ATTACK);
  const defenceSkills = state.player.equipSkillList.filter(s => s.skillData.type === SkillType.DEFENCE);

  return (
    <div style={{
      background: 'var(--color-bg-dark)', borderRadius: 'var(--radius-md)',
      padding: '8px 12px', fontSize: 11
    }}>
      <div style={{ color: 'var(--color-text-dim)', marginBottom: 4 }}>战斗技能</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {attackSkills.map(skill => (
          <span key={skill.skillData.name} style={{
            padding: '2px 8px', background: 'var(--color-red)', color: '#fff',
            borderRadius: 'var(--radius-sm)', fontSize: 10
          }}>
            {skill.skillData.name} Lv.{skill.level}
          </span>
        ))}
        {defenceSkills.map(skill => (
          <span key={skill.skillData.name} style={{
            padding: '2px 8px', background: 'var(--color-blue)', color: '#fff',
            borderRadius: 'var(--radius-sm)', fontSize: 10
          }}>
            {skill.skillData.name} Lv.{skill.level}
          </span>
        ))}
      </div>
    </div>
  )
}
