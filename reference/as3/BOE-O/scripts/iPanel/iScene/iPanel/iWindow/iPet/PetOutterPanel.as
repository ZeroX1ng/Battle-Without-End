package iPanel.iScene.iPanel.iWindow.iPet
{
   import iPanel.OutterPanel;
   
   public class PetOutterPanel extends OutterPanel
   {
      
      public function PetOutterPanel()
      {
         super(495,false);
      }
      
      override protected function setInnerPanel() : *
      {
         innerPanel = new PetInnerPanel();
         this.addChild(innerPanel);
      }
   }
}

