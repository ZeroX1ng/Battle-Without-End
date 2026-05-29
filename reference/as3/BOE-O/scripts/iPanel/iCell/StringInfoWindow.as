package iPanel.iCell
{
   import flash.text.TextField;
   import flash.text.TextFieldAutoSize;
   import iGlobal.Global;
   
   public class StringInfoWindow extends InfoWindow
   {
      
      private var textField:TextField = Global.getTextField(20);
      
      public function StringInfoWindow()
      {
         this.textField.autoSize = TextFieldAutoSize.LEFT;
         this.textField.multiline = true;
         this.addChild(this.textField);
         this.mouseChildren = false;
         this.mouseEnabled = false;
         super(0,0);
      }
      
      public function setText(param1:String) : *
      {
         var _loc3_:int = 0;
         var _loc4_:int = 0;
         this.graphics.clear();
         this.textField.htmlText = param1;
         this.textField.width = 300;
         var _loc2_:int = this.textField.textWidth;
         if(_loc2_ < 200)
         {
            _loc3_ = _loc2_ + 4;
            _loc4_ = this.textField.textHeight + 2;
            this.textField.width = _loc3_ + 2;
         }
         else
         {
            this.textField.width = 200;
            _loc3_ = 204;
            _loc4_ = this.textField.height + 2;
         }
         super.draw(_loc3_,_loc4_);
      }
   }
}

