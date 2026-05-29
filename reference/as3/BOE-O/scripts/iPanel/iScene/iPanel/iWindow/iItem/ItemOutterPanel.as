package iPanel.iScene.iPanel.iWindow.iItem
{
   import iPanel.OutterPanel;
   
   public class ItemOutterPanel extends OutterPanel
   {
      
      public function ItemOutterPanel()
      {
         super(360,false);
      }
      
      override protected function setInnerPanel() : *
      {
         innerPanel = new ItemInnerPanel();
         this.addChild(innerPanel);
      }
   }
}

