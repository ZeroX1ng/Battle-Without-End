package com.spikything.utils
{
   import flash.display.Stage;
   import flash.errors.IllegalOperationError;
   import flash.events.Event;
   import flash.events.MouseEvent;
   import flash.external.ExternalInterface;
   
   public class MouseWheelTrap
   {
      
      private static const JAVASCRIPT:String = "var browserScrolling;function allowBrowserScroll(value){browserScrolling=value;}function handle(delta){if(!browserScrolling){return false;}return true;}function wheel(event){var delta=0;if(!event){event=window.event;}if(event.wheelDelta){delta=event.wheelDelta/120;if(window.opera){delta=-delta;}}else if(event.detail){delta=-event.detail/3;}if(delta){handle(delta);}if(!browserScrolling){if(event.preventDefault){event.preventDefault();}event.returnValue=false;}}if(window.addEventListener){window.addEventListener(\'DOMMouseScroll\',wheel,false);}window.onmousewheel=document.onmousewheel=wheel;allowBrowserScroll(true);";
      
      private static const JS_METHOD:String = "allowBrowserScroll";
      
      private static var _browserScrollEnabled:Boolean = true;
      
      private static var _mouseWheelTrapped:Boolean = false;
      
      private const INSTANTIATION_ERROR:String = "Don\'t instantiate com.spikything.utils.MouseWheelTrap directly. Just call MouseWheelTrap.setup(stage);";
      
      public function MouseWheelTrap()
      {
         super();
         throw new IllegalOperationError(this.INSTANTIATION_ERROR);
      }
      
      public static function setup(param1:Stage) : void
      {
         var stage:Stage = param1;
         stage.addEventListener(MouseEvent.MOUSE_MOVE,function(param1:* = null):void
         {
            allowBrowserScroll(false);
         });
         stage.addEventListener(Event.MOUSE_LEAVE,function(param1:* = null):void
         {
            allowBrowserScroll(true);
         });
      }
      
      private static function allowBrowserScroll(param1:Boolean) : void
      {
         createMouseWheelTrap();
         if(param1 == _browserScrollEnabled)
         {
            return;
         }
         _browserScrollEnabled = param1;
         if(ExternalInterface.available)
         {
            ExternalInterface.call(JS_METHOD,_browserScrollEnabled);
            return;
         }
      }
      
      private static function createMouseWheelTrap() : void
      {
         if(_mouseWheelTrapped)
         {
            return;
         }
         _mouseWheelTrapped = true;
         if(ExternalInterface.available)
         {
            ExternalInterface.call("eval",JAVASCRIPT);
            return;
         }
      }
   }
}

