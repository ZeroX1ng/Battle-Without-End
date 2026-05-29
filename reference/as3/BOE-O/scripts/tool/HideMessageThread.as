package tool
{
   import flash.display.Bitmap;
   import flash.display.BitmapData;
   import flash.display.DisplayObject;
   import flash.display.DisplayObjectContainer;
   import flash.display.Stage;
   import flash.events.Event;
   import flash.filters.BitmapFilterQuality;
   import flash.filters.BlurFilter;
   import flash.geom.Point;
   
   internal class HideMessageThread
   {
      
      internal var FILTER_BLUR:BlurFilter = new BlurFilter(4,4,BitmapFilterQuality.LOW);
      
      internal var POINT_ZERO:Point = new Point();
      
      private var message:DisplayObject;
      
      private var wrapper:Bitmap;
      
      private var parent:DisplayObjectContainer;
      
      private var film:BitmapData;
      
      private var particles:Vector.<HideMessageParticle>;
      
      private var gap:int = 1;
      
      private var ignoreColor:uint;
      
      private var behaveFunction:Function;
      
      private var out:Boolean = false;
      
      public function HideMessageThread(param1:DisplayObject, param2:int, param3:uint, param4:Function = null)
      {
         super();
         this.message = param1;
         this.parent = param1.parent;
         this.particles = new Vector.<HideMessageParticle>();
         this.gap = param2;
         this.ignoreColor = param3;
         this.behaveFunction = param4;
      }
      
      public function run() : void
      {
         var _loc1_:Stage = null;
         var _loc2_:uint = 0;
         var _loc3_:Number = NaN;
         var _loc4_:Number = NaN;
         var _loc5_:Number = NaN;
         var _loc6_:Number = NaN;
         var _loc7_:uint = 0;
         var _loc8_:uint = 0;
         var _loc9_:BitmapData = null;
         _loc1_ = this.message.stage;
         _loc9_ = Bitmap(this.message).bitmapData;
         _loc3_ = _loc9_.width;
         _loc4_ = _loc9_.height;
         _loc5_ = this.message.x;
         _loc6_ = this.message.y;
         _loc7_ = 0;
         while(_loc7_ < _loc3_)
         {
            _loc8_ = 0;
            while(_loc8_ < _loc4_)
            {
               _loc2_ = _loc9_.getPixel32(_loc7_,_loc8_);
               if(_loc2_)
               {
                  if(_loc2_ != this.ignoreColor)
                  {
                     this.particles.push(new HideMessageParticle(_loc5_ + _loc7_,_loc6_ + _loc8_,_loc2_));
                  }
               }
               _loc8_ += this.gap;
            }
            _loc7_ += this.gap;
         }
         _loc9_.dispose();
         this.film = new BitmapData(_loc1_.stageWidth,_loc1_.stageHeight,true,0);
         this.wrapper = new Bitmap(this.film);
         this.wrapper = new Bitmap(this.film);
         this.parent.addChild(this.wrapper);
         this.parent.removeChild(this.message);
         this.parent.addEventListener(Event.ENTER_FRAME,this.step);
      }
      
      private function step(param1:Event = null) : void
      {
         var _loc2_:uint = 0;
         var _loc3_:uint = 0;
         var _loc4_:Stage = null;
         var _loc5_:HideMessageParticle = null;
         this.film.lock();
         this.film.applyFilter(this.film,this.film.rect,this.POINT_ZERO,this.FILTER_BLUR);
         var _loc6_:int = 1;
         _loc3_ = this.particles.length;
         _loc2_ = 0;
         while(_loc2_ < _loc3_)
         {
            _loc5_ = this.particles[_loc2_];
            _loc5_.update();
            this.film.setPixel32(_loc5_.x,_loc5_.y,_loc5_.color);
            if(!this.film.rect.contains(_loc5_.x,_loc5_.y))
            {
               this.particles.splice(_loc2_,1);
               _loc2_--;
               _loc3_ = this.particles.length;
            }
            _loc2_ += _loc6_;
         }
         this.film.unlock();
         if(_loc3_ > 20)
         {
            if(_loc3_ < 50)
            {
               if(!this.out)
               {
                  trace("run");
                  Effect.fadeOut(this.wrapper,30,this.behaveFunction);
                  this.out = true;
               }
            }
         }
         else
         {
            this.parent.removeEventListener(Event.ENTER_FRAME,this.step);
            this.finalize();
         }
      }
      
      public function finalize() : void
      {
         this.parent.removeChild(this.wrapper);
         this.film.dispose();
         this.parent = null;
         this.wrapper = null;
         this.message = null;
      }
   }
}

