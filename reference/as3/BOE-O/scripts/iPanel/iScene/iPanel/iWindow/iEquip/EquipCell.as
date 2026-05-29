package iPanel.iScene.iPanel.iWindow.iEquip
{
   import flash.display.Sprite;
   import flash.events.MouseEvent;
   import flash.filters.GlowFilter;
   import flash.geom.ColorTransform;
   import flash.geom.Point;
   import flash.utils.getDefinitionByName;
   import iData.iItem.Equipment;
   import iData.iItem.Weapon;
   import iGlobal.Global;
   import iPanel.iCell.ButtonCell;
   import iPanel.iCell.ItemInfoWindow;
   
   public class EquipCell extends ButtonCell
   {
      
      private var infoWindow:ItemInfoWindow;
      
      public var equip:Equipment;
      
      public var position:String;
      
      private const SIZE:int = 80;
      
      public function EquipCell(param1:Equipment = null, param2:String = "")
      {
         var _loc4_:Sprite = null;
         this.infoWindow = Global.itemInfoWindow;
         this.position = param2;
         this.equip = param1;
         super("flash.display.Sprite","flash.display.Sprite");
         var _loc3_:Sprite = new Sprite();
         _loc3_.graphics.beginFill(16777215);
         _loc3_.graphics.drawCircle(40,40,39);
         _loc3_.graphics.endFill();
         before.addChild(_loc3_);
         if(param1 == null)
         {
            _loc4_ = new mc_mode();
         }
         else
         {
            if(this.equip is Weapon)
            {
               _loc4_ = new (getDefinitionByName("mc_" + this.equip.type) as Class)();
            }
            else
            {
               _loc4_ = new (getDefinitionByName("mc_" + this.equip.position + "_" + this.equip.type) as Class)();
            }
            _loc4_.transform.colorTransform = new ColorTransform(0,0,0,1,this.equip.getColorInHex() >> 16,this.equip.getColorInHex() >> 8 & 0xFF,this.equip.getColorInHex() & 0xFF);
            if(this.equip.level >= 7)
            {
               _loc3_.filters = [new GlowFilter(16711680,0.66,this.equip.level + 3,this.equip.level + 3)];
            }
         }
         before.addChild(_loc4_);
         _loc4_.width = this.SIZE;
         _loc4_.height = this.SIZE;
         if(param1 == null)
         {
            _loc4_ = new mc_mode();
         }
         else
         {
            if(this.equip is Weapon)
            {
               _loc4_ = new (getDefinitionByName("mc_" + this.equip.type) as Class)();
            }
            else
            {
               _loc4_ = new (getDefinitionByName("mc_" + this.equip.position + "_" + this.equip.type) as Class)();
            }
            after.transform.colorTransform = new ColorTransform(0,0,0,1,227,178,10,5);
         }
         after.addChild(_loc4_);
         _loc4_.width = this.SIZE;
         _loc4_.height = this.SIZE;
         downFunction = this.setBefore;
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
      }
      
      override public function setBefore() : void
      {
         super.setBefore();
         Global.hideItemInfoWindow();
      }
      
      override public function setAfter() : void
      {
         super.setAfter();
         if(this.equip)
         {
            Global.setItemInfoWindow(this.equip.getDescription());
         }
      }
   }
}

