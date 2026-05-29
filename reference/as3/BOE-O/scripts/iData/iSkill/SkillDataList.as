package iData.iSkill
{
   import iData.iItem.Equipment;
   import iData.iItem.Stat;
   import iData.iMonster.Monster;
   import iData.iPlayer.TitleList;
   import iData.iSkill.iBuff.BuffBurn;
   import iData.iSkill.iBuff.BuffCorrosion;
   import iData.iSkill.iBuff.BuffFrozen;
   import iData.iSkill.iBuff.BuffPoison;
   import iGlobal.Global;
   import iGlobal.Player;
   import iPanel.iScene.MainScene;
   import tool.MyMath;
   
   public class SkillDataList
   {
      
      public static const COMBAT_MASTERY:PassiveSkillData = new PassiveSkillData("Combat Mastery","近战精通",SkillCategory.MELEE,new <Vector.<Stat>>[new <Stat>[new Stat(Stat.hp,10),new Stat(Stat.str,1)],new <Stat>[new Stat(Stat.hp,20),new Stat(Stat.str,3)],new <Stat>[new Stat(Stat.hp,30),new Stat(Stat.str,6)],new <Stat>[new Stat(Stat.hp,40),new Stat(Stat.str,9)],new <Stat>[new Stat(Stat.hp,50),new Stat(Stat.str,12)],new <Stat>[new Stat(Stat.hp,60),new Stat(Stat.str,16)],new <Stat>[new Stat(Stat.hp,70),new Stat(Stat.str,20)],new <Stat>[new Stat(Stat.hp,80),new Stat(Stat.str,24)],new <Stat>[new Stat(Stat.hp,90),new Stat(Stat.str,28)],new <Stat>[new Stat(Stat.hp,100),new Stat(Stat.str,32)],new <Stat>[new Stat(Stat.hp,110),new Stat(Stat.str,34),new Stat(Stat.dex,2)],new <Stat>[new Stat(Stat.hp,120),new Stat(Stat.str,36),new Stat(Stat.dex,4)],new <Stat>[new Stat(Stat.hp,130),new Stat(Stat.str,38),new Stat(Stat.dex,6)],new <Stat>[new Stat(Stat.hp,140),new Stat(Stat.str,40),new Stat(Stat.dex,8)],new <Stat>[new Stat(Stat
      .hp,150),new Stat(Stat.str,42),new Stat(Stat.dex,10)]],new <Vector.<Stat>>[new <Stat>[new Stat(Stat.attackMax,1),new Stat(Stat.balance,1)],new <Stat>[new Stat(Stat.attackMax,2),new Stat(Stat.balance,2)],new <Stat>[new Stat(Stat.attackMax,3),new Stat(Stat.balance,3)],new <Stat>[new Stat(Stat.attackMin,1),new Stat(Stat.attackMax,4),new Stat(Stat.balance,4)],new <Stat>[new Stat(Stat.attackMin,2),new Stat(Stat.attackMax,5),new Stat(Stat.balance,5)],new <Stat>[new Stat(Stat.attackMin,3),new Stat(Stat.attackMax,5),new Stat(Stat.balance,6)],new <Stat>[new Stat(Stat.attackMin,4),new Stat(Stat.attackMax,6),new Stat(Stat.balance,7)],new <Stat>[new Stat(Stat.attackMin,4),new Stat(Stat.attackMax,7),new Stat(Stat.balance,8)],new <Stat>[new Stat(Stat.attackMin,4),new Stat(Stat.attackMax,8),new Stat(Stat.balance,9)],new <Stat>[new Stat(Stat.attackMin,4),new Stat(Stat.attackMax,9),new Stat(Stat.balance,10)],new <Stat>[new Stat(Stat.attackMin,5),new Stat(Stat.attackMax,10),new Stat(Stat.balance,11)],new <Stat>[new Stat(Stat
      .attackMin,6),new Stat(Stat.attackMax,11),new Stat(Stat.balance,12)],new <Stat>[new Stat(Stat.attackMin,6),new Stat(Stat.attackMax,13),new Stat(Stat.balance,13)],new <Stat>[new Stat(Stat.attackMin,6),new Stat(Stat.attackMax,16),new Stat(Stat.balance,14)],new <Stat>[new Stat(Stat.attackMin,8),new Stat(Stat.attackMax,18),new Stat(Stat.balance,15)]],new <int>[0,1,3,5,7,8,10,12,14,16,20,22,24,26,30],des_combat_master);
      
      public static const SMASH:ActiveSkillData = new ActiveSkillData("Smash","重击",SkillType.ATTACK,SkillCategory.MELEE,new <Vector.<Stat>>[new Vector.<Stat>(0),new Vector.<Stat>(0),new Vector.<Stat>(0),new Vector.<Stat>(0),new Vector.<Stat>(0),new Vector.<Stat>(0),new Vector.<Stat>(0),new <Stat>[new Stat(Stat.str,1),new Stat(Stat.will,1)],new <Stat>[new Stat(Stat.str,2),new Stat(Stat.will,2)],new <Stat>[new Stat(Stat.str,3),new Stat(Stat.will,3)],new <Stat>[new Stat(Stat.str,4),new Stat(Stat.will,4)],new <Stat>[new Stat(Stat.str,5),new Stat(Stat.will,5)],new <Stat>[new Stat(Stat.str,6),new Stat(Stat.will,6)],new <Stat>[new Stat(Stat.str,7),new Stat(Stat.will,7)],new <Stat>[new Stat(Stat.str,8),new Stat(Stat.will,8)]],null,new <int>[0,2,4,6,8,10,11,11,11,11,13,13,13,13,20],[200,210,220,230,240,250,300,310,320,330,400,420,440,460,500],des_smash,behave_smash);
      
      public static const CRITICAL_HIT:PassiveSkillData = new PassiveSkillData("Critical Hit","暴击",SkillCategory.ALL,new <Vector.<Stat>>[new <Stat>[new Stat(Stat.will,3),new Stat(Stat.crit_mul,50)],new <Stat>[new Stat(Stat.will,6),new Stat(Stat.crit_mul,55)],new <Stat>[new Stat(Stat.will,9),new Stat(Stat.crit_mul,60)],new <Stat>[new Stat(Stat.will,12),new Stat(Stat.crit_mul,65)],new <Stat>[new Stat(Stat.will,15),new Stat(Stat.crit_mul,70)],new <Stat>[new Stat(Stat.will,18),new Stat(Stat.crit_mul,75)],new <Stat>[new Stat(Stat.will,21),new Stat(Stat.crit_mul,90)],new <Stat>[new Stat(Stat.will,24),new Stat(Stat.crit_mul,95)],new <Stat>[new Stat(Stat.will,27),new Stat(Stat.crit_mul,100)],new <Stat>[new Stat(Stat.will,30),new Stat(Stat.crit_mul,105)],new <Stat>[new Stat(Stat.will,33),new Stat(Stat.crit_mul,110)],new <Stat>[new Stat(Stat.will,36),new Stat(Stat.crit_mul,120)],new <Stat>[new Stat(Stat.will,39),new Stat(Stat.crit_mul,130)],new <Stat>[new Stat(Stat.will,42),new Stat(Stat.crit_mul,140)],new <Stat>[new Stat(Stat
      .will,45),new Stat(Stat.crit_mul,150)]],null,new <int>[3,3,3,3,4,5,6,7,8,10,12,14,16,18,20],des_combat_master);
      
      public static const BLACKSMITHING:PassiveSkillData = new PassiveSkillData("Blacksmithing","锻造",SkillCategory.ALL,new <Vector.<Stat>>[new <Stat>[new Stat(Stat.dex,1),new Stat(Stat.intelligence,1)],new <Stat>[new Stat(Stat.dex,2),new Stat(Stat.intelligence,2)],new <Stat>[new Stat(Stat.dex,3),new Stat(Stat.intelligence,3)],new <Stat>[new Stat(Stat.dex,4),new Stat(Stat.intelligence,4)],new <Stat>[new Stat(Stat.dex,5),new Stat(Stat.intelligence,5)],new <Stat>[new Stat(Stat.dex,6),new Stat(Stat.intelligence,6)],new <Stat>[new Stat(Stat.dex,7),new Stat(Stat.intelligence,7)],new <Stat>[new Stat(Stat.dex,8),new Stat(Stat.intelligence,8)],new <Stat>[new Stat(Stat.dex,9),new Stat(Stat.intelligence,9)],new <Stat>[new Stat(Stat.dex,11),new Stat(Stat.intelligence,11)],new <Stat>[new Stat(Stat.dex,13),new Stat(Stat.intelligence,13)],new <Stat>[new Stat(Stat.dex,15),new Stat(Stat.intelligence,15)],new <Stat>[new Stat(Stat.dex,17),new Stat(Stat.intelligence,17)],new <Stat>[new Stat(Stat.dex,19),new Stat(Stat
      .intelligence,19)],new <Stat>[new Stat(Stat.dex,21),new Stat(Stat.intelligence,21)]],null,new <int>[0,1,2,3,4,5,10,11,12,13,20,21,22,23,30],des_blacksmithing);
      
      public static const DEFENCE:ActiveSkillData = new ActiveSkillData("Defence","防御",SkillType.DEFENCE,SkillCategory.ALL,new <Vector.<Stat>>[new <Stat>[new Stat(Stat.hp,2),new Stat(Stat.defence,1)],new <Stat>[new Stat(Stat.hp,4),new Stat(Stat.defence,2)],new <Stat>[new Stat(Stat.hp,6),new Stat(Stat.defence,3)],new <Stat>[new Stat(Stat.hp,8),new Stat(Stat.defence,4)],new <Stat>[new Stat(Stat.hp,10),new Stat(Stat.defence,5)],new <Stat>[new Stat(Stat.hp,12),new Stat(Stat.defence,6)],new <Stat>[new Stat(Stat.hp,14),new Stat(Stat.defence,7)],new <Stat>[new Stat(Stat.hp,16),new Stat(Stat.defence,8)],new <Stat>[new Stat(Stat.hp,18),new Stat(Stat.defence,9)],new <Stat>[new Stat(Stat.hp,20),new Stat(Stat.defence,10)],new <Stat>[new Stat(Stat.hp,22),new Stat(Stat.defence,11)],new <Stat>[new Stat(Stat.hp,25),new Stat(Stat.defence,12)],new <Stat>[new Stat(Stat.hp,28),new Stat(Stat.defence,13)],new <Stat>[new Stat(Stat.hp,31),new Stat(Stat.defence,14)],new <Stat>[new Stat(Stat.hp,41),new Stat(Stat.defence
      ,15)]],null,new <int>[0,1,3,5,7,8,11,12,13,14,17,18,19,20,25],[[20,5,1.1],[21,6,1.15],[22,7,1.2],[24,8,1.25],[26,9,1.3],[28,10,1.4],[32,12,1.45],[34,13,1.5],[38,14,1.55],[42,15,1.7],[46,17,1.75],[50,20,1.8],[54,23,1.85],[59,26,1.9],[65,30,2]],des_defence,behave_defence);
      
      public static const COUNTERATTACK:ActiveSkillData = new ActiveSkillData("Counterattack","反击",SkillType.DEFENCE,SkillCategory.MELEE,new <Vector.<Stat>>[new <Stat>[new Stat(Stat.dex,1)],new <Stat>[new Stat(Stat.dex,2)],new <Stat>[new Stat(Stat.dex,3)],new <Stat>[new Stat(Stat.dex,4)],new <Stat>[new Stat(Stat.dex,5)],new <Stat>[new Stat(Stat.dex,6)],new <Stat>[new Stat(Stat.dex,7)],new <Stat>[new Stat(Stat.dex,8)],new <Stat>[new Stat(Stat.dex,9)],new <Stat>[new Stat(Stat.dex,10)],new <Stat>[new Stat(Stat.dex,11)],new <Stat>[new Stat(Stat.dex,12)],new <Stat>[new Stat(Stat.dex,13)],new <Stat>[new Stat(Stat.dex,14)],new <Stat>[new Stat(Stat.dex,15)]],null,new <int>[3,4,5,6,6,7,8,9,10,11,12,13,14,15,18],[[50,100,5,5],[60,100,5,5],[70,100,5,5],[80,100,5,5],[90,100,5,5],[100,100,5,5],[120,110,10,10],[130,115,10,10],[140,120,10,10],[150,125,10,10],[160,130,15,15],[170,135,15,15],[180,140,15,15],[190,140,15,15],[200,150,20,20]],des_counterattack,behave_counterattack);
      
      public static const MAGIC_MASTERY:PassiveSkillData = new PassiveSkillData("Magic Mastery","魔法精通",SkillCategory.MAGIC,new <Vector.<Stat>>[new <Stat>[new Stat(Stat.mp,10)],new <Stat>[new Stat(Stat.mp,20)],new <Stat>[new Stat(Stat.mp,30)],new <Stat>[new Stat(Stat.mp,40)],new <Stat>[new Stat(Stat.mp,50)],new <Stat>[new Stat(Stat.mp,60)],new <Stat>[new Stat(Stat.mp,70),new Stat(Stat.intelligence,1)],new <Stat>[new Stat(Stat.mp,80),new Stat(Stat.intelligence,2)],new <Stat>[new Stat(Stat.mp,90),new Stat(Stat.intelligence,3)],new <Stat>[new Stat(Stat.mp,100),new Stat(Stat.intelligence,4)],new <Stat>[new Stat(Stat.mp,110),new Stat(Stat.intelligence,6)],new <Stat>[new Stat(Stat.mp,120),new Stat(Stat.intelligence,8)],new <Stat>[new Stat(Stat.mp,130),new Stat(Stat.intelligence,10)],new <Stat>[new Stat(Stat.mp,140),new Stat(Stat.intelligence,12)],new <Stat>[new Stat(Stat.mp,150),new Stat(Stat.intelligence,17)]],null,new <int>[1,1,2,2,3,3,5,5,7,7,10,10,10,10,15],des_combat_master);
      
      public static const FIREBOLT:ActiveSkillData = new ActiveSkillData("Firebolt","火焰",SkillType.ATTACK,SkillCategory.MAGIC,new <Vector.<Stat>>[new <Stat>[new Stat(Stat.intelligence,1)],new <Stat>[new Stat(Stat.intelligence,3)],new <Stat>[new Stat(Stat.intelligence,5)],new <Stat>[new Stat(Stat.intelligence,7)],new <Stat>[new Stat(Stat.intelligence,10)],new <Stat>[new Stat(Stat.intelligence,13)],new <Stat>[new Stat(Stat.intelligence,16)],new <Stat>[new Stat(Stat.intelligence,20)],new <Stat>[new Stat(Stat.intelligence,24)],new <Stat>[new Stat(Stat.intelligence,28)],new <Stat>[new Stat(Stat.intelligence,32)],new <Stat>[new Stat(Stat.intelligence,37)],new <Stat>[new Stat(Stat.intelligence,42)],new <Stat>[new Stat(Stat.intelligence,47)],new <Stat>[new Stat(Stat.intelligence,52)]],null,new <int>[1,1,2,2,3,3,5,5,7,7,12,12,12,12,15],[[7,25,10],[8,27,10],[9,28,15],[11,30,15],[13,35,15],[15,40,15],[18,45,20],[21,50,20],[25,55,20],[29,60,20],[40,80,25],[45,85,25],[50,90,25],[55,95,25],[60,120,30]],des_magic_bolt
      ,behave_bolt);
      
      public static const ICEBOLT:ActiveSkillData = new ActiveSkillData("Icebolt","冰矛",SkillType.ATTACK,SkillCategory.MAGIC,new <Vector.<Stat>>[new <Stat>[new Stat(Stat.intelligence,1)],new <Stat>[new Stat(Stat.intelligence,3)],new <Stat>[new Stat(Stat.intelligence,5)],new <Stat>[new Stat(Stat.intelligence,7)],new <Stat>[new Stat(Stat.intelligence,10)],new <Stat>[new Stat(Stat.intelligence,13)],new <Stat>[new Stat(Stat.intelligence,16)],new <Stat>[new Stat(Stat.intelligence,20)],new <Stat>[new Stat(Stat.intelligence,24)],new <Stat>[new Stat(Stat.intelligence,28)],new <Stat>[new Stat(Stat.intelligence,32)],new <Stat>[new Stat(Stat.intelligence,37)],new <Stat>[new Stat(Stat.intelligence,42)],new <Stat>[new Stat(Stat.intelligence,47)],new <Stat>[new Stat(Stat.intelligence,52)]],null,new <int>[1,1,2,2,3,3,3,5,5,5,7,8,9,10,20],[[10,20,5],[11,21,5],[13,23,5],[15,25,5],[18,27,5],[21,30,5],[24,35,10],[28,40,10],[32,45,10],[37,48,10],[48,54,15],[53,59,15],[59,65,15],[63,72,15],[70,80,20]],des_magic_bolt
      ,behave_bolt);
      
      public static const LIGHTNINGBOLT:ActiveSkillData = new ActiveSkillData("LightningBolt","雷矢",SkillType.ATTACK,SkillCategory.MAGIC,new <Vector.<Stat>>[new <Stat>[new Stat(Stat.intelligence,1)],new <Stat>[new Stat(Stat.intelligence,3)],new <Stat>[new Stat(Stat.intelligence,5)],new <Stat>[new Stat(Stat.intelligence,7)],new <Stat>[new Stat(Stat.intelligence,10)],new <Stat>[new Stat(Stat.intelligence,13)],new <Stat>[new Stat(Stat.intelligence,16)],new <Stat>[new Stat(Stat.intelligence,20)],new <Stat>[new Stat(Stat.intelligence,24)],new <Stat>[new Stat(Stat.intelligence,28)],new <Stat>[new Stat(Stat.intelligence,32)],new <Stat>[new Stat(Stat.intelligence,37)],new <Stat>[new Stat(Stat.intelligence,42)],new <Stat>[new Stat(Stat.intelligence,47)],new <Stat>[new Stat(Stat.intelligence,52)]],null,new <int>[1,2,3,4,5,5,8,8,8,8,10,10,10,10,20],[[1,40,15],[2,46,15],[3,52,15],[4,58,15],[5,65,15],[6,72,15],[8,79,15],[9,86,15],[11,93,15],[13,100,15],[20,110,20],[24,120,20],[28,130,20],[32,140,20],[40,150
      ,25]],des_magic_bolt,behave_bolt);
      
      public static const FIREBALL:ActiveSkillData = new ActiveSkillData("Fireball","火球",SkillType.ATTACK,SkillCategory.MAGIC,new <Vector.<Stat>>[new <Stat>[new Stat(Stat.intelligence,3)],new <Stat>[new Stat(Stat.intelligence,6)],new <Stat>[new Stat(Stat.intelligence,9)],new <Stat>[new Stat(Stat.intelligence,12)],new <Stat>[new Stat(Stat.intelligence,16)],new <Stat>[new Stat(Stat.intelligence,20)],new <Stat>[new Stat(Stat.intelligence,24)],new <Stat>[new Stat(Stat.intelligence,29)],new <Stat>[new Stat(Stat.intelligence,34)],new <Stat>[new Stat(Stat.intelligence,39)],new <Stat>[new Stat(Stat.intelligence,44)],new <Stat>[new Stat(Stat.intelligence,49),new Stat(Stat.str,2)],new <Stat>[new Stat(Stat.intelligence,54),new Stat(Stat.str,5)],new <Stat>[new Stat(Stat.intelligence,59),new Stat(Stat.str,8)],new <Stat>[new Stat(Stat.intelligence,64),new Stat(Stat.str,12)]],null,new <int>[7,8,9,10,12,15,17,20,25,30,35,40,45,50,60],[[32,80,40,0.2],[48,128,40,0.2],[64,160,40,0.2],[80,192,45,0.2],[112,208,45
      ,0.25],[144,240,45,0.25],[208,320,50,0.25],[224,336,50,0.3],[240,352,50,0.4],[288,368,50,0.5],[288,400,50,0.6],[288,416,50,0.7],[288,432,50,0.8],[288,448,50,0.9],[320,480,55,1]],des_fireball,behave_fireball);
      
      public static const THUNDER:ActiveSkillData = new ActiveSkillData("Thunder","雷击",SkillType.ATTACK,SkillCategory.MAGIC,new <Vector.<Stat>>[new <Stat>[new Stat(Stat.mp,5),new Stat(Stat.will,1)],new <Stat>[new Stat(Stat.mp,10),new Stat(Stat.will,2)],new <Stat>[new Stat(Stat.mp,15),new Stat(Stat.will,3)],new <Stat>[new Stat(Stat.mp,21),new Stat(Stat.will,4)],new <Stat>[new Stat(Stat.mp,27),new Stat(Stat.will,5)],new <Stat>[new Stat(Stat.mp,33),new Stat(Stat.will,6)],new <Stat>[new Stat(Stat.mp,40),new Stat(Stat.will,8)],new <Stat>[new Stat(Stat.mp,47),new Stat(Stat.will,10)],new <Stat>[new Stat(Stat.mp,55),new Stat(Stat.will,12)],new <Stat>[new Stat(Stat.mp,65),new Stat(Stat.will,14)],new <Stat>[new Stat(Stat.mp,70),new Stat(Stat.will,17)],new <Stat>[new Stat(Stat.mp,75),new Stat(Stat.will,20)],new <Stat>[new Stat(Stat.mp,80),new Stat(Stat.will,23)],new <Stat>[new Stat(Stat.mp,85),new Stat(Stat.will,26)],new <Stat>[new Stat(Stat.mp,90),new Stat(Stat.will,29)]],null,new <int>[2,4,6,9,12,16,20,25,30,35,40,45,50,55,60]
      ,[[16,106,45,5,0.02],[26,160,45,5,0.02],[34,210,45,5,0.02],[50,262,45,5,0.02],[70,328,45,10,0.025],[82,380,50,10,0.025],[98,460,50,10,0.025],[104,536,50,10,0.03],[118,572,50,10,0.04],[126,628,50,10,0.05],[134,660,50,10,0.06],[148,716,55,10,0.07],[148,782,55,10,0.08],[148,848,55,10,0.09],[160,880,60,15,0.1]],des_thunder,behave_thunder);
      
      public static const ICE_SPEAR:ActiveSkillData = new ActiveSkillData("Ice Spear","冰刃",SkillType.ATTACK,SkillCategory.MAGIC,new <Vector.<Stat>>[new <Stat>[new Stat(Stat.intelligence,1)],new <Stat>[new Stat(Stat.intelligence,2)],new <Stat>[new Stat(Stat.intelligence,3)],new <Stat>[new Stat(Stat.intelligence,4)],new <Stat>[new Stat(Stat.intelligence,5)],new <Stat>[new Stat(Stat.intelligence,6)],new <Stat>[new Stat(Stat.intelligence,8)],new <Stat>[new Stat(Stat.intelligence,10)],new <Stat>[new Stat(Stat.intelligence,12)],new <Stat>[new Stat(Stat.intelligence,14)],new <Stat>[new Stat(Stat.intelligence,17),new Stat(Stat.mp,5)],new <Stat>[new Stat(Stat.intelligence,20),new Stat(Stat.mp,10)],new <Stat>[new Stat(Stat.intelligence,23),new Stat(Stat.mp,15)],new <Stat>[new Stat(Stat.intelligence,26),new Stat(Stat.mp,20)],new <Stat>[new Stat(Stat.intelligence,29),new Stat(Stat.mp,30)]],null,new <int>[4,6,8,10,12,14,20,25,30,35,42,48,54,60,70],[[80,88,30,5,0.02,1],[84,96,30,5,0.02,1],[88,104,30,5,0.02
      ,1],[92,112,30,5,0.02,1],[96,120,30,10,0.025,1],[100,128,30,10,0.025,1],[112,144,35,10,0.025,1],[116,152,35,10,0.03,1],[120,160,35,10,0.04,1],[124,168,35,10,0.05,1],[136,184,35,10,0.06,2],[140,192,40,10,0.07,2],[144,200,40,10,0.08,2],[148,208,40,10,0.09,2],[160,240,45,15,0.1,3]],des_icespear,behave_ice_spear);
      
      public static const MANA_SHIELD:ActiveSkillData = new ActiveSkillData("Mana Shield","魔法盾",SkillType.DEFENCE,SkillCategory.MAGIC,new <Vector.<Stat>>[new <Stat>[new Stat(Stat.mp,2)],new <Stat>[new Stat(Stat.mp,4)],new <Stat>[new Stat(Stat.mp,6)],new <Stat>[new Stat(Stat.mp,8)],new <Stat>[new Stat(Stat.mp,10)],new <Stat>[new Stat(Stat.mp,12)],new <Stat>[new Stat(Stat.mp,15),new Stat(Stat.intelligence,1)],new <Stat>[new Stat(Stat.mp,18),new Stat(Stat.intelligence,2)],new <Stat>[new Stat(Stat.mp,21),new Stat(Stat.intelligence,3)],new <Stat>[new Stat(Stat.mp,24),new Stat(Stat.intelligence,4)],new <Stat>[new Stat(Stat.mp,28),new Stat(Stat.intelligence,5)],new <Stat>[new Stat(Stat.mp,32),new Stat(Stat.intelligence,6)],new <Stat>[new Stat(Stat.mp,36),new Stat(Stat.intelligence,7)],new <Stat>[new Stat(Stat.mp,40),new Stat(Stat.intelligence,8)],new <Stat>[new Stat(Stat.mp,50),new Stat(Stat.intelligence,11)]],null,new <int>[4,6,8,10,12,14,17,20,23,26,30,34,38,42,50],[[5,0.002,0.5,30],[5,0.002,0.5,35]
      ,[5,0.002,0.5,40],[5,0.002,0.5,45],[10,0.0025,0.75,50],[10,0.0025,0.75,55],[10,0.0025,0.75,60],[10,0.003,0.75,65],[10,0.004,1,70],[10,0.005,1,75],[10,0.006,1,80],[10,0.007,1,85],[10,0.008,1,90],[10,0.009,1,95],[15,0.01,1.5,95]],des_mana_shield,behave_mana_shield);
      
      public static const RANGE_MASTERY:PassiveSkillData = new PassiveSkillData("Range Mastery","远程精通",SkillCategory.RANGED,new <Vector.<Stat>>[new <Stat>[new Stat(Stat.dex,2)],new <Stat>[new Stat(Stat.dex,4)],new <Stat>[new Stat(Stat.dex,6)],new <Stat>[new Stat(Stat.dex,8)],new <Stat>[new Stat(Stat.dex,10)],new <Stat>[new Stat(Stat.dex,14)],new <Stat>[new Stat(Stat.dex,18)],new <Stat>[new Stat(Stat.dex,22)],new <Stat>[new Stat(Stat.dex,26)],new <Stat>[new Stat(Stat.dex,30),new Stat(Stat.str,1)],new <Stat>[new Stat(Stat.dex,34),new Stat(Stat.str,2),new Stat(Stat.will,2)],new <Stat>[new Stat(Stat.dex,38),new Stat(Stat.str,3),new Stat(Stat.will,4)],new <Stat>[new Stat(Stat.dex,42),new Stat(Stat.str,4),new Stat(Stat.will,6)],new <Stat>[new Stat(Stat.dex,46),new Stat(Stat.str,5),new Stat(Stat.will,8)],new <Stat>[new Stat(Stat.dex,50),new Stat(Stat.str,6),new Stat(Stat.will,10)]],new <Vector.<Stat>>[new <Stat>[new Stat(Stat.attackMax,1),new Stat(Stat.balance,1)],new <Stat>[new Stat(Stat.attackMax,2),new Stat(Stat
      .balance,2)],new <Stat>[new Stat(Stat.attackMax,3),new Stat(Stat.balance,3)],new <Stat>[new Stat(Stat.attackMin,1),new Stat(Stat.attackMax,4),new Stat(Stat.balance,4)],new <Stat>[new Stat(Stat.attackMin,1),new Stat(Stat.attackMax,5),new Stat(Stat.balance,5)],new <Stat>[new Stat(Stat.attackMin,1),new Stat(Stat.attackMax,5),new Stat(Stat.balance,6)],new <Stat>[new Stat(Stat.attackMin,1),new Stat(Stat.attackMax,6),new Stat(Stat.balance,7)],new <Stat>[new Stat(Stat.attackMin,2),new Stat(Stat.attackMax,7),new Stat(Stat.balance,8)],new <Stat>[new Stat(Stat.attackMin,2),new Stat(Stat.attackMax,8),new Stat(Stat.balance,9)],new <Stat>[new Stat(Stat.attackMin,2),new Stat(Stat.attackMax,9),new Stat(Stat.balance,10)],new <Stat>[new Stat(Stat.attackMin,3),new Stat(Stat.attackMax,11),new Stat(Stat.balance,11)],new <Stat>[new Stat(Stat.attackMin,4),new Stat(Stat.attackMax,13),new Stat(Stat.balance,12)],new <Stat>[new Stat(Stat.attackMin,6),new Stat(Stat.attackMax,18),new Stat(Stat.balance,13)],new <Stat>[new Stat(Stat
      .attackMin,8),new Stat(Stat.attackMax,22),new Stat(Stat.balance,14)],new <Stat>[new Stat(Stat.attackMin,10),new Stat(Stat.attackMax,25),new Stat(Stat.balance,15)]],new <int>[0,1,3,5,7,8,9,10,12,14,15,16,17,18,20],des_combat_master);
      
      public static const MIRAGE_MISSILE:ActiveSkillData = new ActiveSkillData("Mirage Missile","毒箭",SkillType.ATTACK,SkillCategory.RANGED,new <Vector.<Stat>>[new <Stat>[new Stat(Stat.dex,1)],new <Stat>[new Stat(Stat.dex,2)],new <Stat>[new Stat(Stat.dex,3)],new <Stat>[new Stat(Stat.dex,4)],new <Stat>[new Stat(Stat.dex,5)],new <Stat>[new Stat(Stat.dex,6),new Stat(Stat.intelligence,1)],new <Stat>[new Stat(Stat.dex,7),new Stat(Stat.intelligence,2)],new <Stat>[new Stat(Stat.dex,8),new Stat(Stat.intelligence,3)],new <Stat>[new Stat(Stat.dex,9),new Stat(Stat.intelligence,4)],new <Stat>[new Stat(Stat.dex,10),new Stat(Stat.intelligence,5)],new <Stat>[new Stat(Stat.dex,12),new Stat(Stat.intelligence,6)],new <Stat>[new Stat(Stat.dex,14),new Stat(Stat.intelligence,7)],new <Stat>[new Stat(Stat.dex,16),new Stat(Stat.intelligence,8)],new <Stat>[new Stat(Stat.dex,18),new Stat(Stat.intelligence,9)],new <Stat>[new Stat(Stat.dex,23),new Stat(Stat.intelligence,14)]],null,new <int>[1,2,3,4,5,6,9,11,13,15,20,22,24,26,40]
      ,[[100,4,6,0.05],[105,4,6,0.05],[110,5,6,0.1],[115,6,7,0.1],[120,7,7,0.15],[130,9,7,0.15],[135,9,8,0.2],[140,12,8,0.25],[145,13,8,0.3],[150,15,9,0.3],[160,17,10,0.4],[170,19,11,0.45],[180,21,12,0.5],[190,23,13,0.6],[200,26,15,0.7]],des_mirage_missle,behave_mirage_missle);
      
      public static const CORROSIVE_SHOT:ActiveSkillData = new ActiveSkillData("Corrosive Shot","腐蚀箭",SkillType.ATTACK,SkillCategory.RANGED,new <Vector.<Stat>>[new <Stat>[new Stat(Stat.dex,1)],new <Stat>[new Stat(Stat.dex,3)],new <Stat>[new Stat(Stat.dex,5)],new <Stat>[new Stat(Stat.dex,7)],new <Stat>[new Stat(Stat.dex,10)],new <Stat>[new Stat(Stat.dex,13)],new <Stat>[new Stat(Stat.dex,16)],new <Stat>[new Stat(Stat.dex,20)],new <Stat>[new Stat(Stat.dex,24)],new <Stat>[new Stat(Stat.dex,28)],new <Stat>[new Stat(Stat.dex,32)],new <Stat>[new Stat(Stat.dex,37)],new <Stat>[new Stat(Stat.dex,42)],new <Stat>[new Stat(Stat.dex,47)],new <Stat>[new Stat(Stat.dex,52)]],null,new <int>[2,4,6,9,12,16,20,25,30,35,40,45,50,55,60],[[100,1,10,0.01,0.1],[105,1,10,0.01,0.1],[110,1,10,0.01,0.1],[115,1,10,0.01,0.1],[120,1,10,0.01,0.1],[130,2,15,0.015,0.15],[135,2,15,0.015,0.2],[140,2,15,0.015,0.3],[145,2,15,0.015,0.3],[150,2,20,0.02,0.3],[160,2,20,0.022,0.3],[170,2,20,0.024,0.35],[180,2,20,0.026,0.4],[190,2,20,0.028
      ,0.45],[200,3,25,0.03,0.5]],des_corrosive_shot,behave_corrosive_shot);
      
      public static const LIFE_DRAIN:ActiveSkillData = new ActiveSkillData("Life Drain","吸血",SkillType.ATTACK,SkillCategory.MELEE,new <Vector.<Stat>>[new <Stat>[new Stat(Stat.str,1)],new <Stat>[new Stat(Stat.str,2)],new <Stat>[new Stat(Stat.str,3)],new <Stat>[new Stat(Stat.str,4)],new <Stat>[new Stat(Stat.str,5)],new <Stat>[new Stat(Stat.str,6)],new <Stat>[new Stat(Stat.str,8)],new <Stat>[new Stat(Stat.str,10)],new <Stat>[new Stat(Stat.str,12)],new <Stat>[new Stat(Stat.str,14)],new <Stat>[new Stat(Stat.str,17),new Stat(Stat.hp,5)],new <Stat>[new Stat(Stat.str,20),new Stat(Stat.hp,10)],new <Stat>[new Stat(Stat.str,23),new Stat(Stat.hp,15)],new <Stat>[new Stat(Stat.str,26),new Stat(Stat.hp,20)],new <Stat>[new Stat(Stat.str,29),new Stat(Stat.hp,30)]],null,new <int>[4,6,8,10,12,14,17,20,23,26,30,34,38,42,50],[[10,0.001,30],[10,0.001,35],[15,0.0015,40],[15,0.002,45],[20,0.0025,50],[25,0.0025,55],[25,0.0025,60],[25,0.003,65],[25,0.0035,70],[25,0.004,75],[30,0.005,80],[30,0.0055,85],[30,0.006,90],[30
      ,0.0065,95],[35,0.0075,100]],des_life_drain,behave_life_drain);
      
      public static const list:Vector.<SkillData> = new <SkillData>[COMBAT_MASTERY,SMASH,CRITICAL_HIT,BLACKSMITHING,DEFENCE,COUNTERATTACK,MAGIC_MASTERY,FIREBOLT,ICEBOLT,LIGHTNINGBOLT,FIREBALL,ICE_SPEAR,THUNDER,RANGE_MASTERY,MIRAGE_MISSILE,CORROSIVE_SHOT,LIFE_DRAIN,MANA_SHIELD];
      
      public function SkillDataList()
      {
         super();
      }
      
      public static function behave_smash(param1:ActiveSkill) : Boolean
      {
         var _loc2_:Array = (param1.skillData as ActiveSkillData).setList;
         var _loc3_:Number = getCritMul();
         var _loc4_:int = (Player.attack * _loc3_ * _loc2_[param1.level] / 100 - monster.defence) * monsterPro;
         if(_loc4_ < 1)
         {
            _loc4_ = 1;
         }
         MainScene.battle.monsterHp -= _loc4_;
         traceAttackInfo(param1.skillData.realName,_loc4_,_loc3_);
         return true;
      }
      
      public static function behave_life_drain(param1:ActiveSkill) : Boolean
      {
         var _loc2_:Array = (param1.skillData as ActiveSkillData).setList;
         if(MainScene.battle.playerMp < _loc2_[param1.level][0])
         {
            return false;
         }
         MainScene.battle.playerMp -= _loc2_[param1.level][0];
         var _loc3_:Number = getCritMul();
         var _loc4_:int = (Player.attack * _loc3_ * (1 + _loc2_[param1.level][1] * Player.str) - monster.defence) * monsterPro;
         if(_loc4_ < 1)
         {
            _loc4_ = 1;
         }
         MainScene.battle.monsterHp -= _loc4_;
         var _loc5_:int = _loc4_ * _loc2_[param1.level][2] / 100;
         if(Player.hp - MainScene.battle.playerHp < _loc5_)
         {
            _loc5_ = Player.hp - MainScene.battle.playerHp;
         }
         MainScene.battle.playerHp += _loc5_;
         traceAttackInfo(param1.skillData.realName,_loc4_,_loc3_);
         MainScene.allInfoPanel.addText("你回复了 <font color=\'" + Equipment.GREEN + "\'>" + _loc5_ + " hp!</font>",Global.battle);
         return true;
      }
      
      public static function behave_defence(param1:ActiveSkill) : Boolean
      {
         var _loc2_:Array = (param1.skillData as ActiveSkillData).setList;
         var _loc3_:int = monster.crit - Player.protection * 2;
         if(_loc3_ > CR)
         {
            _loc3_ = CR;
         }
         var _loc4_:Number = 1;
         if(Math.random() * 100 < _loc3_)
         {
            _loc4_ = monster.crit_mul / 100;
         }
         var _loc5_:int = (monster.attack * _loc4_ - Player.defence - _loc2_[param1.level][0]) * (1 - caculateProtection(Player.protection * _loc2_[param1.level][2] + _loc2_[param1.level][1]));
         if(_loc5_ < 1)
         {
            _loc5_ = 1;
         }
         MainScene.battle.playerHp -= _loc5_;
         if(_loc4_ > 1)
         {
            MainScene.allInfoPanel.addText("你<font color=\'#ff4040\'>防御</font>成功, " + monster.nameHtml + "对你造成<font color=\'#ff4040\' size=\'20\'>" + _loc5_ + "!</font>伤害",Global.battle);
         }
         else
         {
            MainScene.allInfoPanel.addText("你<font color=\'#ff4040\'>防御</font>成功, " + monster.nameHtml + "对你造成<font color=\'#ff4040\'>" + _loc5_ + "</font>伤害",Global.battle);
         }
         TitleList.updateTitleInfo("endure",_loc5_);
         return true;
      }
      
      public static function behave_mana_shield(param1:ActiveSkill) : Boolean
      {
         var _loc2_:Array = (param1.skillData as ActiveSkillData).setList;
         if(MainScene.battle.playerMp < _loc2_[param1.level][0])
         {
            return false;
         }
         MainScene.battle.playerMp -= _loc2_[param1.level][0];
         var _loc3_:int = monster.crit - Player.protection * 2;
         if(_loc3_ > CR)
         {
            _loc3_ = CR;
         }
         var _loc4_:Number = 1;
         if(Math.random() * 100 < _loc3_)
         {
            _loc4_ = monster.crit_mul / 100;
         }
         var _loc5_:int = (monster.attack * _loc4_ - Player.defence) * (1 - caculateProtection(Player.protection));
         var _loc6_:int = _loc5_ * _loc2_[param1.level][3] / 100;
         _loc5_ -= _loc6_;
         if(_loc5_ < 1)
         {
            _loc5_ = 1;
         }
         MainScene.battle.playerHp -= _loc5_;
         var _loc7_:int = _loc6_ / (_loc2_[param1.level][2] + Player.intelligence * _loc2_[param1.level][1]);
         MainScene.battle.playerMp -= _loc7_;
         if(_loc4_ > 1)
         {
            MainScene.allInfoPanel.addText(monster.nameHtml + "对你造成<font color=\'#ff4040\' size=\'20\'>" + _loc5_ + "!</font>伤害," + "<font color=\'#ff4040\'>魔法盾</font>吸收<font color=\'#ff4040\'>" + _loc6_ + "</font>",Global.battle);
         }
         else
         {
            MainScene.allInfoPanel.addText(monster.nameHtml + "对你造成<font color=\'#ff4040\'>" + _loc5_ + "</font>伤害," + "<font color=\'#ff4040\'>魔法盾</font>吸收<font color=\'#ff4040\'>" + _loc6_ + "</font>",Global.battle);
         }
         TitleList.updateTitleInfo("endure",_loc5_);
         return true;
      }
      
      public static function behave_counterattack(param1:ActiveSkill) : Boolean
      {
         var _loc2_:Array = (param1.skillData as ActiveSkillData).setList;
         var _loc3_:int = monster.crit - Player.protection * 2;
         if(_loc3_ > CR)
         {
            _loc3_ = CR;
         }
         var _loc4_:Number = 1;
         if(Math.random() * 100 < _loc3_)
         {
            _loc4_ = monster.crit_mul / 100;
         }
         var _loc5_:int = (monster.attack * _loc4_ - Player.defence) * (1 - caculateProtection(Player.protection));
         if(_loc5_ < 1)
         {
            _loc5_ = 1;
         }
         MainScene.battle.playerHp -= _loc5_;
         if(_loc4_ > 1)
         {
            MainScene.allInfoPanel.addText(monster.nameHtml + "对你造成<font color=\'#ff4040\' size=\'20\'>" + _loc5_ + "!</font>伤害",Global.battle);
         }
         else
         {
            MainScene.allInfoPanel.addText(monster.nameHtml + "对你造成<font color=\'#ff4040\'>" + _loc5_ + "</font>伤害",Global.battle);
         }
         TitleList.updateTitleInfo("endure",_loc5_);
         if(MainScene.battle.playerHp < 0)
         {
            return true;
         }
         _loc4_ = getCritMul(_loc2_[param1.level][2]);
         var _loc6_:int = (Player.attack * _loc4_ * _loc2_[param1.level][1] / 100 + _loc5_ * _loc2_[param1.level][0] / 100 - monster.defence) * (1 - caculateProtection(monster.protection - Player.protectionReduce - Player.protectionIgnore - _loc2_[param1.level][2] * 3));
         if(_loc6_ < 1)
         {
            _loc6_ = 1;
         }
         MainScene.battle.monsterHp -= _loc6_;
         if(_loc4_ > 1)
         {
            MainScene.allInfoPanel.addText("你<font color=\'#ff4040\'>反击</font>成功,对" + monster.nameHtml + "造成<font color=\'#ff4040\' size=\'20\'>" + _loc6_ + "!</font>伤害",Global.battle);
            TitleList.updateTitleInfo("crit",0,1);
         }
         else
         {
            MainScene.allInfoPanel.addText("你<font color=\'#ff4040\'>反击</font>成功,对" + monster.nameHtml + "造成<font color=\'#ff4040\'>" + _loc6_ + "</font>伤害",Global.battle);
            TitleList.updateTitleInfo("crit",0,-1);
         }
         TitleList.updateTitleInfo("damage",_loc6_,_loc6_);
         return true;
      }
      
      public static function behave_bolt(param1:ActiveSkill) : Boolean
      {
         var _loc2_:Array = (param1.skillData as ActiveSkillData).setList;
         if(MainScene.battle.playerMp < _loc2_[param1.level][2])
         {
            return false;
         }
         MainScene.battle.playerMp -= _loc2_[param1.level][2];
         var _loc3_:Number = getCritMul();
         var _loc4_:int = MyMath.balanceRandom(Player.magicBalance) * (_loc2_[param1.level][1] - _loc2_[param1.level][0]) + _loc2_[param1.level][0];
         var _loc5_:int = _loc4_ * _loc3_ * (100 + Player.magicDamage) / 100 * monsterPro;
         if(_loc5_ < 1)
         {
            _loc5_ = 1;
         }
         MainScene.battle.monsterHp -= _loc5_;
         traceAttackInfo(param1.skillData.realName,_loc5_,_loc3_);
         return true;
      }
      
      public static function behave_thunder(param1:ActiveSkill) : Boolean
      {
         var _loc2_:Array = (param1.skillData as ActiveSkillData).setList;
         if(MainScene.battle.playerMp < _loc2_[param1.level][2])
         {
            return false;
         }
         MainScene.battle.playerMp -= _loc2_[param1.level][2];
         var _loc3_:Number = getCritMul(_loc2_[param1.level][3]);
         var _loc4_:int = MyMath.balanceRandom(Player.magicBalance) * (_loc2_[param1.level][1] - _loc2_[param1.level][0]) + _loc2_[param1.level][0];
         var _loc5_:int = _loc4_ * _loc3_ * (100 + Player.magicDamage) / 100 * (1 - caculateProtection(monster.protection - Player.protectionReduce - Player.protectionIgnore - _loc2_[param1.level][3] - Player.will * _loc2_[param1.level][4]));
         if(_loc5_ < 1)
         {
            _loc5_ = 1;
         }
         MainScene.battle.monsterHp -= _loc5_;
         traceAttackInfo(param1.skillData.realName,_loc5_,_loc3_);
         return true;
      }
      
      public static function behave_fireball(param1:ActiveSkill) : Boolean
      {
         var _loc2_:Array = (param1.skillData as ActiveSkillData).setList;
         if(MainScene.battle.playerMp < _loc2_[param1.level][2])
         {
            return false;
         }
         MainScene.battle.playerMp -= _loc2_[param1.level][2];
         var _loc3_:Number = getCritMul();
         var _loc4_:int = MyMath.balanceRandom(Player.magicBalance) * (_loc2_[param1.level][1] - _loc2_[param1.level][0]) + _loc2_[param1.level][0];
         var _loc5_:int = _loc4_ * _loc3_ * (100 + Player.magicDamage) / 100 * monsterPro;
         if(_loc5_ < 1)
         {
            _loc5_ = 1;
         }
         MainScene.battle.monsterHp -= _loc5_;
         traceAttackInfo(param1.skillData.realName,_loc5_,_loc3_);
         monster.addBuff(new BuffBurn(_loc2_[param1.level][3] * Player.intelligence));
         return true;
      }
      
      public static function behave_ice_spear(param1:ActiveSkill) : Boolean
      {
         var _loc2_:Array = (param1.skillData as ActiveSkillData).setList;
         if(MainScene.battle.playerMp < _loc2_[param1.level][2])
         {
            return false;
         }
         MainScene.battle.playerMp -= _loc2_[param1.level][2];
         var _loc3_:Number = getCritMul();
         var _loc4_:int = MyMath.balanceRandom(Player.magicBalance) * (_loc2_[param1.level][1] - _loc2_[param1.level][0]) + _loc2_[param1.level][0];
         var _loc5_:int = _loc4_ * _loc3_ * (100 + Player.magicDamage) / 100 * monsterPro;
         if(_loc5_ < 1)
         {
            _loc5_ = 1;
         }
         MainScene.battle.monsterHp -= _loc5_;
         traceAttackInfo(param1.skillData.realName,_loc5_,_loc3_);
         if(Math.random() * 100 < _loc2_[param1.level][3] + Player.intelligence * _loc2_[param1.level][4])
         {
            monster.addBuff(new BuffFrozen(_loc2_[param1.level][5]));
         }
         return true;
      }
      
      public static function behave_mirage_missle(param1:ActiveSkill) : Boolean
      {
         var _loc2_:Array = (param1.skillData as ActiveSkillData).setList;
         if(MainScene.battle.playerMp < _loc2_[param1.level][2])
         {
            return false;
         }
         MainScene.battle.playerMp -= _loc2_[param1.level][2];
         var _loc3_:Number = getCritMul();
         var _loc4_:int = (Player.attack * _loc3_ * _loc2_[param1.level][0] / 100 - monster.defence) * monsterPro;
         if(_loc4_ < 1)
         {
            _loc4_ = 1;
         }
         MainScene.battle.monsterHp -= _loc4_;
         traceAttackInfo(param1.skillData.realName,_loc4_,_loc3_);
         monster.addBuff(new BuffPoison(_loc2_[param1.level][1] + _loc2_[param1.level][3] * Player.will));
         monster.addBuff(new BuffPoison(_loc2_[param1.level][1] + _loc2_[param1.level][3] * Player.will));
         return true;
      }
      
      public static function behave_corrosive_shot(param1:ActiveSkill) : Boolean
      {
         var _loc2_:Array = (param1.skillData as ActiveSkillData).setList;
         if(MainScene.battle.playerMp < _loc2_[param1.level][2])
         {
            return false;
         }
         MainScene.battle.playerMp -= _loc2_[param1.level][2];
         var _loc3_:Number = getCritMul();
         var _loc4_:int = (Player.attack * _loc3_ * (_loc2_[param1.level][0] / 100 + Player.dex * _loc2_[param1.level][4] / 100) - monster.defence) * monsterPro;
         if(_loc4_ < 1)
         {
            _loc4_ = 1;
         }
         MainScene.battle.monsterHp -= _loc4_;
         traceAttackInfo(param1.skillData.realName,_loc4_,_loc3_);
         monster.addBuff(new BuffCorrosion(_loc2_[param1.level][1] + Player.dex * _loc2_[param1.level][3]));
         return true;
      }
      
      private static function traceAttackInfo(param1:String, param2:int, param3:Number) : *
      {
         if(param3 > 1)
         {
            MainScene.allInfoPanel.addText("你使用了<font color=\'#ff4040\'>" + param1 + " </font>,对" + monster.nameHtml + "造成了<font color=\'#ff4040\' size=\'20\'> " + param2 + "! </font>伤害.",Global.battle);
            TitleList.updateTitleInfo("crit",0,1);
         }
         else
         {
            MainScene.allInfoPanel.addText("你使用了<font color=\'#ff4040\'>" + param1 + " </font>,对" + monster.nameHtml + "造成了<font color=\'#ff4040\'> " + param2 + "</font>伤害.",Global.battle);
            TitleList.updateTitleInfo("crit",0,-1);
         }
         TitleList.updateTitleInfo("damage",param2,param2);
      }
      
      private static function get monster() : Monster
      {
         return MainScene.battle.monster;
      }
      
      private static function get CR() : int
      {
         return MainScene.battle.CR;
      }
      
      private static function get monsterPro() : Number
      {
         return 1 - caculateProtection(monster.protection - Player.protectionReduce - Player.protectionIgnore);
      }
      
      private static function caculateProtection(param1:int) : Number
      {
         if(param1 >= 0)
         {
            return 0.06 * param1 / (1 + 0.06 * param1);
         }
         if(param1 < -1000)
         {
            return -1;
         }
         return -(1 - Math.pow(0.94,-param1));
      }
      
      private static function getCritMul(param1:int = 0) : Number
      {
         var _loc2_:int = Player.crit - (monster.protection - Player.protectionReduce) * 2;
         if(_loc2_ < 0 && param1 > 0)
         {
            _loc2_ = param1;
         }
         else
         {
            _loc2_ += param1;
         }
         if(_loc2_ > CR)
         {
            _loc2_ = CR;
         }
         var _loc3_:Number = 1;
         if(Math.random() * 100 < _loc2_)
         {
            _loc3_ = Player.crit_mul / 100;
         }
         return _loc3_;
      }
      
      public static function des_combat_master(param1:Skill) : String
      {
         var _loc2_:String = getTitle(param1);
         _loc2_ += getStat(param1,param1.level);
         _loc2_ += getEffect(param1,param1.level);
         if(param1.level < 14)
         {
            _loc2_ += "<font color=\'" + Equipment.GREEN + "\'>";
            _loc2_ += "下一级:<br/>";
            _loc2_ += getStat(param1,param1.level + 1);
            _loc2_ += getEffect(param1,param1.level + 1);
            _loc2_ += "</font>";
            if(Player.ap >= param1.skillData.lvupCostList[param1.level + 1])
            {
               _loc2_ += "<font color=\'" + Equipment.YELLOW + "\'>";
            }
            else
            {
               _loc2_ += "<font color=\'#ff4040\'>";
            }
            _loc2_ += getAp(param1,param1.level + 1);
            _loc2_ += "</font>";
         }
         return _loc2_;
      }
      
      public static function des_blacksmithing(param1:Skill) : String
      {
         var _loc4_:String = null;
         var _loc2_:String = getTitle(param1);
         var _loc3_:int = param1.level;
         _loc2_ += "<font size=\'20\'>";
         _loc2_ += "当强化装备时:<br/>";
         _loc2_ += "  成功率 +" + _loc3_ + "%<br/>";
         _loc4_ = "";
         if(_loc3_ > 1)
         {
            _loc4_ = "  +1前不会消失";
         }
         if(_loc3_ > 5)
         {
            _loc4_ = "  +3前不会消失";
         }
         if(_loc3_ > 9)
         {
            _loc4_ = "  +5前不会消失";
         }
         if(_loc3_ > 13)
         {
            _loc4_ = "  +7前不会消失";
         }
         if(_loc3_ > 1)
         {
            _loc2_ += _loc4_ + "<br/>";
         }
         if(_loc3_ > 5)
         {
            _loc4_ = "  50% 降回+0.";
         }
         if(_loc3_ > 9)
         {
            _loc4_ = "  50% 降低1级";
         }
         if(_loc3_ > 13)
         {
            _loc4_ = "  50% 保持不变.";
         }
         if(_loc3_ > 5)
         {
            _loc2_ += "  当失败时:<br/>";
            _loc2_ += _loc4_ + "<br/>";
         }
         _loc2_ += "</font>";
         _loc2_ += getStat(param1,param1.level);
         _loc3_++;
         if(param1.level < 14)
         {
            _loc2_ += "<font color=\'" + Equipment.GREEN + "\'>";
            _loc2_ += "下一级:<br/>";
            _loc2_ += "<font size=\'20\'>";
            _loc2_ += "当强化装备时:<br/>";
            _loc2_ += "  成功率 +" + _loc3_ + "%<br/>";
            _loc4_ = "";
            if(_loc3_ > 1)
            {
               _loc4_ = "  +1前不会消失";
            }
            if(_loc3_ > 5)
            {
               _loc4_ = "  +3前不会消失";
            }
            if(_loc3_ > 9)
            {
               _loc4_ = "  +5前不会消失";
            }
            if(_loc3_ > 13)
            {
               _loc4_ = "  +7前不会消失";
            }
            if(_loc3_ > 1)
            {
               _loc2_ += _loc4_ + "<br/>";
            }
            if(_loc3_ > 5)
            {
               _loc4_ = "  50% 降回+0.";
            }
            if(_loc3_ > 9)
            {
               _loc4_ = "  50% 降低1级";
            }
            if(_loc3_ > 13)
            {
               _loc4_ = "  50% 保持不变.";
            }
            if(_loc3_ > 5)
            {
               _loc2_ += "  当失败时:<br/>";
               _loc2_ += _loc4_ + "<br/>";
            }
            _loc2_ += "</font>";
            _loc2_ += getStat(param1,param1.level + 1);
            _loc2_ += "</font>";
            if(Player.ap >= param1.skillData.lvupCostList[param1.level + 1])
            {
               _loc2_ += "<font color=\'" + Equipment.YELLOW + "\'>";
            }
            else
            {
               _loc2_ += "<font color=\'#ff4040\'>";
            }
            _loc2_ += getAp(param1,param1.level + 1);
            _loc2_ += "</font>";
         }
         return _loc2_;
      }
      
      public static function des_defence(param1:Skill) : String
      {
         var _loc2_:Array = (param1.skillData as ActiveSkillData).setList;
         var _loc3_:String = getTitle(param1);
         _loc3_ += "<font size=\'20\'>当技能使用成功时:<br/>";
         _loc3_ += "  防御 +" + _loc2_[param1.level][0] + "<br/>";
         _loc3_ += "  护甲 +" + _loc2_[param1.level][1] + "<br/>";
         _loc3_ += "  护甲 *" + _loc2_[param1.level][2] + "</font><br/>";
         _loc3_ += getStat(param1,param1.level);
         if(param1.level < 14)
         {
            _loc3_ += "<font color=\'" + Equipment.GREEN + "\'>";
            _loc3_ += "下一级:<br/>";
            _loc3_ += "<font size=\'20\'>当技能使用成功时:<br/>";
            _loc3_ += "  防御 +" + _loc2_[param1.level + 1][0] + "<br/>";
            _loc3_ += "  护甲 +" + _loc2_[param1.level + 1][1] + "<br/>";
            _loc3_ += "  护甲 *" + _loc2_[param1.level + 1][2] + "</font><br/>";
            _loc3_ += getStat(param1,param1.level + 1);
            _loc3_ += "</font>";
            if(Player.ap >= param1.skillData.lvupCostList[param1.level + 1])
            {
               _loc3_ += "<font color=\'" + Equipment.YELLOW + "\'>";
            }
            else
            {
               _loc3_ += "<font color=\'#ff4040\'>";
            }
            _loc3_ += getAp(param1,param1.level + 1);
            _loc3_ += "</font>";
         }
         return _loc3_;
      }
      
      public static function des_counterattack(param1:Skill) : String
      {
         var _loc2_:Array = (param1.skillData as ActiveSkillData).setList;
         var _loc3_:String = getTitle(param1);
         _loc3_ += "<font size=\'20\'>";
         _loc3_ += "  反击";
         _loc3_ += "" + _loc2_[param1.level][0] + "% 敌人的";
         _loc3_ += "+" + _loc2_[param1.level][1] + "% 自身的伤害<br/>";
         _loc3_ += "  额外暴击 +" + _loc2_[param1.level][2] + "%<br/>";
         _loc3_ += "  无视护甲 +" + _loc2_[param1.level][2] * 3 + "</font><br/>";
         _loc3_ += getStat(param1,param1.level);
         if(param1.level < 14)
         {
            _loc3_ += "<font color=\'" + Equipment.GREEN + "\'>";
            _loc3_ += "下一级:<br/>";
            _loc3_ += "<font size=\'20\'>";
            _loc3_ += "  反击";
            _loc3_ += "" + _loc2_[param1.level + 1][0] + "% 敌人的";
            _loc3_ += "+" + _loc2_[param1.level + 1][1] + "% 自身的伤害<br/>";
            _loc3_ += "  额外暴击 +" + _loc2_[param1.level + 1][2] + "%<br/>";
            _loc3_ += "  无视护甲 +" + _loc2_[param1.level + 1][2] * 3 + "</font><br/>";
            _loc3_ += getStat(param1,param1.level + 1);
            _loc3_ += "</font>";
            if(Player.ap >= param1.skillData.lvupCostList[param1.level + 1])
            {
               _loc3_ += "<font color=\'" + Equipment.YELLOW + "\'>";
            }
            else
            {
               _loc3_ += "<font color=\'#ff4040\'>";
            }
            _loc3_ += getAp(param1,param1.level + 1);
            _loc3_ += "</font>";
         }
         return _loc3_;
      }
      
      public static function des_smash(param1:Skill) : String
      {
         var _loc2_:Array = (param1.skillData as ActiveSkillData).setList;
         var _loc3_:String = getTitle(param1);
         _loc3_ += "<font size=\'20\'>当技能使用成功时:<br/>";
         _loc3_ += "  伤害 " + _loc2_[param1.level] + "%";
         _loc3_ += "</font><br/>";
         _loc3_ += getStat(param1,param1.level);
         if(param1.level < 14)
         {
            _loc3_ += "<font color=\'" + Equipment.GREEN + "\'>";
            _loc3_ += "下一级:<br/>";
            _loc3_ += "<font size=\'20\'>当技能使用成功时:<br/>";
            _loc3_ += "  伤害 " + _loc2_[param1.level + 1] + "%";
            _loc3_ += "</font><br/>";
            _loc3_ += getStat(param1,param1.level + 1);
            _loc3_ += "</font>";
            if(Player.ap >= param1.skillData.lvupCostList[param1.level + 1])
            {
               _loc3_ += "<font color=\'" + Equipment.YELLOW + "\'>";
            }
            else
            {
               _loc3_ += "<font color=\'#ff4040\'>";
            }
            _loc3_ += getAp(param1,param1.level + 1);
            _loc3_ += "</font>";
         }
         return _loc3_;
      }
      
      public static function des_magic_bolt(param1:Skill) : String
      {
         var _loc2_:ActiveSkillData = param1.skillData as ActiveSkillData;
         var _loc3_:String = getTitle(param1);
         _loc3_ += "<font size=\'20\'>  伤害:" + _loc2_.setList[param1.level][0] + "~" + _loc2_.setList[param1.level][1] + "<br/>";
         _loc3_ += "  耗魔:" + _loc2_.setList[param1.level][2] + "</font><br/>";
         _loc3_ += getStat(param1,param1.level);
         if(param1.level < 14)
         {
            _loc3_ += "<font color=\'" + Equipment.GREEN + "\'>";
            _loc3_ += "下一级:<br/>";
            _loc3_ += "<font size=\'20\'>  伤害:" + _loc2_.setList[param1.level + 1][0] + "~" + _loc2_.setList[param1.level + 1][1] + "<br/>";
            _loc3_ += "  耗魔:" + _loc2_.setList[param1.level + 1][2] + "</font><br/>";
            _loc3_ += getStat(param1,param1.level + 1);
            _loc3_ += "</font>";
            if(Player.ap >= param1.skillData.lvupCostList[param1.level + 1])
            {
               _loc3_ += "<font color=\'" + Equipment.YELLOW + "\'>";
            }
            else
            {
               _loc3_ += "<font color=\'#ff4040\'>";
            }
            _loc3_ += getAp(param1,param1.level + 1);
            _loc3_ += "</font>";
         }
         return _loc3_;
      }
      
      public static function des_fireball(param1:Skill) : String
      {
         var _loc2_:ActiveSkillData = param1.skillData as ActiveSkillData;
         var _loc3_:String = getTitle(param1);
         _loc3_ += "<font size=\'20\'>  伤害:" + _loc2_.setList[param1.level][0] + "~" + _loc2_.setList[param1.level][1] + "<br/>";
         _loc3_ += "  附加状态: 灼烧(造成 智力*" + _loc2_.setList[param1.level][3] + " 伤害每回合,可叠加)<br/>";
         _loc3_ += "  耗魔:" + _loc2_.setList[param1.level][2] + "</font><br/>";
         _loc3_ += getStat(param1,param1.level);
         if(param1.level < 14)
         {
            _loc3_ += "<font color=\'" + Equipment.GREEN + "\'>";
            _loc3_ += "下一级:<br/>";
            _loc3_ += "<font size=\'20\'>  伤害:" + _loc2_.setList[param1.level + 1][0] + "~" + _loc2_.setList[param1.level + 1][1] + "<br/>";
            _loc3_ += "  附加状态: 灼烧(造成 智力*" + _loc2_.setList[param1.level + 1][3] + " 伤害每回合,可叠加)<br/>";
            _loc3_ += "  耗魔:" + _loc2_.setList[param1.level + 1][2] + "</font><br/>";
            _loc3_ += getStat(param1,param1.level + 1);
            _loc3_ += "</font>";
            if(Player.ap >= param1.skillData.lvupCostList[param1.level + 1])
            {
               _loc3_ += "<font color=\'" + Equipment.YELLOW + "\'>";
            }
            else
            {
               _loc3_ += "<font color=\'#ff4040\'>";
            }
            _loc3_ += getAp(param1,param1.level + 1);
            _loc3_ += "</font>";
         }
         return _loc3_;
      }
      
      public static function des_icespear(param1:Skill) : String
      {
         var _loc2_:ActiveSkillData = param1.skillData as ActiveSkillData;
         var _loc3_:String = getTitle(param1);
         _loc3_ += "<font size=\'20\'>  伤害:" + _loc2_.setList[param1.level][0] + "~" + _loc2_.setList[param1.level][1] + "<br/>";
         _loc3_ += "  附加状态: 冰冻( " + _loc2_.setList[param1.level][3] + "%+ 智力*" + _loc2_.setList[param1.level][4] + "% 概率使目标无法行动" + _loc2_.setList[param1.level][5] + "回合)<br/>";
         _loc3_ += "  耗魔:" + _loc2_.setList[param1.level][2] + "</font><br/>";
         _loc3_ += getStat(param1,param1.level);
         if(param1.level < 14)
         {
            _loc3_ += "<font color=\'" + Equipment.GREEN + "\'>";
            _loc3_ += "下一级:<br/>";
            _loc3_ += "<font size=\'20\'>  伤害:" + _loc2_.setList[param1.level + 1][0] + "~" + _loc2_.setList[param1.level + 1][1] + "<br/>";
            _loc3_ += "  附加状态: 冰冻( " + _loc2_.setList[param1.level + 1][3] + "%+ 智力*" + _loc2_.setList[param1.level + 1][4] + "% 概率使目标无法行动" + _loc2_.setList[param1.level + 1][5] + "回合)<br/>";
            _loc3_ += "  耗魔:" + _loc2_.setList[param1.level + 1][2] + "</font><br/>";
            _loc3_ += getStat(param1,param1.level + 1);
            _loc3_ += "</font>";
            if(Player.ap >= param1.skillData.lvupCostList[param1.level + 1])
            {
               _loc3_ += "<font color=\'" + Equipment.YELLOW + "\'>";
            }
            else
            {
               _loc3_ += "<font color=\'#ff4040\'>";
            }
            _loc3_ += getAp(param1,param1.level + 1);
            _loc3_ += "</font>";
         }
         return _loc3_;
      }
      
      public static function des_thunder(param1:Skill) : String
      {
         var _loc2_:ActiveSkillData = param1.skillData as ActiveSkillData;
         var _loc3_:String = getTitle(param1);
         _loc3_ += "<font size=\'20\'>  伤害:" + _loc2_.setList[param1.level][0] + "~" + _loc2_.setList[param1.level][1] + "<br/>";
         _loc3_ += "  特效: 无视 " + _loc2_.setList[param1.level][3] + "+ 意志*" + _loc2_.setList[param1.level][4] + " 的目标护甲<br/>";
         _loc3_ += "  额外暴击率 +" + _loc2_.setList[param1.level][3] + "<br/>";
         _loc3_ += "  耗魔:" + _loc2_.setList[param1.level][2] + "</font><br/>";
         _loc3_ += getStat(param1,param1.level);
         if(param1.level < 14)
         {
            _loc3_ += "<font color=\'" + Equipment.GREEN + "\'>";
            _loc3_ += "下一级:<br/>";
            _loc3_ += "<font size=\'20\'>  伤害:" + _loc2_.setList[param1.level + 1][0] + "~" + _loc2_.setList[param1.level + 1][1] + "<br/>";
            _loc3_ += "  特效: 无视 " + _loc2_.setList[param1.level + 1][3] + "+ 意志*" + _loc2_.setList[param1.level + 1][4] + " 的目标护甲<br/>";
            _loc3_ += "  额外暴击率 +" + _loc2_.setList[param1.level + 1][3] + "<br/>";
            _loc3_ += "  耗魔:" + _loc2_.setList[param1.level + 1][2] + "</font><br/>";
            _loc3_ += getStat(param1,param1.level + 1);
            _loc3_ += "</font>";
            if(Player.ap >= param1.skillData.lvupCostList[param1.level + 1])
            {
               _loc3_ += "<font color=\'" + Equipment.YELLOW + "\'>";
            }
            else
            {
               _loc3_ += "<font color=\'#ff4040\'>";
            }
            _loc3_ += getAp(param1,param1.level + 1);
            _loc3_ += "</font>";
         }
         return _loc3_;
      }
      
      public static function des_mana_shield(param1:Skill) : String
      {
         var _loc2_:ActiveSkillData = param1.skillData as ActiveSkillData;
         var _loc3_:String = getTitle(param1);
         _loc3_ += "<font size=\'20\'>";
         _loc3_ += "  效果: 每点魔法可以吸收 " + _loc2_.setList[param1.level][2] + "+智力*" + _loc2_.setList[param1.level][1] + " 的伤害(最多" + _loc2_.setList[param1.level][3] + "% 的伤害)<br/>";
         _loc3_ += "  耗魔:" + _loc2_.setList[param1.level][0] + "</font><br/>";
         _loc3_ += getStat(param1,param1.level);
         if(param1.level < 14)
         {
            _loc3_ += "<font color=\'" + Equipment.GREEN + "\'>";
            _loc3_ += "下一级:<br/>";
            _loc3_ += "<font size=\'20\'>";
            _loc3_ += "  效果: 每点魔法可以吸收 " + _loc2_.setList[param1.level + 1][2] + "+智力*" + _loc2_.setList[param1.level + 1][1] + " 的伤害(最多" + _loc2_.setList[param1.level + 1][3] + "% 的伤害)<br/>";
            _loc3_ += "  耗魔:" + _loc2_.setList[param1.level + 1][0] + "</font><br/>";
            _loc3_ += getStat(param1,param1.level + 1);
            _loc3_ += "</font>";
            if(Player.ap >= param1.skillData.lvupCostList[param1.level + 1])
            {
               _loc3_ += "<font color=\'" + Equipment.YELLOW + "\'>";
            }
            else
            {
               _loc3_ += "<font color=\'#ff4040\'>";
            }
            _loc3_ += getAp(param1,param1.level + 1);
            _loc3_ += "</font>";
         }
         return _loc3_;
      }
      
      public static function des_mirage_missle(param1:Skill) : String
      {
         var _loc2_:ActiveSkillData = param1.skillData as ActiveSkillData;
         var _loc3_:String = getTitle(param1);
         _loc3_ += "<font size=\'20\'>  伤害:" + _loc2_.setList[param1.level][0] + "%<br/>";
         _loc3_ += "  附加状态: 毒(造成 " + _loc2_.setList[param1.level][1] + "+意志*" + _loc2_.setList[param1.level][3] + " 伤害每回合,可叠加)<br/>";
         _loc3_ += "  耗魔:" + _loc2_.setList[param1.level][2] + "</font><br/>";
         _loc3_ += getStat(param1,param1.level);
         if(param1.level < 14)
         {
            _loc3_ += "<font color=\'" + Equipment.GREEN + "\'>";
            _loc3_ += "下一级:<br/>";
            _loc3_ += "<font size=\'20\'>  伤害:" + _loc2_.setList[param1.level + 1][0] + "%<br/>";
            _loc3_ += "  附加状态: 毒(造成 " + _loc2_.setList[param1.level + 1][1] + "+意志*" + _loc2_.setList[param1.level + 1][3] + " 伤害每回合,可叠加)<br/>";
            _loc3_ += "  耗魔:" + _loc2_.setList[param1.level + 1][2] + "</font><br/>";
            _loc3_ += getStat(param1,param1.level + 1);
            _loc3_ += "</font>";
            if(Player.ap >= param1.skillData.lvupCostList[param1.level + 1])
            {
               _loc3_ += "<font color=\'" + Equipment.YELLOW + "\'>";
            }
            else
            {
               _loc3_ += "<font color=\'#ff4040\'>";
            }
            _loc3_ += getAp(param1,param1.level + 1);
            _loc3_ += "</font>";
         }
         return _loc3_;
      }
      
      public static function des_corrosive_shot(param1:Skill) : String
      {
         var _loc2_:ActiveSkillData = param1.skillData as ActiveSkillData;
         var _loc3_:String = getTitle(param1);
         _loc3_ += "<font size=\'20\'>  伤害:" + _loc2_.setList[param1.level][0] + "%+敏捷*" + _loc2_.setList[param1.level][4] + "%<br/>";
         _loc3_ += "  附加状态: 破甲(降低 " + _loc2_.setList[param1.level][1] + "+ 敏捷*" + _loc2_.setList[param1.level][3] + " 的目标护甲,可叠加)<br/>";
         _loc3_ += "  耗魔:" + _loc2_.setList[param1.level][2] + "</font><br/>";
         _loc3_ += getStat(param1,param1.level);
         if(param1.level < 14)
         {
            _loc3_ += "<font color=\'" + Equipment.GREEN + "\'>";
            _loc3_ += "下一级:<br/>";
            _loc3_ += "<font size=\'20\'>  伤害:" + _loc2_.setList[param1.level + 1][0] + "%+敏捷*" + _loc2_.setList[param1.level + 1][4] + "%<br/>";
            _loc3_ += "  附加状态: 破甲(降低 " + _loc2_.setList[param1.level + 1][1] + "+ 敏捷*" + _loc2_.setList[param1.level + 1][3] + " 的目标护甲,可叠加)<br/>";
            _loc3_ += "  耗魔:" + _loc2_.setList[param1.level + 1][2] + "</font><br/>";
            _loc3_ += getStat(param1,param1.level + 1);
            _loc3_ += "</font>";
            if(Player.ap >= param1.skillData.lvupCostList[param1.level + 1])
            {
               _loc3_ += "<font color=\'" + Equipment.YELLOW + "\'>";
            }
            else
            {
               _loc3_ += "<font color=\'#ff4040\'>";
            }
            _loc3_ += getAp(param1,param1.level + 1);
            _loc3_ += "</font>";
         }
         return _loc3_;
      }
      
      public static function des_life_drain(param1:Skill) : String
      {
         var _loc2_:ActiveSkillData = param1.skillData as ActiveSkillData;
         var _loc3_:String = getTitle(param1);
         _loc3_ += "<font size=\'20\'>  伤害: 100%+ 力量*" + _loc2_.setList[param1.level][1] * 100 + "%<br/>";
         _loc3_ += "  效果:吸取 " + _loc2_.setList[param1.level][2] + "% 伤害用于生命回复)<br/>";
         _loc3_ += "  耗魔:" + _loc2_.setList[param1.level][0] + "</font><br/>";
         _loc3_ += getStat(param1,param1.level);
         if(param1.level < 14)
         {
            _loc3_ += "<font color=\'" + Equipment.GREEN + "\'>";
            _loc3_ += "下一级:<br/>";
            _loc3_ += "<font size=\'20\'>  伤害: 100%+ str*" + _loc2_.setList[param1.level + 1][1] * 100 + "%<br/>";
            _loc3_ += "  效果:吸取 " + _loc2_.setList[param1.level + 1][2] + "% 伤害用于生命回复)<br/>";
            _loc3_ += "  耗魔:" + _loc2_.setList[param1.level + 1][0] + "</font><br/>";
            _loc3_ += getStat(param1,param1.level + 1);
            _loc3_ += "</font>";
            if(Player.ap >= param1.skillData.lvupCostList[param1.level + 1])
            {
               _loc3_ += "<font color=\'" + Equipment.YELLOW + "\'>";
            }
            else
            {
               _loc3_ += "<font color=\'#ff4040\'>";
            }
            _loc3_ += getAp(param1,param1.level + 1);
            _loc3_ += "</font>";
         }
         return _loc3_;
      }
      
      private static function getTitle(param1:Skill) : String
      {
         var _loc2_:String = "<p align=\'center\'>" + param1.skillData.realName + " " + (15 - param1.level).toString(16).toUpperCase() + "</p>";
         return _loc2_ + ("<p align=\'center\'><font size=\'16\'>" + getCategory(param1) + "</font></p>");
      }
      
      private static function getCategory(param1:Skill) : String
      {
         switch(param1.skillData.category)
         {
            case SkillCategory.ALL:
               return "全部";
            case SkillCategory.MAGIC:
               return "魔法";
            case SkillCategory.MELEE:
               return "近战";
            case SkillCategory.RANGED:
               return "远程";
            default:
               return param1.skillData.category;
         }
      }
      
      private static function getStat(param1:Skill, param2:int) : String
      {
         var _loc3_:String = "";
         _loc3_ += "<font size=\'20\'>";
         var _loc4_:Vector.<Stat> = param1.skillData.statList[param2];
         var _loc5_:int = 0;
         while(_loc5_ < _loc4_.length)
         {
            _loc3_ += "<li>" + _loc4_[_loc5_].statTranslate() + " +" + _loc4_[_loc5_].value + "</li>";
            _loc5_++;
         }
         return _loc3_ + "</font>";
      }
      
      private static function getEffect(param1:Skill, param2:int) : String
      {
         var _loc4_:Vector.<Stat> = null;
         var _loc5_:int = 0;
         var _loc3_:String = "<font size=\'20\'>";
         if(param1.skillData.category == SkillCategory.MELEE)
         {
            _loc3_ += "使用近战武器:<br/>";
            _loc4_ = param1.skillData.effectList[param2];
            _loc5_ = 0;
            while(_loc5_ < _loc4_.length)
            {
               _loc3_ += "<li>" + _loc4_[_loc5_].statTranslate() + "+" + _loc4_[_loc5_].value + "</li>";
               _loc5_++;
            }
         }
         else if(param1.skillData.category == SkillCategory.RANGED)
         {
            _loc3_ += "使用远程武器:<br/>";
            _loc4_ = param1.skillData.effectList[param2];
            _loc5_ = 0;
            while(_loc5_ < _loc4_.length)
            {
               _loc3_ += "<li>" + _loc4_[_loc5_].statTranslate() + "+" + _loc4_[_loc5_].value + "</li>";
               _loc5_++;
            }
         }
         return _loc3_ + "</font>";
      }
      
      private static function getAp(param1:Skill, param2:int) : String
      {
         var _loc3_:String = "<font size=\'24\'>";
         _loc3_ += "AP:" + param1.skillData.lvupCostList[param2];
         return _loc3_ + "</font>";
      }
   }
}

