package iPanel.iScene.iPanel.iWindow.iSystem
{
   import flash.display.Sprite;
   import flash.geom.ColorTransform;
   import flash.utils.getDefinitionByName;
   import iPanel.iCell.ButtonCell;
   
   public class ClickButton extends ButtonCell
   {
      
      private var FIX:int = 20;
      
      public function ClickButton(param1:String, param2:int)
      {
         super("flash.display.Sprite","flash.display.Sprite");
         this.FIX = param2;
         var _loc3_:Sprite = new doubleCircle();
         _loc3_.width = this.FIX;
         _loc3_.height = this.FIX;
         _loc3_.transform.colorTransform = new ColorTransform(1,1,1,1,255,255,255,0);
         this.before.addChild(_loc3_);
         var _loc4_:Sprite = new (getDefinitionByName(param1) as Class)();
         this.before.addChild(_loc4_);
         this.setMcPosition(_loc4_);
         var _loc5_:Sprite = new doubleCircle();
         _loc5_.width = this.FIX;
         _loc5_.height = this.FIX;
         this.after.addChild(_loc5_);
         var _loc6_:Sprite = new (getDefinitionByName(param1) as Class)();
         _loc6_.transform.colorTransform = new ColorTransform(1,1,1,1,255,255,255,0);
         this.after.addChild(_loc6_);
         this.setMcPosition(_loc6_);
      }
      
      private function setMcPosition(param1:Sprite) : *
      {
         var _loc2_:Number = NaN;
         if(param1.width > param1.height)
         {
            _loc2_ = this.FIX / 2 / param1.width;
         }
         else
         {
            _loc2_ = this.FIX / 2 / param1.height;
         }
         param1.scaleX = _loc2_;
         param1.scaleY = _loc2_;
         param1.x = this.FIX / 2 - param1.width / 2;
         param1.y = this.FIX / 2 - param1.height / 2;
      }
      
      override public function setDown() : void
      {
         super.setDown();
         this.setBefore();
      }
   }
}

