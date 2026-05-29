package iPanel.iScene.iPanel.iShop
{
   import flash.geom.Point;
   import iData.iItem.Equipment;
   import iGlobal.Global;
   import iGlobal.Player;
   import iPanel.iCell.EquipButton;
   import iPanel.iCell.EquipmentCell;
   import iPanel.iCell.ItemInfoWindow;
   
   public class GambleCell extends EquipmentCell
   {
      
      public var moneyButton:EquipButton;
      
      public var money:int;
      
      private var m_text:String;
      
      public function GambleCell(param1:Equipment)
      {
         super(param1);
         this.money = 10000 + Math.random() * 100000 * (1 + Player.combatPower / 700);
         text.text = equip.realName + "?";
         this.downFunction = setBefore;
         this.updateMoneyButton();
      }
      
      override protected function setEquipButton() : void
      {
      }
      
      public function updateMoneyButton() : *
      {
         if(Player.gold > this.money)
         {
            this.moneyButton.mouseChildren = true;
            this.moneyButton.mouseEnabled = true;
            this.m_text = "<p align=\'right\'>$ " + this.money + "</p>";
         }
         else
         {
            this.moneyButton.mouseChildren = false;
            this.moneyButton.mouseEnabled = false;
            this.m_text = "<p align=\'right\'><font color=\'#ff4040\'>$ " + this.money + "</font></p>";
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
               Player.loseMoney(money);
               if(_this.parent)
               {
                  _this.parent.removeChild(_this);
               }
               Player.save();
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
         this.infoWindow = new ItemInfoWindow("<p align=\'center\'>???</p>" + this.m_text);
         this.addChild(infoWindow);
         infoWindow.x = -135;
         var _loc1_:int = 0;
         var _loc2_:Point = this.localToGlobal(new Point(0,0));
         if(_loc2_.y + infoWindow.height > Global.stage.stageHeight)
         {
            _loc2_ = this.globalToLocal(new Point(0,Global.stage.stageHeight - infoWindow.height));
            _loc1_ = _loc2_.y;
         }
         infoWindow.y = _loc1_;
      }
   }
}

