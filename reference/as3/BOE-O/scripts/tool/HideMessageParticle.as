package tool
{
   internal class HideMessageParticle
   {
      
      public var x:Number;
      
      public var y:Number;
      
      public var ax:Number;
      
      public var ay:Number;
      
      public var vx:Number;
      
      public var vy:Number;
      
      public var color:uint;
      
      public function HideMessageParticle(param1:Number, param2:Number, param3:Number)
      {
         var _loc4_:Number = NaN;
         var _loc5_:Number = NaN;
         super();
         _loc4_ = Math.random() * 5;
         _loc5_ = Math.random() * Math.PI * 2;
         this.ax = Math.cos(_loc5_) * _loc4_;
         this.ay = Math.sin(_loc5_) * _loc4_;
         this.x = param1;
         this.y = param2;
         this.color = param3;
         this.vx = 0;
         this.vy = 0;
      }
      
      public function update() : void
      {
         this.vx += this.ax;
         this.vy += this.ay;
         this.x += this.vx;
         this.y += this.vy;
      }
   }
}

