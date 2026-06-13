// ═══ 帮助窗口 ═══
// AS3 原始: iPanel.iScene.iPanel.HelpPanel.as
// 展示游戏帮助信息和版本说明，包含战斗力/技能/装备品质/怪兽/宠物系统说明

import { useGameContext } from '../../state/GameContext'
import { QualityColor, QualityName } from '../../core/constants'

export function HelpWindow() {
  const { dispatch } = useGameContext();

  const qName = (q: number) => QualityName[q] || '未知';
  const qColor = (q: number) => QualityColor[q] || '#c8c8d4';

  const helpHtml = [
    `<font size="14">你们好，这里主要用来放置一下帮助和版本信息</font><br/>`,
    `<br/>`,
    `<b>战斗力：</b>显示值表示的是没有任何装备的情况下的基础战斗力，所以装备不影响<br/>`,
    `<br/>`,
    `<b>技能：</b>主动技能，需要你装备后，才会在战斗中使用。当某些技能等级达到1后，会学会新的进阶技能<br/>`,
    `<br/>`,
    `<b>装备：</b><br/>`,
    `\t-装备共有6种品质：基础、<font color="${qColor(1)}">${qName(1)}</font>、<font color="${qColor(2)}">${qName(2)}</font>、<font color="${qColor(3)}">${qName(3)}</font>、<font color="${qColor(4)}">${qName(4)}</font>、<font color="${qColor(5)}">${qName(5)}</font><br/>`,
    `\t-区域boss有很大概率掉落 <font color="${qColor(5)}">${qName(5)}</font> 装备，普通的怪兽也有，但概率非常之小<br/>`,
    `\t-装备的价值，受到你的战斗力和怪兽的战斗力比值的影响，差距越大，装备越好的可能性越大，幸运和地图等级也影响装备的价值<br/>`,
    `<br/>`,
    `<b>怪兽：</b><br/>`,
    `\t-某些怪兽有称号，这使得他们变强大，当然掉落也会变好<br/>`,
    `\t-每个地图都有一个区域boss，区域boss在每次战斗结束后，将会维持当前的血量到下次战斗，打败区域boss后有概率获得宠物<br/>`,
    `<br/>`,
    `<b>宠物：</b><br/>`,
    `\t-宠物通过击败区域boss获得<br/>`,
    `\t-打败一个区域boss不能保证你一定会获得宠物，幸运也影响掉落<br/>`,
    `\t-每个宠物都有不同的初始属性和不同的成长值，但总体来说，越高地图掉落的宠物越好<br/>`,
    `\t-如果宠物在战斗中死亡，将不会获得任何经验<br/>`,
    `\t-宠物如果超过人物5级，将不会获得经验<br/>`,
    `\t-宠物最多能有4个技能，升级时有一定概率领悟技能<br/>`,
  ].join('');

  return (
    <div style={{ padding: 8, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <b style={{ color: 'var(--color-text)', fontSize: 15 }}>帮助</b>
      </div>
      <div style={{
        flex: 1, overflowY: 'auto', fontSize: 12, lineHeight: '22px',
        color: 'var(--color-text)', padding: '4px 0'
      }}>
        <div dangerouslySetInnerHTML={{ __html: helpHtml }} />
      </div>
    </div>
  );
}
