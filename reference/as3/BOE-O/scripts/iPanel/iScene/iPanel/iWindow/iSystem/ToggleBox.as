package iPanel.iScene.iPanel.iWindow.iSystem
{
   import flash.display.Sprite;
   import flash.events.MouseEvent;
   import flash.text.TextField;
   import iGlobal.Global;
   
   public class ToggleBox extends Sprite
   {
      
      private var box:Sprite;
      
      private var size:int;
      
      private var text:TextField;
      
      private var isDown:Boolean = false;
      
      public var downFunction:Function;
      
      public var upFunction:Function;
      
      public function ToggleBox(param1:String, param2:int, param3:* = true)
      {
         super();
         this.size = param2;
         this.text = Global.getTextField(param2);
         this.addChild(this.text);
         this.setText(param1);
         this.box = new Sprite();
         this.addChild(this.box);
         if(param3)
         {
            this.setDown();
         }
         else
         {
            this.setUp();
         }
         this.box.addEventListener(MouseEvent.MOUSE_DOWN,this.onMouseDown);
      }
      
      public function setText(param1:String) : *
      {
         this.text.width = 300;
         this.text.htmlText = param1;
         this.text.width = this.text.textWidth + 6;
         this.text.x = this.size + 2;
      }
      
      public function setDown() : *
      {
         this.isDown = true;
         this.box.graphics.clear();
         this.box.graphics.lineStyle(2,7631988);
         this.box.graphics.beginFill(14922250);
         this.box.graphics.drawRect(0,0,this.size,this.size);
         this.box.graphics.endFill();
         if(Boolean(this.downFunction))
         {
            this.downFunction();
         }
      }
      
      public function setUp() : *
      {
         this.isDown = false;
         this.box.graphics.clear();
         this.box.graphics.beginFill(16777215,0);
         this.box.graphics.lineStyle(2,7631988);
         this.box.graphics.drawRect(0,0,this.size,this.size);
         this.box.graphics.endFill();
         if(Boolean(this.upFunction))
         {
            this.upFunction();
         }
      }
      
      private function onMouseDown(param1:MouseEvent) : *
      {
         if(this.isDown)
         {
            this.setUp();
         }
         else
         {
            this.setDown();
         }
      }
   }
}

