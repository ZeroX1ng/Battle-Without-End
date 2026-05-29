package iPanel.iScene.iPanel.iWindow.iTitle
{
   import iPanel.OutterPanel;
   
   public class TitleOutterPanel extends OutterPanel
   {
      
      public function TitleOutterPanel()
      {
         super(540);
      }
      
      override protected function setInnerPanel() : *
      {
         innerPanel = new TitleInnerPanel();
         this.addChild(innerPanel);
      }
   }
}

