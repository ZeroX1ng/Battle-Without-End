package iData.iMonster
{
   import iData.iItem.EquipType;
   import iData.iItem.Equipment;
   import iData.iItem.EquipmentData;
   import iData.iItem.EquipmentList;
   import iData.iItem.Stat;
   import iData.iItem.Weapon;
   import iData.iItem.WeaponData;
   import iData.iNumber.DamageNumber;
   import iData.iSkill.iBuff.Buff;
   import iGlobal.Global;
   import iGlobal.Player;
   import iPanel.iScene.MainScene;
   import tool.MyMath;
   
   public class Monster
   {
      
      public var title:MonsterTitle;
      
      public var data:MonsterData;
      
      public var buffList:Vector.<Buff>;
      
      public const RED:String = "#ff4040";
      
      public const BLUE:String = "#4a60d7";
      
      public const YELLOW:String = "#FFA640";
      
      public const GREEN:String = "#4BB814";
      
      public const BROWN:String = "#bf7130";
      
      public const PURPLE:String = "#BC38d3";
      
      public const PINK:String = "#EE6b9c";
      
      public function Monster(param1:MonsterData)
      {
         super();
         this.data = param1.clone();
         this.buffList = new Vector.<Buff>();
         this.generateTitle();
      }
      
      protected function generateTitle() : void
      {
         if(Math.random() > 0.8)
         {
            this.title = MonsterTitleList.list[MonsterTitleList.list.length * Math.random() >> 0];
            this.addTitleStat();
         }
      }
      
      protected function addTitleStat() : void
      {
         var _loc3_:StatMul = null;
         var _loc1_:int = int(this.title.statMulList.length);
         var _loc2_:int = 0;
         while(_loc2_ < _loc1_)
         {
            _loc3_ = this.title.statMulList[_loc2_];
            if(_loc3_.name == Stat.attackMin)
            {
               this.data.attack = new DamageNumber(this.data.attack.min * _loc3_.mul + _loc3_.add,this.data.attack.max);
            }
            else if(_loc3_.name == Stat.attackMax)
            {
               this.data.attack = new DamageNumber(this.data.attack.min,this.data.attack.max * _loc3_.mul + _loc3_.add);
            }
            else if(_loc3_.name == Stat.ATTACK)
            {
               this.data.attack = new DamageNumber(this.data.attack.min * _loc3_.mul + _loc3_.add,this.data.attack.max * _loc3_.mul + _loc3_.add);
            }
            else
            {
               this.data[_loc3_.name] *= _loc3_.mul;
               this.data[_loc3_.name] += _loc3_.add;
            }
            _loc2_++;
         }
      }
      
      public function addBuff(param1:Buff) : *
      {
         var _loc2_:Buff = this.isContainBuff(param1.name);
         if(_loc2_ == null)
         {
            this.buffList.push(param1);
         }
         else
         {
            _loc2_.combine(param1);
         }
         MainScene.monsterInfoPanel.updateBuff();
      }
      
      public function runBuff() : *
      {
         var _loc1_:int = int(this.buffList.length);
         var _loc2_:int = 0;
         while(_loc2_ < _loc1_)
         {
            this.buffList[_loc2_].run();
            _loc2_++;
         }
         this.removeBuff();
      }
      
      public function removeBuff() : *
      {
         var _loc1_:int = int(this.buffList.length);
         var _loc2_:int = 0;
         while(_loc2_ < _loc1_)
         {
            if(this.buffList[_loc2_].isOver())
            {
               this.buffList.splice(_loc2_,1);
               MainScene.monsterInfoPanel.updateBuff();
               return;
            }
            _loc2_++;
         }
      }
      
      public function isContainBuff(param1:String) : Buff
      {
         var _loc2_:int = int(this.buffList.length);
         var _loc3_:int = 0;
         while(_loc3_ < _loc2_)
         {
            if(this.buffList[_loc3_].name == param1)
            {
               return this.buffList[_loc3_];
            }
            _loc3_++;
         }
         return null;
      }
      
      public function get CP() : int
      {
         return this.data.CP;
      }
      
      public function get money() : int
      {
         var _loc1_:Number = (this.CP / Player.combatPower + Global.map.mapData.modifier) * this.CP / 10 * (1 + Player.luck / 300);
         if(this.title)
         {
            _loc1_ *= this.title.goldMul;
         }
         return _loc1_;
      }
      
      public function get exp() : int
      {
         var _loc1_:Number = (this.CP / Player.combatPower + Global.map.mapData.modifier) * this.CP * (1 + Player.luck / 300);
         if(this.title)
         {
            _loc1_ *= this.title.xpMul;
         }
         return _loc1_;
      }
      
      public function get dropRate() : Number
      {
         var _loc1_:Number = (this.CP / Player.combatPower + Global.map.mapData.modifier) * (1 + Player.luck / 300);
         if(this.title)
         {
            _loc1_ *= this.title.dropMul;
         }
         return _loc1_;
      }
      
      public function dropItem() : void
      {
         var _loc1_:EquipmentData = null;
         var _loc2_:Equipment = null;
         var _loc3_:Boolean = false;
         if(Math.random() * 100 < 20 * this.dropRate)
         {
            _loc1_ = EquipmentList.list[EquipmentList.list.length * Math.random() >> 0];
            if(_loc1_ is WeaponData)
            {
               _loc2_ = new Weapon(_loc1_ as WeaponData,this.dropRate);
            }
            else
            {
               _loc2_ = new Equipment(_loc1_,this.dropRate);
            }
            _loc3_ = false;
            if(!Global["item" + _loc2_.quality + "_toggle"])
            {
               _loc3_ = true;
            }
            if(!_loc3_)
            {
               if(_loc2_ is Weapon || _loc2_.type == EquipType.ACCESORY)
               {
                  if(!Global[_loc2_.name + "_toggle"])
                  {
                     _loc3_ = true;
                  }
               }
               else if(!Global[_loc2_.position + "_" + _loc2_.type + "_toggle"])
               {
                  _loc3_ = true;
               }
            }
            if(!_loc3_ && Player.addItem(_loc2_))
            {
               if(MainScene.lootPanel)
               {
                  switch(_loc2_.quality)
                  {
                     case 0:
                        ++MainScene.lootPanel.basic;
                        break;
                     case 1:
                        ++MainScene.lootPanel.magic;
                        break;
                     case 2:
                        ++MainScene.lootPanel.rare;
                        break;
                     case 3:
                        ++MainScene.lootPanel.perfect;
                        break;
                     case 4:
                        ++MainScene.lootPanel.epic;
                        break;
                     case 5:
                        ++MainScene.lootPanel.legendary;
                  }
               }
            }
            else
            {
               _loc3_ = true;
            }
            if(_loc3_)
            {
               Player.addMoney(_loc2_.getMoney());
            }
         }
      }
      
      public function dropPet() : void
      {
      }
      
      public function get nameHtml() : String
      {
         var _loc2_:String = null;
         var _loc3_:String = null;
         var _loc1_:Number = this.CP / Player.combatPower;
         if(_loc1_ < 0.8)
         {
            _loc2_ = this.PINK;
            _loc3_ = "WEAKEST";
         }
         else if(_loc1_ < 1)
         {
            _loc2_ = this.PURPLE;
            _loc3_ = "WEAK";
         }
         else if(_loc1_ < 1.4)
         {
            _loc2_ = this.BROWN;
            _loc3_ = "NORMAL";
         }
         else if(_loc1_ < 2)
         {
            _loc2_ = this.GREEN;
            _loc3_ = "STRONG";
         }
         else if(_loc1_ < 3)
         {
            _loc2_ = this.YELLOW;
            _loc3_ = "AWFUL";
         }
         else
         {
            _loc2_ = this.RED;
            _loc3_ = "BOSS";
         }
         return "<font color=\'" + _loc2_ + "\'>" + this.data.realName + "</font>";
      }
      
      public function get attack() : int
      {
         return this.data.attack.min + (this.data.attack.max - this.data.attack.min) * MyMath.balanceRandom(this.balance);
      }
      
      public function get hp() : int
      {
         return this.data.hp;
      }
      
      public function get balance() : int
      {
         if(this.data.balance > 100)
         {
            this.data.balance = 100;
         }
         if(this.data.balance < 0)
         {
            this.data.balance = 0;
         }
         return this.data.balance;
      }
      
      public function get crit() : int
      {
         return this.data.crit;
      }
      
      public function get crit_mul() : int
      {
         return this.data.crit_mul;
      }
      
      public function get defence() : int
      {
         return this.data.defence;
      }
      
      public function get protection() : int
      {
         var _loc1_:int = this.data.protection;
         var _loc2_:Buff = this.isContainBuff("corrosion");
         if(_loc2_ != null)
         {
            _loc1_ -= _loc2_.count;
         }
         return _loc1_;
      }
   }
}

