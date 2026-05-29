package iPanel.iScene.iPanel.iWindow.iSkill
{
   import flash.display.Sprite;
   import iData.iSkill.ActiveSkill;
   import iData.iSkill.SkillCategory;
   import iGlobal.Player;
   import iPanel.InnerPanel;
   
   public class CombatInnerPanel extends InnerPanel
   {
      
      private const Gap:int = 50;
      
      private var listSprite:Sprite;
      
      public function CombatInnerPanel()
      {
         var _loc3_:ActiveSkillCell = null;
         super();
         this.listSprite = new Sprite();
         this.addChild(this.listSprite);
         var _loc1_:int = 0;
         var _loc2_:int = 0;
         while(_loc2_ < Player.skillList.length)
         {
            if(Player.skillList[_loc2_] is ActiveSkill && Player.skillList[_loc2_].skillData.category != SkillCategory.MAGIC)
            {
               _loc3_ = new ActiveSkillCell(Player.skillList[_loc2_]);
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
         var _loc3_:ActiveSkillCell = null;
         var _loc1_:int = 0;
         var _loc2_:int = 0;
         while(_loc2_ < Player.skillList.length)
         {
            if(Player.skillList[_loc2_] is ActiveSkill && Player.skillList[_loc2_].skillData.category != SkillCategory.MAGIC)
            {
               if(++_loc1_ > this.listSprite.numChildren)
               {
                  _loc3_ = new ActiveSkillCell(Player.skillList[_loc2_]);
                  this.listSprite.addChild(_loc3_);
                  _loc3_.y = this.Gap * (_loc1_ - 1);
               }
            }
            _loc2_++;
         }
      }
   }
}

