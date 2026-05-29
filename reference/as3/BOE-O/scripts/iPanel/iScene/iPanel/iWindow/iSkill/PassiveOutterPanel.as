package iPanel.iScene.iPanel.iWindow.iSkill
{
   import iPanel.OutterPanel;
   
   public class PassiveOutterPanel extends OutterPanel
   {
      
      public function PassiveOutterPanel()
      {
         super(515);
      }
      
      override protected function setInnerPanel() : *
      {
         innerPanel = new PassiveInnerPanel();
         this.addChild(innerPanel);
      }
   }
}

