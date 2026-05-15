// ═══ 种族选择场景 ═══
// AS3 原始: iPanel.iScene.RaceScene.as

import React from 'react'
import { useGameContext } from '../../state/GameContext'
import { list as raceList } from '../../core/data/raceData'
import { Race } from '../../core/models/Race'
import { GameLayout } from '../layout/GameLayout'
import { StickFigure } from '../common/StickFigure'

const raceColors: Record<string, string> = {
  '人类': '#4a60d7',
  '精灵': '#4BB814',
  '巨人': '#ff4040',
  '不死': '#BC38d3',
  '矮人': '#FFA640',
}

const statLabels: Record<string, string> = {
  hp: 'HP', mp: 'MP', str: '力量', dex: '敏捷',
  intelligence: '智力', will: '意志', luck: '幸运'
}

const growStatLabels: Record<string, string> = {
  str: '力量', dex: '敏捷', intelligence: '智力', will: '意志', luck: '幸运'
}

export function RaceScene() {
  const { state, dispatch } = useGameContext();
  const [selected, setSelected] = React.useState<Race | null>(null);
  const [age, setAge] = React.useState(10);

  const isRebirth = state.isRebirth;
  const stats = selected?.caculateStat(age);
  const growStats = selected?.ageupList[age - 10];

  const handleConfirm = () => {
    if (!selected) return;
    if (isRebirth) {
      dispatch({ type: 'DO_REBIRTH', age, race: selected });
    } else {
      dispatch({ type: 'PLAYER_BURN', age, race: selected });
    }
  };

  return (
    <div style={{ padding: 30, textAlign: 'center' }}>
      <h1 style={{ color: 'var(--color-red)', fontSize: 24, marginBottom: 20 }}>
        {isRebirth ? '⚡ 转生' : '选择种族'}
      </h1>

      {isRebirth && (
        <div style={{
          color: 'var(--color-text-dim)', fontSize: 13, marginBottom: 16,
          background: 'var(--color-bg-dark)', padding: '8px 16px', borderRadius: 'var(--radius-md)',
          display: 'inline-block'
        }}>
          重新选择你的种族与年龄，所有装备、技能、物品将保留
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
        {raceList.map(race => (
          <button
            key={race.name}
            onClick={() => setSelected(race)}
            style={{
              padding: '8px 16px', fontSize: 14,
              background: selected === race ? raceColors[race.name] || 'var(--color-border)' : 'var(--color-bg-dark)',
              color: selected === race ? '#fff' : 'var(--color-text)',
              border: `2px solid ${raceColors[race.name] || 'var(--color-border)'}`,
              borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            {race.name}
          </button>
        ))}
      </div>

      {selected && (
        <>
          <div style={{ marginBottom: 15 }}>
            <label style={{ color: 'var(--color-text-dim)', marginRight: 10 }}>年龄:</label>
            <input
              type="range" min={10} max={25} value={age}
              onChange={e => setAge(Number(e.target.value))}
              style={{ width: 200, verticalAlign: 'middle' }}
            />
            <span style={{ color: 'var(--color-yellow)', fontSize: 18, marginLeft: 10 }}>{age}岁</span>
          </div>

          {stats && (
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              gap: 30, marginBottom: 20
            }}>
              <div style={{
                background: 'var(--color-bg-dark)', padding: '10px',
                borderRadius: 'var(--radius-md)'
              }}>
                <StickFigure age={age} size={1.8} />
              </div>

              <div style={{
                display: 'inline-block', textAlign: 'left',
                background: 'var(--color-bg-dark)', padding: '15px 25px',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ color: raceColors[selected.name], fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
                  {selected.name} 初始属性
                </div>
                {Object.entries(statLabels).map(([key, label]) => (
                  <div key={key} style={{ color: 'var(--color-text)', fontSize: 14, margin: '3px 0' }}>
                    {label}: <span style={{ color: 'var(--color-yellow)' }}>{(stats as any)[key]}</span>
                  </div>
                ))}

                {growStats && (
                  <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
                    <div style={{ color: 'var(--color-yellow)', fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>
                      年龄增长
                    </div>
                    {Object.entries(growStatLabels).map(([key, label]) => (
                      <div key={key} style={{ color: 'var(--color-text)', fontSize: 14, margin: '3px 0' }}>
                        {label}: <span style={{ color: 'var(--color-green)' }}>+{(growStats as any)[key]}</span>
                      </div>
                    ))}
                    <div style={{ color: 'var(--color-text-dim)', fontSize: 12, marginTop: 6 }}>
                      (升级时增长属性是当前年龄增长的1/4)
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <br />
          <button
            onClick={handleConfirm}
            style={{
              padding: '12px 50px', fontSize: 18,
              background: 'var(--color-green)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius-md)',
              cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            {isRebirth ? '转生' : '开始冒险！'}
          </button>
        </>
      )}
    </div>
  )
}
