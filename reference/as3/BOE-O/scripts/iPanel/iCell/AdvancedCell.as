package iPanel.iCell
{
   import flash.filters.GlowFilter;
   import flash.geom.ColorTransform;
   import flash.geom.Point;
   import flash.text.TextField;
   import iGlobal.Global;
   
   public class AdvancedCell extends ButtonCell
   {
      
      public var infoWindow:InfoWindow;
      
      public var text:TextField;
      
      public var html:String;
      
      public function AdvancedCell(param1:int, param2:int)
      {
         super("flash.display.Sprite","flash.display.Sprite");
         before.graphics.lineStyle(1,13487565,0.8);
         before.graphics.beginFill(16777215,0.95);
         before.graphics.drawRect(0,0,param1,param2);
         before.graphics.endFill();
         after.graphics.lineStyle(1,13487565,0.8);
         after.graphics.beginFill(14922250,0.95);
         after.graphics.drawRect(0,0,param1,param2);
         after.graphics.endFill();
      }
      
      override public function setAfter() : void
      {
         super.setAfter();
         this.filters = [new GlowFilter(5066061,0.66,13,13)];
         if(this.parent)
         {
            this.parent.addChildAt(this,this.parent.numChildren - 1);
         }
         this.addInfoWindow();
         this.text.transform.colorTransform = new ColorTransform(0,0,0,1,255,255,255,0);
      }
      
      override public function setBefore() : void
      {
         super.setBefore();
         this.filters = [];
         this.removeInfoWindow();
         this.text.transform.colorTransform = new ColorTransform();
      }
      
      protected function addInfoWindow() : *
      {
         this.addChild(this.infoWindow);
         this.infoWindow.x = -135;
         this.infoWindow.y = 0;
         var _loc1_:Point = this.localToGlobal(new Point(0,0));
         if(_loc1_.y + this.infoWindow.height > Global.stage.stageHeight)
         {
            _loc1_ = this.globalToLocal(new Point(0,Global.stage.stageHeight - this.infoWindow.height));
            this.infoWindow.y = _loc1_.y;
         }
      }
      
      protected function removeInfoWindow() : *
      {
         if(this.contains(this.infoWindow))
         {
            this.removeChild(this.infoWindow);
         }
      }
   }
}

