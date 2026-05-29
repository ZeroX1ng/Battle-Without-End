package iData.iPet
{
   import iData.iPet.iPetSkill.AttackPetSkillData;
   import iData.iPet.iPetSkill.PetSkill;
   import iData.iPet.iPetSkill.PetSkillData;
   import iData.iPet.iPetSkill.PetSkillList;
   import iGlobal.Global;
   import iGlobal.Player;
   import iPanel.iScene.MainScene;
   import tool.MyMath;
   
   public class Pet
   {
      
      public var type:String;
      
      public var mc_name:String;
      
      public var realName:String;
      
      private var _name:String;
      
      private var _level:int;
      
      private var _exp:int;
      
      public var startStat:PetStats;
      
      public var growStat:PetStats;
      
      public var currentStat:PetStats;
      
      public var skillList:Vector.<PetSkill>;
      
      public function Pet(param1:PetData, param2:Number)
      {
         super();
         this.startStat = PetStats.generatePetStats(param1.type.startMin,param1.type.startRange,param2);
         this.startStat.balance = 30 + Math.random() * 60;
         this.startStat.cri = 10 + Math.random() * 30;
         this.startStat.criMul = 130 + Math.random() * 70;
         this.growStat = PetStats.generatePetStats(param1.type.growMin,param1.type.growRange,param2);
         this.currentStat = new PetStats(0,0,0,0,0,0,0,0,0,0);
         var _loc3_:int = 0;
         while(_loc3_ < PetStats.list.length)
         {
            this.currentStat[PetStats.list[_loc3_]] = this.startStat[PetStats.list[_loc3_]];
            _loc3_++;
         }
         this.generateSkill();
         this.level = 1;
         this._name = param1.name;
         this.type = param1.type.type;
         this.mc_name = param1.mc;
         this.exp = 0;
         this.realName = param1.realName;
      }
      
      public static function load(param1:String) : Pet
      {
         var _loc3_:Pet = null;
         var _loc4_:int = 0;
         var _loc5_:Array = null;
         var _loc2_:Array = param1.split("#");
         _loc4_ = 0;
         while(_loc4_ < PetDataList.list.length)
         {
            if(_loc2_[0] == PetDataList.list[_loc4_].name)
            {
               _loc3_ = new Pet(PetDataList.list[_loc4_],1);
               break;
            }
            _loc4_++;
         }
         _loc3_.exp = _loc2_[2];
         _loc3_.startStat = PetStats.load(_loc2_[3]);
         _loc3_.growStat = PetStats.load(_loc2_[4]);
         _loc3_.skillList = new Vector.<PetSkill>();
         if(_loc2_.length > 5)
         {
            _loc5_ = (_loc2_[5] as String).split("^");
            _loc4_ = 0;
            while(_loc4_ < _loc5_.length)
            {
               if(_loc5_[_loc4_] != "")
               {
                  _loc3_.skillList.push(PetSkill.load(_loc5_[_loc4_]));
               }
               _loc4_++;
            }
         }
         _loc3_.setLevel(_loc2_[1]);
         return _loc3_;
      }
      
      private function generateSkill() : *
      {
         var _loc1_:int = 0;
         var _loc5_:int = 0;
         this.skillList = new Vector.<PetSkill>();
         var _loc2_:Number = Math.random();
         if(_loc2_ < 0.4)
         {
            _loc1_ = 0;
         }
         else if(_loc2_ < 0.6)
         {
            _loc1_ = 1;
         }
         else if(_loc2_ < 0.75)
         {
            _loc1_ = 2;
         }
         else if(_loc2_ < 0.9)
         {
            _loc1_ = 3;
         }
         else
         {
            _loc1_ = 4;
         }
         var _loc3_:int = int(PetSkillList.list.length);
         var _loc4_:int = 0;
         while(_loc4_ < _loc1_)
         {
            do
            {
               _loc5_ = Math.random() * _loc3_;
            }
            while(!this.addSkill(PetSkillList.list[_loc5_]));
            _loc4_++;
         }
      }
      
      private function addSkill(param1:PetSkillData) : Boolean
      {
         if(this.skillList.length >= 4)
         {
            return false;
         }
         var _loc2_:int = 0;
         while(_loc2_ < this.skillList.length)
         {
            if(param1.name == this.skillList[_loc2_].skillData.name)
            {
               return false;
            }
            _loc2_++;
         }
         this.skillList.push(new PetSkill(param1));
         return true;
      }
      
      public function getAttackSkill() : Vector.<PetSkill>
      {
         var _loc1_:Vector.<PetSkill> = new Vector.<PetSkill>();
         var _loc2_:int = 0;
         while(_loc2_ < this.skillList.length)
         {
            if(this.skillList[_loc2_].skillData is AttackPetSkillData)
            {
               _loc1_.push(this.skillList[_loc2_]);
            }
            _loc2_++;
         }
         return _loc1_;
      }
      
      public function addExp(param1:int) : *
      {
         if(this.getLevelExp() < 0)
         {
            return;
         }
         if(this.level - Player.lv > 5)
         {
            return;
         }
         this.exp += param1;
         MainScene.allInfoPanel.addText("你的宠物获得了<font color=\'#4a60d7\'>" + param1 + "</font>经验.",Global.exp);
         if(this.exp > this.getLevelExp())
         {
            this.levelUp();
         }
      }
      
      private function levelUp() : *
      {
         var _loc2_:int = 0;
         var _loc3_:int = 0;
         ++this.level;
         this.exp = 0;
         var _loc1_:int = 0;
         while(_loc1_ < PetStats.list.length)
         {
            this.currentStat[PetStats.list[_loc1_]] += this.growStat[PetStats.list[_loc1_]];
            _loc1_++;
         }
         MainScene.allInfoPanel.addText("<font color=\'#ff4040\'>你的宠物升级了!你的宠物达到了Lv." + this.level + "!</font>");
         if(Math.random() * 100 < 1 - this.level * 0.01)
         {
            _loc2_ = int(PetSkillList.list.length);
            _loc3_ = Math.random() * _loc2_;
            if(this.addSkill(PetSkillList.list[_loc3_]))
            {
               MainScene.allInfoPanel.addText("<font color=\'#ff4040\'>你的宠物学会了" + PetSkillList.list[_loc3_].name + "!</font>");
            }
         }
      }
      
      public function setLevel(param1:int) : *
      {
         if(param1 < 1)
         {
            param1 = 1;
         }
         if(param1 > 100)
         {
            param1 = 100;
         }
         this.level = param1;
         var _loc2_:int = 0;
         while(_loc2_ < PetStats.list.length)
         {
            this.currentStat[PetStats.list[_loc2_]] = this.startStat[PetStats.list[_loc2_]] + this.growStat[PetStats.list[_loc2_]] * (this.level - 1);
            _loc2_++;
         }
      }
      
      public function getLevelExp() : int
      {
         if(this.level > 100)
         {
            return -1;
         }
         return this.level * this.level * ((this.level + 1) * (this.level + 1) - 13 * (this.level + 1) + 82);
      }
      
      public function set level(param1:int) : *
      {
         this._level = MyMath.encryptInt(param1);
         if(MainScene.petInfoPanel)
         {
            MainScene.petInfoPanel.update();
         }
         if(MainScene.otherPanel)
         {
            if(MainScene.otherPanel.equipWindow)
            {
               MainScene.otherPanel.equipWindow.updatePetInfo();
            }
         }
      }
      
      public function get level() : int
      {
         return MyMath.decryptInt(this._level);
      }
      
      public function set exp(param1:int) : *
      {
         this._exp = MyMath.encryptInt(param1);
         if(MainScene.petInfoPanel)
         {
            MainScene.petInfoPanel.updateExp();
         }
      }
      
      public function get exp() : int
      {
         return MyMath.decryptInt(this._exp);
      }
      
      public function get hp() : int
      {
         var _loc1_:int = this.currentStat.hp;
         var _loc2_:PetSkill = this.getSkill(PetSkillList.strong);
         if(_loc2_)
         {
            _loc1_ += _loc2_.getSetArray()[0] * this.level;
         }
         return _loc1_;
      }
      
      public function get mp() : int
      {
         var _loc1_:int = this.currentStat.mp;
         var _loc2_:PetSkill = this.getSkill(PetSkillList.wisdom);
         if(_loc2_)
         {
            _loc1_ += _loc2_.getSetArray()[0] * this.level;
         }
         return _loc1_;
      }
      
      public function get attmin() : int
      {
         var _loc1_:int = this.currentStat.attmin;
         var _loc2_:PetSkill = this.getSkill(PetSkillList.aggressive);
         if(_loc2_)
         {
            _loc1_ += _loc2_.getSetArray()[0] * this.level;
         }
         return _loc1_;
      }
      
      public function get attmax() : int
      {
         var _loc1_:int = this.currentStat.attmax;
         var _loc2_:PetSkill = this.getSkill(PetSkillList.aggressive);
         if(_loc2_)
         {
            _loc1_ += _loc2_.getSetArray()[0] * this.level;
         }
         return _loc1_;
      }
      
      public function get defence() : int
      {
         var _loc1_:int = this.currentStat.def;
         var _loc2_:PetSkill = this.getSkill(PetSkillList.defensive);
         if(_loc2_)
         {
            _loc1_ += _loc2_.getSetArray()[0] * this.level;
         }
         return _loc1_;
      }
      
      public function get pro() : int
      {
         var _loc1_:int = this.currentStat.pro;
         var _loc2_:PetSkill = this.getSkill(PetSkillList.protective);
         if(_loc2_)
         {
            _loc1_ += _loc2_.getSetArray()[0] * this.level;
         }
         return _loc1_;
      }
      
      public function get balance() : int
      {
         var _loc1_:int = this.currentStat.balance;
         if(_loc1_ > 100)
         {
            _loc1_ = 100;
         }
         return _loc1_;
      }
      
      public function get cri() : int
      {
         var _loc1_:int = this.currentStat.cri;
         var _loc2_:PetSkill = this.getSkill(PetSkillList.slayer);
         if(_loc2_)
         {
            _loc1_ += _loc2_.getSetArray()[0];
         }
         return _loc1_;
      }
      
      public function get crimul() : int
      {
         var _loc1_:int = this.currentStat.criMul;
         var _loc2_:PetSkill = this.getSkill(PetSkillList.slayer);
         if(_loc2_)
         {
            _loc1_ *= _loc2_.getSetArray()[1];
         }
         return _loc1_;
      }
      
      public function get magicatt() : int
      {
         var _loc1_:int = 100 + this.currentStat.magAtt;
         var _loc2_:PetSkill = this.getSkill(PetSkillList.wise);
         if(_loc2_)
         {
            _loc1_ += _loc2_.getSetArray()[0] * this.level;
         }
         return _loc1_;
      }
      
      public function get attack() : int
      {
         return this.attmin + (this.attmax - this.attmin) * MyMath.balanceRandom(this.balance);
      }
      
      public function get name() : *
      {
         return this._name;
      }
      
      public function getSkill(param1:PetSkillData) : PetSkill
      {
         var _loc2_:int = 0;
         while(_loc2_ < this.skillList.length)
         {
            if(this.skillList[_loc2_].skillData.name == param1.name)
            {
               return this.skillList[_loc2_];
            }
            _loc2_++;
         }
         return null;
      }
      
      public function save() : String
      {
         var _loc2_:int = 0;
         var _loc1_:String = "";
         _loc1_ += this.name + "#" + this.level + "#" + this.exp;
         _loc1_ += "#" + this.startStat.save();
         _loc1_ += "#" + this.growStat.save();
         if(this.skillList.length > 0)
         {
            _loc1_ += "#";
            _loc2_ = 0;
            while(_loc2_ < this.skillList.length)
            {
               _loc1_ += this.skillList[_loc2_].save() + "^";
               _loc2_++;
            }
         }
         return _loc1_;
      }
   }
}

