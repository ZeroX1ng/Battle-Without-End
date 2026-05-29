package iPanel.iScene.iPanel.iWindow
{
   import iPanel.iScene.iPanel.iWindow.iTitle.TitleInnerPanel;
   import iPanel.iScene.iPanel.iWindow.iTitle.TitleOutterPanel;
   
   public class TitleWindow extends Window
   {
      
      private var panel:TitleInnerPanel;
      
      public function TitleWindow()
      {
         super();
         var _loc1_:TitleOutterPanel = new TitleOutterPanel();
         this.panel = _loc1_.innerPanel as TitleInnerPanel;
         this.addChild(_loc1_);
         _loc1_.x = 0;
         _loc1_.y = 0;
      }
      
      public function update() : *
      {
         this.panel.onUpdate();
      }
   }
}

