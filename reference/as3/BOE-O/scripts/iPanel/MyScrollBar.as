package iPanel
{
   import flash.display.Sprite;
   import flash.events.MouseEvent;
   import flash.geom.Rectangle;
   import tool.MyEvent;
   
   public class MyScrollBar extends Sprite
   {
      
      private var scroll:Sprite;
      
      private var total:int;
      
      private var inner:Sprite;
      
      private var _position:Number;
      
      public var isDown:Boolean;
      
      private var bg:Sprite;
      
      public var percent:Number;
      
      public function MyScrollBar(param1:int, param2:Sprite)
      {
         super();
         this.total = param1;
         this.inner = param2;
         this.scroll = new Sprite();
         this.addChild(this.scroll);
         this.bg = new Sprite();
         this.bg.graphics.beginFill(0,0);
         this.bg.graphics.drawRect(-10,0,20,param1);
         this.bg.graphics.endFill();
         this.addChild(this.bg);
         this.addEventListener(MouseEvent.MOUSE_DOWN,this.onMouseDown);
         this.addEventListener(MouseEvent.MOUSE_UP,this.onMouseUp);
         this.addEventListener(MouseEvent.MOUSE_MOVE,this.onMouseMove);
         this.drawScroll();
      }
      
      private function onMouseDown(param1:MouseEvent) : *
      {
         param1.stopPropagation();
         this.isDown = true;
         this.onMouseMove(param1);
      }
      
      public function onMouseUp(param1:MouseEvent) : *
      {
         param1.stopPropagation();
         this.isDown = false;
      }
      
      public function onMouseMove(param1:MouseEvent) : *
      {
         param1.stopPropagation();
         if(this.getLength() < 0)
         {
            return;
         }
         if(this.isDown)
         {
            this.position = mouseY - this.getLength() / 2;
            dispatchEvent(new MyEvent(MyEvent.MyScroll));
         }
         this.drawScroll();
      }
      
      private function set position(param1:Number) : *
      {
         this._position = param1;
         if(this._position > this.total - this.getLength())
         {
            this._position = this.total - this.getLength();
         }
         if(this._position < 0)
         {
            this._position = 0;
         }
         this.percent = this._position / (this.total - this.getLength());
      }
      
      public function updatePosition(param1:Number) : *
      {
         this.percent = param1;
         this.position = this.percent * (this.total - this.getLength());
         this.drawScroll();
      }
      
      private function drawScroll() : *
      {
         this.scroll.graphics.clear();
         if(this.getLength() < 0)
         {
            return;
         }
         this.scroll.graphics.beginFill(7631988);
         this.scroll.graphics.drawRoundRect(0,this._position,3,this.getLength(),2,2);
         this.scroll.graphics.endFill();
         var _loc1_:Rectangle = this.inner.getBounds(this.inner);
         this.x = _loc1_.x + _loc1_.width;
      }
      
      private function getLength() : *
      {
         var _loc1_:Number = this.total / this.inner.height * this.total;
         if(this.inner.height < this.total)
         {
            _loc1_ = -1;
         }
         else if(_loc1_ < 50)
         {
            _loc1_ = 50;
         }
         return _loc1_;
      }
   }
}

