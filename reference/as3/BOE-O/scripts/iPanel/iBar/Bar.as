package iPanel.iBar
{
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.events.MouseEvent;
   import flash.filters.GlowFilter;
   import flash.geom.Point;
   import iGlobal.Global;
   import iPanel.iCell.StringInfoWindow;
   
   public class Bar extends Sprite
   {
      
      public var infoWindow:StringInfoWindow = Global.stringInfoWindow;
      
      private var line:Sprite;
      
      private var bg:Sprite;
      
      private var _max:Number;
      
      private var _value:Number = 0;
      
      private var _aim:Number = 0;
      
      private const RATIO:Number = 0.1;
      
      private var w:Number;
      
      private var fcolor:uint;
      
      private var text:String;
      
      private var isMouseOver:Boolean;
      
      public function Bar(param1:Number, param2:Number, param3:uint, param4:String = "")
      {
         super();
         this.w = param1;
         this._max = param2;
         this.fcolor = param3;
         this.text = param4;
         this.drawBg();
         this.line = new Sprite();
         this.addChild(this.line);
         this.updateMc();
         this.addEventListener(Event.ENTER_FRAME,this.onEnterFrame);
         this.addEventListener(MouseEvent.MOUSE_OVER,this.onMouseOver);
         this.addEventListener(MouseEvent.MOUSE_OUT,this.onMouseOut);
      }
      
      private function onMouseOver(param1:MouseEvent) : void
      {
         this.filters = [new GlowFilter(this.fcolor,0.66,4,4)];
         var _loc2_:Point = this.localToGlobal(new Point(mouseX + 15,mouseY + 15));
         this.infoWindow.x = _loc2_.x;
         this.infoWindow.y = _loc2_.y;
         this.infoWindow.y = _loc2_.y;
         this.isMouseOver = true;
         Global.setStringInfoWindow(this.text + (this._value >> 0) + "/" + this._max);
      }
      
      private function onMouseOut(param1:MouseEvent) : void
      {
         this.filters = [];
         this.isMouseOver = false;
         Global.hideInfoWindow();
      }
      
      private function updateMc() : void
      {
         this.line.graphics.clear();
         this.line.graphics.lineStyle(2,15066597);
         this.line.graphics.moveTo(0,0);
         this.line.graphics.lineTo(this.w,0);
         this.line.graphics.lineStyle(2,this.fcolor);
         this.line.graphics.moveTo(0,0);
         if(this._value < 0)
         {
            this.line.graphics.lineTo(0,0);
         }
         else if(this._value > this._max)
         {
            this.line.graphics.lineTo(this.w,0);
         }
         else
         {
            this.line.graphics.lineTo(this._value / this._max * this.w,0);
         }
      }
      
      public function onEnterFrame(param1:Event) : void
      {
         if(Math.abs(this._aim - this._value) > this._max / 100)
         {
            this._value += (this._aim - this._value) * this.RATIO;
         }
         else
         {
            this._value = this._aim;
         }
         this.updateMc();
      }
      
      public function set Max(param1:Number) : *
      {
         this._max = param1;
      }
      
      public function set Value(param1:Number) : *
      {
         this._aim = param1;
         if(this.isMouseOver)
         {
            Global.setStringInfoWindow(this.text + (this._value >> 0) + "/" + this._max);
         }
      }
      
      public function get Value() : Number
      {
         return this._value;
      }
      
      private function drawBg() : void
      {
         this.bg = new Sprite();
         this.addChild(this.bg);
         this.bg.graphics.beginFill(4095,0);
         this.bg.graphics.drawRect(-3,0,this.w,8);
         this.bg.graphics.endFill();
      }
   }
}

