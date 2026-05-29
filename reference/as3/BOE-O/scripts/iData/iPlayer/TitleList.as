package iData.iPlayer
{
   import iData.iItem.Stat;
   import iData.iMonster.StatMul;
   import iData.iSkill.SkillDataList;
   import iGlobal.Player;
   
   public class TitleList
   {
      
      public static const beginner:Title = new Title("the Beginner","初心者","欢迎来到战斗无止境的游戏世界",new <StatMul>[new StatMul(Stat.protection,1,1),new StatMul(Stat.luck,1,5)]);
      
      public static const reborn:Title = new Title("the Reborn","转生的","在20岁后转生",new <StatMul>[new StatMul(Stat.str,1,6),new StatMul(Stat.intelligence,1,6),new StatMul(Stat.dex,1,6),new StatMul(Stat.will,1,6),new StatMul(Stat.luck,1,6)],0,1);
      
      public static const adult:Title = new Title("the Adult","成年的","达到18岁",new <StatMul>[new StatMul(Stat.will,1,15),new StatMul(Stat.dex,1,3),new StatMul(Stat.luck,1,-5)],18);
      
      public static const all_knowing:Title = new Title("the All-Knowing","睿智的","达到30岁",new <StatMul>[new StatMul(Stat.intelligence,1.1,20),new StatMul(Stat.dex,1,20),new StatMul(Stat.will,1,-30),new StatMul(Stat.hp,1,-5),new StatMul(Stat.mp,1,-5)],30);
      
      public static const old:Title = new Title("the Old","年老的","达到40岁",new <StatMul>[new StatMul(Stat.intelligence,1.2,35),new StatMul(Stat.dex,1,10),new StatMul(Stat.will,1,-40),new StatMul(Stat.str,1,-5),new StatMul(Stat.hp,1,-10),new StatMul(Stat.mp,1,-10)],40);
      
      public static const who_reached_Lv_50_at_Age_10:Title = new Title("who Reached Lv 50 at Age 10 ","10岁达到50级的","在10岁时达到50级",new <StatMul>[new StatMul(Stat.str,1.05,20),new StatMul(Stat.will,1.05,10),new StatMul(Stat.intelligence,1,-20),new StatMul(Stat.dex,1,-20),new StatMul(Stat.luck,1,10)],50);
      
      public static const wise:Title = new Title("the Wise","聪明的","智力超过200",new <StatMul>[new StatMul(Stat.intelligence,1.1,20)],200);
      
      public static const strong:Title = new Title("the Strong","强壮的","力量超过200",new <StatMul>[new StatMul(Stat.str,1.1,20)],200);
      
      public static const skillfull:Title = new Title("the Skillful","灵巧的","敏捷超过200",new <StatMul>[new StatMul(Stat.dex,1.1,20)],200);
      
      public static const tough:Title = new Title("the Tough","坚强的","意志超过200",new <StatMul>[new StatMul(Stat.will,1.1,20)],200);
      
      public static const lucky:Title = new Title("the Lucky","幸运的","幸运超过200",new <StatMul>[new StatMul(Stat.luck,1.1,20)],200);
      
      public static const beginner_forger:Title = new Title("the Beginner Forger","初级铁匠","强化出+5的装备",new <StatMul>[new StatMul(Stat.str,1,10),new StatMul(Stat.luck,1,10),new StatMul(Stat.intelligence,1,-10),new StatMul(Stat.dex,1,-10)],5);
      
      public static const advanced_forger:Title = new Title("the Advanced Forger","进阶铁匠","强化出+8的装备",new <StatMul>[new StatMul(Stat.str,1.05,15),new StatMul(Stat.luck,1.05,15),new StatMul(Stat.intelligence,0.95,-15),new StatMul(Stat.dex,0.95,-15)],8);
      
      public static const expert_forger:Title = new Title("the Expert Forger","专业铁匠","强化出+12的装备",new <StatMul>[new StatMul(Stat.str,1.1,20),new StatMul(Stat.luck,1.1,20),new StatMul(Stat.intelligence,0.9,-20),new StatMul(Stat.dex,0.9,-20)],12);
      
      public static const god_blessed:Title = new Title("the God blessed","上帝保佑的","强化出+15的装备",new <StatMul>[new StatMul(Stat.str,1.2,30),new StatMul(Stat.luck,1.2,30),new StatMul(Stat.intelligence,0.8,-30),new StatMul(Stat.dex,0.8,-30)],15);
      
      public static const who_experienced_death:Title = new Title("who Experienced Death","经历死亡的","一次承受了超过500点伤害",new <StatMul>[new StatMul(Stat.hp,1.05,50),new StatMul(Stat.protection,1,5),new StatMul(Stat.intelligence,1,-30),new StatMul(Stat.dex,1,-30)],500);
      
      public static const who_transcended_death:Title = new Title("who Transcended Death","超越死亡的","一次承受了超过1000点伤害",new <StatMul>[new StatMul(Stat.hp,1.1,80),new StatMul(Stat.protection,1.05,8),new StatMul(Stat.intelligence,1,-20),new StatMul(Stat.dex,1,-20)],1000);
      
      public static const breaker:Title = new Title("the Breaker","破坏者","一次造成了500点伤害",new <StatMul>[new StatMul(Stat.str,1.05,20),new StatMul(Stat.ATTACK,1,10),new StatMul(Stat.intelligence,1,-30),new StatMul(Stat.luck,1,-20)],500);
      
      public static const terminator:Title = new Title("the Terminator","终结者","一次造成了1000点伤害",new <StatMul>[new StatMul(Stat.str,1.1,30),new StatMul(Stat.ATTACK,1.05,20),new StatMul(Stat.intelligence,1,-20),new StatMul(Stat.luck,1,-15)],1000);
      
      public static const killer:Title = new Title("the Killer","杀手","总计造成10万伤害",new <StatMul>[new StatMul(Stat.hp,1.05,30),new StatMul(Stat.defence,1.05,10)],0,100000);
      
      public static const warlord:Title = new Title("the Warlord","战神","总计造成100万伤害",new <StatMul>[new StatMul(Stat.hp,1.1,50),new StatMul(Stat.defence,1.1,15)],0,1000000);
      
      public static const boss_slayer:Title = new Title("the Boss Slayer","Boss屠戮者","击败100个boss",new <StatMul>[new StatMul(Stat.protectionIgnore,1,5),new StatMul(Stat.protectionReduce,1,3)],0,100);
      
      public static const butterfingers:Title = new Title("the Butterfingers","手划的","强化装备时连续失败4次",new <StatMul>[new StatMul(Stat.protection,1,10),new StatMul(Stat.dex,1,-20),new StatMul(Stat.luck,1,-20)],0,4);
      
      public static const weakness_discoverer:Title = new Title("the Weakness Discoverer","弱点观察者","连续7次暴击",new <StatMul>[new StatMul(Stat.crit,1.1,20),new StatMul(Stat.crit_mul,1.05,30)],0,7);
      
      public static const the_elemental_apprentice:Title = new Title("the Elemental Apprentice","初级元素师","冰矛、火焰、雷矢都达到Rank 1",new <StatMul>[new StatMul(Stat.mp,1.1,100),new StatMul(Stat.intelligence,1.1,30),new StatMul(Stat.magicDamage,1.1,10),new StatMul(Stat.str,0.8,-20),new StatMul(Stat.hp,0.9,-30)],0,3);
      
      public static const the_elemental_master:Title = new Title("the Elemental Master","大师元素师","冰刃、火球、雷击都达到Rank 1",new <StatMul>[new StatMul(Stat.mp,1.2,200),new StatMul(Stat.intelligence,1.2,50),new StatMul(Stat.magicDamage,1.15,15),new StatMul(Stat.str,0.7,-30),new StatMul(Stat.hp,0.8,-60),new StatMul(Stat.dex,0.9,-30),new StatMul(Stat.protection,1,3)],0,3);
      
      public static const the_sniper:Title = new Title("the Sniper","狙击者","远程精通、毒箭、破甲箭都达到Rank 1",new <StatMul>[new StatMul(Stat.dex,1.2,30),new StatMul(Stat.crit,1.2,20)],0,3);
      
      public static const master_of_combat:Title = new Title("the Combat Master","近战大师","近战精通达到Rank 1",new <StatMul>[new StatMul(Stat.hp,1,50),new StatMul(Stat.ATTACK,1.2),new StatMul(Stat.str,1,20),new StatMul(Stat.intelligence,0.8,-20),new StatMul(Stat.luck,1,-20)],0,0,add_life_drain);
      
      public static const master_of_defence:Title = new Title("the Master of Defence","防御大师","防御达到Rank 1",new <StatMul>[new StatMul(Stat.hp,1.1,100),new StatMul(Stat.defence,1,20),new StatMul(Stat.protection,1,10),new StatMul(Stat.intelligence,0.9,-10),new StatMul(Stat.luck,1,-10)]);
      
      public static const master_of_counter:Title = new Title("the Master of Counter","反击大师","反击达到Rank 1",new <StatMul>[new StatMul(Stat.mp,1,-30),new StatMul(Stat.str,1,-20),new StatMul(Stat.intelligence,1,20),new StatMul(Stat.dex,1.1,20)]);
      
      public static const master_of_smash:Title = new Title("the Master of Smash","重击大师","重击达到Rank 1",new <StatMul>[new StatMul(Stat.str,1.2,20),new StatMul(Stat.dex,1,-20),new StatMul(Stat.luck,1,20),new StatMul(Stat.protection,1,-10)]);
      
      public static const master_of_magic:Title = new Title("the Magic Master","魔法大师","魔法精通达到Rank 1",new <StatMul>[new StatMul(Stat.mp,1.1,50),new StatMul(Stat.magicDamage,1,5)],0,0,add_mana_shield);
      
      public static const master_of_icebolt:Title = new Title("the Master of Icebolt","冰矛大师","冰矛达到Rank 1",new <StatMul>[new StatMul(Stat.mp,1.1,20),new StatMul(Stat.intelligence,1.1,15),new StatMul(Stat.str,0.9,-20),new StatMul(Stat.dex,1,15)],0,0,add_ice_spear);
      
      public static const master_of_firebolt:Title = new Title("the Master of Firebolt","火焰大师","火焰达到Rank 1",new <StatMul>[new StatMul(Stat.mp,1.1,30),new StatMul(Stat.intelligence,1.1,15),new StatMul(Stat.str,0.9,-10),new StatMul(Stat.dex,1,15),new StatMul(Stat.luck,1,-10)],0,0,add_fireball);
      
      public static const master_of_lightningbolt:Title = new Title("the Master of Lightning Bolt","雷矢大师","雷矢达到Rank 1",new <StatMul>[new StatMul(Stat.mp,1.1,30),new StatMul(Stat.hp,0.9,-30),new StatMul(Stat.intelligence,1.1,15),new StatMul(Stat.str,1,10),new StatMul(Stat.luck,1,-10)],0,0,add_thunder);
      
      public static const master_of_criticalHit:Title = new Title("the Master of Critical Hit","暴击大师","暴击达到Rank 1",new <StatMul>[new StatMul(Stat.hp,1,30),new StatMul(Stat.dex,0.9,-10),new StatMul(Stat.protection,1,-5),new StatMul(Stat.will,1.2,30),new StatMul(Stat.crit_mul,1,50)]);
      
      public static const master_of_blacksmithing:Title = new Title("the Master of Blacksmithing","锻造大师","铁匠达到Rank 1",new <StatMul>[new StatMul(Stat.hp,1,-30),new StatMul(Stat.mp,1,-30),new StatMul(Stat.dex,1,30),new StatMul(Stat.will,1,10),new StatMul(Stat.luck,1.1,20)]);
      
      public static const master_of_iceSpear:Title = new Title("the Master of Ice Spear","冰刃大师","冰刃达到Rank 1",new <StatMul>[new StatMul(Stat.mp,1.2,30),new StatMul(Stat.intelligence,1.3,25),new StatMul(Stat.str,0.8,-20),new StatMul(Stat.hp,0.9),new StatMul(Stat.dex,1,25),new StatMul(Stat.luck,1,20)]);
      
      public static const master_of_fireball:Title = new Title("the Master of Fireball","火球大师","火球达到Rank 1",new <StatMul>[new StatMul(Stat.mp,1.2,30),new StatMul(Stat.intelligence,1.2,15),new StatMul(Stat.str,1.1,10),new StatMul(Stat.will,0.8,-10),new StatMul(Stat.dex,1,-20),new StatMul(Stat.luck,1,-20)]);
      
      public static const master_of_thunder:Title = new Title("the Master of Thunder","雷击大师","雷击达到Rank 1",new <StatMul>[new StatMul(Stat.mp,1.2,30),new StatMul(Stat.intelligence,1,15),new StatMul(Stat.will,1.2,30),new StatMul(Stat.str,0.8,-15)]);
      
      public static const master_of_range:Title = new Title("the Master of Range","远程大师","远程精通达到Rank 1",new <StatMul>[new StatMul(Stat.dex,1.2,30),new StatMul(Stat.str,0.9,-25),new StatMul(Stat.will,1,-30),new StatMul(Stat.hp,1,25)],0,0,add_corrosion);
      
      public static const master_of_mirageMissle:Title = new Title("the Master of Mirage Missle","毒箭大师","毒箭达到Rank 1",new <StatMul>[new StatMul(Stat.dex,1.1,20),new StatMul(Stat.intelligence,1,25),new StatMul(Stat.str,1,-20),new StatMul(Stat.will,1,-15),new StatMul(Stat.mp,1,30)]);
      
      public static const master_of_corrosive:Title = new Title("the Master of Corrosion","破甲大师","破甲箭达到Rank 1",new <StatMul>[new StatMul(Stat.dex,1.3,35),new StatMul(Stat.will,1,25),new StatMul(Stat.str,0.8,-20),new StatMul(Stat.hp,1,-35),new StatMul(Stat.mp,1,50)]);
      
      public static const master_of_lifeDrain:Title = new Title("the Life Drain Master","吸血大师","吸血达到Rank 1",new <StatMul>[new StatMul(Stat.hp,1.2,50),new StatMul(Stat.str,1.1,25),new StatMul(Stat.intelligence,0.8,-20),new StatMul(Stat.luck,1,-20)]);
      
      public static const master_of_manaShield:Title = new Title("the Mana Shield Master","魔法盾大师","魔法盾达到Rank 1",new <StatMul>[new StatMul(Stat.mp,1.2,50),new StatMul(Stat.intelligence,1,25),new StatMul(Stat.str,0.9,-10)]);
      
      public static const list:Vector.<Title> = new <Title>[TitleList.beginner,TitleList.reborn,TitleList.adult,TitleList.all_knowing,TitleList.old,TitleList.who_reached_Lv_50_at_Age_10,TitleList.wise,TitleList.strong,TitleList.skillfull,TitleList.tough,TitleList.lucky,TitleList.beginner_forger,TitleList.advanced_forger,TitleList.expert_forger,TitleList.god_blessed,TitleList.who_experienced_death,TitleList.who_transcended_death,TitleList.breaker,TitleList.terminator,TitleList.killer,TitleList.warlord,TitleList.boss_slayer,TitleList.butterfingers,TitleList.weakness_discoverer,TitleList.the_elemental_apprentice,TitleList.the_elemental_master,TitleList.the_sniper,TitleList.master_of_blacksmithing,TitleList.master_of_combat,TitleList.master_of_counter,TitleList.master_of_criticalHit,TitleList.master_of_defence,TitleList.master_of_firebolt,TitleList.master_of_icebolt,TitleList.master_of_lightningbolt,TitleList.master_of_magic,TitleList.master_of_smash,TitleList.master_of_range,TitleList.master_of_mirageMissle,TitleList
      .master_of_corrosive,TitleList.master_of_fireball,TitleList.master_of_iceSpear,TitleList.master_of_thunder,TitleList.master_of_manaShield,TitleList.master_of_lifeDrain];
      
      public function TitleList()
      {
         super();
      }
      
      public static function add_fireball() : *
      {
         Player.addSkill(SkillDataList.FIREBALL);
      }
      
      public static function add_ice_spear() : *
      {
         Player.addSkill(SkillDataList.ICE_SPEAR);
      }
      
      public static function add_thunder() : *
      {
         Player.addSkill(SkillDataList.THUNDER);
      }
      
      public static function add_mana_shield() : *
      {
         Player.addSkill(SkillDataList.MANA_SHIELD);
      }
      
      public static function add_life_drain() : *
      {
         Player.addSkill(SkillDataList.LIFE_DRAIN);
      }
      
      public static function add_corrosion() : *
      {
         Player.addSkill(SkillDataList.CORROSIVE_SHOT);
      }
      
      public static function updateTitleInfo(param1:String, param2:int = 0, param3:int = 0) : *
      {
         switch(param1)
         {
            case SkillDataList.BLACKSMITHING.name:
               master_of_blacksmithing.updateInfo();
               break;
            case SkillDataList.COMBAT_MASTERY.name:
               master_of_combat.updateInfo();
               break;
            case SkillDataList.COUNTERATTACK.name:
               master_of_counter.updateInfo();
               break;
            case SkillDataList.CRITICAL_HIT.name:
               master_of_criticalHit.updateInfo();
               break;
            case SkillDataList.DEFENCE.name:
               master_of_defence.updateInfo();
               break;
            case SkillDataList.FIREBOLT.name:
               master_of_firebolt.updateInfo();
               the_elemental_apprentice.updateInfo(0,1);
               break;
            case SkillDataList.ICEBOLT.name:
               master_of_icebolt.updateInfo();
               the_elemental_apprentice.updateInfo(0,1);
               break;
            case SkillDataList.LIGHTNINGBOLT.name:
               master_of_lightningbolt.updateInfo();
               the_elemental_apprentice.updateInfo(0,1);
               break;
            case SkillDataList.MAGIC_MASTERY.name:
               master_of_magic.updateInfo();
               break;
            case SkillDataList.SMASH.name:
               master_of_smash.updateInfo();
               break;
            case SkillDataList.CORROSIVE_SHOT.name:
               master_of_corrosive.updateInfo();
               the_sniper.updateInfo(0,1);
               break;
            case SkillDataList.RANGE_MASTERY.name:
               master_of_range.updateInfo();
               the_sniper.updateInfo(0,1);
               break;
            case SkillDataList.MIRAGE_MISSILE.name:
               master_of_mirageMissle.updateInfo();
               the_sniper.updateInfo(0,1);
               break;
            case SkillDataList.ICE_SPEAR.name:
               master_of_iceSpear.updateInfo();
               the_elemental_master.updateInfo(0,1);
               break;
            case SkillDataList.FIREBALL.name:
               master_of_fireball.updateInfo();
               the_elemental_master.updateInfo(0,1);
               break;
            case SkillDataList.THUNDER.name:
               master_of_thunder.updateInfo();
               the_elemental_master.updateInfo(0,1);
               break;
            case SkillDataList.MANA_SHIELD.name:
               master_of_manaShield.updateInfo();
               break;
            case SkillDataList.LIFE_DRAIN.name:
               master_of_lifeDrain.updateInfo();
               break;
            case "age":
               adult.updateInfo(param2);
               all_knowing.updateInfo(param2);
               old.updateInfo(param2);
               break;
            case "age10":
               who_reached_Lv_50_at_Age_10.updateInfo(param2);
               break;
            case Stat.str:
               strong.updateInfo(param2);
               break;
            case Stat.dex:
               skillfull.updateInfo(param2);
               break;
            case Stat.intelligence:
               wise.updateInfo(param2);
               break;
            case Stat.will:
               tough.updateInfo(param2);
               break;
            case Stat.luck:
               lucky.updateInfo(param2);
               break;
            case "begin":
               beginner.updateInfo();
               break;
            case "reborn":
               reborn.updateInfo(0,1);
               break;
            case "forge":
               beginner_forger.updateInfo(param2,param3);
               advanced_forger.updateInfo(param2,param3);
               expert_forger.updateInfo(param2,param3);
               god_blessed.updateInfo(param2,param3);
               break;
            case "endure":
               who_experienced_death.updateInfo(param2);
               who_transcended_death.updateInfo(param2);
               break;
            case "damage":
               breaker.updateInfo(param2);
               terminator.updateInfo(param2);
               killer.updateInfo(param2,param3);
               warlord.updateInfo(param2,param3);
               break;
            case "kill":
               boss_slayer.updateInfo(param2,param3);
               break;
            case "fail":
               butterfingers.updateInfo(param2,param3);
               break;
            case "crit":
               weakness_discoverer.updateInfo(param2,param3);
         }
      }
   }
}

