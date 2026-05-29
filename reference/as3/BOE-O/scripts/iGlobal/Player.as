package iGlobal
{
   import flash.net.FileReference;
   import flash.net.SharedObject;
   import flash.utils.ByteArray;
   import iData.BasicStatus;
   import iData.Race;
   import iData.RaceList;
   import iData.iItem.Equipment;
   import iData.iItem.EquipmentList;
   import iData.iItem.Stat;
   import iData.iItem.Weapon;
   import iData.iItem.WeaponCategory;
   import iData.iItem.WeaponData;
   import iData.iMap.Map;
   import iData.iMap.MapList;
   import iData.iPet.Pet;
   import iData.iPlayer.Title;
   import iData.iPlayer.TitleList;
   import iData.iSkill.ActiveSkill;
   import iData.iSkill.ActiveSkillData;
   import iData.iSkill.PassiveSkill;
   import iData.iSkill.PassiveSkillData;
   import iData.iSkill.Skill;
   import iData.iSkill.SkillCategory;
   import iData.iSkill.SkillData;
   import iData.iSkill.SkillDataList;
   import iData.iSkill.SkillType;
   import iPanel.iScene.MainScene;
   import iPanel.iScene.SaveScene;
   import tool.Base64;
   import tool.MyMath;
   
   public class Player
   {
      
      public static var lv:int;
      
      public static var age:int;
      
      public static var race:Race;
      
      public static var basicStatus:BasicStatus;
      
      public static var ap:int;
      
      public static var gold:int;
      
      public static var xp:int;
      
      public static var pet:Pet;
      
      public static var title:Title;
      
      public static var apCost:int;
      
      public static var storeLv:int;
      
      public static var head:Equipment;
      
      public static var feet:Equipment;
      
      public static var body:Equipment;
      
      public static var necklace:Equipment;
      
      public static var ring:Equipment;
      
      public static var leftHand:Weapon;
      
      public static var rightHand:Weapon;
      
      public static var BAGMAX:int = 50;
      
      public static var PETMAX:int = 10;
      
      public static var caculate:int = 0;
      
      public static var playerName:String = "Jason";
      
      public static var skillStatus:BasicStatus = new BasicStatus(0,0,0,0,0,0,0);
      
      public static var equipStatus:BasicStatus = new BasicStatus(0,0,0,0,0,0,0);
      
      public static var skillList:Vector.<Skill> = new Vector.<Skill>();
      
      public static var equipSkillList:Vector.<ActiveSkill> = new Vector.<ActiveSkill>();
      
      public static var itemList:Vector.<Equipment> = new Vector.<Equipment>();
      
      public static var titleList:Vector.<Title> = new Vector.<Title>();
      
      public static var petList:Vector.<Pet> = new Vector.<Pet>();
      
      public function Player()
      {
         super();
      }
      
      public static function burn(param1:int, param2:Race) : void
      {
         Player.age = param1;
         Player.race = param2;
         Player.lv = 1;
         caculateInitStat();
         if(!leftHand)
         {
            equip(new Weapon(EquipmentList.list[1] as WeaponData,1));
         }
         Player.addSkill(SkillDataList.COMBAT_MASTERY);
         Player.addSkill(SkillDataList.SMASH);
         Player.addSkill(SkillDataList.CRITICAL_HIT);
         Player.addSkill(SkillDataList.COUNTERATTACK);
         Player.addSkill(SkillDataList.DEFENCE);
         Player.addSkill(SkillDataList.MAGIC_MASTERY);
         Player.addSkill(SkillDataList.FIREBOLT);
         Player.addSkill(SkillDataList.ICEBOLT);
         Player.addSkill(SkillDataList.LIGHTNINGBOLT);
         Player.addSkill(SkillDataList.BLACKSMITHING);
         Player.addSkill(SkillDataList.RANGE_MASTERY);
         Player.addSkill(SkillDataList.MIRAGE_MISSILE);
         TitleList.updateTitleInfo("begin");
         updateAllInfo();
         save();
      }
      
      private static function caculateInitStat() : void
      {
         Player.basicStatus = race.caculateStat(age);
      }
      
      private static function caculateLevelStat() : void
      {
      }
      
      public static function ageup() : void
      {
         caculate = 0;
         if(age < 25)
         {
            basicStatus.hp += race.ageupList[age - 10].hp + 1;
            basicStatus.mp += race.ageupList[age - 10].mp + 1;
            basicStatus.str += race.ageupList[age - 10].str;
            basicStatus.dex += race.ageupList[age - 10].dex;
            basicStatus.will += race.ageupList[age - 10].will;
            basicStatus.intelligence += race.ageupList[age - 10].intelligence;
            basicStatus.luck += race.ageupList[age - 10].luck;
         }
         else
         {
            basicStatus.hp += 1;
            basicStatus.mp += 1;
         }
         ++age;
         var _loc1_:int = 18 - age;
         if(_loc1_ < 1 && age <= 25)
         {
            _loc1_ = 1;
         }
         if(_loc1_ > 0)
         {
            addAp(_loc1_);
         }
         updateInfoWindow();
         MainScene.allInfoPanel.addText("<font color=\'#ff4040\'>你长大了! 你现在" + age + "岁了!</font>");
         TitleList.updateTitleInfo("age",age);
         MainScene.otherPanel.otherWindow.updateBirth();
      }
      
      public static function get combatPower() : Number
      {
         var _loc1_:Number = basicStatus.hp + skillStatus.hp;
         var _loc2_:Number = basicStatus.mp + skillStatus.mp;
         var _loc3_:Number = basicStatus.str + skillStatus.str;
         var _loc4_:Number = basicStatus.intelligence + skillStatus.intelligence;
         var _loc5_:Number = basicStatus.dex + skillStatus.dex;
         var _loc6_:Number = basicStatus.will + skillStatus.will;
         var _loc7_:Number = basicStatus.luck + skillStatus.luck;
         return _loc1_ + 0.5 * _loc2_ + _loc3_ + 0.2 * _loc4_ + 0.1 * _loc5_ + 0.5 * _loc6_ + 0.1 * _loc7_ + apCost;
      }
      
      public static function addItem(param1:Equipment) : Boolean
      {
         if(itemList.length >= BAGMAX)
         {
            MainScene.allInfoPanel.addText("背包满了!",Global.item);
            return false;
         }
         itemList.push(param1);
         if(MainScene.allInfoPanel)
         {
            MainScene.allInfoPanel.addText("你获得了" + param1.getNameHTML() + "!",Global.item);
         }
         if(MainScene.otherPanel)
         {
            if(MainScene.otherPanel.itemWindow)
            {
               MainScene.otherPanel.itemWindow.addOneItem();
            }
         }
         return true;
      }
      
      public static function addPet(param1:Pet) : Boolean
      {
         if(petList.length >= PETMAX)
         {
            MainScene.allInfoPanel.addText("宠物栏满了!",Global.item);
            return false;
         }
         petList.push(param1);
         if(MainScene.allInfoPanel)
         {
            MainScene.allInfoPanel.addText("你获得了" + param1.name + "!",Global.item);
         }
         if(MainScene.otherPanel)
         {
            MainScene.otherPanel.petWindow.update();
         }
         return true;
      }
      
      public static function removeItem(param1:Equipment) : Boolean
      {
         var _loc2_:int = int(itemList.length);
         var _loc3_:int = 0;
         while(_loc3_ < _loc2_)
         {
            if(itemList[_loc3_] == param1)
            {
               itemList.splice(_loc3_,1);
               return true;
            }
            _loc3_++;
         }
         return false;
      }
      
      public static function addSkill(param1:SkillData) : void
      {
         var _loc2_:int = int(skillList.length);
         var _loc3_:int = 0;
         while(_loc3_ < _loc2_)
         {
            if(skillList[_loc3_].skillData.name == param1.name)
            {
               return;
            }
            _loc3_++;
         }
         if(param1 is PassiveSkillData)
         {
            skillList.push(new PassiveSkill(param1 as PassiveSkillData));
         }
         else
         {
            skillList.push(new ActiveSkill(param1 as ActiveSkillData));
         }
         if(MainScene.allInfoPanel)
         {
            MainScene.allInfoPanel.addText("你获得了技能<font color=\'#ff4040\'>" + param1.name + "</font>");
         }
      }
      
      public static function getSkill(param1:SkillData) : Skill
      {
         var _loc2_:int = int(skillList.length);
         var _loc3_:int = 0;
         while(_loc3_ < _loc2_)
         {
            if(skillList[_loc3_].skillData.name == param1.name)
            {
               return skillList[_loc3_];
            }
            _loc3_++;
         }
         return null;
      }
      
      public static function isSkillEquiped(param1:Skill) : Boolean
      {
         var _loc2_:int = int(equipSkillList.length);
         var _loc3_:int = 0;
         while(_loc3_ < _loc2_)
         {
            if(equipSkillList[_loc3_] == param1)
            {
               return true;
            }
            _loc3_++;
         }
         return false;
      }
      
      public static function equipSkill(param1:Skill) : Boolean
      {
         if(isSkillEquiped(param1))
         {
            return false;
         }
         var _loc2_:int = int(skillList.length);
         var _loc3_:int = 0;
         while(_loc3_ < _loc2_)
         {
            if(skillList[_loc3_] == param1)
            {
               equipSkillList.push(param1);
               updateBattleSkillWindow();
               return true;
            }
            _loc3_++;
         }
         return false;
      }
      
      public static function unequipSkill(param1:Skill) : Boolean
      {
         var _loc2_:int = int(equipSkillList.length);
         var _loc3_:int = 0;
         while(_loc3_ < _loc2_)
         {
            if(equipSkillList[_loc3_] == param1)
            {
               equipSkillList.splice(_loc3_,1);
               updateBattleSkillWindow();
               return true;
            }
            _loc3_++;
         }
         return false;
      }
      
      public static function get attackSkillList() : Vector.<ActiveSkill>
      {
         var _loc3_:String = null;
         var _loc1_:Vector.<ActiveSkill> = new Vector.<ActiveSkill>();
         var _loc2_:int = int(equipSkillList.length);
         if(leftHand)
         {
            _loc3_ = leftHand.category;
         }
         else
         {
            _loc3_ = WeaponCategory.MELEE;
         }
         var _loc4_:int = 0;
         while(_loc4_ < _loc2_)
         {
            if((equipSkillList[_loc4_].skillData as ActiveSkillData).type == SkillType.ATTACK)
            {
               if(equipSkillList[_loc4_].skillData.category == SkillCategory.ALL || equipSkillList[_loc4_].skillData.category == SkillCategory.MAGIC || equipSkillList[_loc4_].skillData.category == _loc3_)
               {
                  _loc1_.push(equipSkillList[_loc4_]);
               }
            }
            _loc4_++;
         }
         return _loc1_;
      }
      
      public static function get defenceSkillList() : Vector.<ActiveSkill>
      {
         var _loc3_:String = null;
         var _loc1_:Vector.<ActiveSkill> = new Vector.<ActiveSkill>();
         var _loc2_:int = int(equipSkillList.length);
         if(leftHand)
         {
            _loc3_ = leftHand.category;
         }
         else
         {
            _loc3_ = WeaponCategory.MELEE;
         }
         var _loc4_:int = 0;
         while(_loc4_ < _loc2_)
         {
            if((equipSkillList[_loc4_].skillData as ActiveSkillData).type == SkillType.DEFENCE)
            {
               if(equipSkillList[_loc4_].skillData.category == SkillCategory.ALL || equipSkillList[_loc4_].skillData.category == SkillCategory.MAGIC || equipSkillList[_loc4_].skillData.category == _loc3_)
               {
                  _loc1_.push(equipSkillList[_loc4_]);
               }
            }
            _loc4_++;
         }
         return _loc1_;
      }
      
      public static function equip(param1:Equipment) : *
      {
         if(param1 is Weapon)
         {
            switch(param1.position)
            {
               case Weapon.ONEHAND:
                  unequip("leftHand");
                  leftHand = param1 as Weapon;
                  updateSkillInfo();
                  break;
               case Weapon.OFFHAND:
                  unequip("rightHand");
                  if(Boolean(leftHand) && leftHand.position == Weapon.TWOHAND)
                  {
                     unequip("leftHand");
                  }
                  rightHand = param1 as Weapon;
                  break;
               case Weapon.TWOHAND:
                  unequip("leftHand");
                  unequip("rightHand");
                  leftHand = param1 as Weapon;
                  updateSkillInfo();
            }
         }
         else
         {
            if(Player[param1.position])
            {
               unequip(param1.position);
            }
            Player[param1.position] = param1;
         }
         updateEquipInfo();
         updateBattleSkillWindow();
      }
      
      public static function unequip(param1:String) : *
      {
         if(Player[param1])
         {
            addItem(Player[param1]);
            Player[param1] = null;
            updateEquipInfo();
            updateSkillInfo();
         }
         updateBattleSkillWindow();
      }
      
      public static function addTitle(param1:Title) : *
      {
         titleList.push(param1);
      }
      
      public static function setTitle(param1:Title) : *
      {
         if(title == param1)
         {
            title = null;
         }
         else
         {
            title = param1;
         }
         updateInfoWindow();
      }
      
      public static function setPet(param1:Pet) : *
      {
         if(pet == param1)
         {
            pet = null;
         }
         else
         {
            if(pet)
            {
               addPet(pet);
            }
            pet = param1;
         }
         updatePetInfoWindow();
         updateEquipWindow();
      }
      
      public static function removePet(param1:Pet) : Boolean
      {
         var _loc2_:int = int(petList.length);
         var _loc3_:int = 0;
         while(_loc3_ < _loc2_)
         {
            if(petList[_loc3_] == param1)
            {
               petList.splice(_loc3_,1);
               return true;
            }
            _loc3_++;
         }
         return false;
      }
      
      public static function addAp(param1:int) : *
      {
         ap += param1;
         updateInfoWindow();
         updateSkillPanel();
         if(param1 > 0)
         {
            MainScene.allInfoPanel.addText("<font color=\'#FF4040\'>你获得了" + param1 + " ap!</font>");
         }
         else
         {
            apCost -= param1;
         }
      }
      
      public static function loseMoney(param1:int) : *
      {
         gold -= param1;
         MainScene.allInfoPanel.addText("你<font color=\'#FF4040\'>失去了" + "$" + param1 + "</font>.",Global.money);
         updateInfoWindow();
         if(MainScene.lootPanel)
         {
            MainScene.lootPanel.money -= param1;
         }
         if(Global.shopPanel)
         {
            Global.shopPanel.updateMoneyButton();
         }
         if(Global.specialShopPanel)
         {
            Global.specialShopPanel.update();
         }
      }
      
      public static function addMoney(param1:int) : *
      {
         if(gold <= 1000000000)
         {
            gold += param1;
            MainScene.allInfoPanel.addText("你获得了<font color=\'#FFA640\'>" + "$" + param1 + "</font>.",Global.money);
            updateInfoWindow();
            if(MainScene.lootPanel)
            {
               MainScene.lootPanel.money += param1;
            }
         }
         if(Global.shopPanel)
         {
            Global.shopPanel.updateMoneyButton();
         }
         if(Global.specialShopPanel)
         {
            Global.specialShopPanel.update();
         }
         if(Global.kongregate)
         {
            Global.kongregate.stats.submit("Money",gold);
         }
      }
      
      public static function loseExp() : *
      {
         var _loc1_:int = xp / 100;
         MainScene.allInfoPanel.addText("你<font color=\'#ff4040\'>失去了" + _loc1_ + "</font>经验.",Global.exp);
         xp -= _loc1_;
         updateXpBar();
         if(MainScene.lootPanel)
         {
            MainScene.lootPanel.exp -= _loc1_;
         }
      }
      
      public static function addExp(param1:int) : *
      {
         if(getLevelExp() < 0)
         {
            return;
         }
         xp += param1;
         MainScene.allInfoPanel.addText("你获得了<font color=\'#4a60d7\'>" + param1 + "</font>经验.",Global.exp);
         if(xp > getLevelExp())
         {
            levelUp();
         }
         updateXpBar();
         if(MainScene.lootPanel)
         {
            MainScene.lootPanel.exp += param1;
         }
      }
      
      private static function levelUp() : *
      {
         ++lv;
         if(age < 25)
         {
            basicStatus.hp += race.ageupList[age - 10].hp / 4 + 1;
            basicStatus.mp += race.ageupList[age - 10].mp / 4 + 1;
            basicStatus.str += race.ageupList[age - 10].str / 4;
            basicStatus.dex += race.ageupList[age - 10].dex / 4;
            basicStatus.will += race.ageupList[age - 10].will / 4;
            basicStatus.intelligence += race.ageupList[age - 10].intelligence / 4;
            basicStatus.luck += race.ageupList[age - 10].luck / 4;
         }
         else
         {
            basicStatus.hp += 1;
            basicStatus.mp += 1;
         }
         addAp(1);
         xp = 0;
         if(MainScene.xpBar)
         {
            MainScene.xpBar.Value = 0;
            MainScene.xpBar.Max = getLevelExp();
         }
         updateInfoWindow();
         updateXpBar();
         MainScene.allInfoPanel.addText("<font color=\'#ff4040\'>升级了! 你现在是 Lv." + lv + "!</font>");
         if(age == 10)
         {
            TitleList.updateTitleInfo("age10",lv);
         }
         if(Global.kongregate)
         {
            Global.kongregate.stats.submit("CP",Player.combatPower);
            Global.kongregate.stats.submit("STR",str);
            Global.kongregate.stats.submit("DEX",dex);
            Global.kongregate.stats.submit("INT",intelligence);
            Global.kongregate.stats.submit("WILL",will);
            Global.kongregate.stats.submit("LUCK",luck);
         }
      }
      
      public static function getLevelExp() : int
      {
         if(lv >= 200)
         {
            return -1;
         }
         return lv * lv * ((lv + 1) * (lv + 1) - 13 * (lv + 1) + 82);
      }
      
      public static function get attack() : int
      {
         var _loc1_:int = 0;
         if(attMin > attMax)
         {
            _loc1_ = attMax + (attMin - attMax) * MyMath.balanceRandom(balance);
         }
         else
         {
            _loc1_ = attMin + (attMax - attMin) * MyMath.balanceRandom(balance);
         }
         return _loc1_;
      }
      
      public static function get attMin() : int
      {
         var _loc2_:String = null;
         var _loc1_:int = basicStatus.attack.min + skillStatus.attack.min + equipStatus.attack.min + str / 3;
         if(leftHand)
         {
            _loc2_ = leftHand.category;
         }
         else
         {
            _loc2_ = WeaponCategory.MELEE;
         }
         if(_loc2_ == WeaponCategory.RANGED)
         {
            _loc1_ += dex / 3;
         }
         return formula_title_stat(_loc1_,Stat.ATTACK);
      }
      
      public static function get attMax() : int
      {
         var _loc2_:String = null;
         var _loc1_:int = basicStatus.attack.max + skillStatus.attack.max + equipStatus.attack.max + str / 2.5;
         if(leftHand)
         {
            _loc2_ = leftHand.category;
         }
         else
         {
            _loc2_ = WeaponCategory.MELEE;
         }
         if(_loc2_ == WeaponCategory.RANGED)
         {
            _loc1_ += dex / 2.5;
         }
         return formula_title_stat(_loc1_,Stat.ATTACK);
      }
      
      public static function get hp() : int
      {
         return formula_title_stat(formula_StatAddUp(Stat.hp),Stat.hp);
      }
      
      public static function get mp() : int
      {
         return formula_title_stat(formula_StatAddUp(Stat.mp),Stat.mp);
      }
      
      public static function get str() : int
      {
         var _loc1_:int = formula_title_stat(formula_StatAddUp(Stat.str),Stat.str);
         TitleList.updateTitleInfo(Stat.str,_loc1_);
         return _loc1_;
      }
      
      public static function get dex() : int
      {
         var _loc1_:int = formula_title_stat(formula_StatAddUp(Stat.dex),Stat.dex);
         TitleList.updateTitleInfo(Stat.dex,_loc1_);
         return _loc1_;
      }
      
      public static function get intelligence() : int
      {
         var _loc1_:int = formula_title_stat(formula_StatAddUp(Stat.intelligence),Stat.intelligence);
         TitleList.updateTitleInfo(Stat.intelligence,_loc1_);
         return _loc1_;
      }
      
      public static function get will() : int
      {
         var _loc1_:int = formula_title_stat(formula_StatAddUp(Stat.will),Stat.will);
         TitleList.updateTitleInfo(Stat.will,_loc1_);
         return _loc1_;
      }
      
      public static function get luck() : int
      {
         var _loc1_:int = formula_title_stat(formula_StatAddUp(Stat.luck),Stat.luck);
         TitleList.updateTitleInfo(Stat.luck,_loc1_);
         return _loc1_;
      }
      
      public static function get defence() : int
      {
         return formula_title_stat(formula_StatAddUp(Stat.defence),Stat.defence);
      }
      
      public static function get protection() : int
      {
         return formula_title_stat(formula_StatAddUp(Stat.protection),Stat.protection);
      }
      
      public static function get balance() : int
      {
         var _loc1_:int = formula_title_stat(formula_StatAddUp(Stat.balance) + (dex - 10) / 4,Stat.balance);
         if(_loc1_ > 100)
         {
            _loc1_ = 100;
         }
         return _loc1_;
      }
      
      public static function get crit() : int
      {
         return formula_title_stat(formula_StatAddUp(Stat.crit) + will / 5 + luck / 5,Stat.crit);
      }
      
      public static function get crit_mul() : int
      {
         return formula_title_stat(formula_StatAddUp(Stat.crit_mul) + 100,Stat.crit_mul);
      }
      
      public static function get spellChance() : int
      {
         return formula_title_stat(formula_StatAddUp(Stat.spellChance) + intelligence / 20,Stat.spellChance);
      }
      
      public static function get protectionIgnore() : int
      {
         return formula_title_stat(formula_StatAddUp(Stat.protectionIgnore),Stat.protectionIgnore);
      }
      
      public static function get protectionReduce() : int
      {
         return formula_title_stat(formula_StatAddUp(Stat.protectionReduce),Stat.protectionReduce);
      }
      
      public static function get magicDamage() : int
      {
         return formula_title_stat(formula_StatAddUp(Stat.magicDamage) + intelligence / 20,Stat.magicDamage);
      }
      
      public static function get magicBalance() : int
      {
         var _loc1_:int = (intelligence - 10) / 4 + 30;
         if(_loc1_ > 99)
         {
            _loc1_ = 99;
         }
         return _loc1_;
      }
      
      public static function get basicStr() : int
      {
         return formula_BasicStatAddUp(Stat.str);
      }
      
      public static function get basicDex() : int
      {
         return formula_BasicStatAddUp(Stat.dex);
      }
      
      public static function get basicInt() : int
      {
         return formula_BasicStatAddUp(Stat.intelligence);
      }
      
      public static function get basicWill() : int
      {
         return formula_BasicStatAddUp(Stat.will);
      }
      
      public static function get basicLuck() : int
      {
         return formula_BasicStatAddUp(Stat.luck);
      }
      
      private static function formula_statAdd(param1:BasicStatus, param2:BasicStatus, param3:String) : int
      {
         return param1[param3] + param2[param3];
      }
      
      private static function formula_StatAddUp(param1:String) : int
      {
         return basicStatus[param1] + skillStatus[param1] + equipStatus[param1];
      }
      
      private static function formula_title_stat(param1:int, param2:String) : int
      {
         var _loc3_:int = 0;
         var _loc4_:int = 0;
         if(title)
         {
            _loc3_ = int(title.statMulList.length);
            _loc4_ = 0;
            while(_loc4_ < _loc3_)
            {
               if(title.statMulList[_loc4_].name == param2)
               {
                  param1 *= title.statMulList[_loc4_].mul;
                  return int(param1 + title.statMulList[_loc4_].add);
               }
               _loc4_++;
            }
         }
         return param1;
      }
      
      private static function formula_BasicStatAddUp(param1:String) : int
      {
         return basicStatus[param1] + skillStatus[param1];
      }
      
      private static function updateInfoWindow() : *
      {
         if(MainScene.playerInfoPanel)
         {
            MainScene.playerInfoPanel.upDate();
         }
      }
      
      public static function updatePetInfoWindow() : *
      {
         if(MainScene.petInfoPanel)
         {
            MainScene.petInfoPanel.update();
         }
      }
      
      public static function updateAllInfo() : *
      {
         updateSkillInfo();
         updateEquipInfo();
      }
      
      public static function updateSkillInfo() : *
      {
         var _loc2_:SkillData = null;
         var _loc3_:int = 0;
         var _loc5_:int = 0;
         skillStatus = new BasicStatus(0,0,0,0,0,0,0);
         var _loc1_:int = int(skillList.length);
         var _loc4_:int = 0;
         while(_loc4_ < _loc1_)
         {
            _loc2_ = skillList[_loc4_].skillData;
            _loc3_ = skillList[_loc4_].level;
            _loc5_ = 0;
            while(_loc5_ < _loc2_.statList[_loc3_].length)
            {
               skillStatus[_loc2_.statList[_loc3_][_loc5_].name] += _loc2_.statList[_loc3_][_loc5_].value;
               _loc5_++;
            }
            if(Boolean(_loc2_.effectList) && Boolean(leftHand))
            {
               if(leftHand.category == _loc2_.category)
               {
                  _loc5_ = 0;
                  while(_loc5_ < _loc2_.effectList[_loc3_].length)
                  {
                     if(_loc2_.effectList[_loc3_][_loc5_].name == Stat.attackMin)
                     {
                        skillStatus.attack.min += _loc2_.effectList[_loc3_][_loc5_].value;
                     }
                     else if(_loc2_.effectList[_loc3_][_loc5_].name == Stat.attackMax)
                     {
                        skillStatus.attack.max += _loc2_.effectList[_loc3_][_loc5_].value;
                     }
                     else
                     {
                        skillStatus[_loc2_.effectList[_loc3_][_loc5_].name] += _loc2_.effectList[_loc3_][_loc5_].value;
                     }
                     _loc5_++;
                  }
               }
            }
            _loc4_++;
         }
         updateInfoWindow();
      }
      
      private static function updateEquipInfo() : *
      {
         var _loc3_:int = 0;
         var _loc4_:Vector.<Stat> = null;
         var _loc5_:int = 0;
         equipStatus = new BasicStatus(0,0,0,0,0,0,0);
         var _loc1_:Array = ["leftHand","rightHand","feet","head","necklace","ring","body"];
         var _loc2_:int = 0;
         while(_loc2_ < _loc1_.length)
         {
            if(Player[_loc1_[_loc2_]])
            {
               _loc3_ = int((Player[_loc1_[_loc2_]] as Equipment).basicStat.length);
               _loc4_ = (Player[_loc1_[_loc2_]] as Equipment).basicStat;
               _loc5_ = 0;
               while(_loc5_ < _loc3_)
               {
                  if(_loc4_[_loc5_].name == Stat.attackMin)
                  {
                     equipStatus.attack.min += _loc4_[_loc5_].value;
                  }
                  else if(_loc4_[_loc5_].name == Stat.attackMax)
                  {
                     equipStatus.attack.max += _loc4_[_loc5_].value;
                  }
                  else if(_loc4_[_loc5_].name == Stat.ATTACK)
                  {
                     equipStatus.attack.min += _loc4_[_loc5_].value;
                     equipStatus.attack.max += _loc4_[_loc5_].value;
                  }
                  else
                  {
                     equipStatus[_loc4_[_loc5_].name] += _loc4_[_loc5_].value;
                  }
                  _loc5_++;
               }
               _loc3_ = int((Player[_loc1_[_loc2_]] as Equipment).qualityStat.length);
               _loc4_ = (Player[_loc1_[_loc2_]] as Equipment).qualityStat;
               _loc5_ = 0;
               while(_loc5_ < _loc3_)
               {
                  if(_loc4_[_loc5_].name == Stat.attackMin)
                  {
                     equipStatus.attack.min += _loc4_[_loc5_].value;
                  }
                  else if(_loc4_[_loc5_].name == Stat.attackMax)
                  {
                     equipStatus.attack.max += _loc4_[_loc5_].value;
                  }
                  else if(_loc4_[_loc5_].name == Stat.ATTACK)
                  {
                     equipStatus.attack.min += _loc4_[_loc5_].value;
                     equipStatus.attack.max += _loc4_[_loc5_].value;
                  }
                  else
                  {
                     equipStatus[_loc4_[_loc5_].name] += _loc4_[_loc5_].value;
                  }
                  _loc5_++;
               }
               _loc3_ = int((Player[_loc1_[_loc2_]] as Equipment).levelStat.length);
               _loc4_ = (Player[_loc1_[_loc2_]] as Equipment).levelStat;
               _loc5_ = 0;
               while(_loc5_ < _loc3_)
               {
                  if(_loc4_[_loc5_].name == Stat.attackMin)
                  {
                     equipStatus.attack.min += _loc4_[_loc5_].value;
                  }
                  else if(_loc4_[_loc5_].name == Stat.attackMax)
                  {
                     equipStatus.attack.max += _loc4_[_loc5_].value;
                  }
                  else if(_loc4_[_loc5_].name == Stat.ATTACK)
                  {
                     equipStatus.attack.min += _loc4_[_loc5_].value;
                     equipStatus.attack.max += _loc4_[_loc5_].value;
                  }
                  else
                  {
                     equipStatus[_loc4_[_loc5_].name] += _loc4_[_loc5_].value;
                  }
                  _loc5_++;
               }
            }
            _loc2_++;
         }
         updateInfoWindow();
         updateEquipWindow();
      }
      
      private static function updateEquipWindow() : *
      {
         if(Boolean(MainScene.otherPanel) && Boolean(MainScene.otherPanel.equipWindow))
         {
            MainScene.otherPanel.equipWindow.update();
         }
      }
      
      public static function updateBattleSkillWindow() : *
      {
         if(MainScene.battleSkillPanel)
         {
            MainScene.battleSkillPanel.update();
         }
      }
      
      private static function updateXpBar() : *
      {
         if(MainScene.playerInfoPanel)
         {
            MainScene.playerInfoPanel.upDateExp();
         }
      }
      
      private static function updateSkillPanel() : *
      {
         if(Boolean(MainScene.otherPanel) && Boolean(MainScene.otherPanel.skillWindow))
         {
            MainScene.otherPanel.skillWindow.onUpdate();
         }
      }
      
      public static function manuallySave() : *
      {
         var _loc4_:int = 0;
         var _loc1_:String = playerName + "<>" + SaveScene.slot + "<>";
         var _loc2_:String = "";
         _loc2_ += "@BASIC:";
         var _loc3_:Array = ["lv","age","ap","xp","gold","apCost","caculate","BAGMAX","PETMAX"];
         _loc4_ = 0;
         while(_loc4_ < _loc3_.length)
         {
            _loc2_ += _loc3_[_loc4_] + "," + Player[_loc3_[_loc4_]] + ",";
            _loc4_++;
         }
         _loc2_ += "@RACE:";
         _loc2_ += race.name;
         _loc3_ = ["head","body","feet","necklace","ring","leftHand","rightHand"];
         _loc2_ += "@EQUIP:";
         _loc4_ = 0;
         while(_loc4_ < _loc3_.length)
         {
            if(Player[_loc3_[_loc4_]])
            {
               _loc2_ += _loc3_[_loc4_] + "," + (Player[_loc3_[_loc4_]] as Equipment).save() + ",";
            }
            _loc4_++;
         }
         _loc2_ += "@ITEM:";
         _loc4_ = 0;
         while(_loc4_ < itemList.length)
         {
            _loc2_ += itemList[_loc4_].save() + ",";
            _loc4_++;
         }
         _loc2_ += "@SKILL:";
         _loc4_ = 0;
         while(_loc4_ < skillList.length)
         {
            _loc2_ += skillList[_loc4_].save() + ",";
            _loc4_++;
         }
         _loc2_ += "@TITLE:";
         _loc4_ = 0;
         while(_loc4_ < TitleList.list.length)
         {
            _loc2_ += TitleList.list[_loc4_].save() + ",";
            _loc4_++;
         }
         _loc2_ += "@OTHER:";
         _loc3_ = ["hp","mp","luck","intelligence","str","dex","will"];
         _loc4_ = 0;
         while(_loc4_ < _loc3_.length)
         {
            _loc2_ += _loc3_[_loc4_] + "," + basicStatus[_loc3_[_loc4_]] + ",";
            _loc4_++;
         }
         _loc2_ += "@GLOBAL:";
         _loc3_ = ["battle","battleIntro","money","exp","item","item0","item1","item2","item3","item4","sword","axe","bow","crossbow","sceptre","staff","dagger","tome","shield","head_light","head_medium","head_heavy","body_light","body_medium","body_heavy","feet_light","feet_medium","feet_heavy","ring","necklace"];
         _loc2_ += "toggle,";
         _loc4_ = 0;
         while(_loc4_ < _loc3_.length)
         {
            _loc2_ += _loc3_[_loc4_] + "#" + Global[_loc3_[_loc4_] + "_toggle"] + "#";
            _loc4_++;
         }
         _loc2_ += "@SELECTION:";
         _loc2_ += "map," + Global.map.mapData.name + "#";
         if(title)
         {
            _loc2_ += "title," + title.name;
         }
         _loc2_ += "@PET:";
         _loc4_ = 0;
         while(_loc4_ < petList.length)
         {
            _loc2_ += petList[_loc4_].save() + ",";
            _loc4_++;
         }
         _loc2_ += "@EQUIPEDPET:";
         if(pet)
         {
            _loc2_ += pet.save();
         }
         var _loc5_:ByteArray = new ByteArray();
         _loc5_.writeUTFBytes(_loc2_);
         _loc5_.compress();
         _loc1_ += Base64.Encode(_loc5_);
         var _loc6_:FileReference = new FileReference();
         _loc6_.save(_loc1_,SaveScene.slot);
      }
      
      public static function manualLoad(param1:String) : *
      {
         var _loc7_:Array = null;
         var _loc8_:Array = null;
         var _loc9_:Array = null;
         var _loc10_:Array = null;
         var _loc11_:Array = null;
         var _loc12_:Array = null;
         var _loc13_:Array = null;
         var _loc14_:Array = null;
         var _loc15_:Array = null;
         var _loc16_:Array = null;
         var _loc17_:int = 0;
         var _loc18_:Array = null;
         var _loc19_:Array = null;
         var _loc20_:int = 0;
         var _loc2_:Array = param1.split("<>");
         playerName = _loc2_[0];
         SaveScene.slot = _loc2_[1];
         var _loc3_:ByteArray = Base64.Decode(_loc2_[2]);
         _loc3_.uncompress();
         var _loc4_:String = _loc3_.toString();
         var _loc5_:Array = _loc4_.split("@");
         var _loc6_:int = 0;
         while(_loc6_ < _loc5_.length)
         {
            _loc7_ = (_loc5_[_loc6_] as String).split(":");
            switch(_loc7_[0])
            {
               case "BASIC":
                  _loc8_ = (_loc7_[1] as String).split(",");
                  _loc17_ = 0;
                  while(_loc17_ < _loc8_.length)
                  {
                     if(_loc8_[_loc17_] != "")
                     {
                        Player[_loc8_[_loc17_]] = _loc8_[_loc17_ + 1];
                     }
                     _loc17_ += 2;
                  }
                  break;
               case "RACE":
                  _loc17_ = 0;
                  while(_loc17_ < RaceList.list.length)
                  {
                     if(_loc7_[1] == "undeath")
                     {
                        Player.race = RaceList.UNDEATH;
                        break;
                     }
                     if(_loc7_[1] == RaceList.list[_loc17_].name)
                     {
                        Player.race = RaceList.list[_loc17_];
                        break;
                     }
                     _loc17_++;
                  }
                  break;
               case "EQUIP":
                  _loc9_ = (_loc7_[1] as String).split(",");
                  _loc17_ = 0;
                  while(_loc17_ < _loc9_.length)
                  {
                     if(_loc9_[_loc17_] != "")
                     {
                        Player[_loc9_[_loc17_]] = Equipment.load(_loc9_[_loc17_ + 1]);
                     }
                     _loc17_ += 2;
                  }
                  break;
               case "ITEM":
                  _loc10_ = (_loc7_[1] as String).split(",");
                  _loc17_ = 0;
                  while(_loc17_ < _loc10_.length)
                  {
                     if(_loc10_[_loc17_] != "")
                     {
                        itemList.push(Equipment.load(_loc10_[_loc17_]));
                     }
                     _loc17_++;
                  }
                  break;
               case "SKILL":
                  _loc11_ = (_loc7_[1] as String).split(",");
                  _loc17_ = 0;
                  while(_loc17_ < _loc11_.length)
                  {
                     if(_loc11_[_loc17_] != "")
                     {
                        skillList.push(Skill.load(_loc11_[_loc17_]));
                     }
                     _loc17_++;
                  }
                  break;
               case "TITLE":
                  _loc12_ = (_loc7_[1] as String).split(",");
                  _loc17_ = 0;
                  while(_loc17_ < TitleList.list.length)
                  {
                     TitleList.list[_loc17_].load(_loc12_[_loc17_]);
                     _loc17_++;
                  }
                  break;
               case "OTHER":
                  _loc13_ = (_loc7_[1] as String).split(",");
                  basicStatus = new BasicStatus(0,0,0,0,0,0,0);
                  _loc17_ = 0;
                  while(_loc17_ < _loc13_.length)
                  {
                     if(_loc13_[_loc17_] != "")
                     {
                        basicStatus[_loc13_[_loc17_]] = _loc13_[_loc17_ + 1];
                     }
                     _loc17_ += 2;
                  }
                  break;
               case "GLOBAL":
                  _loc14_ = (_loc7_[1] as String).split(",");
                  switch(_loc14_[0])
                  {
                     case "toggle":
                        _loc18_ = (_loc14_[1] as String).split("#");
                        _loc17_ = 0;
                        while(_loc17_ < _loc18_.length)
                        {
                           if(_loc18_[_loc17_] != "")
                           {
                              if(_loc18_[_loc17_ + 1] == "true")
                              {
                                 Global[_loc18_[_loc17_] + "_toggle"] = true;
                              }
                              else
                              {
                                 Global[_loc18_[_loc17_] + "_toggle"] = false;
                              }
                           }
                           _loc17_ += 2;
                        }
                  }
                  break;
               case "SELECTION":
                  _loc15_ = (_loc7_[1] as String).split("#");
                  _loc17_ = 0;
                  while(_loc17_ < _loc15_.length)
                  {
                     _loc19_ = (_loc15_[_loc17_] as String).split(",");
                     switch(_loc19_[0])
                     {
                        case "map":
                           _loc20_ = 0;
                           while(_loc20_ < MapList.list.length)
                           {
                              if(_loc19_[1] == MapList.list[_loc20_].name)
                              {
                                 Global.map = new Map(MapList.list[_loc20_]);
                              }
                              _loc20_++;
                           }
                           break;
                        case "title":
                           _loc20_ = 0;
                           while(_loc20_ < TitleList.list.length)
                           {
                              if(_loc19_[1] == TitleList.list[_loc20_].name)
                              {
                                 title = TitleList.list[_loc20_];
                              }
                              _loc20_++;
                           }
                     }
                     _loc17_++;
                  }
                  break;
               case "PET":
                  _loc16_ = (_loc7_[1] as String).split(",");
                  _loc17_ = 0;
                  while(_loc17_ < _loc16_.length)
                  {
                     if(_loc16_[_loc17_] != "")
                     {
                        petList.push(Pet.load(_loc16_[_loc17_]));
                     }
                     _loc17_++;
                  }
                  break;
               case "EQUIPEDPET":
                  if(_loc7_[1] != "")
                  {
                     pet = Pet.load(_loc7_[1]);
                  }
            }
            _loc6_++;
         }
         if(!basicStatus)
         {
            caculateInitStat();
         }
         updateAllInfo();
         updateXpBar();
      }
      
      public static function save() : *
      {
         var _loc6_:int = 0;
         var _loc1_:SharedObject = SharedObject.getLocal(SaveScene.slot);
         _loc1_.data.userName = playerName;
         var _loc2_:Date = new Date();
         var _loc3_:String = "[" + (_loc2_.getMonth() + 1) + "/" + _loc2_.getDate() + "/" + _loc2_.getHours() + ":" + _loc2_.getMinutes() + "]";
         _loc1_.data.time = _loc3_;
         var _loc4_:String = "";
         _loc4_ = _loc4_ + "@BASIC:";
         var _loc5_:Array = ["lv","age","ap","xp","gold","apCost","caculate","BAGMAX","PETMAX"];
         _loc6_ = 0;
         while(_loc6_ < _loc5_.length)
         {
            _loc4_ += _loc5_[_loc6_] + "," + Player[_loc5_[_loc6_]] + ",";
            _loc6_++;
         }
         _loc4_ += "@RACE:";
         _loc4_ = _loc4_ + race.name;
         _loc5_ = ["head","body","feet","necklace","ring","leftHand","rightHand"];
         _loc4_ += "@EQUIP:";
         _loc6_ = 0;
         while(_loc6_ < _loc5_.length)
         {
            if(Player[_loc5_[_loc6_]])
            {
               _loc4_ += _loc5_[_loc6_] + "," + (Player[_loc5_[_loc6_]] as Equipment).save() + ",";
            }
            _loc6_++;
         }
         _loc4_ += "@ITEM:";
         _loc6_ = 0;
         while(_loc6_ < itemList.length)
         {
            _loc4_ += itemList[_loc6_].save() + ",";
            _loc6_++;
         }
         _loc4_ += "@SKILL:";
         _loc6_ = 0;
         while(_loc6_ < skillList.length)
         {
            _loc4_ += skillList[_loc6_].save() + ",";
            _loc6_++;
         }
         _loc4_ += "@TITLE:";
         _loc6_ = 0;
         while(_loc6_ < TitleList.list.length)
         {
            _loc4_ += TitleList.list[_loc6_].save() + ",";
            _loc6_++;
         }
         _loc4_ += "@OTHER:";
         _loc5_ = ["hp","mp","luck","intelligence","str","dex","will"];
         _loc6_ = 0;
         while(_loc6_ < _loc5_.length)
         {
            _loc4_ += _loc5_[_loc6_] + "," + basicStatus[_loc5_[_loc6_]] + ",";
            _loc6_++;
         }
         _loc4_ += "@GLOBAL:";
         _loc5_ = ["battle","battleIntro","money","exp","item","item0","item1","item2","item3","item4","sword","axe","bow","crossbow","sceptre","staff","dagger","tome","shield","head_light","head_medium","head_heavy","body_light","body_medium","body_heavy","feet_light","feet_medium","feet_heavy","ring","necklace","sound"];
         _loc4_ += "toggle,";
         _loc6_ = 0;
         while(_loc6_ < _loc5_.length)
         {
            _loc4_ += _loc5_[_loc6_] + "#" + Global[_loc5_[_loc6_] + "_toggle"] + "#";
            _loc6_++;
         }
         _loc4_ += "@SELECTION:";
         _loc4_ = _loc4_ + ("map," + Global.map.mapData.name + "#");
         if(title)
         {
            _loc4_ += "title," + title.name;
         }
         _loc4_ += "@PET:";
         _loc6_ = 0;
         while(_loc6_ < petList.length)
         {
            _loc4_ += petList[_loc6_].save() + ",";
            _loc6_++;
         }
         _loc4_ += "@EQUIPEDPET:";
         if(pet)
         {
            _loc4_ += pet.save();
         }
         var _loc7_:ByteArray = new ByteArray();
         _loc7_.writeUTFBytes(_loc4_);
         _loc7_.compress();
         _loc1_.data.info = Base64.Encode(_loc7_);
         _loc1_.flush();
      }
      
      public static function load() : *
      {
         var _loc6_:Array = null;
         var _loc7_:Array = null;
         var _loc8_:Array = null;
         var _loc9_:Array = null;
         var _loc10_:Array = null;
         var _loc11_:Array = null;
         var _loc12_:Array = null;
         var _loc13_:Array = null;
         var _loc14_:Array = null;
         var _loc15_:Array = null;
         var _loc16_:int = 0;
         var _loc17_:Array = null;
         var _loc18_:Array = null;
         var _loc19_:int = 0;
         var _loc1_:SharedObject = SharedObject.getLocal(SaveScene.slot);
         playerName = _loc1_.data.userName;
         var _loc2_:ByteArray = Base64.Decode(_loc1_.data.info);
         _loc2_.uncompress();
         var _loc3_:String = _loc2_.toString();
         var _loc4_:Array = _loc3_.split("@");
         var _loc5_:int = 0;
         while(_loc5_ < _loc4_.length)
         {
            _loc6_ = (_loc4_[_loc5_] as String).split(":");
            switch(_loc6_[0])
            {
               case "BASIC":
                  _loc7_ = (_loc6_[1] as String).split(",");
                  _loc16_ = 0;
                  while(_loc16_ < _loc7_.length)
                  {
                     if(_loc7_[_loc16_] != "")
                     {
                        Player[_loc7_[_loc16_]] = _loc7_[_loc16_ + 1];
                     }
                     _loc16_ += 2;
                  }
                  break;
               case "RACE":
                  _loc16_ = 0;
                  while(_loc16_ < RaceList.list.length)
                  {
                     if(_loc6_[1] == "undeath")
                     {
                        Player.race = RaceList.UNDEATH;
                        break;
                     }
                     if(_loc6_[1] == RaceList.list[_loc16_].name)
                     {
                        Player.race = RaceList.list[_loc16_];
                        break;
                     }
                     _loc16_++;
                  }
                  break;
               case "EQUIP":
                  _loc8_ = (_loc6_[1] as String).split(",");
                  _loc16_ = 0;
                  while(_loc16_ < _loc8_.length)
                  {
                     if(_loc8_[_loc16_] != "")
                     {
                        Player[_loc8_[_loc16_]] = Equipment.load(_loc8_[_loc16_ + 1]);
                     }
                     _loc16_ += 2;
                  }
                  break;
               case "ITEM":
                  _loc9_ = (_loc6_[1] as String).split(",");
                  _loc16_ = 0;
                  while(_loc16_ < _loc9_.length)
                  {
                     if(_loc9_[_loc16_] != "")
                     {
                        itemList.push(Equipment.load(_loc9_[_loc16_]));
                     }
                     _loc16_++;
                  }
                  break;
               case "SKILL":
                  _loc10_ = (_loc6_[1] as String).split(",");
                  _loc16_ = 0;
                  while(_loc16_ < _loc10_.length)
                  {
                     if(_loc10_[_loc16_] != "")
                     {
                        skillList.push(Skill.load(_loc10_[_loc16_]));
                     }
                     _loc16_++;
                  }
                  break;
               case "TITLE":
                  _loc11_ = (_loc6_[1] as String).split(",");
                  _loc16_ = 0;
                  while(_loc16_ < TitleList.list.length)
                  {
                     TitleList.list[_loc16_].load(_loc11_[_loc16_]);
                     _loc16_++;
                  }
                  break;
               case "OTHER":
                  _loc12_ = (_loc6_[1] as String).split(",");
                  basicStatus = new BasicStatus(0,0,0,0,0,0,0);
                  _loc16_ = 0;
                  while(_loc16_ < _loc12_.length)
                  {
                     if(_loc12_[_loc16_] != "")
                     {
                        basicStatus[_loc12_[_loc16_]] = _loc12_[_loc16_ + 1];
                     }
                     _loc16_ += 2;
                  }
                  break;
               case "GLOBAL":
                  _loc13_ = (_loc6_[1] as String).split(",");
                  switch(_loc13_[0])
                  {
                     case "toggle":
                        _loc17_ = (_loc13_[1] as String).split("#");
                        _loc16_ = 0;
                        while(_loc16_ < _loc17_.length)
                        {
                           if(_loc17_[_loc16_] != "")
                           {
                              if(_loc17_[_loc16_ + 1] == "true")
                              {
                                 Global[_loc17_[_loc16_] + "_toggle"] = true;
                              }
                              else
                              {
                                 Global[_loc17_[_loc16_] + "_toggle"] = false;
                              }
                           }
                           _loc16_ += 2;
                        }
                  }
                  break;
               case "SELECTION":
                  _loc14_ = (_loc6_[1] as String).split("#");
                  _loc16_ = 0;
                  while(_loc16_ < _loc14_.length)
                  {
                     _loc18_ = (_loc14_[_loc16_] as String).split(",");
                     switch(_loc18_[0])
                     {
                        case "map":
                           _loc19_ = 0;
                           while(_loc19_ < MapList.list.length)
                           {
                              if(_loc18_[1] == MapList.list[_loc19_].name)
                              {
                                 Global.map = new Map(MapList.list[_loc19_]);
                              }
                              _loc19_++;
                           }
                           break;
                        case "title":
                           _loc19_ = 0;
                           while(_loc19_ < TitleList.list.length)
                           {
                              if(_loc18_[1] == TitleList.list[_loc19_].name)
                              {
                                 title = TitleList.list[_loc19_];
                              }
                              _loc19_++;
                           }
                     }
                     _loc16_++;
                  }
                  break;
               case "PET":
                  _loc15_ = (_loc6_[1] as String).split(",");
                  _loc16_ = 0;
                  while(_loc16_ < _loc15_.length)
                  {
                     if(_loc15_[_loc16_] != "")
                     {
                        petList.push(Pet.load(_loc15_[_loc16_]));
                     }
                     _loc16_++;
                  }
                  break;
               case "EQUIPEDPET":
                  if(_loc6_[1] != "")
                  {
                     pet = Pet.load(_loc6_[1]);
                  }
            }
            _loc5_++;
         }
         if(!basicStatus)
         {
            caculateInitStat();
         }
         updateAllInfo();
         updateXpBar();
      }
   }
}

