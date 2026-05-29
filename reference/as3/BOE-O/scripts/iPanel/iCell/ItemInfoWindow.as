package iPanel.iCell
{
   import flash.text.TextField;
   import iGlobal.Global;
   
   public class ItemInfoWindow extends InfoWindow
   {
      
      private var text:TextField = Global.getTextField(24);
      
      public function ItemInfoWindow(param1:String)
      {
         this.text.multiline = true;
         this.addChild(this.text);
         this.text.htmlText = param1;
         super(0,0);
      }
      
      override public function draw(param1:int, param2:int) : *
      {
         this.graphics.clear();
         this.text.width = 130;
         super.draw(130,this.text.textHeight + 5);
      }
      
      public function set TEXT(param1:String) : *
      {
         this.text.htmlText = param1;
         this.draw(0,0);
      }
   }
}

