package iPanel.iScene.iPanel.iWindow.iSkill
{
   import flash.display.Sprite;
   import flash.events.MouseEvent;
   import flash.filters.GlowFilter;
   import flash.geom.Point;
   import flash.text.TextField;
   import flash.utils.getDefinitionByName;
   import iData.iSkill.Skill;
   import iGlobal.Global;
   import iPanel.iCell.BasicCell;
   import iPanel.iCell.EquipButton;
   import iPanel.iCell.ItemInfoWindow;
   import tool.MyEvent;
   import tool.MyMath;
   
   public class SkillCell extends BasicCell
   {
      
      public var infoWindow:ItemInfoWindow;
      
      public var text:TextField;
      
      public var skill:Skill;
      
      protected var bg:Sprite;
      
      protected var mc:Sprite;
      
      protected const yellow:uint = 14922250;
      
      protected var lvupButton:EquipButton;
      
      public function SkillCell(param1:Skill)
      {
         this.skill = param1;
         super(200,50);
         this.bg = new Sprite();
         this.bg.graphics.lineStyle(1,13487565,0.8);
         this.bg.graphics.beginFill(16777215,0.95);
         this.bg.graphics.drawRect(0,0,200,50);
         this.bg.graphics.endFill();
         this.addChild(this.bg);
         this.setInfo();
         this.setLvupButton();
         this.update();
         this.addEventListener(MouseEvent.MOUSE_OVER,this.onMouseOver);
         this.addEventListener(MouseEvent.MOUSE_OUT,this.onMouseOut);
      }
      
      private function setInfo() : *
      {
         this.mc = new (getDefinitionByName("mc_" + MyMath.StringFormChange(this.skill.skillData.name.toLowerCase()," ","_")) as Class)();
         this.addChild(this.mc);
         this.mc.width = 30;
         this.mc.height = 30;
         this.mc.x = 10;
         this.mc.y = 10;
         this.text = Global.getTextField(24);
         this.text.width = 140;
         this.text.text = this.skill.skillData.realName + " " + (15 - this.skill.level).toString(16).toUpperCase();
         this.addChild(this.text);
         this.text.x = 50;
         this.text.y = 10;
         this.infoWindow = new ItemInfoWindow(this.skill.getDescription());
      }
      
      public function onMouseOver(param1:MouseEvent) : void
      {
         this.filters = [new GlowFilter(5066061,0.66,13,13)];
         if(this.parent)
         {
            this.parent.addChildAt(this,this.parent.numChildren - 1);
         }
         this.addInfoWindow();
      }
      
      public function onMouseOut(param1:MouseEvent) : void
      {
         this.filters = [];
         this.removeInfoWindow();
      }
      
      private function setLvupButton() : void
      {
         var lvupDown:Function = null;
         lvupDown = function():void
         {
            this.setBefore();
            skill.levelup();
            dispatchEvent(new MyEvent(MyEvent.Update));
         };
         this.lvupButton = new EquipButton("lvup");
         this.addChild(this.lvupButton);
         this.lvupButton.x = 172;
         this.lvupButton.y = 15;
         this.lvupButton.downFunction = lvupDown;
      }
      
      public function update() : *
      {
         this.text.text = this.skill.skillData.realName + " " + (15 - this.skill.level).toString(16).toUpperCase();
         this.removeInfoWindow();
         this.infoWindow = new ItemInfoWindow(this.skill.getDescription());
         if(this.skill.canLevelup())
         {
            this.lvupButton.visible = true;
         }
         else
         {
            this.lvupButton.visible = false;
         }
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

