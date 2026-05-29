package iPanel.iScene.iPanel.iShop
{
   import flash.geom.Point;
   import iData.iItem.Equipment;
   import iData.iItem.Weapon;
   import iGlobal.Global;
   import iGlobal.Player;
   import iPanel.iCell.EquipButton;
   import iPanel.iCell.EquipmentCell;
   import iPanel.iCell.ItemInfoWindow;
   
   public class ShopCell extends EquipmentCell
   {
      
      public var moneyButton:EquipButton;
      
      private var m_text:String;
      
      public function ShopCell(param1:Equipment)
      {
         super(param1);
         this.downFunction = setBefore;
         this.updateMoneyButton();
      }
      
      override protected function setEquipButton() : void
      {
      }
      
      public function updateMoneyButton() : *
      {
         if(Player.gold > equip.getSellMoney())
         {
            this.moneyButton.mouseChildren = true;
            this.moneyButton.mouseEnabled = true;
            this.m_text = "";
         }
         else
         {
            this.moneyButton.mouseChildren = false;
            this.moneyButton.mouseEnabled = false;
            this.m_text = "<font color=\'#ff4040\'>Can\'t afford</font>";
         }
      }
      
      override protected function setMoneyButton() : void
      {
         var _this:* = undefined;
         var moneyDown:Function = null;
         moneyDown = function():void
         {
            if(Player.addItem(equip))
            {
               Player.loseMoney(equip.getSellMoney());
               if(_this.parent)
               {
                  _this.parent.removeChild(_this);
               }
            }
            this.setBefore();
         };
         this.moneyButton = new EquipButton("money");
         this.addChild(this.moneyButton);
         this.moneyButton.x = 172;
         this.moneyButton.y = 15;
         this.moneyButton.downFunction = moneyDown;
         _this = this;
      }
      
      override protected function addInfoWindow() : *
      {
         var _loc3_:String = null;
         this.infoWindow = new ItemInfoWindow(this.equip.getSellDesciption() + this.m_text);
         this.addChild(infoWindow);
         infoWindow.x = 205;
         var _loc1_:int = 0;
         var _loc2_:Point = this.localToGlobal(new Point(0,0));
         if(_loc2_.y + infoWindow.height > Global.stage.stageHeight)
         {
            _loc2_ = this.globalToLocal(new Point(0,Global.stage.stageHeight - infoWindow.height));
            _loc1_ = _loc2_.y;
         }
         infoWindow.y = _loc1_;
         if(equip is Weapon)
         {
            switch(equip.position)
            {
               case Weapon.ONEHAND:
                  _loc3_ = "leftHand";
                  break;
               case Weapon.OFFHAND:
                  _loc3_ = "rightHand";
                  break;
               case Weapon.TWOHAND:
                  _loc3_ = "leftHand";
            }
         }
         else
         {
            _loc3_ = equip.position;
         }
         if(Player[_loc3_])
         {
            this.equipedInfoWindow = new ItemInfoWindow(Player[_loc3_].getDescription());
            this.addChild(equipedInfoWindow);
            equipedInfoWindow.x = 340;
            equipedInfoWindow.y = _loc1_;
         }
      }
   }
}

