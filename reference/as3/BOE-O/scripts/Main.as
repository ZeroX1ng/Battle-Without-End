package
{
   import flash.display.MovieClip;
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.events.MouseEvent;
   import flash.net.URLRequest;
   import flash.net.navigateToURL;
   import iGlobal.Global;
   import iPanel.iScene.BeginScene;
   import tool.Effect;
   
   public class Main extends Sprite
   {
      
      internal var _mochiads_game_id:String = "0378b66faafd51ef";
      
      public function Main()
      {
         super();
         if(stage)
         {
            this.init();
         }
         else
         {
            addEventListener(Event.ADDED_TO_STAGE,this.init);
         }
      }
      
      private function init(param1:Event = null) : void
      {
         var mc:MovieClip = null;
         var clickHandle:Function = null;
         var onEnterFrame:Function = null;
         var e:Event = param1;
         clickHandle = function(param1:MouseEvent):void
         {
            navigateToURL(new URLRequest("http://critgame.net"),"_blank");
         };
         onEnterFrame = function():*
         {
            var next:Function;
            var scene:BeginScene = null;
            if(mc.currentFrame == mc.totalFrames - 1)
            {
               next = function():*
               {
                  mc.parent.removeChild(mc);
               };
               Effect.fadeOut(mc,20,next);
               scene = new BeginScene();
               Global.stage.addChild(scene);
               Effect.fadeIn(scene);
               mc.removeEventListener(Event.ENTER_FRAME,onEnterFrame);
            }
         };
         removeEventListener(Event.ADDED_TO_STAGE,this.init);
         Global.init(this.stage);
         mc = new brand_mc();
         this.addChild(mc);
         mc.x = stage.stageWidth / 2;
         mc.y = stage.stageHeight / 2;
         mc.buttonMode = true;
         mc.addEventListener(MouseEvent.CLICK,clickHandle);
         mc.addEventListener(Event.ENTER_FRAME,onEnterFrame);
      }
   }
}

