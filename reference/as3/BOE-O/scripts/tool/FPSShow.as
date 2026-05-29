package tool
{
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.events.TimerEvent;
   import flash.text.TextField;
   import flash.utils.Timer;
   
   public class FPSShow extends Sprite
   {
      
      private var txt:TextField;
      
      private var count:int = 0;
      
      public function FPSShow()
      {
         super();
         this.init();
      }
      
      private function init() : *
      {
         this.txt = new TextField();
         this.txt.textColor = 16711680;
         addChild(this.txt);
         var _loc1_:Timer = new Timer(1000);
         _loc1_.addEventListener(TimerEvent.TIMER,this.timerHandler);
         this.addEventListener(Event.ENTER_FRAME,this.onEnterFrame);
         _loc1_.start();
         this.mouseChildren = false;
         this.mouseEnabled = false;
      }
      
      private function timerHandler(param1:TimerEvent) : void
      {
         this.txt.text = "FPS:" + this.count;
         this.count = 0;
      }
      
      private function onEnterFrame(param1:Event) : void
      {
         ++this.count;
      }
   }
}

