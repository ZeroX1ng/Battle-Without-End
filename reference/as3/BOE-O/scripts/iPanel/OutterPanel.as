package iPanel
{
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.events.MouseEvent;
   import tool.MyEvent;
   
   public class OutterPanel extends Sprite
   {
      
      public var innerPanel:InnerPanel;
      
      private var coverpanel:CoverPanel;
      
      private var mousedown:Boolean = false;
      
      private var temp:Number;
      
      private var d:Number = 0;
      
      private var H:Number = 400;
      
      private var isBlur:Boolean;
      
      private var scrollBar:MyScrollBar;
      
      public function OutterPanel(param1:int = 400, param2:Boolean = true)
      {
         super();
         this.setInnerPanel();
         this.innerPanel.cacheAsBitmap = true;
         this.H = param1;
         this.isBlur = param2;
         this.coverpanel = new CoverPanel(820,this.H);
         this.coverpanel.cacheAsBitmap = true;
         this.coverpanel.x = -400;
         var _loc3_:Sprite = new Sprite();
         _loc3_.graphics.beginFill(0,1);
         _loc3_.graphics.drawRect(0,0,400,300);
         _loc3_.graphics.endFill();
         _loc3_.x = -400;
         _loc3_.y = 300;
         var _loc4_:Sprite = new Sprite();
         _loc4_.addChild(this.coverpanel);
         _loc4_.addChild(_loc3_);
         this.addChild(_loc4_);
         _loc4_.cacheAsBitmap = true;
         this.innerPanel.mask = _loc4_;
         this.scrollBar = new MyScrollBar(param1,this.innerPanel);
         this.addChild(this.scrollBar);
         this.addEventListener(MouseEvent.MOUSE_DOWN,this.onMouseDown);
         this.addEventListener(MouseEvent.MOUSE_UP,this.onMouseUp);
         this.addEventListener(MouseEvent.MOUSE_MOVE,this.onMouseMove);
         this.addEventListener(Event.ENTER_FRAME,this.onEnterFrame);
         this.addEventListener(MouseEvent.ROLL_OUT,this.onMouseOut);
         this.addEventListener(MouseEvent.MOUSE_WHEEL,this.onMouseWheel);
         this.addEventListener(MyEvent.MyScroll,this.onMyScroll,true);
         if(param2)
         {
            this.coverpanel.applyLowerBlur();
         }
      }
      
      private function onMyScroll(param1:Event) : *
      {
         this.innerPanel.positionY = -this.scrollBar.percent * (this.innerPanel.height - this.H);
         this.checkPosition();
         this.applyBlur();
      }
      
      protected function setInnerPanel() : *
      {
         this.innerPanel = new InnerPanel();
         this.addChild(this.innerPanel);
      }
      
      private function onMouseWheel(param1:MouseEvent) : void
      {
         this.innerPanel.positionY += param1.delta * 5;
         param1.updateAfterEvent();
         this.applyBlur();
         this.d = param1.delta * 5;
      }
      
      private function onMouseDown(param1:MouseEvent) : void
      {
         if(!this.mousedown)
         {
            this.temp = this.mouseY;
         }
         this.mousedown = true;
      }
      
      private function onMouseUp(param1:MouseEvent) : void
      {
         this.mousedown = false;
         this.scrollBar.onMouseUp(param1);
      }
      
      private function onMouseMove(param1:MouseEvent) : void
      {
         if(this.mousedown)
         {
            this.d = -this.temp + (this.temp = this.mouseY);
            this.innerPanel.positionY += this.d;
            param1.updateAfterEvent();
            this.applyBlur();
         }
         else if(this.scrollBar.percent < 90)
         {
            this.scrollBar.onMouseMove(param1);
         }
      }
      
      private function borderMove() : *
      {
         if(this.innerPanel.positionY + this.innerPanel.height < this.H)
         {
            return;
         }
         if(this.innerPanel.positionY > 0)
         {
            return;
         }
         if(mouseY > this.H - 30 && mouseY < this.H && mouseX >= 0 && mouseX < 200)
         {
            this.d = (this.H - mouseY - 30) / 5;
            this.innerPanel.positionY += this.d;
            this.applyBlur();
         }
         if(mouseY < 30 && mouseY > 0 && mouseX >= 0 && mouseX < 200)
         {
            this.d = (30 - mouseY) / 5;
            this.innerPanel.positionY += this.d;
            this.applyBlur();
         }
      }
      
      private function onMouseOut(param1:MouseEvent) : void
      {
         trace("out",param1.target,mouseY,mouseX);
         this.mousedown = false;
         if(mouseY < 50 || mouseY > this.H - 50)
         {
            this.scrollBar.onMouseUp(param1);
         }
      }
      
      private function onEnterFrame(param1:Event) : void
      {
         if(this.d != 0)
         {
            this.innerPanel.positionY += this.d = this.d * 0.9;
            if(Math.abs(this.d) < 1)
            {
               this.d = 0;
            }
            this.applyBlur();
         }
         if(!this.mousedown)
         {
            this.checkPosition();
         }
      }
      
      private function applyBlur() : void
      {
         if(this.isBlur)
         {
            if(this.innerPanel.positionY < 0)
            {
               this.coverpanel.applyUpperBlur();
            }
            else
            {
               this.coverpanel.removeUpperBlur();
            }
         }
      }
      
      private function checkPosition() : void
      {
         if(this.innerPanel.positionY > 0)
         {
            this.innerPanel.positionY *= 0.9;
            if(Math.abs(this.innerPanel.positionY) < 1)
            {
               this.innerPanel.positionY = 0;
            }
         }
         if(this.innerPanel.height < this.H)
         {
            if(this.innerPanel.positionY < 0)
            {
               this.innerPanel.positionY *= 0.9;
               if(Math.abs(this.innerPanel.positionY) < 1)
               {
                  this.innerPanel.positionY = 0;
               }
            }
            return;
         }
         if(this.innerPanel.positionY + this.innerPanel.height < this.H)
         {
            this.innerPanel.positionY -= (this.innerPanel.positionY - (-this.innerPanel.height + this.H)) * 0.1;
            if(this.innerPanel.positionY > this.H - this.innerPanel.height)
            {
               this.innerPanel.positionY = this.H - this.innerPanel.height;
            }
         }
         this.scrollBar.updatePosition(-this.innerPanel.positionY / (this.innerPanel.height - this.H));
      }
   }
}

