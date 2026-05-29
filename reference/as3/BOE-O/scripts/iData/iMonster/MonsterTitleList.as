package iData.iMonster
{
   import iData.iItem.Stat;
   
   public class MonsterTitleList
   {
      
      public static const list:Vector.<MonsterTitle> = new <MonsterTitle>[new MonsterTitle("肉盾",new <StatMul>[new StatMul(Stat.hp,3),new StatMul(Stat.defence,1.5,10),new StatMul(Stat.protection,1.5,5)],3,2,1.5),new MonsterTitle("难看的",new <StatMul>[new StatMul(Stat.hp,1.2)],1.2,1.2,1.4),new MonsterTitle("可疑的",new Vector.<StatMul>(0),3,3,3),new MonsterTitle("未知的",new <StatMul>[new StatMul(Stat.ATTACK,2,20),new StatMul(Stat.hp,3,30),new StatMul(Stat.defence,5,20),new StatMul(Stat.protection,3,15)],5,5,1.8),new MonsterTitle("非常难看的",new <StatMul>[new StatMul(Stat.hp,1.5)],1.5,1.5,1.5),new MonsterTitle("看起来很凶的",new <StatMul>[new StatMul(Stat.ATTACK,2),new StatMul(Stat.hp,2)],2,1.5,1.5),new MonsterTitle("刚赌赢了一把的",new Vector.<StatMul>(0),1,5,1),new MonsterTitle("眼神锐利的",new <StatMul>[new StatMul(Stat.crit,2,15),new StatMul(Stat.crit_mul,2)],2,1.5,1.5),new MonsterTitle("10岁打到人的",new <StatMul>[new StatMul(Stat.ATTACK,1.5),new StatMul(Stat.hp,1.5),new StatMul(Stat.crit,2),new StatMul(Stat.defence,1,10),new StatMul(Stat
      .protection,1,5)],3,1.5,1.6),new MonsterTitle("努力的 ",new <StatMul>[new StatMul(Stat.ATTACK,2),new StatMul(Stat.hp,5),new StatMul(Stat.defence,2,10)],3,1.5,1.8),new MonsterTitle("头头",new <StatMul>[new StatMul(Stat.ATTACK,3),new StatMul(Stat.hp,3),new StatMul(Stat.crit,3),new StatMul(Stat.defence,2,10),new StatMul(Stat.protection,2,5),new StatMul(Stat.crit_mul,2)],4,3,2.2),new MonsterTitle("被诅咒的",new <StatMul>[new StatMul(Stat.ATTACK,2),new StatMul(Stat.hp,2)],0.5,0.5,0.7),new MonsterTitle("弱小的",new <StatMul>[new StatMul(Stat.ATTACK,0.8),new StatMul(Stat.hp,0.8)],0.5,0.5,0.7),new MonsterTitle("有野心的",new <StatMul>[new StatMul(Stat.ATTACK,1.5),new StatMul(Stat.hp,1.5)],1,1,1.4),new MonsterTitle("重获新生的",new <StatMul>[new StatMul(Stat.ATTACK,1.5),new StatMul(Stat.hp,2)],1.2,1,1.4),new MonsterTitle("神圣的",new <StatMul>[new StatMul(Stat.defence,3,30),new StatMul(Stat.protection,3,20)],3,3,2.1),new MonsterTitle("将要灭绝的",new <StatMul>[new StatMul(Stat.defence,2,20),new StatMul(Stat.protection,2,10)]
      ,2,2,1.7),new MonsterTitle("初级召唤的",new <StatMul>[new StatMul(Stat.ATTACK,1.5,10),new StatMul(Stat.hp,2,30),new StatMul(Stat.defence,1.5,10),new StatMul(Stat.protection,1.5,5),new StatMul(Stat.crit,1.5,10),new StatMul(Stat.crit_mul,1.5)],1.5,1.5,2),new MonsterTitle("进阶召唤的",new <StatMul>[new StatMul(Stat.ATTACK,2.5,20),new StatMul(Stat.hp,3,60),new StatMul(Stat.defence,2,30),new StatMul(Stat.protection,2,10),new StatMul(Stat.crit,2,15),new StatMul(Stat.crit_mul,2)],2,2,3),new MonsterTitle("大神召唤的",new <StatMul>[new StatMul(Stat.ATTACK,4,30),new StatMul(Stat.hp,5,90),new StatMul(Stat.defence,2.5,50),new StatMul(Stat.protection,2.5,18),new StatMul(Stat.crit,2.5,25),new StatMul(Stat.crit_mul,2.5)],3,3,4),new MonsterTitle("精英召唤的",new <StatMul>[new StatMul(Stat.ATTACK,6,40),new StatMul(Stat.hp,7,120),new StatMul(Stat.defence,3.5,70),new StatMul(Stat.protection,3.5,30),new StatMul(Stat.crit,3.5,40),new StatMul(Stat.crit_mul,3.5)],5,5,5),new MonsterTitle("远古的",new <StatMul>[new StatMul(Stat.ATTACK
      ,3,50),new StatMul(Stat.hp,10,100),new StatMul(Stat.defence,1.5,30),new StatMul(Stat.protection,1.5,35),new StatMul(Stat.crit,1.5,10),new StatMul(Stat.crit_mul,1.5)],10,10,2.8)];
      
      public static const REGION_BOSS:MonsterTitle = new MonsterTitle("<font color=\'#ff4040\'>区域BOSS</font>",new <StatMul>[new StatMul(Stat.ATTACK,3,50),new StatMul(Stat.hp,50,100),new StatMul(Stat.defence,0,0),new StatMul(Stat.protection,1,50),new StatMul(Stat.crit,2.5,100),new StatMul(Stat.crit_mul,2.5,50)],20,20,3);
      
      public function MonsterTitleList()
      {
         super();
      }
   }
}

