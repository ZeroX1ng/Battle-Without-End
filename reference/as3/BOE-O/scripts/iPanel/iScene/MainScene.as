package iPanel.iScene
{
   import flash.display.Sprite;
   import iData.Battle;
   import iGlobal.Global;
   import iPanel.iBar.Bar;
   import iPanel.iScene.iPanel.AllInfoPanel;
   import iPanel.iScene.iPanel.BattleSkillPanel;
   import iPanel.iScene.iPanel.HelpPanel;
   import iPanel.iScene.iPanel.LootPanel;
   import iPanel.iScene.iPanel.MonsterInfoPanel;
   import iPanel.iScene.iPanel.OtherPanel;
   import iPanel.iScene.iPanel.PetInfoPanel;
   import iPanel.iScene.iPanel.PlayerInfoPanel;
   import iPanel.iScene.iPanel.ShopPanel;
   import iPanel.iScene.iPanel.SpecialShopPanel;
   import tool.FPSShow;
   
   public class MainScene extends Sprite
   {
      
      public static var playerInfoPanel:PlayerInfoPanel;
      
      public static var monsterInfoPanel:MonsterInfoPanel;
      
      public static var petInfoPanel:PetInfoPanel;
      
      public static var otherPanel:OtherPanel;
      
      public static var battleSkillPanel:BattleSkillPanel;
      
      public static var allInfoPanel:AllInfoPanel;
      
      public static var xpBar:Bar;
      
      public static var lootPanel:LootPanel;
      
      public static var battle:Battle;
      
      public function MainScene()
      {
         super();
         this.setBackground();
         this.setPlayerInfo();
         this.setMonsterInfo();
         this.setPetInfo();
         this.setBattleSkillPanel();
         this.setAllInfoPanel();
         this.setLootPanel();
         this.setOther();
         this.setBattle();
         this.addChild(new FPSShow());
         Global.shopPanel = new ShopPanel();
         Global.helpPanel = new HelpPanel();
         Global.specialShopPanel = new SpecialShopPanel();
      }
      
      private function setBackground() : void
      {
         var _loc1_:Sprite = new Sprite();
         _loc1_.graphics.beginFill(12632256,1);
         _loc1_.graphics.drawRect(0,0,800,600);
         _loc1_.graphics.endFill();
         this.addChild(_loc1_);
      }
      
      private function setPlayerInfo() : void
      {
         playerInfoPanel = new PlayerInfoPanel();
         this.addChild(playerInfoPanel);
         playerInfoPanel.x = 10;
         playerInfoPanel.y = 10;
      }
      
      private function setMonsterInfo() : void
      {
         monsterInfoPanel = new MonsterInfoPanel();
         this.addChild(monsterInfoPanel);
         monsterInfoPanel.x = 400;
         monsterInfoPanel.y = 10;
      }
      
      private function setPetInfo() : void
      {
         petInfoPanel = new PetInfoPanel();
         this.addChild(petInfoPanel);
         petInfoPanel.x = 400;
         petInfoPanel.y = 150;
      }
      
      private function setOther() : void
      {
         otherPanel = new OtherPanel();
         this.addChild(otherPanel);
         otherPanel.x = 590;
         otherPanel.y = 10;
      }
      
      private function setBattleSkillPanel() : void
      {
         battleSkillPanel = new BattleSkillPanel();
         this.addChild(battleSkillPanel);
         battleSkillPanel.x = 415;
         battleSkillPanel.y = 235;
      }
      
      private function setAllInfoPanel() : void
      {
         allInfoPanel = new AllInfoPanel();
         this.addChild(allInfoPanel);
         allInfoPanel.x = 10;
         allInfoPanel.y = 235;
      }
      
      private function setBattle() : void
      {
         battle = new Battle();
         battle.init();
      }
      
      private function setXpBar() : void
      {
         xpBar = new Bar(575,100,7932074,"exp: ");
         this.addChild(xpBar);
         xpBar.x = 10;
         xpBar.y = 235;
      }
      
      private function setLootPanel() : void
      {
         lootPanel = new LootPanel();
         this.addChild(lootPanel);
         lootPanel.x = 415;
         lootPanel.y = 405;
      }
   }
}

