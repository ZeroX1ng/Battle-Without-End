package iPanel.iScene.iPanel.iWindow
{
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.media.Sound;
   import flash.text.TextField;
   import flash.utils.getDefinitionByName;
   import iData.iItem.Equipment;
   import iData.iItem.Weapon;
   import iData.iPlayer.TitleList;
   import iData.iSkill.SkillDataList;
   import iGlobal.Global;
   import iGlobal.Player;
   import iPanel.iCell.BasicCell;
   import iPanel.iCell.StringCell;
   import iPanel.iScene.MainScene;
   import iPanel.iScene.iPanel.iWindow.iItem.ForgeButton;
   import iPanel.iScene.iPanel.iWindow.iItem.ItemInnerPanel;
   import iPanel.iScene.iPanel.iWindow.iItem.ItemOutterPanel;
   import iPanel.iScene.iPanel.iWindow.iItem.StringInfoButton;
   import iPanel.iScene.iPanel.iWindow.iSystem.ToggleBox;
   import tool.MyEvent;
   
   public class ItemWindow extends Window
   {
      
      private var panel:ItemInnerPanel;
      
      private var text:StringCell;
      
      private var money:StringCell;
      
      private var item_mc:Sprite;
      
      private var forgeButton:ForgeButton;
      
      private var autoEnhance:Boolean;
      
      private var autoBox:ToggleBox;
      
      private var textBag:TextField = Global.getTextField(32,7631988);
      
      public function ItemWindow()
      {
         super();
         var _loc1_:ItemOutterPanel = new ItemOutterPanel();
         this.addChild(_loc1_);
         _loc1_.x = 0;
         _loc1_.y = 40;
         this.panel = _loc1_.innerPanel as ItemInnerPanel;
         this.setForge();
         this.onItemChange();
         this.setBagText();
         this.item_mc.mouseEnabled = false;
         this.item_mc.mouseChildren = false;
         this.text.mouseEnabled = false;
         this.text.mouseChildren = false;
         this.addEventListener(MyEvent.Change,this.onItemChange,true);
         this.addEventListener(MyEvent.Update,this.updateBagText,true);
      }
      
      public function removeCurrentItem() : *
      {
         this.onItemChange();
      }
      
      private function checkIfinBag() : *
      {
         var _loc1_:int = int(Player.itemList.length);
         var _loc2_:int = 0;
         while(_loc2_ < _loc1_)
         {
            if(this.panel.selectCell)
            {
               if(Player.itemList[_loc2_] == this.panel.selectCell.equip)
               {
                  return;
               }
            }
            _loc2_++;
         }
         this.panel.selectCell = null;
      }
      
      private function setAutoInfo() : *
      {
         var _loc1_:int = Player.getSkill(SkillDataList.BLACKSMITHING).level;
         if(_loc1_ > 13)
         {
            this.autoBox.visible = true;
            this.autoBox.setText("自动+7");
         }
         else if(_loc1_ > 9)
         {
            this.autoBox.visible = true;
            this.autoBox.setText("自动+5");
         }
         else if(_loc1_ > 5)
         {
            this.autoBox.visible = true;
            this.autoBox.setText("自动+3");
         }
         else if(_loc1_ > 1)
         {
            this.autoBox.visible = true;
            this.autoBox.setText("自动+1");
         }
         else
         {
            this.autoBox.visible = false;
         }
      }
      
      private function onItemChange(param1:Event = null) : void
      {
         var _loc3_:Sprite = null;
         var _loc4_:* = 0;
         this.checkIfinBag();
         this.setAutoInfo();
         if(!this.panel.selectCell)
         {
            this.item_mc.visible = false;
            this.text.setText("");
            this.money.setText("");
            this.forgeButton.mouseEnabled = false;
            this.forgeButton.mouseChildren = false;
            return;
         }
         this.forgeButton.mouseEnabled = true;
         this.forgeButton.mouseChildren = true;
         var _loc2_:Equipment = this.panel.selectCell.equip;
         if(_loc2_ is Weapon)
         {
            _loc3_ = new (getDefinitionByName("mc_" + _loc2_.type) as Class)();
         }
         else
         {
            _loc3_ = new (getDefinitionByName("mc_" + _loc2_.position + "_" + _loc2_.type) as Class)();
         }
         if(this.item_mc.numChildren > 0)
         {
            _loc4_ = this.item_mc.numChildren;
            while(_loc4_ > 0)
            {
               this.item_mc.removeChildAt(0);
               _loc4_--;
            }
         }
         this.item_mc.addChild(_loc3_);
         _loc3_.width = 50;
         _loc3_.height = 50;
         this.item_mc.visible = true;
         this.text.setText(this.getSuccessRate() + "%");
         if(!this.panel.selectCell.equip.canLevelup())
         {
            this.forgeButton.mouseEnabled = false;
            this.forgeButton.mouseChildren = false;
            this.money.setText("<font color=\'#ff4040\'>$" + this.getMoney() + "</font>");
         }
         else
         {
            this.money.setText("$" + this.getMoney());
         }
      }
      
      private function setBagText() : void
      {
         var value:StringInfoButton;
         var type:StringInfoButton;
         var valueDown:Function = null;
         var typeDown:Function = null;
         valueDown = function():*
         {
            var itemSort:Function = null;
            itemSort = function(param1:Equipment, param2:Equipment):Number
            {
               if(param1.getMoney() < param2.getMoney())
               {
                  return 1;
               }
               if(param1.getMoney() > param2.getMoney())
               {
                  return -1;
               }
               return 0;
            };
            Player.itemList.sort(itemSort);
            panel.update();
            updateBagText();
         };
         typeDown = function():*
         {
            var itemSort:Function = null;
            itemSort = function(param1:Equipment, param2:Equipment):Number
            {
               if(param1.sortWeight < param2.sortWeight)
               {
                  return -1;
               }
               if(param1.sortWeight > param2.sortWeight)
               {
                  return 1;
               }
               return 0;
            };
            Player.itemList.sort(itemSort);
            panel.update();
            updateBagText();
         };
         var bag:Sprite = new BasicCell(200,40);
         this.addChild(bag);
         bag.x = 0;
         bag.y = 0;
         this.textBag.width = 200;
         this.textBag.htmlText = "<p align=\'center\'>" + Player.itemList.length + "/" + Player.BAGMAX + "</p>";
         bag.addChild(this.textBag);
         value = new StringInfoButton("价值","按价值排列");
         bag.addChild(value);
         value.x = 5;
         value.y = 0;
         value.downFunction = valueDown;
         type = new StringInfoButton("类型","按类型排列");
         bag.addChild(type);
         type.x = 160;
         type.y = 0;
         type.downFunction = typeDown;
      }
      
      public function updateBagText(param1:Event = null) : *
      {
         this.textBag.htmlText = "<p align=\'center\'>" + Player.itemList.length + "/" + Player.BAGMAX + "</p>";
      }
      
      private function setForge() : void
      {
         var soundsBox:*;
         var s_text:StringCell;
         var m_text:StringCell;
         var autoDown:Function = null;
         var autoUp:Function = null;
         var soundsDown:Function = null;
         var soundsUp:Function = null;
         var onDown:Function = null;
         autoDown = function():*
         {
            autoEnhance = true;
         };
         autoUp = function():*
         {
            autoEnhance = false;
         };
         soundsDown = function():*
         {
            Global.sound_toggle = true;
         };
         soundsUp = function():*
         {
            Global.sound_toggle = false;
         };
         onDown = function():*
         {
            if(!panel.selectCell)
            {
               return;
            }
            var _loc1_:int = 0;
            var _loc2_:int = Player.getSkill(SkillDataList.BLACKSMITHING).level;
            if(_loc2_ > 13)
            {
               _loc1_ = 7;
            }
            else if(_loc2_ > 9)
            {
               _loc1_ = 5;
            }
            else if(_loc2_ > 5)
            {
               _loc1_ = 3;
            }
            else if(_loc2_ > 1)
            {
               _loc1_ = 1;
            }
            if(autoEnhance && panel.selectCell.equip.level < _loc1_)
            {
               while(panel.selectCell.equip.level < _loc1_)
               {
                  if(!panel.selectCell)
                  {
                     break;
                  }
                  if(Player.gold < getMoney())
                  {
                     break;
                  }
                  forging();
               }
            }
            else
            {
               forging();
            }
            this.setBefore();
            Player.save();
         };
         var forging:Function = function():*
         {
            var _loc2_:int = 0;
            var _loc3_:int = 0;
            var _loc4_:Sound = null;
            if(!panel.selectCell)
            {
               return;
            }
            Player.loseMoney(getMoney());
            var _loc1_:Boolean = false;
            if(Math.random() * 100 < getSuccessRate())
            {
               panel.selectCell.equip.levelup();
               TitleList.updateTitleInfo("forge",panel.selectCell.equip.level);
               TitleList.updateTitleInfo("fail",0,-1);
               if(Global.kongregate)
               {
                  Global.kongregate.stats.submit("Forge",panel.selectCell.equip.level);
               }
            }
            else
            {
               _loc2_ = Player.getSkill(SkillDataList.BLACKSMITHING).level;
               _loc3_ = 50;
               if(_loc2_ > 13)
               {
                  if(Math.random() * 100 >= _loc3_)
                  {
                     if(panel.selectCell.equip.level < 7)
                     {
                        panel.selectCell.equip.setLevel(0);
                     }
                     else
                     {
                        _loc1_ = true;
                     }
                  }
               }
               else if(_loc2_ > 9)
               {
                  if(Math.random() * 100 < _loc3_)
                  {
                     panel.selectCell.equip.setLevel(panel.selectCell.equip.level - 1);
                  }
                  else if(panel.selectCell.equip.level < 5)
                  {
                     panel.selectCell.equip.setLevel(0);
                  }
                  else
                  {
                     _loc1_ = true;
                  }
               }
               else if(_loc2_ > 5)
               {
                  if(Math.random() * 100 < _loc3_)
                  {
                     panel.selectCell.equip.setLevel(0);
                  }
                  else if(panel.selectCell.equip.level < 3)
                  {
                     panel.selectCell.equip.setLevel(0);
                  }
                  else
                  {
                     _loc1_ = true;
                  }
               }
               else if(_loc2_ > 1)
               {
                  if(panel.selectCell.equip.level < 1)
                  {
                     panel.selectCell.equip.setLevel(0);
                  }
                  else
                  {
                     _loc1_ = true;
                  }
               }
               else
               {
                  _loc1_ = true;
               }
               TitleList.updateTitleInfo("fail",0,1);
            }
            if(!_loc1_)
            {
               panel.selectCell.update();
               onItemChange();
               MainScene.allInfoPanel.addText("你获得了" + panel.selectCell.equip.getNameHTML() + "<font color=\'" + panel.selectCell.equip.getColor + "\'>+" + panel.selectCell.equip.level + "!");
            }
            else
            {
               if(panel.selectCell.equip.level > 8 || panel.selectCell.equip.quality >= 4)
               {
                  if(Global.sound_toggle)
                  {
                     _loc4_ = new yell_sound();
                     _loc4_.play();
                  }
               }
               Player.removeItem(panel.selectCell.equip);
               MainScene.allInfoPanel.addText("<font color=\'#ff4040\'>强化</font>" + panel.selectCell.equip.getNameHTML() + "<font color=\'" + panel.selectCell.equip.getColor + "\'>+" + (panel.selectCell.equip.level + 1) + " <font color=\'#ff4040\'>失败. 物品消失!</font>");
               panel.selectCell = null;
               panel.update();
               onItemChange();
               updateBagText();
            }
         };
         var c:BasicCell = new BasicCell(200,135);
         this.addChild(c);
         c.x = 0;
         c.y = 405;
         this.autoBox = new ToggleBox("自动+7",16,false);
         c.addChild(this.autoBox);
         this.autoBox.x = 70;
         this.autoBox.y = 100;
         this.autoEnhance = false;
         this.setAutoInfo();
         this.autoBox.downFunction = autoDown;
         this.autoBox.upFunction = autoUp;
         soundsBox = new ToggleBox("音效",16);
         c.addChild(soundsBox);
         soundsBox.x = 70;
         soundsBox.y = 80;
         soundsBox.downFunction = soundsDown;
         soundsBox.upFunction = soundsUp;
         this.forgeButton = new ForgeButton();
         c.addChild(this.forgeButton);
         this.forgeButton.x = 140;
         this.forgeButton.y = 75;
         this.forgeButton.downFunction = onDown;
         s_text = new StringCell("成功率",130,24);
         c.addChild(s_text);
         s_text.x = 10;
         s_text.y = 35;
         this.text = new StringCell("",100,24);
         c.addChild(this.text);
         this.text.x = 100;
         this.text.y = 35;
         m_text = new StringCell("费用",130,24);
         c.addChild(m_text);
         m_text.x = 10;
         m_text.y = 5;
         this.money = new StringCell("",100,24);
         c.addChild(this.money);
         this.money.x = 60;
         this.money.y = 5;
         this.item_mc = new Sprite();
         c.addChild(this.item_mc);
         this.item_mc.x = 10;
         this.item_mc.y = 75;
      }
      
      public function addOneItem() : *
      {
         this.panel.addOneCell();
         this.updateBagText();
      }
      
      private function getSuccessRate() : Number
      {
         var _loc1_:int = this.panel.selectCell.equip.level + 1;
         var _loc2_:Number = Player.luck / 20 + Math.pow(Math.E,-_loc1_ / 5) * 100 + Player.getSkill(SkillDataList.BLACKSMITHING).level;
         _loc2_ = (_loc2_ * 100 >> 0) / 100;
         if(_loc2_ > 100 - _loc1_ * 3)
         {
            _loc2_ = 100 - _loc1_ * 3;
         }
         return _loc2_;
      }
      
      private function getMoney() : int
      {
         return int(this.panel.selectCell.equip.getMoney() * Math.pow(1.2,this.panel.selectCell.equip.level + 1));
      }
   }
}

