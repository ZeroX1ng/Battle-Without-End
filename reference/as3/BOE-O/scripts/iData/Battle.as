package iData
{
   import flash.events.Event;
   import flash.events.TimerEvent;
   import flash.utils.Timer;
   import iData.iMonster.Boss;
   import iData.iMonster.Monster;
   import iData.iPet.Pet;
   import iData.iPet.iPetSkill.PetSkill;
   import iData.iPet.iPetSkill.PetSkillList;
   import iData.iPlayer.TitleList;
   import iData.iSkill.ActiveSkill;
   import iData.iSkill.ActiveSkillData;
   import iData.iSkill.iBuff.Buff;
   import iGlobal.Global;
   import iGlobal.Player;
   import iPanel.iScene.MainScene;
   
   public class Battle
   {
      
      public var turn:int = 1;
      
      public var playerHp:int;
      
      public var playerMp:int;
      
      public var monster:Monster;
      
      public var monsterHp:int;
      
      public var petHp:int;
      
      public var petMp:int;
      
      public var pet:Pet;
      
      public var boss:Boss;
      
      public var timer:Timer;
      
      public const CR:int = 50;
      
      public function Battle()
      {
         super();
         this.timer = new Timer(500);
         this.timer.addEventListener(TimerEvent.TIMER,this.run);
         this.timer.start();
      }
      
      public function init() : void
      {
         var _loc1_:Monster = null;
         if(!this.boss)
         {
            this.boss = Global.map.getBoss();
         }
         if(Math.random() < 0.05)
         {
            this.monster = this.boss;
            this.monsterHp = this.boss.hpleft;
         }
         else
         {
            _loc1_ = new Monster(Global.map.mapData.monsterList[Math.random() * Global.map.mapData.monsterList.length >> 0]);
            this.monster = _loc1_;
            this.monsterHp = this.monster.hp;
         }
         this.playerHp = Player.hp;
         this.playerMp = Player.mp;
         this.pet = Player.pet;
         if(this.pet)
         {
            this.petHp = Player.pet.hp;
            this.petMp = Player.pet.mp;
         }
         MainScene.monsterInfoPanel.update();
         MainScene.petInfoPanel.update();
         if(this.monster.title)
         {
            MainScene.allInfoPanel.addText("你遇到了" + this.monster.nameHtml + " " + this.monster.title.name + "!",Global.battleIntro);
         }
         else
         {
            MainScene.allInfoPanel.addText("你遇到了" + this.monster.nameHtml + "!",Global.battleIntro);
         }
         this.turn = 1;
         if(MainScene.lootPanel)
         {
            MainScene.lootPanel.update();
         }
      }
      
      public function changeTurn() : void
      {
         this.turn *= -1;
         if(this.checkDead())
         {
            this.turn = 1;
         }
      }
      
      private function checkDead() : Boolean
      {
         if(this.playerHp <= 0)
         {
            if(this.monster is Boss)
            {
               this.boss.hpleft = this.monsterHp;
            }
            this.playerDie();
            this.init();
            return true;
         }
         if(this.petHp <= 0)
         {
            this.pet = null;
         }
         if(this.monsterHp <= 0)
         {
            if(this.monster is Boss)
            {
               this.boss = null;
            }
            this.giveTrophy();
            this.init();
            return true;
         }
         return false;
      }
      
      private function playerDie() : *
      {
         MainScene.allInfoPanel.addText("<font color=\'#ff4040\'>你被击败了!</font>",Global.battleIntro);
      }
      
      private function giveTrophy() : *
      {
         MainScene.allInfoPanel.addText(this.monster.nameHtml + "<font color=\'#21c4af\'>被击败了!</font>",Global.battleIntro);
         Player.addExp(this.monster.exp);
         Player.addMoney(this.monster.money);
         this.monster.dropItem();
         this.monster.dropPet();
         if(this.monster.CP / Player.combatPower > 3)
         {
            TitleList.updateTitleInfo("kill",0,1);
         }
         if(this.pet)
         {
            this.pet.addExp(this.monster.exp);
         }
      }
      
      public function run(param1:Event = null) : void
      {
         if(this.monster)
         {
            this.fight();
         }
         ++Player.caculate;
         if(Player.caculate > 2400)
         {
            Player.ageup();
         }
         if(Player.caculate % 60 == 0)
         {
            Player.save();
         }
         if(Global.shopPanel)
         {
            Global.shopPanel.updateTime();
            if(Player.caculate % 600 == 0)
            {
               Global.shopPanel.updateShop();
            }
         }
      }
      
      private function fight() : *
      {
         if(this.turn > 0)
         {
            this.playerTurn();
            this.petTurn();
         }
         else
         {
            this.monsterTurn();
         }
         MainScene.playerInfoPanel.upDateHpAndMp();
         MainScene.monsterInfoPanel.updateHp();
         MainScene.petInfoPanel.updateHp();
         this.changeTurn();
      }
      
      private function playerTurn() : *
      {
         var _loc3_:int = 0;
         var _loc4_:ActiveSkill = null;
         var _loc1_:Boolean = false;
         var _loc2_:int = int(Player.attackSkillList.length);
         if(_loc2_ > 0)
         {
            _loc3_ = Player.spellChance + 20 + _loc2_ * 5;
            if(_loc3_ > 95)
            {
               _loc3_ = 95;
            }
            if(Math.random() * 100 < _loc3_)
            {
               _loc4_ = Player.attackSkillList[Math.random() * _loc2_ >> 0];
               if((_loc4_.skillData as ActiveSkillData).behaveFunction(_loc4_))
               {
                  _loc1_ = true;
               }
            }
         }
         if(!_loc1_)
         {
            this.playerAttack();
         }
      }
      
      private function petTurn() : *
      {
         var _loc3_:int = 0;
         var _loc4_:PetSkill = null;
         if(!this.pet || this.petHp <= 0)
         {
            return;
         }
         var _loc1_:Boolean = false;
         var _loc2_:Vector.<PetSkill> = this.pet.getAttackSkill();
         if(_loc2_.length > 0)
         {
            if(Math.random() * 100 < 50)
            {
               _loc3_ = Math.random() * _loc2_.length >> 0;
               if(_loc2_[_loc3_].skillData.behaveFunction(_loc2_[_loc3_]))
               {
                  _loc1_ = true;
               }
            }
         }
         if(!_loc1_)
         {
            _loc4_ = this.pet.getSkill(PetSkillList.double_hit);
            if(_loc4_)
            {
               this.petAttack();
               if(Math.random() * 100 < _loc4_.getSetArray()[0])
               {
                  this.petAttack();
               }
            }
            else
            {
               this.petAttack();
            }
         }
         this.petEndTurn();
      }
      
      private function petEndTurn() : *
      {
         var _loc1_:PetSkill = this.pet.getSkill(PetSkillList.meditation);
         if(_loc1_)
         {
            this.playerMp += _loc1_.getSetArray()[0] * this.pet.level;
            if(this.playerMp > Player.mp)
            {
               this.playerMp = Player.mp;
            }
            this.petMp += _loc1_.getSetArray()[0] * this.pet.level;
            if(this.petMp > this.pet.mp)
            {
               this.petMp = this.pet.mp;
            }
            MainScene.allInfoPanel.addText("你的宠物恢复了你和他自身的<font color=\'#4a60d7\' size=\'16\'>" + (_loc1_.getSetArray()[0] * this.pet.level >> 0) + "</font>Mp",Global.battle);
         }
         _loc1_ = this.pet.getSkill(PetSkillList.heal);
         if(_loc1_)
         {
            this.playerHp += _loc1_.getSetArray()[0] * this.pet.level;
            if(this.playerHp > Player.hp)
            {
               this.playerHp = Player.hp;
            }
            this.petHp += _loc1_.getSetArray()[0] * this.pet.level;
            if(this.petHp > this.pet.hp)
            {
               this.petHp = this.pet.hp;
            }
            MainScene.allInfoPanel.addText("你的宠物恢复了你和他自身的<font color=\'#7AEE3C\' size=\'16\'>" + (_loc1_.getSetArray()[0] * this.pet.level >> 0) + "</font>Hp",Global.battle);
         }
      }
      
      private function monsterTurn() : *
      {
         var _loc2_:PetSkill = null;
         this.monster.runBuff();
         var _loc1_:Buff = this.monster.isContainBuff("frozen");
         if(_loc1_ == null && this.monsterHp > 0)
         {
            if(this.pet)
            {
               _loc2_ = this.pet.getSkill(PetSkillList.taunt);
               if(_loc2_)
               {
                  this.monsterAttackPet();
               }
               else if(Math.random() < 0.5)
               {
                  this.monsterAttackPlayer();
               }
               else
               {
                  this.monsterAttackPet();
               }
            }
            else
            {
               this.monsterAttackPlayer();
            }
         }
      }
      
      private function monsterAttackPlayer() : *
      {
         var _loc3_:int = 0;
         var _loc4_:ActiveSkill = null;
         var _loc1_:Boolean = false;
         var _loc2_:int = int(Player.defenceSkillList.length);
         if(_loc2_ > 0)
         {
            _loc3_ = Player.spellChance + _loc2_ * 20;
            if(_loc3_ > 95)
            {
               _loc3_ = 95;
            }
            if(Math.random() * 100 < _loc3_)
            {
               _loc4_ = Player.defenceSkillList[Math.random() * _loc2_ >> 0];
               if((_loc4_.skillData as ActiveSkillData).behaveFunction(_loc4_))
               {
                  _loc1_ = true;
               }
            }
         }
         if(!_loc1_)
         {
            this.monsterAttack();
         }
      }
      
      private function monsterAttackPet() : *
      {
         var _loc1_:int = 0;
         var _loc2_:Number = NaN;
         var _loc3_:int = 0;
         _loc1_ = this.monster.crit - this.pet.pro * 2;
         if(_loc1_ > this.CR)
         {
            _loc1_ = this.CR;
         }
         _loc2_ = 1;
         if(Math.random() * 100 < _loc1_)
         {
            _loc2_ = this.monster.crit_mul / 100;
         }
         _loc3_ = (this.monster.attack * _loc2_ - this.pet.defence) * (1 - this.caculateProtection(this.pet.pro));
         if(_loc3_ < 1)
         {
            _loc3_ = 1;
         }
         var _loc4_:PetSkill = this.pet.getSkill(PetSkillList.dodge);
         if(_loc4_)
         {
            if(Math.random() * 100 < _loc4_.getSetArray()[0])
            {
               MainScene.allInfoPanel.addText("你的宠物回避了" + this.monster.nameHtml + "的攻击!",Global.battle);
               return;
            }
         }
         this.petHp -= _loc3_;
         if(_loc2_ > 1)
         {
            MainScene.allInfoPanel.addText(this.monster.nameHtml + "对你的宠物造成了<font color=\'#ff4040\' size=\'20\'>" + _loc3_ + "!</font>伤害",Global.battle);
         }
         else
         {
            MainScene.allInfoPanel.addText(this.monster.nameHtml + "对你的宠物造成了<font color=\'#ff4040\'>" + _loc3_ + "</font>伤害",Global.battle);
         }
         _loc4_ = this.pet.getSkill(PetSkillList.injury_resile);
         if(_loc4_)
         {
            if(Math.random() * 100 < _loc4_.getSetArray()[0])
            {
               this.monsterHp -= _loc3_ * _loc4_.getSetArray()[1] / 100;
               MainScene.allInfoPanel.addText("你的宠物反弹了<font color=\'#ff4040\'>" + _loc3_ + "</font>伤害给" + this.monster.nameHtml,Global.battle);
            }
         }
         _loc4_ = this.pet.getSkill(PetSkillList.counterattack);
         if(_loc4_)
         {
            if(Math.random() * 100 < _loc4_.getSetArray()[0])
            {
               _loc1_ = this.pet.cri - this.monster.protection * 2;
               if(_loc1_ > this.CR)
               {
                  _loc1_ = this.CR;
               }
               _loc2_ = 1;
               if(Math.random() * 100 < _loc1_)
               {
                  _loc2_ = this.pet.crimul / 100;
               }
               _loc3_ = (this.pet.attack * _loc2_ - this.monster.defence) * (1 - this.caculateProtection(this.monster.protection));
               _loc3_ *= _loc4_.getSetArray()[1] / 100;
               if(_loc3_ < 1)
               {
                  _loc3_ = 1;
               }
               this.monsterHp -= _loc3_;
               MainScene.allInfoPanel.addText("你的宠物成功反击了<font color=\'#ff4040\'>" + _loc3_ + "</font>伤害给" + this.monster.nameHtml,Global.battle);
            }
         }
      }
      
      private function caculateProtection(param1:int) : Number
      {
         if(param1 >= 0)
         {
            return 0.06 * param1 / (1 + 0.06 * param1);
         }
         if(param1 < -100)
         {
            return -1;
         }
         return -(1 - Math.pow(0.94,-param1));
      }
      
      private function petAttack() : void
      {
         var _loc1_:int = this.pet.cri - this.monster.protection * 2;
         if(_loc1_ > this.CR)
         {
            _loc1_ = this.CR;
         }
         var _loc2_:Number = 1;
         if(Math.random() * 100 < _loc1_)
         {
            _loc2_ = this.pet.crimul / 100;
         }
         var _loc3_:int = (this.pet.attack * _loc2_ - this.monster.defence) * (1 - this.caculateProtection(this.monster.protection));
         if(_loc3_ < 1)
         {
            _loc3_ = 1;
         }
         var _loc4_:PetSkill = this.pet.getSkill(PetSkillList.good_or_evil);
         if(_loc4_)
         {
            if(Math.random() * 100 >= _loc4_.getSetArray()[0])
            {
               this.monsterHp += _loc3_;
               if(this.monsterHp > this.monster.hp)
               {
                  this.monsterHp = this.monster.hp;
               }
               MainScene.allInfoPanel.addText("你的宠物给" + this.monster.nameHtml + "回复了<font color=\'#7AEE3C\' size=\'16\'>" + _loc3_ + "</font> hp",Global.battle);
               return;
            }
            _loc2_ *= 2;
         }
         this.monsterHp -= _loc3_;
         if(_loc2_ > 1)
         {
            MainScene.allInfoPanel.addText("你的宠物对" + this.monster.nameHtml + "造成了<font color=\'#ff4040\' size=\'20\'>" + _loc3_ + "!</font> 伤害",Global.battle);
         }
         else
         {
            MainScene.allInfoPanel.addText("你的宠物对" + this.monster.nameHtml + "造成了<font color=\'#ff4040\'>" + _loc3_ + "</font> 伤害" + this.monster.nameHtml,Global.battle);
         }
         _loc4_ = this.pet.getSkill(PetSkillList.life_drain);
         if(_loc4_)
         {
            this.petHp += _loc3_ * _loc4_.getSetArray()[0] / 100;
            MainScene.allInfoPanel.addText("你的宠物恢复了<font color=\'#7AEE3C\' size=\'16\'>" + _loc3_ + "</font> hp",Global.battle);
         }
      }
      
      private function monsterAttack() : void
      {
         var _loc1_:int = this.monster.crit - Player.protection * 2;
         if(_loc1_ > this.CR)
         {
            _loc1_ = this.CR;
         }
         var _loc2_:Number = 1;
         if(Math.random() * 100 < _loc1_)
         {
            _loc2_ = this.monster.crit_mul / 100;
         }
         var _loc3_:int = (this.monster.attack * _loc2_ - Player.defence) * (1 - this.caculateProtection(Player.protection));
         if(_loc3_ < 1)
         {
            _loc3_ = 1;
         }
         this.playerHp -= _loc3_;
         if(_loc2_ > 1)
         {
            MainScene.allInfoPanel.addText(this.monster.nameHtml + "对你造成了<font color=\'#ff4040\' size=\'20\'>" + _loc3_ + "!</font>伤害",Global.battle);
         }
         else
         {
            MainScene.allInfoPanel.addText(this.monster.nameHtml + "对你造成了<font color=\'#ff4040\'>" + _loc3_ + "</font>伤害",Global.battle);
         }
         TitleList.updateTitleInfo("endure",_loc3_);
      }
      
      private function playerAttack() : void
      {
         var _loc1_:int = Player.crit - (this.monster.protection - Player.protectionReduce) * 2;
         if(_loc1_ > this.CR)
         {
            _loc1_ = this.CR;
         }
         var _loc2_:Number = 1;
         if(Math.random() * 100 < _loc1_)
         {
            _loc2_ = Player.crit_mul / 100;
         }
         var _loc3_:int = (Player.attack * _loc2_ - this.monster.defence) * (1 - this.caculateProtection(this.monster.protection - Player.protectionReduce - Player.protectionIgnore));
         if(_loc3_ < 1)
         {
            _loc3_ = 1;
         }
         this.monsterHp -= _loc3_;
         if(_loc2_ > 1)
         {
            MainScene.allInfoPanel.addText("你对" + this.monster.nameHtml + "造成了<font color=\'#ff4040\' size=\'20\'>" + _loc3_ + "!</font>伤害" + this.monster.nameHtml,Global.battle);
            TitleList.updateTitleInfo("crit",0,1);
         }
         else
         {
            MainScene.allInfoPanel.addText("你对" + this.monster.nameHtml + "造成了<font color=\'#ff4040\'>" + _loc3_ + "</font>伤害",Global.battle);
            TitleList.updateTitleInfo("crit",0,-1);
         }
         TitleList.updateTitleInfo("damage",_loc3_,_loc3_);
      }
   }
}

