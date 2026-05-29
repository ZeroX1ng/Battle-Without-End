package iPanel.iScene.iPanel.iWindow
{
   import flash.display.Sprite;
   import iData.iItem.Equipment;
   import iGlobal.Global;
   import iPanel.iCell.BasicCell;
   import iPanel.iCell.StringCell;
   import iPanel.iScene.iPanel.iWindow.iSystem.ToggleBox;
   
   public class SystemWindow extends Window
   {
      
      private var startX:int = 10;
      
      private var startY:int = 10;
      
      private var gapY:int = 30;
      
      private var gapX:int = 70;
      
      private var gapBigY:int = 60;
      
      private var fontSize_small:int = 16;
      
      private var fontSize_meddle:int = 24;
      
      private var fontSize_big:int = 32;
      
      private var lootStartX:int = 10;
      
      private var lootStartY:int = 110;
      
      private var lootGapSmallY:int = 20;
      
      private var lootGapY:int = 25;
      
      private var lootGapMidY:int = 45;
      
      private var lootGapBitY:int = 65;
      
      private var lootGapX:int = 65;
      
      public function SystemWindow()
      {
         super();
         var _loc1_:Sprite = new BasicCell(200,540);
         this.addChild(_loc1_);
         this.setToggle();
         this.setItemToggle();
      }
      
      private function setToggle() : *
      {
         var battle:ToggleBox;
         var battleIntro:ToggleBox;
         var money:ToggleBox;
         var exp:ToggleBox;
         var item:ToggleBox;
         var battleDown:Function = null;
         var battleUp:Function = null;
         var battleIntroDown:Function = null;
         var battleIntroUp:Function = null;
         var moneyDown:Function = null;
         var moneyUp:Function = null;
         var expDown:Function = null;
         var expUp:Function = null;
         var itemDown:Function = null;
         var itemUp:Function = null;
         battleDown = function():*
         {
            Global.battle_toggle = true;
         };
         battleUp = function():*
         {
            Global.battle_toggle = false;
         };
         battleIntroDown = function():*
         {
            Global.battleIntro_toggle = true;
         };
         battleIntroUp = function():*
         {
            Global.battleIntro_toggle = false;
         };
         moneyDown = function():*
         {
            Global.money_toggle = true;
         };
         moneyUp = function():*
         {
            Global.money_toggle = false;
         };
         expDown = function():*
         {
            Global.exp_toggle = true;
         };
         expUp = function():*
         {
            Global.exp_toggle = false;
         };
         itemDown = function():*
         {
            Global.item_toggle = true;
         };
         itemUp = function():*
         {
            Global.item_toggle = false;
         };
         var text:StringCell = new StringCell("日志显示",150,this.fontSize_big);
         this.addChild(text);
         text.x = 5;
         text.y = 10;
         battle = new ToggleBox("战况",this.fontSize_small,Global.battle_toggle);
         this.addChild(battle);
         battle.x = 10;
         battle.y = 60;
         battle.downFunction = battleDown;
         battle.upFunction = battleUp;
         battleIntro = new ToggleBox("战果",this.fontSize_small,Global.battleIntro_toggle);
         this.addChild(battleIntro);
         battleIntro.x = 70;
         battleIntro.y = 60;
         battleIntro.downFunction = battleIntroDown;
         battleIntro.upFunction = battleIntroUp;
         money = new ToggleBox("$",this.fontSize_small,Global.money_toggle);
         this.addChild(money);
         money.x = 140;
         money.y = 60;
         money.downFunction = moneyDown;
         money.upFunction = moneyUp;
         exp = new ToggleBox("Exp",this.fontSize_small,Global.exp_toggle);
         this.addChild(exp);
         exp.x = 10;
         exp.y = 90;
         exp.downFunction = expDown;
         exp.upFunction = expUp;
         item = new ToggleBox("道具",this.fontSize_small,Global.item_toggle);
         this.addChild(item);
         item.x = 70;
         item.y = 90;
         item.downFunction = itemDown;
         item.upFunction = itemUp;
      }
      
      private function setItemToggle() : *
      {
         var item0:ToggleBox;
         var item1:ToggleBox;
         var item2:ToggleBox;
         var item3:ToggleBox;
         var item4:ToggleBox;
         var item5:ToggleBox;
         var item0Down:Function = null;
         var item0Up:Function = null;
         var item1Down:Function = null;
         var item1Up:Function = null;
         var item2Down:Function = null;
         var item2Up:Function = null;
         var item3Down:Function = null;
         var item3Up:Function = null;
         var item4Down:Function = null;
         var item4Up:Function = null;
         var item5Down:Function = null;
         var item5Up:Function = null;
         item0Down = function():*
         {
            Global.item0_toggle = true;
         };
         item0Up = function():*
         {
            Global.item0_toggle = false;
         };
         item1Down = function():*
         {
            Global.item1_toggle = true;
         };
         item1Up = function():*
         {
            Global.item1_toggle = false;
         };
         item2Down = function():*
         {
            Global.item2_toggle = true;
         };
         item2Up = function():*
         {
            Global.item2_toggle = false;
         };
         item3Down = function():*
         {
            Global.item3_toggle = true;
         };
         item3Up = function():*
         {
            Global.item3_toggle = false;
         };
         item4Down = function():*
         {
            Global.item4_toggle = true;
         };
         item4Up = function():*
         {
            Global.item4_toggle = false;
         };
         item5Down = function():*
         {
            Global.item5_toggle = true;
         };
         item5Up = function():*
         {
            Global.item5_toggle = false;
         };
         var text:StringCell = new StringCell("道具拾取",150,this.fontSize_big);
         this.addChild(text);
         text.x = 5;
         text.y = this.lootStartY;
         item0 = new ToggleBox("基础",this.fontSize_small,Global.item0_toggle);
         this.addChild(item0);
         item0.x = this.lootStartX;
         item0.y = this.lootStartY + this.lootGapMidY * 1;
         item0.downFunction = item0Down;
         item0.upFunction = item0Up;
         item1 = new ToggleBox("<font color=\'" + Equipment.GREEN + "\'>精品</font>",this.fontSize_small,Global.item1_toggle);
         this.addChild(item1);
         item1.x = this.lootStartX + this.lootGapX * 1;
         item1.y = this.lootStartY + this.lootGapMidY * 1;
         item1.downFunction = item1Down;
         item1.upFunction = item1Up;
         item2 = new ToggleBox("<font color=\'" + Equipment.BLUE + "\'>稀有</font>",this.fontSize_small,Global.item2_toggle);
         this.addChild(item2);
         item2.x = this.lootStartX + this.lootGapX * 2;
         item2.y = this.lootStartY + this.lootGapMidY * 1;
         item2.downFunction = item2Down;
         item2.upFunction = item2Up;
         item3 = new ToggleBox("<font color=\'" + Equipment.YELLOW + "\'>完美</font>",this.fontSize_small,Global.item3_toggle);
         this.addChild(item3);
         item3.x = this.lootStartX + this.lootGapX * 0;
         item3.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapY * 1;
         item3.downFunction = item3Down;
         item3.upFunction = item3Up;
         item4 = new ToggleBox("<font color=\'" + Equipment.ORANGE + "\'>史诗</font>",this.fontSize_small,Global.item4_toggle);
         this.addChild(item4);
         item4.x = this.lootStartX + this.lootGapX * 1;
         item4.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapY * 1;
         item4.downFunction = item4Down;
         item4.upFunction = item4Up;
         item5 = new ToggleBox("<font color=\'" + Equipment.PURPLE + "\'>传奇</font>",this.fontSize_small,Global.item5_toggle);
         this.addChild(item5);
         item5.x = this.lootStartX + this.lootGapX * 2;
         item5.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapY * 1;
         item5.downFunction = item5Down;
         item5.upFunction = item5Up;
         this.setWeaponToggle();
         this.setOffhand();
         this.setHead();
         this.setBody();
         this.setFeet();
         this.setAccessory();
      }
      
      private function setWeaponToggle() : *
      {
         var sword:ToggleBox;
         var axe:ToggleBox;
         var bow:ToggleBox;
         var crossbow:ToggleBox;
         var sceptre:ToggleBox;
         var staff:ToggleBox;
         var swordDown:Function = null;
         var swordUp:Function = null;
         var axeDown:Function = null;
         var axeUp:Function = null;
         var bowDown:Function = null;
         var bowUp:Function = null;
         var crossbowDown:Function = null;
         var crossbowUp:Function = null;
         var sceptreDown:Function = null;
         var sceptreUp:Function = null;
         var staffDown:Function = null;
         var staffUp:Function = null;
         swordDown = function():*
         {
            Global.sword_toggle = true;
         };
         swordUp = function():*
         {
            Global.sword_toggle = false;
         };
         axeDown = function():*
         {
            Global.axe_toggle = true;
         };
         axeUp = function():*
         {
            Global.axe_toggle = false;
         };
         bowDown = function():*
         {
            Global.bow_toggle = true;
         };
         bowUp = function():*
         {
            Global.bow_toggle = false;
         };
         crossbowDown = function():*
         {
            Global.crossbow_toggle = true;
         };
         crossbowUp = function():*
         {
            Global.crossbow_toggle = false;
         };
         sceptreDown = function():*
         {
            Global.sceptre_toggle = true;
         };
         sceptreUp = function():*
         {
            Global.sceptre_toggle = false;
         };
         staffDown = function():*
         {
            Global.staff_toggle = true;
         };
         staffUp = function():*
         {
            Global.staff_toggle = false;
         };
         var text:StringCell = new StringCell("武器拾取",150,20);
         this.addChild(text);
         text.x = this.lootStartX + this.lootGapX * 0;
         text.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 1 + this.lootGapY * 1;
         sword = new ToggleBox("剑",this.fontSize_small,Global.sword_toggle);
         this.addChild(sword);
         sword.x = this.lootStartX + this.lootGapX * 0;
         sword.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 1 + this.lootGapY * 2;
         sword.downFunction = swordDown;
         sword.upFunction = swordUp;
         axe = new ToggleBox("斧",this.fontSize_small,Global.axe_toggle);
         this.addChild(axe);
         axe.x = this.lootStartX + this.lootGapX * 1;
         axe.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 1 + this.lootGapY * 2;
         axe.downFunction = axeDown;
         axe.upFunction = axeUp;
         bow = new ToggleBox("弓",this.fontSize_small,Global.bow_toggle);
         this.addChild(bow);
         bow.x = this.lootStartX + this.lootGapX * 2;
         bow.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 1 + this.lootGapY * 2;
         bow.downFunction = bowDown;
         bow.upFunction = bowUp;
         crossbow = new ToggleBox("弩",this.fontSize_small,Global.crossbow_toggle);
         this.addChild(crossbow);
         crossbow.x = this.lootStartX + this.lootGapX * 0;
         crossbow.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 1 + this.lootGapY * 3;
         crossbow.downFunction = crossbowDown;
         crossbow.upFunction = crossbowUp;
         sceptre = new ToggleBox("权杖",this.fontSize_small,Global.sceptre_toggle);
         this.addChild(sceptre);
         sceptre.x = this.lootStartX + this.lootGapX * 1;
         sceptre.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 1 + this.lootGapY * 3;
         sceptre.downFunction = sceptreDown;
         sceptre.upFunction = sceptreUp;
         staff = new ToggleBox("法杖",this.fontSize_small,Global.staff_toggle);
         this.addChild(staff);
         staff.x = this.lootStartX + this.lootGapX * 2;
         staff.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 1 + this.lootGapY * 3;
         staff.downFunction = staffDown;
         staff.upFunction = staffUp;
      }
      
      private function setOffhand() : *
      {
         var dagger:ToggleBox;
         var tome:ToggleBox;
         var shield:ToggleBox;
         var daggerDown:Function = null;
         var daggerUp:Function = null;
         var tomeDown:Function = null;
         var tomeUp:Function = null;
         var shieldDown:Function = null;
         var shieldUp:Function = null;
         daggerDown = function():*
         {
            Global.dagger_toggle = true;
         };
         daggerUp = function():*
         {
            Global.dagger_toggle = false;
         };
         tomeDown = function():*
         {
            Global.tome_toggle = true;
         };
         tomeUp = function():*
         {
            Global.tome_toggle = false;
         };
         shieldDown = function():*
         {
            Global.shield_toggle = true;
         };
         shieldUp = function():*
         {
            Global.shield_toggle = false;
         };
         var text:StringCell = new StringCell("副手拾取",150,20);
         this.addChild(text);
         text.x = this.lootStartX + this.lootGapX * 0;
         text.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 2 + this.lootGapY * 3;
         dagger = new ToggleBox("匕首",this.fontSize_small,Global.dagger_toggle);
         this.addChild(dagger);
         dagger.x = this.lootStartX + this.lootGapX * 0;
         dagger.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 2 + this.lootGapY * 4;
         dagger.downFunction = daggerDown;
         dagger.upFunction = daggerUp;
         tome = new ToggleBox("书",this.fontSize_small,Global.tome_toggle);
         this.addChild(tome);
         tome.x = this.lootStartX + this.lootGapX * 1;
         tome.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 2 + this.lootGapY * 4;
         tome.downFunction = tomeDown;
         tome.upFunction = tomeUp;
         shield = new ToggleBox("盾",this.fontSize_small,Global.shield_toggle);
         this.addChild(shield);
         shield.x = this.lootStartX + this.lootGapX * 2;
         shield.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 2 + this.lootGapY * 4;
         shield.downFunction = shieldDown;
         shield.upFunction = shieldUp;
      }
      
      private function setHead() : *
      {
         var headLight:ToggleBox;
         var headMedium:ToggleBox;
         var headHeavy:ToggleBox;
         var headLightDown:Function = null;
         var headLightUp:Function = null;
         var headMediumDown:Function = null;
         var headMediumUp:Function = null;
         var headHeavyDown:Function = null;
         var headHeavyUp:Function = null;
         headLightDown = function():*
         {
            Global.head_light_toggle = true;
         };
         headLightUp = function():*
         {
            Global.head_light_toggle = false;
         };
         headMediumDown = function():*
         {
            Global.head_medium_toggle = true;
         };
         headMediumUp = function():*
         {
            Global.head_medium_toggle = false;
         };
         headHeavyDown = function():*
         {
            Global.head_heavy_toggle = true;
         };
         headHeavyUp = function():*
         {
            Global.head_heavy_toggle = false;
         };
         var text:StringCell = new StringCell("头部拾取",150,20);
         this.addChild(text);
         text.x = this.lootStartX + this.lootGapX * 0;
         text.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 3 + this.lootGapY * 4;
         headLight = new ToggleBox("轻甲",this.fontSize_small,Global.head_light_toggle);
         this.addChild(headLight);
         headLight.x = this.lootStartX + this.lootGapX * 0;
         headLight.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 3 + this.lootGapY * 5;
         headLight.downFunction = headLightDown;
         headLight.upFunction = headLightUp;
         headMedium = new ToggleBox("中甲",this.fontSize_small,Global.head_medium_toggle);
         this.addChild(headMedium);
         headMedium.x = this.lootStartX + this.lootGapX * 1;
         headMedium.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 3 + this.lootGapY * 5;
         headMedium.downFunction = headMediumDown;
         headMedium.upFunction = headMediumUp;
         headHeavy = new ToggleBox("重甲",this.fontSize_small,Global.head_heavy_toggle);
         this.addChild(headHeavy);
         headHeavy.x = this.lootStartX + this.lootGapX * 2;
         headHeavy.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 3 + this.lootGapY * 5;
         headHeavy.downFunction = headHeavyDown;
         headHeavy.upFunction = headHeavyUp;
      }
      
      private function setBody() : *
      {
         var bodyLight:ToggleBox;
         var bodyMedium:ToggleBox;
         var bodyHeavy:ToggleBox;
         var bodyLightDown:Function = null;
         var bodyLightUp:Function = null;
         var bodyMediumDown:Function = null;
         var bodyMediumUp:Function = null;
         var bodyHeavyDown:Function = null;
         var bodyHeavyUp:Function = null;
         bodyLightDown = function():*
         {
            Global.body_light_toggle = true;
         };
         bodyLightUp = function():*
         {
            Global.body_light_toggle = false;
         };
         bodyMediumDown = function():*
         {
            Global.body_medium_toggle = true;
         };
         bodyMediumUp = function():*
         {
            Global.body_medium_toggle = false;
         };
         bodyHeavyDown = function():*
         {
            Global.body_heavy_toggle = true;
         };
         bodyHeavyUp = function():*
         {
            Global.body_heavy_toggle = false;
         };
         var text:StringCell = new StringCell("身体拾取",150,20);
         this.addChild(text);
         text.x = this.lootStartX + this.lootGapX * 0;
         text.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 4 + this.lootGapY * 5;
         bodyLight = new ToggleBox("轻甲",this.fontSize_small,Global.body_light_toggle);
         this.addChild(bodyLight);
         bodyLight.x = this.lootStartX + this.lootGapX * 0;
         bodyLight.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 4 + this.lootGapY * 6;
         bodyLight.downFunction = bodyLightDown;
         bodyLight.upFunction = bodyLightUp;
         bodyMedium = new ToggleBox("中甲",this.fontSize_small,Global.body_medium_toggle);
         this.addChild(bodyMedium);
         bodyMedium.x = this.lootStartX + this.lootGapX * 1;
         bodyMedium.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 4 + this.lootGapY * 6;
         bodyMedium.downFunction = bodyMediumDown;
         bodyMedium.upFunction = bodyMediumUp;
         bodyHeavy = new ToggleBox("重甲",this.fontSize_small,Global.body_heavy_toggle);
         this.addChild(bodyHeavy);
         bodyHeavy.x = this.lootStartX + this.lootGapX * 2;
         bodyHeavy.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 4 + this.lootGapY * 6;
         bodyHeavy.downFunction = bodyHeavyDown;
         bodyHeavy.upFunction = bodyHeavyUp;
      }
      
      private function setFeet() : *
      {
         var feetLight:ToggleBox;
         var feetMedium:ToggleBox;
         var feetHeavy:ToggleBox;
         var feetLightDown:Function = null;
         var feetLightUp:Function = null;
         var feetMediumDown:Function = null;
         var feetMediumUp:Function = null;
         var feetHeavyDown:Function = null;
         var feetHeavyUp:Function = null;
         feetLightDown = function():*
         {
            Global.feet_light_toggle = true;
         };
         feetLightUp = function():*
         {
            Global.feet_light_toggle = false;
         };
         feetMediumDown = function():*
         {
            Global.feet_medium_toggle = true;
         };
         feetMediumUp = function():*
         {
            Global.feet_medium_toggle = false;
         };
         feetHeavyDown = function():*
         {
            Global.feet_heavy_toggle = true;
         };
         feetHeavyUp = function():*
         {
            Global.feet_heavy_toggle = false;
         };
         var text:StringCell = new StringCell("足部拾取",150,20);
         this.addChild(text);
         text.x = this.lootStartX + this.lootGapX * 0;
         text.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 5 + this.lootGapY * 6;
         feetLight = new ToggleBox("轻甲",this.fontSize_small,Global.feet_light_toggle);
         this.addChild(feetLight);
         feetLight.x = this.lootStartX + this.lootGapX * 0;
         feetLight.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 5 + this.lootGapY * 7;
         feetLight.downFunction = feetLightDown;
         feetLight.upFunction = feetLightUp;
         feetMedium = new ToggleBox("中甲",this.fontSize_small,Global.feet_medium_toggle);
         this.addChild(feetMedium);
         feetMedium.x = this.lootStartX + this.lootGapX * 1;
         feetMedium.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 5 + this.lootGapY * 7;
         feetMedium.downFunction = feetMediumDown;
         feetMedium.upFunction = feetMediumUp;
         feetHeavy = new ToggleBox("重甲",this.fontSize_small,Global.feet_heavy_toggle);
         this.addChild(feetHeavy);
         feetHeavy.x = this.lootStartX + this.lootGapX * 2;
         feetHeavy.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 5 + this.lootGapY * 7;
         feetHeavy.downFunction = feetHeavyDown;
         feetHeavy.upFunction = feetHeavyUp;
      }
      
      private function setAccessory() : *
      {
         var ring:ToggleBox;
         var necklace:ToggleBox;
         var ringDown:Function = null;
         var ringUp:Function = null;
         var necklaceDown:Function = null;
         var necklaceUp:Function = null;
         ringDown = function():*
         {
            Global.ring_toggle = true;
         };
         ringUp = function():*
         {
            Global.ring_toggle = false;
         };
         necklaceDown = function():*
         {
            Global.necklace_toggle = true;
         };
         necklaceUp = function():*
         {
            Global.necklace_toggle = false;
         };
         var text:StringCell = new StringCell("饰品拾取",150,20);
         this.addChild(text);
         text.x = this.lootStartX + this.lootGapX * 0;
         text.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 6 + this.lootGapY * 7;
         ring = new ToggleBox("戒指",this.fontSize_small,Global.ring_toggle);
         this.addChild(ring);
         ring.x = this.lootStartX + this.lootGapX * 0;
         ring.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 6 + this.lootGapY * 8;
         ring.downFunction = ringDown;
         ring.upFunction = ringUp;
         necklace = new ToggleBox("项链",this.fontSize_small,Global.necklace_toggle);
         this.addChild(necklace);
         necklace.x = this.lootStartX + this.lootGapX * 1;
         necklace.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 6 + this.lootGapY * 8;
         necklace.downFunction = necklaceDown;
         necklace.upFunction = necklaceUp;
      }
      
      private function autoSell() : *
      {
         var autoSellDown:Function = null;
         var autoSellUp:Function = null;
         autoSellDown = function():*
         {
            Global.autoSell_toggle = true;
         };
         autoSellUp = function():*
         {
            Global.autoSell_toggle = false;
         };
         var autoSell:ToggleBox = new ToggleBox("Auto sell lowest value while bag is full",this.fontSize_small,Global.autoSell_toggle);
         this.addChild(autoSell);
         autoSell.x = this.lootStartX + this.lootGapX * 0;
         autoSell.y = this.lootStartY + this.lootGapMidY * 1 + this.lootGapSmallY * 7 + this.lootGapY * 8 + 10;
         autoSell.downFunction = autoSellDown;
         autoSell.upFunction = autoSellUp;
      }
   }
}

