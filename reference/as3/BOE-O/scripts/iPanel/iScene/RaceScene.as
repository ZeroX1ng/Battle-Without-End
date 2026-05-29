package iPanel.iScene
{
   import flash.display.MovieClip;
   import flash.display.Sprite;
   import flash.text.TextField;
   import iData.BasicStatus;
   import iData.Race;
   import iData.RaceList;
   import iGlobal.Global;
   import iGlobal.Player;
   import iPanel.iCell.ButtonGroup;
   import tool.Effect;
   
   public class RaceScene extends Sprite
   {
      
      public var background:Sprite = new Sprite();
      
      public var human:RaceButton = new RaceButton("before_human","after_human",RaceList.HUMAN);
      
      public var elf:RaceButton = new RaceButton("before_elf","after_elf",RaceList.ELF);
      
      public var giant:RaceButton = new RaceButton("before_giant","after_giant",RaceList.GIANT);
      
      public var dwarf:RaceButton = new RaceButton("before_dwarf","after_dwarf",RaceList.DWARF);
      
      public var undeath:RaceButton = new RaceButton("before_undeath","after_undeath",RaceList.UNDEATH);
      
      private var agePanel:Sprite;
      
      private var infoPanel:Sprite;
      
      private var ageText:TextField;
      
      private var initialText:TextField;
      
      private var ageGrowText:TextField;
      
      private var chosenRace:Race;
      
      private var chosenAge:int = 10;
      
      private const px:int = 100;
      
      private const py:int = 150;
      
      private const pg:int = 80;
      
      public function RaceScene()
      {
         super();
         this.background.graphics.beginFill(16777215,1);
         this.background.graphics.drawRect(0,0,800,600);
         this.background.graphics.endFill();
         this.addChild(this.background);
         var _loc1_:MovieClip = new caption_mc();
         this.addChild(_loc1_);
         _loc1_.x = 150;
         _loc1_.y = -30;
         this.setRaceButtons();
         this.setAgeButtons();
         this.setInfoPanel();
      }
      
      private function setRaceButtons() : void
      {
         var buttonGroup:ButtonGroup;
         var aa:Function = null;
         aa = function():void
         {
            if(agePanel.visible == false)
            {
               agePanel.visible = true;
               Effect.fadeIn(agePanel,10);
            }
            chosenRace = this.race;
            updataInfo();
         };
         this.addChild(this.human);
         this.human.x = this.px;
         this.human.y = this.py;
         this.human.downFunction = aa;
         this.addChild(this.elf);
         this.elf.x = this.px;
         this.elf.y = this.py + this.pg;
         this.elf.downFunction = aa;
         this.addChild(this.giant);
         this.giant.x = this.px;
         this.giant.y = this.py + this.pg * 2;
         this.giant.downFunction = aa;
         this.addChild(this.undeath);
         this.undeath.x = this.px;
         this.undeath.y = this.py + this.pg * 3;
         this.undeath.downFunction = aa;
         this.addChild(this.dwarf);
         this.dwarf.x = this.px;
         this.dwarf.y = this.py + this.pg * 4;
         this.dwarf.downFunction = aa;
         buttonGroup = new ButtonGroup();
         buttonGroup.addButton(this.human);
         buttonGroup.addButton(this.elf);
         buttonGroup.addButton(this.giant);
         buttonGroup.addButton(this.dwarf);
         buttonGroup.addButton(this.undeath);
      }
      
      private function setAgeButtons() : void
      {
         var buttonGroup2:ButtonGroup;
         var i:int;
         var aa:Function;
         var p:PeopleModel = null;
         this.agePanel = new Sprite();
         this.addChild(this.agePanel);
         this.agePanel.y = 200;
         this.agePanel.x = 380;
         buttonGroup2 = new ButtonGroup();
         i = 0;
         while(i < 8)
         {
            aa = function():void
            {
               if(infoPanel.visible == false)
               {
                  infoPanel.visible = true;
                  Effect.fadeIn(infoPanel,10);
               }
               chosenAge = this.age;
               updataInfo();
            };
            p = new PeopleModel(10 + i);
            this.agePanel.addChild(p);
            p.y = 0;
            p.x = i * 50;
            buttonGroup2.addButton(p);
            p.downFunction = aa;
            i++;
         }
         this.agePanel.visible = false;
      }
      
      private function setInfoPanel() : void
      {
         var mention:TextField;
         var okButton:FlickerButton;
         var _this:* = undefined;
         var okDown:Function = null;
         okDown = function():void
         {
            var addMain:Function = null;
            addMain = function():*
            {
               var _loc1_:MainScene = null;
               if(Global.sound_toggle)
               {
                  Global.soundOut();
               }
               if(Global.mainScene)
               {
                  Global.mainScene.visible = true;
                  Effect.fadeIn(Global.mainScene);
               }
               else
               {
                  _loc1_ = new MainScene();
                  Global.mainScene = _loc1_;
                  Global.stage.addChild(_loc1_);
                  Effect.fadeIn(_loc1_);
               }
            };
            Effect.explodeOut(_this,2,4294967295,addMain);
            Player.burn(chosenAge,chosenRace);
            if(Global.sound_toggle)
            {
               Global.playSound();
            }
            if(Global.mainScene)
            {
               Global.mainScene.visible = false;
            }
         };
         this.infoPanel = new Sprite();
         this.addChild(this.infoPanel);
         this.infoPanel.x = 380;
         this.infoPanel.y = 150;
         this.ageText = Global.getTextField();
         this.ageText.text = "年龄:10";
         this.infoPanel.addChild(this.ageText);
         this.initialText = Global.getTextField();
         this.initialText.text = "初始属性:";
         this.initialText.width = 420;
         this.infoPanel.addChild(this.initialText);
         this.initialText.y = 170;
         this.ageGrowText = Global.getTextField();
         this.ageGrowText.text = "年龄成长:";
         this.ageGrowText.width = 400;
         this.infoPanel.addChild(this.ageGrowText);
         this.ageGrowText.y = 220;
         mention = Global.getTextField(16);
         mention.width = 300;
         mention.text = "(升级时增长属性是当前年龄增长的1/4)";
         this.infoPanel.addChild(mention);
         mention.x = 100;
         mention.y = 260;
         okButton = new FlickerButton("确定",250,50);
         this.infoPanel.addChild(okButton);
         okButton.x = 100;
         okButton.y = 300;
         okButton.downFunction = okDown;
         _this = this;
         this.infoPanel.visible = false;
      }
      
      private function updataInfo() : void
      {
         this.ageText.text = "年龄:" + this.chosenAge;
         var _loc1_:BasicStatus = this.chosenRace.caculateStat(this.chosenAge);
         this.initialText.text = "初始属性:   力量 " + _loc1_.str + " 敏捷 " + _loc1_.dex + " 智力 " + _loc1_.intelligence + " 意志 " + _loc1_.will + " 幸运 " + _loc1_.luck;
         _loc1_ = this.chosenRace.ageupList[this.chosenAge - 10];
         this.ageGrowText.text = "年龄增长:   力量+" + _loc1_.str + " 敏捷+" + _loc1_.dex + " 智力+" + _loc1_.intelligence + " 意志+" + _loc1_.will + " 幸运+" + _loc1_.luck;
      }
   }
}

