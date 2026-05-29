package iPanel.iCell
{
   import flash.display.Sprite;
   import flash.events.MouseEvent;
   import flash.filters.GlowFilter;
   import flash.geom.Point;
   import iGlobal.Global;
   
   public class MenuButton extends ButtonCell
   {
      
      private var bg:Sprite = new BasicCell(40,40);
      
      private var text:String;
      
      private var infoWindow:StringInfoWindow = Global.stringInfoWindow;
      
      public function MenuButton(param1:String, param2:String, param3:String)
      {
         this.addChild(this.bg);
         super(param1,param2);
         this.text = param3;
      }
      
      override public function onMouseOver(param1:MouseEvent) : void
      {
         super.onMouseOver(param1);
         var _loc2_:Point = this.localToGlobal(new Point(mouseX + 15,mouseY + 15));
         this.infoWindow.x = _loc2_.x;
         this.infoWindow.y = _loc2_.y;
         if(this.infoWindow.x + this.infoWindow.width > Global.stage.stageWidth)
         {
            this.infoWindow.x = this.infoWindow.x - this.infoWindow.width - 10;
         }
         Global.setStringInfoWindow(this.text);
      }
      
      override public function onMouseOut(param1:MouseEvent) : void
      {
         super.onMouseOut(param1);
         Global.hideInfoWindow();
      }
      
      override public function setBefore() : void
      {
         super.setBefore();
         this.filters = [];
      }
      
      override public function setDown() : void
      {
         super.setDown();
         this.filters = [new GlowFilter(5066061,0.66,13,13)];
         if(this.parent)
         {
            this.parent.addChildAt(this,this.parent.numChildren - 1);
         }
      }
   }
}

