package iPanel.iScene.iPanel
{
   import iGlobal.Global;
   import iPanel.iCell.BasicCell;
   import iPanel.iScene.iPanel.iAllInfo.AllInfoInnerPanel;
   import iPanel.iScene.iPanel.iAllInfo.AllInfoOutterPanel;
   
   public class AllInfoPanel extends BasicCell
   {
      
      public var panel:AllInfoInnerPanel;
      
      public function AllInfoPanel()
      {
         super(400,355);
         var _loc1_:AllInfoOutterPanel = new AllInfoOutterPanel();
         this.addChild(_loc1_);
         _loc1_.y = 10;
         this.panel = _loc1_.innerPanel as AllInfoInnerPanel;
      }
      
      public function addText(param1:String, param2:String = "other") : void
      {
         if(Global[param2 + "_toggle"])
         {
            this.panel.addText(param1);
            return;
         }
      }
   }
}

