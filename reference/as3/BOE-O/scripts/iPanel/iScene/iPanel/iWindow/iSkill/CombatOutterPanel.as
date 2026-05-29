package iPanel.iScene.iPanel.iWindow.iSkill
{
   import iPanel.OutterPanel;
   
   public class CombatOutterPanel extends OutterPanel
   {
      
      public function CombatOutterPanel()
      {
         super(515);
      }
      
      override protected function setInnerPanel() : *
      {
         innerPanel = new CombatInnerPanel();
         this.addChild(innerPanel);
      }
   }
}

