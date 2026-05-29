package iPanel.iScene.iPanel.iBattleSkill
{
   import iPanel.OutterPanel;
   
   public class BattleSkillOutterPanel extends OutterPanel
   {
      
      public function BattleSkillOutterPanel()
      {
         super(155,false);
      }
      
      override protected function setInnerPanel() : *
      {
         innerPanel = new BattleSkillInnerPanel();
         this.addChild(innerPanel);
      }
   }
}

