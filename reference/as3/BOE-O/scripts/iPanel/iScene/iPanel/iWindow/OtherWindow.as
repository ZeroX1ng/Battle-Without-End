package iPanel.iScene.iPanel.iWindow
{
   import flash.display.Sprite;
   import iData.iPlayer.TitleList;
   import iGlobal.Global;
   import iGlobal.Player;
   import iPanel.iCell.BasicCell;
   import iPanel.iCell.StringCell;
   import iPanel.iScene.MainScene;
   import iPanel.iScene.RaceScene;
   import iPanel.iScene.iPanel.iWindow.iSystem.ClickButton;
   import iPanel.iScene.iPanel.iWindow.iSystem.iMap.MapPanel;
   import tool.Effect;
   
   public class OtherWindow extends Window
   {
      
      public var mapPanel:MapPanel;
      
      private var rebirth:ClickButton;
      
      public function OtherWindow()
      {
         super();
         var _loc1_:Sprite = new BasicCell(200,540);
         this.addChild(_loc1_);
         this.setMap();
         this.setHelp();
         this.setShop();
         this.setSpecialShop();
         this.setRebirth();
         this.setSave();
      }
      
      private function setHelp() : *
      {
         var help_text:StringCell;
         var helpDown:Function = null;
         helpDown = function():*
         {
            Global.stage.addChild(Global.helpPanel);
            Global.helpPanel.visible = true;
            this.setBefore();
         };
         var help:ClickButton = new ClickButton("button_help",50);
         this.addChild(help);
         help.x = 10;
         help.y = 100;
         help.downFunction = helpDown;
         help_text = new StringCell("帮助",100,32);
         this.addChild(help_text);
         help_text.x = 100;
         help_text.y = 100;
      }
      
      private function setMap() : *
      {
         var mapButton:ClickButton;
         var text:StringCell;
         var mapDown:Function = null;
         mapDown = function():void
         {
            Global.stage.addChild(mapPanel);
            mapPanel.visible = true;
         };
         this.mapPanel = new MapPanel();
         mapButton = new ClickButton("button_map",50);
         this.addChild(mapButton);
         mapButton.x = 10;
         mapButton.y = 10;
         mapButton.downFunction = mapDown;
         text = new StringCell("地图",100,32);
         this.addChild(text);
         text.x = 100;
         text.y = 10;
      }
      
      private function setShop() : *
      {
         var shop_text:StringCell;
         var shopDown:Function = null;
         shopDown = function():*
         {
            Global.stage.addChild(Global.shopPanel);
            Global.shopPanel.visible = true;
            this.setBefore();
         };
         var shop:ClickButton = new ClickButton("button_shop",50);
         this.addChild(shop);
         shop.x = 10;
         shop.y = 200;
         shop.downFunction = shopDown;
         shop_text = new StringCell("商店",100,32);
         this.addChild(shop_text);
         shop_text.x = 100;
         shop_text.y = 200;
      }
      
      private function setSpecialShop() : *
      {
         var specialShop_text:StringCell;
         var specialShopDown:Function = null;
         specialShopDown = function():*
         {
            Global.stage.addChild(Global.specialShopPanel);
            Global.specialShopPanel.visible = true;
            this.setBefore();
         };
         var specialShop:ClickButton = new ClickButton("button_shop",50);
         this.addChild(specialShop);
         specialShop.x = 10;
         specialShop.y = 280;
         specialShop.downFunction = specialShopDown;
         specialShop_text = new StringCell("特殊商店",150,32);
         this.addChild(specialShop_text);
         specialShop_text.x = 60;
         specialShop_text.y = 280;
      }
      
      private function setRebirth() : *
      {
         var rebirth_text:StringCell;
         var intro:StringCell;
         var rebirthDown:Function = null;
         rebirthDown = function():void
         {
            var _loc1_:RaceScene = new RaceScene();
            Global.stage.addChild(_loc1_);
            Effect.gradientIn(_loc1_);
            rebirth.mouseEnabled = false;
            rebirth.mouseChildren = false;
            TitleList.updateTitleInfo("reborn");
            Player.caculate = 0;
         };
         this.rebirth = new ClickButton("button_rebirth",50);
         this.addChild(this.rebirth);
         this.rebirth.x = 10;
         this.rebirth.y = 350;
         this.rebirth.downFunction = rebirthDown;
         this.updateBirth();
         rebirth_text = new StringCell("转生",100,32);
         this.addChild(rebirth_text);
         rebirth_text.x = 100;
         rebirth_text.y = 350;
         intro = new StringCell("当你达到20岁之后",150,16);
         this.addChild(intro);
         intro.x = 35;
         intro.y = 400;
         intro = new StringCell("可以选择转生",150,16);
         this.addChild(intro);
         intro.x = 40;
         intro.y = 420;
         intro = new StringCell("技能和装备会保留",150,16);
         this.addChild(intro);
         intro.x = 40;
         intro.y = 440;
      }
      
      private function setSave() : *
      {
         var save_text:StringCell;
         var s_t:StringCell;
         var saveDown:Function = null;
         saveDown = function():void
         {
            Player.save();
            MainScene.allInfoPanel.addText("记录已经保存!");
         };
         var save:ClickButton = new ClickButton("button_save",50);
         this.addChild(save);
         save.x = 10;
         save.y = 470;
         save.downFunction = saveDown;
         save_text = new StringCell("保存",100,32);
         this.addChild(save_text);
         save_text.x = 100;
         save_text.y = 470;
         s_t = new StringCell("自动保存/30s",100,16);
         this.addChild(s_t);
         s_t.x = 80;
         s_t.y = 510;
      }
      
      public function updateBirth() : *
      {
         if(Player.age >= 20)
         {
            this.rebirth.mouseEnabled = true;
            this.rebirth.mouseChildren = true;
         }
         else
         {
            this.rebirth.mouseEnabled = false;
            this.rebirth.mouseChildren = false;
         }
      }
   }
}

