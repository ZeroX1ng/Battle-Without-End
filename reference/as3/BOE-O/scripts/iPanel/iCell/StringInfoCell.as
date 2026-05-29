package iPanel.iCell
{
   import flash.display.Sprite;
   import flash.events.MouseEvent;
   import flash.filters.GlowFilter;
   import flash.geom.Point;
   import flash.text.TextField;
   import iGlobal.Global;
   
   public class StringInfoCell extends Sprite
   {
      
      public var infoWindow:StringInfoWindow = Global.stringInfoWindow;
      
      public var textField:TextField = Global.getTextField(16);
      
      public var info:String;
      
      private var w:int;
      
      private var size:int = 16;
      
      public function StringInfoCell(param1:String, param2:String, param3:int = 100)
      {
         super();
         this.info = param2;
         this.w = param3;
         this.addChild(this.textField);
         this.setText(param1);
         this.addEventListener(MouseEvent.MOUSE_MOVE,this.onMouseMove);
         this.addEventListener(MouseEvent.MOUSE_OVER,this.onMouseOver);
         this.addEventListener(MouseEvent.MOUSE_OUT,this.onMouseOut);
         this.mouseChildren = false;
      }
      
      public function onMouseMove(param1:MouseEvent) : void
      {
         var _loc2_:Point = this.localToGlobal(new Point(mouseX + 15,mouseY + 15));
         this.infoWindow.x = _loc2_.x;
         this.infoWindow.y = _loc2_.y;
         if(this.infoWindow.x + this.infoWindow.width > Global.stage.stageWidth)
         {
            this.infoWindow.x = this.infoWindow.x - this.infoWindow.width - 30;
         }
      }
      
      public function onMouseOver(param1:MouseEvent) : void
      {
         this.filters = [new GlowFilter(5066061,0.66,13,13)];
         if(this.parent)
         {
            this.parent.addChildAt(this,this.parent.numChildren - 1);
         }
         Global.setStringInfoWindow(this.info);
      }
      
      public function onMouseOut(param1:MouseEvent) : void
      {
         this.filters = [];
         Global.hideInfoWindow();
      }
      
      public function setInfo(param1:String) : *
      {
         this.info = param1;
      }
      
      public function setText(param1:String) : *
      {
         var _loc2_:int = 0;
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
         this.graphics.clear();
         this.graphics.beginFill(16777215,0.95);
         this.graphics.drawRoundRect(0,0,this.textField.textWidth + 6,this.textField.textHeight + 2,3);
         this.graphics.endFill();
      }
   }
}

