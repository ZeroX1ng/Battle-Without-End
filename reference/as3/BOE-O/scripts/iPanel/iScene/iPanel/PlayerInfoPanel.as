package iPanel.iScene.iPanel
{
   import iData.Race;
   import iGlobal.Player;
   import iPanel.iBar.Bar;
   import iPanel.iCell.BasicCell;
   import iPanel.iCell.StringCell;
   import iPanel.iCell.StringInfoCell;
   import iPanel.iScene.MainScene;
   
   public class PlayerInfoPanel extends BasicCell
   {
      
      private const beginX:int = 10;
      
      private const beginY:int = 10;
      
      private const sXGap:int = 40;
      
      private const bXGap:int = 120;
      
      private const yGap:int = 25;
      
      private var _name:StringCell;
      
      private var race:StringCell;
      
      private var age:StringInfoCell;
      
      private var lv:StringCell;
      
      private var hp:Bar;
      
      private var mp:Bar;
      
      private var exp:Bar;
      
      private var gold:StringCell;
      
      private var str:StringCell;
      
      private var dex:StringCell;
      
      private var intelligence:StringCell;
      
      private var will:StringCell;
      
      private var luck:StringCell;
      
      private var ap:StringCell;
      
      private var attack:StringCell;
      
      private var balance:StringCell;
      
      private var crit:StringCell;
      
      private var defence:StringCell;
      
      private var protection:StringInfoCell;
      
      private var pro_ignore:StringCell;
      
      private var crit_mul:StringCell;
      
      private var cp:StringCell;
      
      public function PlayerInfoPanel()
      {
         super(385,220);
         this.setPosition();
         this.upDate();
      }
      
      private function setPosition() : *
      {
         var _loc1_:StringCell = new StringCell("名字");
         this.addChild(_loc1_);
         _loc1_.x = this.beginX;
         _loc1_.y = this.beginY;
         this._name = new StringCell("Jason",200);
         this.addChild(this._name);
         this._name.x = this.beginX + this.sXGap;
         this._name.y = this.beginY;
         var _loc2_:Array = new Array();
         var _loc3_:StringCell = new StringCell("种族");
         _loc2_.push(_loc3_);
         this.race = new StringCell(Player.race.name.toUpperCase());
         _loc2_.push(this.race);
         var _loc4_:StringCell = new StringCell("年龄");
         _loc2_.push(_loc4_);
         this.age = new StringInfoCell("17","还剩:");
         _loc2_.push(this.age);
         var _loc5_:StringCell = new StringCell("LV");
         _loc2_.push(_loc5_);
         this.lv = new StringCell("20");
         _loc2_.push(this.lv);
         _loc2_.push(new StringCell("HP"));
         _loc2_.push(this.hp = new Bar(80,100,12522257));
         _loc2_.push(new StringCell("MP"));
         _loc2_.push(this.mp = new Bar(80,100,424351));
         _loc2_.push(new StringCell("EXP"));
         _loc2_.push(this.exp = new Bar(80,100,7932074));
         _loc2_.push(new StringCell("金钱"));
         _loc2_.push(this.gold = new StringCell("23424"));
         _loc2_.push(new StringInfoCell("力量","增加基础攻击力"));
         _loc2_.push(this.str = new StringCell("13"));
         _loc2_.push(new StringInfoCell("敏捷","影响平衡，增加使用远程武器时候的攻击力"));
         _loc2_.push(this.dex = new StringCell("14"));
         _loc2_.push(new StringInfoCell("智力","增加魔法伤害和技能释放率"));
         _loc2_.push(this.intelligence = new StringCell("123"));
         _loc2_.push(new StringInfoCell("意志","影响暴击"));
         _loc2_.push(this.will = new StringCell("213"));
         _loc2_.push(new StringInfoCell("幸运","影响暴击和...？"));
         _loc2_.push(this.luck = new StringCell("12"));
         _loc2_.push(new StringInfoCell("AP","技能点，提升技能"));
         _loc2_.push(this.ap = new StringCell("23"));
         _loc2_.push(new StringInfoCell("战斗力","显示了你当前的基础战斗力，不包括装备的加成 "));
         _loc2_.push(this.cp = new StringCell("100"));
         _loc2_.push(new StringInfoCell("攻击","物理输出"));
         _loc2_.push(this.attack = new StringCell("12~23"));
         _loc2_.push(new StringInfoCell("平衡","影响伤害的平衡，值越大，输出接近最大值的可能性越大"));
         _loc2_.push(this.balance = new StringCell("100"));
         _loc2_.push(new StringInfoCell("暴击","暴击概率，可被对方护甲减少"));
         _loc2_.push(this.crit = new StringCell("50%"));
         _loc2_.push(new StringInfoCell("暴击倍数","暴击倍数，影响暴击时造成输出的倍数"));
         _loc2_.push(this.crit_mul = new StringCell("100%"));
         _loc2_.push(new StringInfoCell("防御","防御，直接抵消伤害"));
         _loc2_.push(this.defence = new StringCell("100"));
         _loc2_.push(new StringInfoCell("护甲","护甲，按百分比抵消伤害，抵消多少百分比鼠标移到到护甲数值上有写"));
         _loc2_.push(this.protection = new StringInfoCell("100","50%"));
         _loc2_.push(new StringInfoCell("无视护甲","无视敌方护甲的数值"));
         _loc2_.push(this.pro_ignore = new StringCell("0"));
         var _loc6_:int = int(_loc2_.length);
         var _loc7_:int = 0;
         while(_loc7_ < _loc6_)
         {
            this.addChild(_loc2_[_loc7_]);
            _loc2_[_loc7_].x = this.beginX + this.sXGap * (_loc7_ % 2) + this.bXGap * (_loc7_ / 14 >> 0);
            _loc2_[_loc7_].y = this.beginY + this.yGap + this.yGap * (_loc7_ % 14 / 2 >> 0);
            _loc7_++;
         }
         this.hp.x = this.beginX + 30;
         this.hp.y += 13;
         this.mp.x = this.beginX + 30;
         this.mp.y += 13;
         this.exp.x = this.beginX + 30;
         this.exp.y += 13;
         this.crit_mul.x += 30;
         this.pro_ignore.x += 30;
         this.cp.x += 10;
      }
      
      public function upDate() : *
      {
         if(Player.title)
         {
            this._name.setText(Player.title.realName + "" + Player.playerName);
         }
         else
         {
            this._name.setText(Player.playerName);
         }
         this.race.setText(Player.race.name.toUpperCase());
         this.age.setText(Player.age + "");
         var _loc1_:String = "";
         var _loc2_:Race = Player.race;
         var _loc3_:int = Player.age;
         var _loc4_:int = 17 - _loc3_;
         if(_loc4_ < 1 && _loc3_ <= 25)
         {
            _loc4_ = 1;
         }
         if(_loc3_ < 25)
         {
            _loc1_ += "Hp   +" + (_loc2_.ageupList[_loc3_ - 10].hp + 1) + "<br/>";
            _loc1_ += "Mp   +" + (_loc2_.ageupList[_loc3_ - 10].mp + 1) + "<br/>";
            _loc1_ += "力量 +" + _loc2_.ageupList[_loc3_ - 10].str + "<br/>";
            _loc1_ += "敏捷 +" + _loc2_.ageupList[_loc3_ - 10].dex + "<br/>";
            _loc1_ += "意志 +" + _loc2_.ageupList[_loc3_ - 10].will + "<br/>";
            _loc1_ += "智力 +" + _loc2_.ageupList[_loc3_ - 10].intelligence + "<br/>";
            _loc1_ += "幸运 +" + _loc2_.ageupList[_loc3_ - 10].luck + "<br/>";
            _loc1_ += "AP   +" + _loc4_ + "<br/>";
         }
         else
         {
            _loc1_ += "Hp   +" + 1 + "<br/>";
            _loc1_ += "Mp   +" + 1 + "<br/>";
            _loc1_ += "力量 +" + 0 + "<br/>";
            _loc1_ += "敏捷 +" + 0 + "<br/>";
            _loc1_ += "意志 +" + 0 + "<br/>";
            _loc1_ += "智力 +" + 0 + "<br/>";
            _loc1_ += "幸运 +" + 0 + "<br/>";
            _loc1_ += "AP   +" + 0 + "<br/>";
         }
         this.age.setInfo("年龄增长时:<br/>" + _loc1_ + "长大还剩:" + this.timeToGrowup());
         this.lv.setText(Player.lv + "");
         if(Player.str < Player.basicStr)
         {
            this.str.setText(this.redText(Player.str + "") + "<font size=\'12\'>(" + Player.basicStr + ")</font>");
         }
         else
         {
            this.str.setText(this.greenText(Player.str + "") + "<font size=\'12\'>(" + Player.basicStr + ")</font>");
         }
         if(Player.dex < Player.basicDex)
         {
            this.dex.setText(this.redText(Player.dex + "") + "<font size=\'12\'>(" + Player.basicDex + ")</font>");
         }
         else
         {
            this.dex.setText(this.greenText(Player.dex + "") + "<font size=\'12\'>(" + Player.basicDex + ")</font>");
         }
         if(Player.intelligence < Player.basicInt)
         {
            this.intelligence.setText(this.redText(Player.intelligence + "") + "<font size=\'12\'>(" + Player.basicInt + ")</font>");
         }
         else
         {
            this.intelligence.setText(this.greenText(Player.intelligence + "") + "<font size=\'12\'>(" + Player.basicInt + ")</font>");
         }
         if(Player.will < Player.basicWill)
         {
            this.will.setText(this.redText(Player.will + "") + "<font size=\'12\'>(" + Player.basicWill + ")</font>");
         }
         else
         {
            this.will.setText(this.greenText(Player.will + "") + "<font size=\'12\'>(" + Player.basicWill + ")</font>");
         }
         if(Player.luck < Player.basicLuck)
         {
            this.luck.setText(this.redText(Player.luck + "") + "<font size=\'12\'>(" + Player.basicLuck + ")</font>");
         }
         else
         {
            this.luck.setText(this.greenText(Player.luck + "") + "<font size=\'12\'>(" + Player.basicLuck + ")</font>");
         }
         if(Player.attMin > Player.attMax)
         {
            this.attack.setText(Player.attMax + "~" + Player.attMin + "");
         }
         else
         {
            this.attack.setText(Player.attMin + "~" + Player.attMax + "");
         }
         this.balance.setText(Player.balance + "");
         this.crit.setText(Player.crit + "");
         this.defence.setText(Player.defence + "");
         this.protection.setText(Player.protection + "");
         this.protection.setInfo(this.caculatePro() + "%");
         this.gold.setText(Player.gold + "");
         this.ap.setText(Player.ap + "");
         this.cp.setText((Player.combatPower * 100 >> 0) / 100 + "");
         this.crit_mul.setText(Player.crit_mul + "%");
         this.pro_ignore.setText(Player.protectionIgnore + "");
         this.upDateHpAndMp();
      }
      
      private function greenText(param1:String) : String
      {
         return "<font color=\'#e3b20a\'>" + param1 + "</font>";
      }
      
      private function redText(param1:String) : String
      {
         return "<font color=\'#ff4040\'>" + param1 + "</font>";
      }
      
      private function caculatePro() : int
      {
         return Player.protection * 6 / (Player.protection * 6 + 100) * 100;
      }
      
      public function upDateHpAndMp() : *
      {
         if(MainScene.battle)
         {
            this.hp.Value = MainScene.battle.playerHp;
            this.mp.Value = MainScene.battle.playerMp;
         }
         this.hp.Max = Player.hp;
         this.mp.Max = Player.mp;
      }
      
      public function upDateExp() : *
      {
         this.exp.Value = Player.xp;
         this.exp.Max = Player.getLevelExp();
      }
      
      public function timeToGrowup() : String
      {
         var _loc1_:int = Player.caculate % 2400;
         _loc1_ = 2400 - _loc1_;
         var _loc2_:int = _loc1_ / 120;
         var _loc3_:int = (_loc1_ - _loc2_ * 120) / 2;
         return _loc2_ + ":" + _loc3_;
      }
   }
}

