package iPanel.iScene.iPanel.iWindow.iItem
{
   import flash.events.MouseEvent;
   import iPanel.iCell.StringInfoCell;
   
   public class StringInfoButton extends StringInfoCell
   {
      
      public var downFunction:Function;
      
      public function StringInfoButton(param1:String, param2:String)
      {
         super(param1,param2);
         this.addEventListener(MouseEvent.MOUSE_DOWN,this.onMouseDown);
      }
      
      override public function onMouseOver(param1:MouseEvent) : void
      {
         super.onMouseOver(param1);
         this.graphics.clear();
         this.graphics.beginFill(14922250,0.95);
         this.graphics.drawRoundRect(0,0,textField.textWidth + 6,textField.textHeight + 2,3);
         this.graphics.endFill();
         textField.htmlText = "<font color=\'#ffffff\'>" + textField.text + "</font>";
      }
      
      override public function onMouseOut(param1:MouseEvent) : void
      {
         super.onMouseOut(param1);
         this.graphics.clear();
         this.graphics.beginFill(16777215,0.95);
         this.graphics.drawRoundRect(0,0,textField.textWidth + 6,textField.textHeight + 2,3);
         this.graphics.endFill();
         textField.htmlText = "<font color=\'#747474\'>" + textField.text + "</font>";
      }
      
      public function onMouseDown(param1:MouseEvent) : void
      {
         if(Boolean(this.downFunction))
         {
            this.downFunction();
         }
      }
   }
}

