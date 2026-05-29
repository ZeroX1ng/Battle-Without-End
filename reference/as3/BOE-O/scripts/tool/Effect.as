package tool
{
   import flash.display.Bitmap;
   import flash.display.BitmapData;
   import flash.display.DisplayObject;
   import flash.display.GradientType;
   import flash.display.SpreadMethod;
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.geom.Matrix;
   import flash.geom.Rectangle;
   
   public class Effect
   {
      
      public function Effect()
      {
         super();
      }
      
      public static function fadeIn(param1:Sprite, param2:Number = 10) : *
      {
         var enter:Function = null;
         var sprite:Sprite = param1;
         var count:Number = param2;
         enter = function(param1:Event):void
         {
            sprite.alpha += 1 / count;
            if(sprite.alpha >= 1)
            {
               sprite.removeEventListener(Event.ENTER_FRAME,enter);
            }
         };
         sprite.alpha = 0;
         sprite.addEventListener(Event.ENTER_FRAME,enter);
      }
      
      public static function fadeOut(param1:DisplayObject, param2:Number = 10, param3:Function = null) : *
      {
         var enter:Function = null;
         var object:DisplayObject = param1;
         var count:Number = param2;
         var behaveFunction:Function = param3;
         enter = function(param1:Event):void
         {
            object.alpha -= 1 / count;
            if(object.alpha <= 0)
            {
               object.removeEventListener(Event.ENTER_FRAME,enter);
               if(object)
               {
                  if(object is Sprite)
                  {
                     (object as Sprite).mouseEnabled = true;
                     (object as Sprite).mouseChildren = true;
                  }
               }
               if(Boolean(behaveFunction))
               {
                  behaveFunction();
               }
            }
         };
         if(object is Sprite)
         {
            (object as Sprite).mouseEnabled = false;
            (object as Sprite).mouseChildren = false;
         }
         object.addEventListener(Event.ENTER_FRAME,enter);
      }
      
      public static function explodeOut(param1:DisplayObject, param2:int, param3:uint, param4:Function = null) : *
      {
         var _loc5_:BitmapData = new BitmapData(param1.width,param1.height,true,0);
         var _loc6_:Number = param1.getBounds(param1).x;
         var _loc7_:Number = param1.getBounds(param1).y;
         _loc5_.draw(param1,new Matrix(1,0,0,1,-_loc6_,-_loc7_));
         var _loc8_:Bitmap = new Bitmap(_loc5_);
         param1.parent.addChild(_loc8_);
         param1.parent.removeChild(param1);
         _loc8_.x = _loc6_;
         _loc8_.y = _loc7_;
         new HideMessageThread(_loc8_,param2,param3,param4).run();
      }
      
      public static function gradientIn(param1:Sprite, param2:int = 30) : *
      {
         var fillType:String = null;
         var colors:Array = null;
         var alphas:Array = null;
         var ratios:Array = null;
         var matr:Matrix = null;
         var spreadMethod:String = null;
         var cover:Sprite = null;
         var times:int = 0;
         var onEnterFrame:Function = null;
         var object:Sprite = param1;
         var count:int = param2;
         onEnterFrame = function(param1:Event):void
         {
            var _loc2_:Number = 1200 / count;
            cover.graphics.clear();
            matr.createGradientBox(50 + times * _loc2_,50 + times * _loc2_,0,-25 - times * _loc2_ / 2,-25 - times * _loc2_ / 2);
            ratios = [0 + 255 / count * times,255];
            cover.graphics.beginGradientFill(fillType,colors,alphas,ratios,matr,spreadMethod);
            cover.graphics.drawCircle(0,0,100 + times * _loc2_);
            ++times;
            if(times > count)
            {
               object.removeEventListener(Event.ENTER_FRAME,onEnterFrame);
               object.cacheAsBitmap = false;
               object.mask = null;
               object.removeChild(cover);
               cover = null;
            }
         };
         var rect:Rectangle = object.getBounds(object);
         fillType = GradientType.RADIAL;
         colors = [16711680,255];
         alphas = [100,0];
         ratios = [0,255];
         matr = new Matrix();
         matr.createGradientBox(50,50,0,-25,-25);
         spreadMethod = SpreadMethod.PAD;
         cover = new Sprite();
         cover.graphics.beginGradientFill(fillType,colors,alphas,ratios,matr,spreadMethod);
         cover.graphics.drawCircle(0,0,100);
         object.addChild(cover);
         cover.cacheAsBitmap = true;
         object.cacheAsBitmap = true;
         object.mask = cover;
         cover.x = object.stage.stageWidth / 2;
         cover.y = object.stage.stageHeight / 2;
         times = 1;
         object.addEventListener(Event.ENTER_FRAME,onEnterFrame);
      }
      
      public static function gradientInOutsideFirst(param1:Sprite, param2:int, param3:int, param4:int, param5:int) : void
      {
         var rect:Rectangle;
         var fillType:String = null;
         var colors:Array = null;
         var alphas:Array = null;
         var ratios:Array = null;
         var matr:Matrix = null;
         var spreadMethod:String = null;
         var cover:Sprite = null;
         var times:int = 0;
         var onEnterFrame:Function = null;
         var object:Sprite = param1;
         var count:int = param2;
         var size:int = param3;
         var px:int = param4;
         var py:int = param5;
         onEnterFrame = function(param1:Event):void
         {
            var _loc2_:Number = size / count;
            cover.graphics.clear();
            matr.createGradientBox(size,size,0,-size / 2,-size / 2);
            ratios = [255 - 255 / count * times,255 - 255 / count * times / 5 * 4];
            cover.graphics.beginGradientFill(fillType,colors,alphas,ratios,matr,spreadMethod);
            cover.graphics.drawCircle(0,0,size);
            ++times;
            if(times > count)
            {
               object.removeEventListener(Event.ENTER_FRAME,onEnterFrame);
               object.cacheAsBitmap = false;
               object.mask = null;
               object.removeChild(cover);
               cover = null;
            }
         };
         if(object.mask)
         {
            return;
         }
         rect = object.getBounds(object);
         fillType = GradientType.RADIAL;
         colors = [16711680,255];
         alphas = [0,100];
         ratios = [255,255];
         matr = new Matrix();
         matr.createGradientBox(size,size,0,-size / 2,-size / 2);
         spreadMethod = SpreadMethod.PAD;
         cover = new Sprite();
         cover.graphics.beginGradientFill(fillType,colors,alphas,ratios,matr,spreadMethod);
         cover.graphics.drawCircle(0,0,size);
         object.addChild(cover);
         cover.cacheAsBitmap = true;
         object.cacheAsBitmap = true;
         object.mask = cover;
         cover.x = px;
         cover.y = py;
         times = 1;
         object.addEventListener(Event.ENTER_FRAME,onEnterFrame);
      }
   }
}

