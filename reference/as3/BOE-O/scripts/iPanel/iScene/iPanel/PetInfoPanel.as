package iPanel.iScene.iPanel
{
   import iPanel.iBar.Bar;
   import iPanel.iCell.BasicCell;
   import iPanel.iCell.StringCell;
   import iPanel.iScene.MainScene;
   
   public class PetInfoPanel extends BasicCell
   {
      
      private const beginX:int = 10;
      
      private const beginY:int = 10;
      
      private const yGap:int = 20;
      
      private const sXGap:int = 50;
      
      private var _name:StringCell;
      
      private var lv:StringCell;
      
      private var hp:Bar;
      
      private var exp:Bar;
      
      public function PetInfoPanel()
      {
         super(185,80);
         this.init();
      }
      
      private function init() : *
      {
         var _loc1_:StringCell = new StringCell("宠物");
         this.addChild(_loc1_);
         _loc1_.x = this.beginX;
         _loc1_.y = this.beginY;
         this._name = new StringCell("",120);
         this.addChild(this._name);
         this._name.x = this.beginX + this.sXGap;
         this._name.y = this.beginY;
         var _loc2_:StringCell = new StringCell("Lv");
         this.addChild(_loc2_);
         _loc2_.x = this.beginX;
         _loc2_.y = this.beginY + this.yGap;
         this.lv = new StringCell("");
         this.addChild(this.lv);
         this.lv.x = this.beginX + this.sXGap - 30;
         this.lv.y = this.beginY + this.yGap;
         var _loc3_:StringCell = new StringCell("Exp");
         this.addChild(_loc3_);
         _loc3_.x = this.beginX + 50;
         _loc3_.y = this.beginY + this.yGap;
         this.exp = new Bar(50,100,7932074);
         this.addChild(this.exp);
         this.exp.x = this.beginX + 80;
         this.exp.y = this.beginY + this.yGap + 13;
         var _loc4_:StringCell = new StringCell("HP");
         this.addChild(_loc4_);
         _loc4_.x = this.beginX;
         _loc4_.y = this.beginY + this.yGap * 2;
         this.hp = new Bar(100,100,12522257);
         this.addChild(this.hp);
         this.hp.x = this.beginX + 25;
         this.hp.y = this.beginY + this.yGap * 2 + 13;
      }
      
      public function update() : *
      {
         if(MainScene.battle.pet)
         {
            this._name.setText(MainScene.battle.pet.realName);
            this.updateLv();
            this.updateHp();
            this.updateExp();
         }
         else
         {
            this._name.setText("");
            this.lv.setText("");
            this.hp.Value = 0;
            this.hp.Max = 1;
            this.exp.Value = 0;
            this.exp.Max = 1;
         }
      }
      
      public function updateHp() : *
      {
         if(MainScene.battle.pet)
         {
            this.hp.Value = MainScene.battle.petHp;
            this.hp.Max = MainScene.battle.pet.hp;
         }
      }
      
      public function updateExp() : *
      {
         if(MainScene.battle.pet)
         {
            this.exp.Value = MainScene.battle.pet.exp;
            this.exp.Max = MainScene.battle.pet.getLevelExp();
         }
      }
      
      public function updateLv() : *
      {
         if(MainScene.battle.pet)
         {
            this.lv.setText(MainScene.battle.pet.level + "");
         }
      }
   }
}

