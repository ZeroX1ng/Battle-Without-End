package iPanel.iScene.iPanel.iWindow.iPet
{
   import flash.display.Sprite;
   import flash.events.MouseEvent;
   import flash.filters.GlowFilter;
   import flash.geom.ColorTransform;
   import flash.geom.Point;
   import flash.utils.getDefinitionByName;
   import iData.iPet.iPetSkill.PetSkill;
   import iGlobal.Global;
   import iPanel.iCell.ButtonCell;
   import iPanel.iCell.ItemInfoWindow;
   import tool.MyMath;
   
   public class PetSkillCell extends ButtonCell
   {
      
      private var infoWindow:ItemInfoWindow = Global.itemInfoWindow;
      
      public var petSkill:PetSkill;
      
      private const SIZE:int = 30;
      
      public function PetSkillCell(param1:PetSkill)
      {
         this.petSkill = param1;
         super("flash.display.Sprite","flash.display.Sprite");
         var _loc2_:Sprite = new Sprite();
         _loc2_.graphics.beginFill(0,0);
         _loc2_.graphics.drawCircle(15,15,30);
         _loc2_.graphics.endFill();
         this.addChild(_loc2_);
         var _loc3_:Sprite = new (getDefinitionByName("pSkill_" + MyMath.StringFormChange(this.petSkill.skillData.name.toLowerCase()," ","_")) as Class)();
         if(this.petSkill.level)
         {
            _loc3_.filters = [new GlowFilter(16711680,0.66,5,5)];
         }
         before.addChild(_loc3_);
         _loc3_.width = this.SIZE;
         _loc3_.height = this.SIZE;
         _loc3_ = new (getDefinitionByName("pSkill_" + MyMath.StringFormChange(this.petSkill.skillData.name.toLowerCase()," ","_")) as Class)();
         after.transform.colorTransform = new ColorTransform(0,0,0,1,227,178,10,5);
         after.addChild(_loc3_);
         _loc3_.width = this.SIZE;
         _loc3_.height = this.SIZE;
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
         if(_loc2_.y + this.infoWindow.height > Global.stage.stageHeight)
         {
            this.infoWindow.y -= this.infoWindow.height - 15;
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
         if(this.petSkill)
         {
            Global.setItemInfoWindow(this.getDescription());
         }
      }
      
      private function getDescription() : String
      {
         var _loc1_:String = "<p align=\'center\'>" + this.petSkill.getRealName() + "</p>";
         return _loc1_ + this.petSkill.skillData.desFunction(this.petSkill);
      }
   }
}

