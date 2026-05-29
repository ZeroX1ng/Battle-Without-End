package iPanel.iScene.iPanel
{
   import flash.display.Sprite;
   import flash.events.Event;
   import iPanel.iCell.ButtonCell;
   import iPanel.iCell.ButtonGroup;
   import iPanel.iCell.MenuButton;
   import iPanel.iScene.iPanel.iWindow.EquipWindow;
   import iPanel.iScene.iPanel.iWindow.ItemWindow;
   import iPanel.iScene.iPanel.iWindow.OtherWindow;
   import iPanel.iScene.iPanel.iWindow.PetWindow;
   import iPanel.iScene.iPanel.iWindow.SkillWindow;
   import iPanel.iScene.iPanel.iWindow.SystemWindow;
   import iPanel.iScene.iPanel.iWindow.TitleWindow;
   import iPanel.iScene.iPanel.iWindow.Window;
   
   public class OtherPanel extends Sprite
   {
      
      private var window:Window;
      
      private var array:Array;
      
      public var itemWindow:ItemWindow;
      
      public var equipWindow:EquipWindow;
      
      public var petWindow:PetWindow;
      
      public var skillWindow:SkillWindow;
      
      public var titleWindow:TitleWindow;
      
      public var systemWindow:SystemWindow;
      
      public var otherWindow:OtherWindow;
      
      public function OtherPanel()
      {
         var cover:Sprite;
         var buttonGroup:ButtonGroup;
         var list:Array;
         var list2:Array;
         var i:int;
         var bSprite:Sprite = null;
         var count:int = 0;
         var max:int = 0;
         var b:int = 0;
         var left:ButtonCell = null;
         var leftDown:Function = null;
         var right:ButtonCell = null;
         var rightDown:Function = null;
         var onEnterFrame:Function = null;
         var cell:ButtonCell = null;
         super();
         leftDown = function():*
         {
            right.visible = true;
            this.setBefore();
            ++count;
            b = count * 40;
            bSprite.addEventListener(Event.ENTER_FRAME,onEnterFrame);
            if(count == 0)
            {
               left.visible = false;
            }
         };
         rightDown = function():*
         {
            left.visible = true;
            this.setBefore();
            --count;
            b = count * 40;
            bSprite.addEventListener(Event.ENTER_FRAME,onEnterFrame);
            if(max + count == 5)
            {
               right.visible = false;
            }
         };
         onEnterFrame = function(param1:Event):*
         {
            bSprite.x += (b - bSprite.x) * 0.5;
            if(Math.abs(bSprite.x - b) < 1)
            {
               bSprite.x = b;
               bSprite.removeEventListener(Event.ENTER_FRAME,onEnterFrame);
            }
         };
         this.array = new Array();
         bSprite = new Sprite();
         this.addChild(bSprite);
         cover = new Sprite();
         cover.graphics.beginFill(0,1);
         cover.graphics.drawRect(0,-20,200,60);
         cover.graphics.endFill();
         this.addChild(cover);
         bSprite.mask = cover;
         buttonGroup = new ButtonGroup();
         list = ["item","equip","pet","skill","title","system","info"];
         list2 = ["背包","装备","宠物","技能","称号","设置","其他"];
         i = 0;
         while(i < list.length)
         {
            cell = new MenuButton("before_" + list[i],"after_" + list[i],list2[i]);
            cell.x = i * 40;
            bSprite.addChild(cell);
            buttonGroup.addButton(cell);
            this.array.push(cell);
            i++;
         }
         count = 0;
         max = int(list.length);
         left = new MenuButton("before_arrow_left","after_arrow_left","向左");
         this.addChild(left);
         left.visible = false;
         left.downFunction = leftDown;
         right = new MenuButton("before_arrow_right","after_arrow_right","向右");
         this.addChild(right);
         right.x = 160;
         right.downFunction = rightDown;
         this.init();
         this.setFunction();
      }
      
      private function init() : *
      {
         this.itemWindow = new ItemWindow();
         this.equipWindow = new EquipWindow();
         this.petWindow = new PetWindow();
         this.skillWindow = new SkillWindow();
         this.titleWindow = new TitleWindow();
         this.systemWindow = new SystemWindow();
         this.otherWindow = new OtherWindow();
      }
      
      private function setFunction() : void
      {
         var _this:* = undefined;
         var addWindow0:Function = null;
         var addWindow1:Function = null;
         var addWindow2:Function = null;
         var addWindow3:Function = null;
         var addWindow4:Function = null;
         var addWindow5:Function = null;
         var addWindow6:Function = null;
         addWindow0 = function():*
         {
            removeWindow();
            _this.window = itemWindow;
            addWindow();
         };
         addWindow1 = function():*
         {
            removeWindow();
            _this.window = equipWindow;
            addWindow();
         };
         addWindow2 = function():*
         {
            removeWindow();
            _this.window = petWindow;
            addWindow();
         };
         addWindow3 = function():*
         {
            removeWindow();
            _this.window = skillWindow;
            addWindow();
         };
         addWindow4 = function():*
         {
            removeWindow();
            _this.window = titleWindow;
            addWindow();
         };
         addWindow5 = function():*
         {
            removeWindow();
            _this.window = systemWindow;
            addWindow();
         };
         addWindow6 = function():*
         {
            removeWindow();
            _this.window = otherWindow;
            addWindow();
         };
         var removeWindow:Function = function():*
         {
            if(_this.window)
            {
               _this.removeChild(_this.window);
            }
         };
         var addWindow:Function = function():*
         {
            _this.addChild(_this.window);
            _this.window.y = 40;
         };
         _this = this;
         this.array[0].downFunction = addWindow0;
         this.array[1].downFunction = addWindow1;
         this.array[2].downFunction = addWindow2;
         this.array[3].downFunction = addWindow3;
         this.array[4].downFunction = addWindow4;
         this.array[5].downFunction = addWindow5;
         this.array[6].downFunction = addWindow6;
      }
   }
}

