package iPanel.iScene.iPanel
{
   import flash.display.Sprite;
   import iData.iItem.Equipment;
   import iData.iItem.EquipmentData;
   import iData.iItem.EquipmentList;
   import iData.iItem.Weapon;
   import iData.iItem.WeaponData;
   import iGlobal.Player;
   import iPanel.iCell.BasicCell;
   import iPanel.iCell.StringCell;
   import iPanel.iScene.FlickerButton;
   import iPanel.iScene.iPanel.iShop.GambleCell;
   import iPanel.iScene.iPanel.iShop.ShopCell;
   
   public class ShopPanel extends BasicCell
   {
      
      private const gap:int = 50;
      
      private const startX1:int = 50;
      
      private const startY1:int = 110;
      
      private const startX2:int = 250;
      
      private var itemPanel:Sprite;
      
      private var time:StringCell;
      
      private var gold:StringCell;
      
      public function ShopPanel()
      {
         super(550,500);
         this.graphics.lineStyle(2,7631988);
         this.graphics.drawRect(0,0,550,500);
         this.init();
      }
      
      private function init() : *
      {
         var title:StringCell;
         var equip_text:StringCell;
         var gamble_text:StringCell;
         var hide:FlickerButton;
         var _this:* = undefined;
         var hideDown:Function = null;
         hideDown = function():*
         {
            _this.visible = false;
            this.setBefore();
         };
         this.time = new StringCell("1200",100,32);
         this.addChild(this.time);
         this.time.x = 450;
         this.time.y = 460;
         this.gold = new StringCell("金钱",200,32);
         this.addChild(this.gold);
         this.gold.x = 30;
         this.gold.y = 460;
         title = new StringCell("商店",300,54);
         this.addChild(title);
         title.x = 200;
         title.y = 10;
         equip_text = new StringCell("出售",100,32);
         this.addChild(equip_text);
         equip_text.x = 100;
         equip_text.y = 70;
         gamble_text = new StringCell("赌博",100,32);
         this.addChild(gamble_text);
         gamble_text.x = 350;
         gamble_text.y = 70;
         this.itemPanel = new Sprite();
         this.addChild(this.itemPanel);
         this.itemPanel.x = this.startX1;
         this.itemPanel.y = this.startY1;
         this.updateTime();
         hide = new FlickerButton("退出",100,48);
         this.addChild(hide);
         hide.x = 420;
         hide.y = 10;
         hide.downFunction = hideDown;
         _this = this;
         this.updateShop();
      }
      
      public function updateTime() : *
      {
         var _loc1_:int = Player.caculate % 600;
         _loc1_ = 600 - _loc1_;
         var _loc2_:int = _loc1_ / 120;
         var _loc3_:int = (_loc1_ - _loc2_ * 120) / 2;
         this.time.setText(_loc2_ + ":" + _loc3_);
         this.gold.setText("金钱: " + Player.gold);
      }
      
      public function updateMoneyButton() : *
      {
         var _loc2_:* = undefined;
         var _loc1_:int = 0;
         while(_loc1_ < this.itemPanel.numChildren)
         {
            _loc2_ = this.itemPanel.getChildAt(_loc1_);
            if(_loc2_ is GambleCell)
            {
               (_loc2_ as GambleCell).updateMoneyButton();
            }
            else
            {
               (_loc2_ as ShopCell).updateMoneyButton();
            }
            _loc1_++;
         }
      }
      
      public function updateShop() : *
      {
         var _loc1_:* = 0;
         var _loc2_:Number = NaN;
         var _loc3_:EquipmentData = null;
         var _loc4_:Equipment = null;
         var _loc5_:ShopCell = null;
         var _loc6_:GambleCell = null;
         _loc1_ = int(this.itemPanel.numChildren - 1);
         while(_loc1_ >= 0)
         {
            this.itemPanel.removeChildAt(_loc1_);
            _loc1_--;
         }
         _loc1_ = 0;
         while(_loc1_ < 7)
         {
            _loc2_ = Math.random() * 3 * (1 + Player.luck / 400) * (1 + Player.combatPower / 1000);
            _loc3_ = EquipmentList.list[EquipmentList.list.length * Math.random() >> 0];
            if(_loc3_ is WeaponData)
            {
               _loc4_ = new Weapon(_loc3_ as WeaponData,_loc2_);
            }
            else
            {
               _loc4_ = new Equipment(_loc3_,_loc2_);
            }
            _loc5_ = new ShopCell(_loc4_);
            this.itemPanel.addChild(_loc5_);
            _loc5_.x = 0;
            _loc5_.y = _loc1_ * this.gap;
            _loc1_++;
         }
         _loc1_ = 0;
         while(_loc1_ < 7)
         {
            _loc2_ = Math.random() * 6 * (1 + Player.luck / 200) * (1 + Player.combatPower / 700);
            _loc3_ = EquipmentList.list[EquipmentList.list.length * Math.random() >> 0];
            if(_loc3_ is WeaponData)
            {
               _loc4_ = new Weapon(_loc3_ as WeaponData,_loc2_);
            }
            else
            {
               _loc4_ = new Equipment(_loc3_,_loc2_);
            }
            _loc6_ = new GambleCell(_loc4_);
            this.itemPanel.addChild(_loc6_);
            _loc6_.x = this.startX2;
            _loc6_.y = _loc1_ * this.gap;
            _loc1_++;
         }
      }
   }
}

