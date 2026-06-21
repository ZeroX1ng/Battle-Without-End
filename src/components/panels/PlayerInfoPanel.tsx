import type React from 'react'
import { useCallback } from 'react'
import { useGameContext } from '../../state/GameContext'
import { selectPlayerStats } from '../../state/selectors'
import { getAgeGrowthInfo } from '../../core/models/Player'
import { useInfoWindow } from '../common/InfoWindow'
import { formatAttackRange, formatCritMultiplier, formatPrimaryAttribute } from './playerInfoDisplay'

const PROTECTION_DAMAGE_REDUCTION = 6

function calcProtectionPercent(protection: number): number {
  const p = Math.floor(protection)
  return Math.floor((p * PROTECTION_DAMAGE_REDUCTION) / (p * PROTECTION_DAMAGE_REDUCTION + 100) * 100)
}

// AS3 StringInfoCell tooltip texts — matches iPanel.iCell.StringInfoCell descriptions
const STAT_TOOLTIPS: Record<string, string> = {
  '力量': '增加基础攻击力',
  '敏捷': '影响平衡，增加使用远程武器时候的攻击力',
  '智力': '增加魔法伤害和技能释放率',
  '意志': '影响暴击',
  '幸运': '影响暴击和...？',
  'AP': '技能点，提升技能',
  '战力': '显示了你当前的基础战斗力，不包括装备的加成',
  '攻击': '物理输出',
  '平衡': '影响伤害的平衡，值越大，输出接近最大值的可能性越大',
  '暴击': '暴击概率，可被对方护甲减少',
  '暴击倍数': '暴击倍数，影响暴击时造成输出的倍数',
  '防御': '防御，直接抵消伤害',
  '护甲': '护甲，按百分比抵消伤害，抵消多少百分比鼠标移到到护甲数值上有写',
  '无视护甲': '无视敌方护甲的数值',
}

type PlayerInfoPanelProps = {
  testSpeedControl?: React.ReactNode
}

// ═══ AS3 三列布局 ═══
// AS3 原始公式: x = beginX + sXGap*(i%2) + bXGap*(i/14>>0)
//               y = beginY + yGap + yGap*(i%14/2>>0)
// 42 个元素 (21 label-value 对) 按 index/14 分三列
//   Col 0: 种族, 年龄, LV, HP, MP, EXP, 金钱
//   Col 1: 力量, 敏捷, 智力, 意志, 幸运, AP, 战力
//   Col 2: 攻击, 平衡, 暴击, 暴击倍数, 防御, 护甲, 无视护甲
//
// HP/MP/EXP 条作为全宽组件保留在上方，三列中跳过它们。

