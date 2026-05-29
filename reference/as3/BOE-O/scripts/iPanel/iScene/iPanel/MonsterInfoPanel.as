package iPanel.iScene.iPanel
{
   import flash.display.Sprite;
   import flash.utils.getDefinitionByName;
   import iData.iMonster.Boss;
   import iData.iSkill.iBuff.Buff;
   import iGlobal.Player;
   import iPanel.iBar.Bar;
   import iPanel.iCell.BasicCell;
   import iPanel.iCell.StringCell;
   import iPanel.iCell.StringInfoCell;
   import iPanel.iScene.MainScene;
   
   public class MonsterInfoPanel extends BasicCell
   {
      
      private const beginX:int = 10;
      
      private const beginY:int = 10;
      
      private const yGap:int = 50;
      
      private const sXGap:int = 50;
      
      private var _name:StringCell;
      
      private var title:StringInfoCell;
      
      private var hp:Bar;
      
      private var cp:StringCell;
      
      private var buffSprite:Sprite;
      
      private var bossIcon:Sprite;
      
      public const RED:String = "#ff4040";
      
      public const BLUE:String = "#4a60d7";
      
      public const YELLOW:String = "#FFA640";
      
      public const GREEN:String = "#7AEE3C";
      
      public const BROWN:String = "#bf7130";
      
      public const PURPLE:String = "#BC38d3";
      
      public const PINK:String = "#EE6b9c";
      
      public function MonsterInfoPanel()
      {
         super(185,135);
         this.setPosition();
      }
      
      private function setPosition() : *
      {
         var _loc1_:StringCell = new StringCell("怪物");
         this.addChild(_loc1_);
         _loc1_.x = this.beginX;
         _loc1_.y = this.beginY;
         this._name = new StringCell("Boss Red Fox",120,16);
         this.addChild(this._name);
         this._name.x = this.beginX + this.sXGap;
         this._name.y = this.beginY;
         this.bossIcon = new boss_icon();
         this.addChild(this.bossIcon);
         this.bossIcon.x = this.beginX + 30;
         this.bossIcon.y = this.beginY + 22;
         this.bossIcon.width = 15;
         this.bossIcon.height = 15;
         this.title = new StringInfoCell("the Tanker","Default",120);
         this.addChild(this.title);
         this.title.x = this.beginX + this.sXGap;
         this.title.y = this.beginY + 20;
         var _loc2_:StringCell = new StringCell("HP");
         this.addChild(_loc2_);
         _loc2_.x = this.beginX;
         _loc2_.y = this.beginY + this.yGap + 30;
         this.hp = new Bar(100,100,12522257);
         this.addChild(this.hp);
         this.hp.x = this.beginX + 25;
         this.hp.y = this.beginY + this.yGap + 43;
         var _loc3_:StringCell = new StringCell("战斗力");
         this.addChild(_loc3_);
         _loc3_.x = this.beginX;
         _loc3_.y = this.beginY + this.yGap * 2;
         this.cp = new StringCell("100");
         this.addChild(this.cp);
         this.cp.x = this.beginX + this.sXGap;
         this.cp.y = this.beginY + this.yGap * 2;
         this.buffSprite = new Sprite();
      }
      
      public function update() : void
      {
         this.setCpRatioTitleAndName();
         this.setTitle();
         this.cp.setText(MainScene.battle.monster.CP + "");
         this.updateHp();
         this.updateBuff();
         this.updateBoss();
      }
      
      private function updateBoss() : *
      {
         if(MainScene.battle.monster is Boss)
         {
            this.bossIcon.visible = true;
            return;
         }
         this.bossIcon.visible = false;
      }
      
      public function updateHp() : void
      {
         this.hp.Max = MainScene.battle.monster.hp;
         this.hp.Value = MainScene.battle.monsterHp;
      }
      
      private function setCpRatioTitleAndName() : *
      {
         var _loc2_:String = null;
         var _loc3_:String = null;
         var _loc1_:Number = MainScene.battle.monster.CP / Player.combatPower;
         if(_loc1_ < 0.8)
         {
            _loc2_ = this.PINK;
            _loc3_ = "非常弱小的";
         }
         else if(_loc1_ < 1)
         {
            _loc2_ = this.PURPLE;
            _loc3_ = "弱小的";
         }
         else if(_loc1_ < 1.4)
         {
            _loc2_ = this.BROWN;
            _loc3_ = "普通的";
         }
         else if(_loc1_ < 2)
         {
            _loc2_ = this.GREEN;
            _loc3_ = "强大的";
         }
         else if(_loc1_ < 3)
         {
            _loc2_ = this.YELLOW;
            _loc3_ = "厉害的";
         }
         else
         {
            _loc2_ = this.RED;
            _loc3_ = "BOSS";
         }
         var _loc4_:String = "<font color=\'" + _loc2_ + "\'>" + _loc3_ + "</font> " + MainScene.battle.monster.data.realName;
         this._name.setText(_loc4_);
      }
      
      private function setTitle() : *
      {
         if(MainScene.battle.monster.title)
         {
            this.title.setText(MainScene.battle.monster.title.name);
            this.title.setInfo(MainScene.battle.monster.title.description);
            this.title.visible = true;
         }
         else
         {
            this.title.setText("");
            this.title.visible = false;
         }
      }
      
      public function updateBuff() : *
      {
         var _loc3_:Sprite = null;
         if(this.contains(this.buffSprite))
         {
            this.removeChild(this.buffSprite);
         }
         this.buffSprite = new Sprite();
         this.addChild(this.buffSprite);
         this.buffSprite.x = this.beginX;
         this.buffSprite.y = this.beginY + 50;
         var _loc1_:Vector.<Buff> = MainScene.battle.monster.buffList;
         var _loc2_:int = 0;
         while(_loc2_ < _loc1_.length)
         {
            _loc3_ = new (getDefinitionByName("buff_" + _loc1_[_loc2_].name) as Class)();
            _loc3_.width = 30;
            _loc3_.height = 30;
            this.buffSprite.addChild(_loc3_);
            _loc3_.x = _loc2_ * 40;
            _loc2_++;
         }
      }
   }
}

