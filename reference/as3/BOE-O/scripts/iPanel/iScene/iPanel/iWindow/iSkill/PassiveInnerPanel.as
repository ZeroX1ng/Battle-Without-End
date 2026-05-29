package iPanel.iScene.iPanel.iWindow.iSkill
{
   import flash.display.Sprite;
   import iData.iSkill.PassiveSkill;
   import iGlobal.Player;
   import iPanel.InnerPanel;
   
   public class PassiveInnerPanel extends InnerPanel
   {
      
      private const Gap:int = 50;
      
      private var listSprite:Sprite;
      
      public function PassiveInnerPanel()
      {
         var _loc3_:SkillCell = null;
         super();
         this.listSprite = new Sprite();
         this.addChild(this.listSprite);
         var _loc1_:int = 0;
         var _loc2_:int = 0;
         while(_loc2_ < Player.skillList.length)
         {
            if(Player.skillList[_loc2_] is PassiveSkill)
            {
               _loc3_ = new SkillCell(Player.skillList[_loc2_]);
               this.listSprite.addChild(_loc3_);
               _loc3_.y = this.Gap * _loc1_;
               _loc1_++;
            }
            _loc2_++;
         }
      }
      
      public function update() : *
      {
         var _loc1_:int = 0;
         while(_loc1_ < this.listSprite.numChildren)
         {
            (this.listSprite.getChildAt(_loc1_) as SkillCell).update();
            _loc1_++;
         }
         this.addCell();
      }
      
      public function addCell() : *
      {
         var _loc3_:SkillCell = null;
         var _loc1_:int = 0;
         var _loc2_:int = 0;
         while(_loc2_ < Player.skillList.length)
         {
            if(Player.skillList[_loc2_] is PassiveSkill)
            {
               if(++_loc1_ > this.listSprite.numChildren)
               {
                  _loc3_ = new SkillCell(Player.skillList[_loc2_]);
                  this.listSprite.addChild(_loc3_);
                  _loc3_.y = this.Gap * (_loc1_ - 1);
               }
            }
            _loc2_++;
         }
      }
   }
}

