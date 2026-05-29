package iPanel.iScene.iPanel.iWindow.iSystem.iMap
{
   import flash.display.Sprite;
   import iData.iMap.MapList;
   import iGlobal.Global;
   import iPanel.iCell.BasicCell;
   import iPanel.iCell.ButtonGroup;
   import iPanel.iScene.FlickerButton;
   
   public class MapPanel extends Sprite
   {
      
      private var bg:Sprite;
      
      public function MapPanel()
      {
         var m:Sprite;
         var buttonGroup:ButtonGroup;
         var length:int;
         var i:int;
         var backButton:FlickerButton;
         var _this:* = undefined;
         var backDown:Function = null;
         var cell:MapCell = null;
         super();
         backDown = function():*
         {
            _this.parent.removeChild(_this);
            this.setBefore();
         };
         this.bg = new BasicCell(800,600);
         this.addChild(this.bg);
         m = new map_mc();
         this.addChild(m);
         buttonGroup = new ButtonGroup();
         length = int(MapList.list.length);
         i = 0;
         while(i < length)
         {
            cell = new MapCell(MapList.list[i]);
            this.addChild(cell);
            buttonGroup.addButton(cell);
            if(MapList.list[i].name == Global.map.mapData.name)
            {
               cell.setAfter();
               cell.onMouseDown(null);
            }
            i++;
         }
         backButton = new FlickerButton("返回",100,50);
         this.addChild(backButton);
         backButton.x = 0;
         backButton.y = 0;
         backButton.downFunction = backDown;
         _this = this;
      }
   }
}

