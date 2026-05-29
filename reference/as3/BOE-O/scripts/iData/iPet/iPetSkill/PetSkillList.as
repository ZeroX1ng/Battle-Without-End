package iData.iPet.iPetSkill
{
   import iData.iMonster.Monster;
   import iData.iPet.Pet;
   import iData.iSkill.iBuff.BuffBurn;
   import iData.iSkill.iBuff.BuffCorrosion;
   import iData.iSkill.iBuff.BuffFrozen;
   import iGlobal.Global;
   import iPanel.iScene.MainScene;
   
   public class PetSkillList
   {
      
      public static const counterattack:DefencePetSkillData = new DefencePetSkillData("Counterattack","反击",[[30,50],[30,100]],null,des_counterattack);
      
      public static const injury_resile:DefencePetSkillData = new DefencePetSkillData("Injury Resile","反震",[[30,25],[30,50]],null,des_injury_resile);
      
      public static const dodge:DefencePetSkillData = new DefencePetSkillData("Dodge","闪避",[[15],[20]],null,des_dodge);
      
      public static const taunt:DefencePetSkillData = new DefencePetSkillData("Taunt","嘲讽",[[10],[20]],null,des_taunt);
      
      public static const aggressive:PassivePetSkillData = new PassivePetSkillData("Aggressive","血性",[[5],[7.5]],null,des_aggressive);
      
      public static const defensive:PassivePetSkillData = new PassivePetSkillData("Defensive","硬化",[[5],[7.5]],null,des_defensive);
      
      public static const protective:PassivePetSkillData = new PassivePetSkillData("Protective","守护",[[2],[2.5]],null,des_protective);
      
      public static const strong:PassivePetSkillData = new PassivePetSkillData("Strong","强力",[[10],[15]],null,des_strong);
      
      public static const wisdom:PassivePetSkillData = new PassivePetSkillData("Wisdom","智慧",[[5],[7.5]],null,des_wisdom);
      
      public static const wise:PassivePetSkillData = new PassivePetSkillData("Wise","聪颖",[[1],[1.5]],null,des_wise);
      
      public static const slayer:PassivePetSkillData = new PassivePetSkillData("Slayer","必杀",[[10,2],[20,2]],null,des_slayer);
      
      public static const life_drain:PassivePetSkillData = new PassivePetSkillData("Life Drain","吸血",[[20],[30]],null,des_life_drain);
      
      public static const good_or_evil:PassivePetSkillData = new PassivePetSkillData("Good or Evil","善恶有报",[[50],[60]],null,des_good_or_evil);
      
      public static const meditation:PassivePetSkillData = new PassivePetSkillData("Meditation","冥思",[[0.15,10],[0.25,15]],null,des_meditation);
      
      public static const heal:PassivePetSkillData = new PassivePetSkillData("Heal","治愈",[[0.3,10],[0.5,15]],null,des_heal);
      
      public static const double_hit:PassivePetSkillData = new PassivePetSkillData("Double hit","连击",[[45],[55]],null,des_doubleHit);
      
      public static const ice_spear:AttackPetSkillData = new AttackPetSkillData("Ice Spear","冰刃",[[5,1.5,1,25],[7,2,1,35,10,2]],behave_ice_spear,des_ice_spear);
      
      public static const fireball:AttackPetSkillData = new AttackPetSkillData("Fireball","火球",[[7,2,30,1],[10,2.5,40,1.25]],behave_fireball,des_fireball);
      
      public static const thunder:AttackPetSkillData = new AttackPetSkillData("Thunder","雷击",[[10,2.5,0.025,1,35],[13,3,0.03,1.25,45]],behave_thunder,des_thunder);
      
      public static const list:Vector.<PetSkillData> = new <PetSkillData>[counterattack,injury_resile,dodge,taunt,aggressive,defensive,strong,wisdom,wise,slayer,life_drain,good_or_evil,ice_spear,fireball,thunder,double_hit,meditation,heal];
      
      public function PetSkillList()
      {
         super();
      }
      
      private static function des_counterattack(param1:PetSkill) : String
      {
         var _loc2_:Array = getSetArray(param1);
         return "当受伤时," + _loc2_[0] + "%的机会反击,反击伤害为宠物正常伤害的" + yellowText(_loc2_[1]) + "%";
      }
      
      private static function des_injury_resile(param1:PetSkill) : String
      {
         var _loc2_:Array = getSetArray(param1);
         return "当受伤时," + _loc2_[0] + "%的机会反震,反震伤害为所受伤害的" + yellowText(_loc2_[1]) + "%";
      }
      
      private static function des_dodge(param1:PetSkill) : String
      {
         var _loc2_:Array = getSetArray(param1);
         return yellowText(_loc2_[0]) + "%几率回避伤害";
      }
      
      private static function des_taunt(param1:PetSkill) : String
      {
         var _loc2_:Array = getSetArray(param1);
         return "吸引怪兽注意力,强制他攻击自己,降低所受伤害的" + yellowText(_loc2_[0]) + "%";
      }
      
      private static function des_aggressive(param1:PetSkill) : String
      {
         var _loc2_:Array = getSetArray(param1);
         return "增加宠物的攻击力 " + yellowText(_loc2_[0]) + "*等级";
      }
      
      private static function des_defensive(param1:PetSkill) : String
      {
         var _loc2_:Array = getSetArray(param1);
         return "增加宠物防御力 " + yellowText(_loc2_[0]) + "*等级";
      }
      
      private static function des_protective(param1:PetSkill) : String
      {
         var _loc2_:Array = getSetArray(param1);
         return "增加宠物护甲 " + yellowText(_loc2_[0]) + "*等级";
      }
      
      private static function des_strong(param1:PetSkill) : String
      {
         var _loc2_:Array = getSetArray(param1);
         return "增加宠物Hp " + yellowText(_loc2_[0]) + "*等级";
      }
      
      private static function des_wisdom(param1:PetSkill) : String
      {
         var _loc2_:Array = getSetArray(param1);
         return "增加宠物Mp " + yellowText(_loc2_[0]) + "*等级";
      }
      
      private static function des_wise(param1:PetSkill) : String
      {
         var _loc2_:Array = getSetArray(param1);
         return "增加宠物魔法攻击 " + yellowText(_loc2_[0]) + "*等级";
      }
      
      private static function des_slayer(param1:PetSkill) : String
      {
         var _loc2_:Array = getSetArray(param1);
         return "增加宠物暴击率 " + yellowText(_loc2_[0]) + "%, 暴击倍数*2";
      }
      
      private static function des_life_drain(param1:PetSkill) : String
      {
         var _loc2_:Array = getSetArray(param1);
         return "当宠物造成物理伤害,回复宠物生命. 回复造成伤害的" + yellowText(_loc2_[0]) + "%";
      }
      
      private static function des_good_or_evil(param1:PetSkill) : String
      {
         var _loc2_:Array = getSetArray(param1);
         return "当造成物理伤害," + yellowText(_loc2_[0]) + "%机会造成两倍伤害," + yellowText(100 - _loc2_[0] + "") + "%机会为敌方回复生命";
      }
      
      private static function des_ice_spear(param1:PetSkill) : String
      {
         var _loc2_:Array = getSetArray(param1);
         var _loc3_:String = "消耗" + yellowText(_loc2_[3]) + "魔法, 造成" + yellowText(_loc2_[0]) + "+" + yellowText(_loc2_[1]) + "*等级的伤害.<br/> 附加效果: 冰冻(使敌方" + yellowText(_loc2_[2]) + "回合无法行动";
         if(param1.level)
         {
            _loc3_ += "," + yellowText(_loc2_[4]) + "%几率冰冻" + yellowText(_loc2_[5]) + "回合";
         }
         return _loc3_ + ")";
      }
      
      private static function behave_ice_spear(param1:PetSkill) : Boolean
      {
         var _loc2_:Array = getSetArray(param1);
         if(MainScene.battle.petMp < _loc2_[3])
         {
            return false;
         }
         MainScene.battle.petMp -= _loc2_[3];
         var _loc3_:Number = getCritMul();
         var _loc4_:int = (_loc2_[0] + _loc2_[1] * pet.level) * pet.magicatt / 100 * monsterPro;
         if(_loc4_ < 1)
         {
            _loc4_ = 1;
         }
         MainScene.battle.monsterHp -= _loc4_;
         if(_loc2_.length > 5)
         {
            if(Math.random() < 0.1)
            {
               monster.addBuff(new BuffFrozen(_loc2_[5]));
            }
         }
         else
         {
            monster.addBuff(new BuffFrozen(_loc2_[2]));
         }
         traceAttackInfo(param1.getRealName(),_loc4_,_loc3_);
         return true;
      }
      
      private static function des_fireball(param1:PetSkill) : String
      {
         var _loc2_:Array = getSetArray(param1);
         return "消耗" + yellowText(_loc2_[2]) + "魔法, 造成" + yellowText(_loc2_[0]) + "+" + yellowText(_loc2_[1]) + "*等级的伤害.<br/> 附加效果: 灼伤(造成敌人" + yellowText(_loc2_[3]) + "*等级的伤害每回合,可叠加)";
      }
      
      private static function behave_fireball(param1:PetSkill) : Boolean
      {
         var _loc2_:Array = getSetArray(param1);
         if(MainScene.battle.petMp < _loc2_[2])
         {
            return false;
         }
         MainScene.battle.petMp -= _loc2_[2];
         var _loc3_:Number = getCritMul();
         var _loc4_:int = (_loc2_[0] + _loc2_[1] * pet.level) * pet.magicatt / 100 * monsterPro;
         if(_loc4_ < 1)
         {
            _loc4_ = 1;
         }
         MainScene.battle.monsterHp -= _loc4_;
         monster.addBuff(new BuffBurn(_loc2_[3] * pet.level * pet.magicatt / 100));
         traceAttackInfo(param1.getRealName(),_loc4_,_loc3_);
         return true;
      }
      
      private static function des_thunder(param1:PetSkill) : String
      {
         var _loc2_:Array = getSetArray(param1);
         return "消耗" + yellowText(_loc2_[4]) + "魔法, 造成" + yellowText(_loc2_[0]) + "+" + yellowText(_loc2_[1]) + "*等级的伤害.<br/> 附加效果: 破甲(减少敌方" + yellowText(_loc2_[2]) + "+" + yellowText(_loc2_[3]) + "*等级的护甲,可叠加)";
      }
      
      private static function behave_thunder(param1:PetSkill) : Boolean
      {
         var _loc2_:Array = getSetArray(param1);
         if(MainScene.battle.petMp < _loc2_[4])
         {
            return false;
         }
         MainScene.battle.petMp -= _loc2_[4];
         var _loc3_:Number = getCritMul();
         var _loc4_:int = (_loc2_[0] + _loc2_[1] * pet.level) * pet.magicatt / 100 * monsterPro;
         if(_loc4_ < 1)
         {
            _loc4_ = 1;
         }
         MainScene.battle.monsterHp -= _loc4_;
         monster.addBuff(new BuffCorrosion(_loc2_[2] + _loc2_[3] * pet.level));
         traceAttackInfo(param1.getRealName(),_loc4_,_loc3_);
         return true;
      }
      
      private static function des_doubleHit(param1:PetSkill) : String
      {
         var _loc2_:Array = getSetArray(param1);
         return "当普通攻击时,有" + yellowText(_loc2_[0]) + "%的机会再次攻击";
      }
      
      private static function des_meditation(param1:PetSkill) : String
      {
         var _loc2_:Array = getSetArray(param1);
         return "每回合,回复自身和玩家" + yellowText(_loc2_[0]) + "*等级的Mp";
      }
      
      private static function des_heal(param1:PetSkill) : String
      {
         var _loc2_:Array = getSetArray(param1);
         return "每回合,回复自身和玩家" + yellowText(_loc2_[0]) + "*等级的Hp";
      }
      
      private static function getSetArray(param1:PetSkill) : Array
      {
         var _loc2_:Array = null;
         if(param1.level)
         {
            _loc2_ = param1.skillData.setList[1];
         }
         else
         {
            _loc2_ = param1.skillData.setList[0];
         }
         return _loc2_;
      }
      
      private static function yellowText(param1:String) : String
      {
         return "<font color=\'#ff7100\'>" + param1 + "</font>";
      }
      
      private static function traceAttackInfo(param1:String, param2:int, param3:Number) : *
      {
         if(param3 > 1)
         {
            MainScene.allInfoPanel.addText("你的宠物使用了<font color=\'#ff4040\'>" + param1 + "</font>,对" + monster.nameHtml + "造成了<font color=\'#ff4040\' size=\'20\'> " + param2 + "!</font>伤害.",Global.battle);
         }
         else
         {
            MainScene.allInfoPanel.addText("你的宠物使用了<font color=\'#ff4040\'>" + param1 + "</font>,对" + monster.nameHtml + "造成了<font color=\'#ff4040\'> " + param2 + "</font>伤害.",Global.battle);
         }
      }
      
      private static function get pet() : Pet
      {
         return MainScene.battle.pet;
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
         return 1 - caculateProtection(monster.protection);
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
         var _loc2_:int = pet.cri - monster.protection * 2;
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
            _loc3_ = pet.crimul / 100;
         }
         return _loc3_;
      }
   }
}

