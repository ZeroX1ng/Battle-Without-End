package iPanel.iScene.iPanel
{
   import iPanel.iCell.BasicCell;
   import iPanel.iScene.iPanel.iBattleSkill.BattleSkillInnerPanel;
   import iPanel.iScene.iPanel.iBattleSkill.BattleSkillOutterPanel;
   
   public class BattleSkillPanel extends BasicCell
   {
      
      public var panel:BattleSkillInnerPanel;
      
      public function BattleSkillPanel()
      {
         super(170,165);
         var _loc1_:BattleSkillOutterPanel = new BattleSkillOutterPanel();
         this.addChild(_loc1_);
         _loc1_.y = 10;
         this.panel = _loc1_.innerPanel as BattleSkillInnerPanel;
         this.update();
      }
      
      public function update() : *
      {
         this.panel.update();
      }
   }
}

