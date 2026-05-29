package iPanel.iScene.iPanel.iAllInfo
{
   import iPanel.OutterPanel;
   
   public class AllInfoOutterPanel extends OutterPanel
   {
      
      public function AllInfoOutterPanel()
      {
         super(345,false);
      }
      
      override protected function setInnerPanel() : *
      {
         innerPanel = new AllInfoInnerPanel();
         this.addChild(innerPanel);
      }
   }
}

