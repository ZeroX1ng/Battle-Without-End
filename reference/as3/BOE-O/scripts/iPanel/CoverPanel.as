package iPanel
{
   import flash.display.Sprite;
   import flash.filters.BlurFilter;
   
   public class CoverPanel extends Sprite
   {
      
      private var FILTER:BlurFilter = new BlurFilter(0,20,4);
      
      private var upper:Sprite;
      
      private var lower:Sprite;
      
      private var w:Number;
      
      private var h:Number;
      
      private var isUpper:Boolean;
      
      private var isLower:Boolean;
      
      public function CoverPanel(param1:int, param2:int)
      {
         super();
         this.upper = new Sprite();
         this.upper.graphics.beginFill(0);
         this.upper.graphics.drawRect(0,-10,param1,param2 * 3 / 4);
         this.upper.graphics.endFill();
         this.addChild(this.upper);
         this.lower = new Sprite();
         this.lower.graphics.beginFill(0);
         this.lower.graphics.drawRect(0,param2 / 4,param1,param2 * 3 / 4);
         this.lower.graphics.endFill();
         this.addChild(this.lower);
         this.w = param1;
         this.h = param2;
      }
      
      public function applyUpperBlur() : void
      {
         if(!this.isUpper)
         {
            this.upper.graphics.clear();
            this.upper.graphics.beginFill(0);
            this.upper.graphics.drawRect(0,20,this.w,this.h * 3 / 4);
            this.upper.graphics.endFill();
            this.upper.filters = [this.FILTER];
            this.isUpper = true;
         }
      }
      
      public function removeUpperBlur() : void
      {
         if(this.isUpper)
         {
            this.upper.graphics.clear();
            this.upper.graphics.beginFill(0);
            this.upper.graphics.drawRect(0,-10,this.w,this.h * 3 / 4);
            this.upper.graphics.endFill();
            this.upper.filters = [];
            this.isUpper = false;
         }
      }
      
      public function applyLowerBlur() : void
      {
         this.lower.graphics.clear();
         this.lower.graphics.beginFill(0);
         this.lower.graphics.drawRect(0,this.h / 4 - 20,this.w,this.h * 3 / 4);
         this.lower.graphics.endFill();
         this.lower.filters = [this.FILTER];
      }
      
      public function removeLowerBlur() : void
      {
         this.lower.graphics.clear();
         this.lower.graphics.beginFill(0);
         this.lower.graphics.drawRect(0,this.h / 4,this.w,this.h * 3 / 4);
         this.lower.graphics.endFill();
         this.lower.filters = [];
      }
   }
}