export function PlayerInfoPanel({ testSpeedControl }: PlayerInfoPanelProps) {
  const { state } = useGameContext();
  const { showStringInfo, hideStringInfo, updateMouse } = useInfoWindow();
  const s = selectPlayerStats(state.player);
  const battleHp = state.battle?.playerHp ?? s.hp;
  const battleMp = state.battle?.playerMp ?? s.mp;
  const ageGrowthInfo = getAgeGrowthInfo(state.player);
  const protectionPercent = calcProtectionPercent(s.protection);

  const handleTooltip = useCallback((tooltip: string) => (event: React.MouseEvent) => {
    updateMouse(event.clientX, event.clientY);
    showStringInfo(tooltip);
  }, [showStringInfo, updateMouse]);

  return (
    <div style={{
      background: 'var(--color-bg-dark)', borderRadius: 'var(--radius-md)',
      padding: '8px 8px', width: 385, fontSize: 13, maxHeight: 220, overflowY: 'auto'
    }}>
      {/* AS3: _name at x=10,y=10, prefix with title.realName when equipped */}
      <div
        data-bwe-player-name-row
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          minHeight: 24,
          fontSize: 16,
          fontWeight: 'bold',
          color: 'var(--color-red)',
          marginBottom: 4,
        }}
      >
        <span>
          {s.titleRealName ? <span style={{ color: 'var(--color-yellow)' }}>{s.titleRealName}</span> : null}{s.playerName}
        </span>
        {testSpeedControl}
      </div>

      {/* AS3: HP/MP/EXP bars — col0 row3-5, label at x=10, bar at x=40, width ~80px */}
      <div style={{ display: 'flex', gap: 40 }}>
        {/* Col 0: 种族, 年龄, LV (已在 header 中), 金钱 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <StatRow label="种族" value={s.raceName} />
          <AgeRow age={s.age} tooltip={ageGrowthInfo.tooltip} onTooltip={handleTooltip} />
          <StatRow label="LV" value={s.lv} />
          <BarRow label="HP" value={battleHp} max={s.hp} color="var(--color-hp)" />
          <BarRow label="MP" value={battleMp} max={s.mp} color="var(--color-mp)" />
          <BarRow label="EXP" value={s.xp} max={s.maxXp} color="var(--color-exp)" />
          <StatRow label="金钱" value={s.gold} valueColor="#FFA640" />
        </div>

        {/* Col 1: 力量, 敏捷, 智力, 意志, 幸运, AP, 战力 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <PrimaryRow label="力量" value={s.str} basic={s.basicStr} tooltip={STAT_TOOLTIPS['力量']} onTooltip={handleTooltip} />
          <PrimaryRow label="敏捷" value={s.dex} basic={s.basicDex} tooltip={STAT_TOOLTIPS['敏捷']} onTooltip={handleTooltip} />
          <PrimaryRow label="智力" value={s.intelligence} basic={s.basicInt} tooltip={STAT_TOOLTIPS['智力']} onTooltip={handleTooltip} />
          <PrimaryRow label="意志" value={s.will} basic={s.basicWill} tooltip={STAT_TOOLTIPS['意志']} onTooltip={handleTooltip} />
          <PrimaryRow label="幸运" value={s.luck} basic={s.basicLuck} tooltip={STAT_TOOLTIPS['幸运']} onTooltip={handleTooltip} />
          <StatRow label="AP" value={s.ap} valueColor="#ff4040" tooltip={STAT_TOOLTIPS['AP']} onTooltip={handleTooltip} />
          <StatRow label="战力" value={Math.floor(s.combatPower)} valueColor="#21c4af" tooltip={STAT_TOOLTIPS['战力']} onTooltip={handleTooltip} />
        </div>

        {/* Col 2: 攻击, 平衡, 暴击, 暴击倍数, 防御, 护甲, 无视护甲 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <StatRow label="攻击" value={formatAttackRange(s.attmin, s.attmax)} tooltip={STAT_TOOLTIPS['攻击']} onTooltip={handleTooltip} />
          <StatRow label="平衡" value={Math.floor(s.balance)} tooltip={STAT_TOOLTIPS['平衡']} onTooltip={handleTooltip} />
          <StatRow label="暴击" value={`${Math.floor(s.crit)}%`} tooltip={STAT_TOOLTIPS['暴击']} onTooltip={handleTooltip} />
          <StatRow label="暴击倍数" value={formatCritMultiplier(s.crit_mul)} tooltip={STAT_TOOLTIPS['暴击倍数']} onTooltip={handleTooltip} />
          <StatRow label="防御" value={Math.floor(s.defence)} tooltip={STAT_TOOLTIPS['防御']} onTooltip={handleTooltip} />
          <ProtectionRow protection={s.protection} percent={protectionPercent} labelTooltip={STAT_TOOLTIPS['护甲']} onTooltip={handleTooltip} />
          <StatRow label="无视护甲" value={Math.floor(s.protectionIgnore)} tooltip={STAT_TOOLTIPS['无视护甲']} onTooltip={handleTooltip} />
        </div>
      </div>
    </div>
  )
}

// ═══ Row components ═══

const ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 11,
}

const LABEL_STYLE: React.CSSProperties = {
  color: 'var(--color-text-dim)',
  whiteSpace: 'nowrap',
}

const VALUE_STYLE: React.CSSProperties = {
  fontWeight: 'bold',
  textAlign: 'right',
  whiteSpace: 'nowrap',
}

function StatRow({
  label, value, valueColor, tooltip, onTooltip,
}: {
  label: string
  value: string | number
  valueColor?: string
  tooltip?: string
  onTooltip?: (t: string) => (e: React.MouseEvent) => void
}) {
  const { updateMouse, hideStringInfo } = useInfoWindow();
  const hasTooltip = !!(tooltip && onTooltip);
  const handleEnter = hasTooltip ? onTooltip!(tooltip!) : undefined;

  return (
    <div style={ROW_STYLE}>
      <span
        style={{ ...LABEL_STYLE, cursor: hasTooltip ? 'help' : undefined }}
        onMouseEnter={handleEnter}
        onMouseMove={e => handleEnter && updateMouse(e.clientX, e.clientY)}
        onMouseLeave={handleEnter ? hideStringInfo : undefined}
      >
        {label}
      </span>
      <span style={{ ...VALUE_STYLE, color: valueColor || 'var(--color-text)' }}>{value}</span>
    </div>
  )
}

function PrimaryRow({
  label, value, basic, tooltip, onTooltip,
}: {
  label: string
  value: number
  basic: number
  tooltip?: string
  onTooltip?: (t: string) => (e: React.MouseEvent) => void
}) {
  const { updateMouse, hideStringInfo } = useInfoWindow();
  const display = formatPrimaryAttribute(value, basic);
  const hasTooltip = !!(tooltip && onTooltip);
  const handleEnter = hasTooltip ? onTooltip!(tooltip!) : undefined;

  return (
    <div style={ROW_STYLE}>
      <span
        style={{ ...LABEL_STYLE, cursor: hasTooltip ? 'help' : undefined }}
        onMouseEnter={handleEnter}
        onMouseMove={e => handleEnter && updateMouse(e.clientX, e.clientY)}
        onMouseLeave={handleEnter ? hideStringInfo : undefined}
      >
        {label}
      </span>
      <span style={VALUE_STYLE}>
        <span style={{ color: display.color }}>{display.valueText}</span>
        <span style={{ color: 'var(--color-text-dim)', fontSize: 11, marginLeft: 1 }}>({display.basicText})</span>
      </span>
    </div>
  )
}

function AgeRow({
  age, tooltip, onTooltip,
}: {
  age: number
  tooltip: string
  onTooltip: (t: string) => (e: React.MouseEvent) => void
}) {
  const { updateMouse, hideStringInfo } = useInfoWindow();
  const handleEnter = onTooltip(tooltip);

  return (
    <div
      style={{ ...ROW_STYLE, cursor: 'help' }}
      onMouseEnter={handleEnter}
      onMouseMove={e => updateMouse(e.clientX, e.clientY)}
      onMouseLeave={hideStringInfo}
    >
      <span style={LABEL_STYLE}>年龄</span>
      <span style={{ ...VALUE_STYLE, color: 'var(--color-yellow)' }}>{age}岁</span>
    </div>
  )
}

function BarRow({
  label, value, max, color,
}: {
  label: string
  value: number
  max: number
  color: string
}) {
  const { showStringInfo, hideStringInfo, updateMouse } = useInfoWindow();
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  const handleEnter = (e: React.MouseEvent) => {
    updateMouse(e.clientX, e.clientY);
    showStringInfo(`${Math.floor(value)}/${Math.floor(max)}`);
  };

  return (
    <div style={ROW_STYLE}>
      <span style={LABEL_STYLE}>{label}</span>
      <div
        style={{
          width: 60, height: 8,
          background: 'var(--color-bg-dark)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          cursor: 'help',
        }}
        onMouseEnter={handleEnter}
        onMouseMove={e => updateMouse(e.clientX, e.clientY)}
        onMouseLeave={hideStringInfo}
      >
        <div style={{
          width: `${pct}%`, height: '100%',
          background: color,
          borderRadius: 'var(--radius-sm)',
          transition: 'width 0.3s',
        }} />
      </div>
    </div>
  )
}

function ProtectionRow({
  protection, percent, labelTooltip, onTooltip,
}: {
  protection: number
  percent: number
  labelTooltip: string
  onTooltip: (t: string) => (e: React.MouseEvent) => void
}) {
  const { showStringInfo, hideStringInfo, updateMouse } = useInfoWindow();
  const handleLabelEnter = onTooltip(labelTooltip);

  const handleValueEnter = (e: React.MouseEvent) => {
    updateMouse(e.clientX, e.clientY);
    showStringInfo(`${percent}%`);
  };

  return (
    <div style={ROW_STYLE}>
      <span
        style={{ ...LABEL_STYLE, cursor: 'help' }}
        onMouseEnter={handleLabelEnter}
        onMouseMove={e => updateMouse(e.clientX, e.clientY)}
        onMouseLeave={hideStringInfo}
      >
        护甲
      </span>
      <span
        style={{ ...VALUE_STYLE, color: 'var(--color-text)', cursor: 'help' }}
        onMouseEnter={handleValueEnter}
        onMouseMove={e => updateMouse(e.clientX, e.clientY)}
        onMouseLeave={hideStringInfo}
      >
        {Math.floor(protection)}
      </span>
    </div>
  )
}
