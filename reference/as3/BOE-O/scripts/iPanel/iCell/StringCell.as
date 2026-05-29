package iPanel.iCell
{
   import flash.text.TextField;
   import iGlobal.Global;
   
   public class StringCell extends BasicCell
   {
      
      private var size:int;
      
      public var w:int;
      
      public var textField:TextField;
      
      public function StringCell(param1:String, param2:int = 100, param3:int = 16)
      {
         this.size = param3;
         this.w = param2;
         this.textField = Global.getTextField(param3);
         super(0,0);
         this.addChild(this.textField);
         this.setText(param1);
         this.mouseChildren = false;
         this.mouseEnabled = false;
      }
      
      public function setText(param1:String) : *
      {
         var _loc2_:int = 0;
         this.graphics.clear();
         if(this.contains(this.textField))
         {
            this.removeChild(this.textField);
         }
         this.textField = Global.getTextField(this.size);
         this.addChild(this.textField);
         this.textField.width = this.w + 100;
         this.textField.htmlText = param1;
         this.textField.width = this.textField.textWidth + 6;
         if(this.textField.width > this.w)
         {
            this.removeChild(this.textField);
            _loc2_ = 1;
            while(_loc2_ < this.size)
            {
               this.textField = Global.getTextField(this.size - _loc2_);
               this.textField.width = this.w + 100;
               this.textField.htmlText = param1;
               this.textField.width = this.textField.textWidth + 6;
               if(this.textField.width < this.w)
               {
                  break;
               }
               _loc2_++;
            }
            this.addChild(this.textField);
         }
      }
   }
}

