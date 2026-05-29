package iPanel.iCell
{
   import flash.display.Sprite;
   import flash.geom.ColorTransform;
   import flash.utils.getDefinitionByName;
   
   public class EquipButton extends ButtonCell
   {
      
      private const FIX:int = 20;
      
      public function EquipButton(param1:String)
      {
         super("flash.display.Sprite","flash.display.Sprite");
         var _loc2_:Sprite = new doubleCircle();
         _loc2_.width = this.FIX;
         _loc2_.height = this.FIX;
         _loc2_.transform.colorTransform = new ColorTransform(1,1,1,1,255,255,255,0);
         this.before.addChild(_loc2_);
         var _loc3_:Sprite = new (getDefinitionByName("mc_" + param1) as Class)();
         this.before.addChild(_loc3_);
         this.setMcPosition(_loc3_);
         var _loc4_:Sprite = new doubleCircle();
         _loc4_.width = this.FIX;
         _loc4_.height = this.FIX;
         this.after.addChild(_loc4_);
         var _loc5_:Sprite = new (getDefinitionByName("mc_" + param1) as Class)();
         _loc5_.transform.colorTransform = new ColorTransform(1,1,1,1,255,255,255,0);
         this.after.addChild(_loc5_);
         this.setMcPosition(_loc5_);
      }
      
      private function setMcPosition(param1:Sprite) : *
      {
         var _loc2_:Number = NaN;
         if(param1.width > param1.height)
         {
            _loc2_ = 10 / param1.width;
         }
         else
         {
            _loc2_ = 10 / param1.height;
         }
         param1.scaleX = _loc2_;
         param1.scaleY = _loc2_;
         param1.x = this.FIX / 2 - param1.width / 2;
         param1.y = this.FIX / 2 - param1.height / 2;
      }
   }
}

