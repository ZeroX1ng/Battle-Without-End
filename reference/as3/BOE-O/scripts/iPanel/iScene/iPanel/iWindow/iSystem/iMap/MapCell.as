package iPanel.iScene.iPanel.iWindow.iSystem.iMap
{
   import flash.events.MouseEvent;
   import flash.geom.ColorTransform;
   import flash.geom.Point;
   import iData.iMap.Map;
   import iData.iMap.MapData;
   import iGlobal.Global;
   import iPanel.iCell.ButtonCell;
   import iPanel.iCell.ItemInfoWindow;
   import iPanel.iScene.MainScene;
   
   public class MapCell extends ButtonCell
   {
      
      private var text:String;
      
      private var map:Map;
      
      private var infoWindow:ItemInfoWindow = Global.itemInfoWindow;
      
      public function MapCell(param1:MapData)
      {
         this.map = new Map(param1);
         super("flash.display.Sprite","flash.display.Sprite");
         this.before.addChild(new map_icon());
         this.after.addChild(new map_icon());
         this.after.transform.colorTransform = new ColorTransform(0,0,0,1,227,178,10);
         this.x = param1.x;
         this.y = param1.y;
         this.setText();
         this.downFunction = this.down;
         this.addEventListener(MouseEvent.MOUSE_MOVE,this.onMouseMove);
      }
      
      public function onMouseMove(param1:MouseEvent) : void
      {
         var _loc2_:Point = this.localToGlobal(new Point(mouseX + 15,mouseY + 15));
         this.infoWindow.x = _loc2_.x;
         this.infoWindow.y = _loc2_.y;
         if(_loc2_.x + 135 > Global.stage.stageWidth)
         {
            this.infoWindow.x -= 135;
         }
         if(_loc2_.y + this.infoWindow.height > Global.stage.stageHeight)
         {
            this.infoWindow.y -= this.infoWindow.height;
         }
      }
      
      override public function onMouseOver(param1:MouseEvent) : void
      {
         super.onMouseOver(param1);
         Global.setItemInfoWindow(this.text);
      }
      
      override public function onMouseOut(param1:MouseEvent) : void
      {
         super.onMouseOut(param1);
         Global.hideItemInfoWindow();
      }
      
      override public function setBefore() : void
      {
         super.setBefore();
      }
      
      override public function setAfter() : void
      {
         super.setAfter();
      }
      
      private function setText() : void
      {
         this.text = "<p align=\'center\'>" + this.map.mapData.realName + "</p>";
         this.text += "<p align=\'center\'>平均战斗力: " + (this.map.averageCp >> 0) + "</p>";
      }
      
      private function down() : *
      {
         Global.map = this.map;
         if(MainScene.lootPanel)
         {
            MainScene.lootPanel.reset();
         }
         if(MainScene.battle)
         {
            MainScene.battle.boss = null;
            MainScene.battle.init();
         }
         if(MainScene.otherPanel)
         {
            MainScene.otherPanel.otherWindow.mapPanel.visible = false;
         }
      }
   }
}

