package iPanel.iScene.iPanel
{
   import iGlobal.Player;
   import iPanel.iCell.BasicCell;
   import iPanel.iCell.StringCell;
   import iPanel.iScene.FlickerButton;
   import iPanel.iScene.MainScene;
   import iPanel.iScene.iPanel.iWindow.iSystem.ClickButton;
   
   public class SpecialShopPanel extends BasicCell
   {
      
      private var bag:ClickButton;
      
      private var pet:ClickButton;
      
      private var bag_cost:StringCell;
      
      private var pet_cost:StringCell;
      
      private var bCost:int;
      
      private var pCost:int;
      
      public function SpecialShopPanel()
      {
         super(550,500);
         this.graphics.lineStyle(2,7631988);
         this.graphics.drawRect(0,0,550,500);
         this.init();
      }
      
      private function init() : *
      {
         var hide:FlickerButton;
         var bag_text:StringCell;
         var pet_text:StringCell;
         var _this:* = undefined;
         var hideDown:Function = null;
         var bagDown:Function = null;
         var petDown:Function = null;
         hideDown = function():*
         {
            _this.visible = false;
            this.setBefore();
         };
         bagDown = function():*
         {
            Player.loseMoney(bCost);
            ++Player.BAGMAX;
            MainScene.otherPanel.itemWindow.updateBagText();
            this.setBefore();
         };
         petDown = function():*
         {
            Player.loseMoney(pCost);
            ++Player.PETMAX;
            MainScene.otherPanel.petWindow.update();
            this.setBefore();
         };
         var title:StringCell = new StringCell("特殊商店",300,54);
         this.addChild(title);
         title.x = 170;
         title.y = 10;
         hide = new FlickerButton("退出",100,48);
         this.addChild(hide);
         hide.x = 420;
         hide.y = 10;
         hide.downFunction = hideDown;
         _this = this;
         this.bag = new ClickButton("button_bagSlot",100);
         this.addChild(this.bag);
         this.bag.x = 50;
         this.bag.y = 100;
         this.bag.downFunction = bagDown;
         bag_text = new StringCell("背包拓展",100,32);
         this.addChild(bag_text);
         bag_text.x = 50;
         bag_text.y = 200;
         this.bag_cost = new StringCell("",120,32);
         this.addChild(this.bag_cost);
         this.bag_cost.x = 50;
         this.bag_cost.y = 250;
         this.pet = new ClickButton("button_petSlot",100);
         this.addChild(this.pet);
         this.pet.x = 400;
         this.pet.y = 100;
         this.pet.downFunction = petDown;
         pet_text = new StringCell("宠物拓展",100,32);
         this.addChild(pet_text);
         pet_text.x = 400;
         pet_text.y = 200;
         this.pet_cost = new StringCell("",120,32);
         this.addChild(this.pet_cost);
         this.pet_cost.x = 400;
         this.pet_cost.y = 250;
         this.update();
      }
      
      public function update() : *
      {
         this.bCost = (Player.BAGMAX - 49) * 1000000;
         this.pCost = (Player.PETMAX - 9) * 5000000;
         if(Player.BAGMAX >= 100)
         {
            this.bCost = -1;
         }
         if(Player.PETMAX >= 20)
         {
            this.pCost = -1;
         }
         if(Player.gold >= this.bCost && this.bCost != -1)
         {
            this.bag_cost.setText("$" + this.bCost);
            this.bag.mouseChildren = true;
            this.bag.mouseEnabled = true;
         }
         else if(Player.gold < this.bCost && this.bCost != -1)
         {
            this.bag_cost.setText("<font color=\'#ff4040\'>$" + this.bCost + "</font>");
            this.bag.mouseChildren = false;
            this.bag.mouseEnabled = false;
         }
         else
         {
            this.bag_cost.setText("最大");
            this.bag.mouseChildren = false;
            this.bag.mouseEnabled = false;
         }
         if(Player.gold >= this.pCost && this.pCost != -1)
         {
            this.pet_cost.setText("$" + this.pCost);
            this.pet.mouseChildren = true;
            this.pet.mouseEnabled = true;
         }
         else if(Player.gold < this.pCost && this.pCost != -1)
         {
            this.pet_cost.setText("<font color=\'#ff4040\'>$" + this.pCost + "</font>");
            this.pet.mouseChildren = false;
            this.pet.mouseEnabled = false;
         }
         else
         {
            this.pet_cost.setText("最大");
            this.pet.mouseChildren = false;
            this.pet.mouseEnabled = false;
         }
      }
   }
}

