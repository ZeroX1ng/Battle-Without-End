package iPanel.iCell
{
   import flash.display.Sprite;
   import flash.filters.GlowFilter;
   import flash.geom.ColorTransform;
   import flash.geom.Point;
   import flash.utils.getDefinitionByName;
   import iData.iItem.Equipment;
   import iData.iItem.Weapon;
   import iGlobal.Global;
   import iGlobal.Player;
   import tool.MyEvent;
   
   public class EquipmentCell extends AdvancedCell
   {
      
      public var equip:Equipment;
      
      protected var filter_mc:Sprite;
      
      protected var be_mc:Sprite;
      
      protected var af_mc:Sprite;
      
      protected var equipedInfoWindow:ItemInfoWindow;
      
      public function EquipmentCell(param1:Equipment)
      {
         this.equip = param1;
         super(200,50);
         this.init();
      }
      
      private function init() : void
      {
         this.filter_mc = new Sprite();
         this.filter_mc.graphics.beginFill(16777215);
         this.filter_mc.graphics.drawCircle(15,15,14);
         this.filter_mc.graphics.endFill();
         before.addChild(this.filter_mc);
         this.filter_mc.x = 10;
         this.filter_mc.y = 10;
         if(this.equip is Weapon)
         {
            this.be_mc = new (getDefinitionByName("mc_" + this.equip.type) as Class)();
         }
         else
         {
            this.be_mc = new (getDefinitionByName("mc_" + this.equip.position + "_" + this.equip.type) as Class)();
         }
         before.addChild(this.be_mc);
         this.be_mc.width = 30;
         this.be_mc.height = 30;
         this.be_mc.x = 10;
         this.be_mc.y = 10;
         if(this.equip is Weapon)
         {
            this.af_mc = new (getDefinitionByName("mc_" + this.equip.type) as Class)();
         }
         else
         {
            this.af_mc = new (getDefinitionByName("mc_" + this.equip.position + "_" + this.equip.type) as Class)();
         }
         after.addChild(this.af_mc);
         this.af_mc.width = 30;
         this.af_mc.height = 30;
         this.af_mc.x = 10;
         this.af_mc.y = 10;
         this.af_mc.transform.colorTransform = new ColorTransform(1,1,1,1,255,255,255,0);
         text = Global.getTextField(24);
         text.width = 110;
         text.htmlText = this.equip.getNameHTML();
         if(this.equip.level)
         {
            text.htmlText += " +" + this.equip.level;
         }
         this.addChild(text);
         text.x = 50;
         text.y = 10;
         this.setEquipButton();
         this.setMoneyButton();
         this.setFilter();
         this.infoWindow = new ItemInfoWindow(this.equip.getDescription());
      }
      
      public function update() : *
      {
         this.removeInfoWindow();
         this.infoWindow = new ItemInfoWindow(this.equip.getDescription());
         text.htmlText = this.equip.getNameHTML();
         if(this.equip.level)
         {
            text.htmlText += " +" + this.equip.level;
         }
         html = this.equip.getNameHTML() + " +" + this.equip.level;
         if(buttonDown)
         {
            this.addInfoWindow();
         }
         this.setFilter();
      }
      
      private function setFilter() : *
      {
         if(this.equip.level >= 7)
         {
            this.filter_mc.filters = [new GlowFilter(16711680,0.66,this.equip.level + 3,this.equip.level + 3)];
            this.af_mc.filters = [new GlowFilter(5066061,0.66,13,13)];
            text.filters = [new GlowFilter(16777215,0.66,5,5)];
         }
      }
      
      protected function setEquipButton() : void
      {
         var equipDown:Function = null;
         equipDown = function():void
         {
            Player.removeItem(equip);
            Player.equip(equip);
            dispatchEvent(new MyEvent(MyEvent.Update));
         };
         var equipButton:EquipButton = new EquipButton("equip");
         this.addChild(equipButton);
         equipButton.x = 150;
         equipButton.y = 15;
         equipButton.downFunction = equipDown;
      }
      
      protected function setMoneyButton() : void
      {
         var moneyDown:Function = null;
         moneyDown = function():void
         {
            Player.removeItem(equip);
            Player.addMoney(equip.getMoney());
            dispatchEvent(new MyEvent(MyEvent.Update));
         };
         var moneyButton:EquipButton = new EquipButton("money");
         this.addChild(moneyButton);
         moneyButton.x = 172;
         moneyButton.y = 15;
         moneyButton.downFunction = moneyDown;
      }
      
      override protected function addInfoWindow() : *
      {
         var _loc1_:String = null;
         var _loc2_:Point = null;
         super.addInfoWindow();
         if(this.equip is Weapon)
         {
            switch(this.equip.position)
            {
               case Weapon.ONEHAND:
                  _loc1_ = "leftHand";
                  break;
               case Weapon.OFFHAND:
                  _loc1_ = "rightHand";
                  break;
               case Weapon.TWOHAND:
                  _loc1_ = "leftHand";
            }
         }
         else
         {
            _loc1_ = this.equip.position;
         }
         if(Player[_loc1_])
         {
            this.equipedInfoWindow = new ItemInfoWindow(Player[_loc1_].getDescription());
            this.addChild(this.equipedInfoWindow);
            this.equipedInfoWindow.x = -270;
            this.equipedInfoWindow.y = 0;
            _loc2_ = this.localToGlobal(new Point(0,0));
            if(_loc2_.y + this.equipedInfoWindow.height > Global.stage.stageHeight)
            {
               _loc2_ = this.globalToLocal(new Point(0,Global.stage.stageHeight - this.equipedInfoWindow.height));
               this.equipedInfoWindow.y = _loc2_.y;
            }
         }
      }
      
      override protected function removeInfoWindow() : *
      {
         super.removeInfoWindow();
         if(this.equipedInfoWindow)
         {
            this.removeChild(this.equipedInfoWindow);
            this.equipedInfoWindow = null;
         }
      }
   }
}

