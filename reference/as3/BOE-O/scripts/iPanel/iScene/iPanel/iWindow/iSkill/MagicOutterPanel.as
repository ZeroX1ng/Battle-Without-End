package iPanel.iScene.iPanel.iWindow.iSkill
{
   import iPanel.OutterPanel;
   
   public class MagicOutterPanel extends OutterPanel
   {
      
      public function MagicOutterPanel()
      {
         super(515);
      }
      
      override protected function setInnerPanel() : *
      {
         innerPanel = new MagicInnerPanel();
         this.addChild(innerPanel);
      }
   }
}

