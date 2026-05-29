package iPanel.iScene.iPanel.iWindow
{
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.text.TextField;
   import iGlobal.Global;
   import iGlobal.Player;
   import iPanel.iCell.BasicCell;
   import iPanel.iScene.iPanel.iWindow.iPet.PetInnerPanel;
   import iPanel.iScene.iPanel.iWindow.iPet.PetOutterPanel;
   import tool.MyEvent;
   
   public class PetWindow extends Window
   {
      
      private var panel:PetInnerPanel;
      
      private var textBag:TextField = Global.getTextField(32,7631988);
      
      public function PetWindow()
      {
         super();
         var _loc1_:PetOutterPanel = new PetOutterPanel();
         this.addChild(_loc1_);
         _loc1_.x = 0;
         _loc1_.y = 40;
         this.panel = _loc1_.innerPanel as PetInnerPanel;
         this.setBagText();
         this.addEventListener(MyEvent.Update,this.updateBagText,true);
      }
      
      private function updateBagText(param1:Event = null) : *
      {
         this.textBag.htmlText = "<p align=\'center\'>" + Player.petList.length + "/" + Player.PETMAX + "</p>";
      }
      
      private function setBagText() : void
      {
         var _loc1_:Sprite = new BasicCell(200,40);
         this.addChild(_loc1_);
         _loc1_.x = 0;
         _loc1_.y = 0;
         this.textBag.width = 200;
         this.textBag.htmlText = "<p align=\'center\'>" + Player.petList.length + "/" + Player.PETMAX + "</p>";
         _loc1_.addChild(this.textBag);
      }
      
      public function update() : void
      {
         this.panel.update();
         this.updateBagText();
      }
   }
}

