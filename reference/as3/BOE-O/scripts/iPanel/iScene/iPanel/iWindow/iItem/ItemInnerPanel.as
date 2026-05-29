package iPanel.iScene.iPanel.iWindow.iItem
{
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.text.TextField;
   import iGlobal.Global;
   import iGlobal.Player;
   import iPanel.InnerPanel;
   import iPanel.iCell.ButtonGroup;
   import iPanel.iCell.EquipmentCell;
   import iPanel.iScene.MainScene;
   import tool.MyEvent;
   
   public class ItemInnerPanel extends InnerPanel
   {
      
      private const Gap:int = 50;
      
      public var selectCell:EquipmentCell;
      
      public var buttonGroup:ButtonGroup;
      
      private var listSprite:Sprite;
      
      private var listSpriteArray:Vector.<Sprite>;
      
      private var text:TextField = Global.getTextField(32,16777215);
      
      public function ItemInnerPanel()
      {
         super();
         var _loc1_:Sprite = new Sprite();
         _loc1_.graphics.beginFill(0,0);
         _loc1_.graphics.drawRect(0,0,20,20);
         _loc1_.graphics.endFill();
         this.addChild(_loc1_);
         this.text.width = 200;
         this.addChild(this.text);
         this.update();
         this.addEventListener(MyEvent.Update,this.onUpdate,true);
      }
      
      private function setSelectedCell(param1:EquipmentCell) : *
      {
         this.selectCell = param1;
         dispatchEvent(new MyEvent(MyEvent.Change));
      }
      
      public function update() : *
      {
         if(MainScene.otherPanel)
         {
            if(MainScene.otherPanel.itemWindow)
            {
               MainScene.otherPanel.itemWindow.removeCurrentItem();
            }
         }
         this.updateList();
      }
      
      private function removeList() : *
      {
      }
      
      override public function set positionY(param1:Number) : *
      {
         var _loc4_:int = 0;
         this.y = param1;
         var _loc2_:int = -this.y / 50;
         var _loc3_:int = int(this.listSpriteArray.length);
         if(_loc2_ - 2 >= _loc3_)
         {
            return;
         }
         _loc4_ = 0;
         while(_loc4_ < _loc2_ - 2)
         {
            if(this.listSprite.contains(this.listSpriteArray[_loc4_]))
            {
               this.listSprite.removeChild(this.listSpriteArray[_loc4_]);
            }
            _loc4_++;
         }
         var _loc5_:int = _loc2_ + 12;
         if(_loc5_ >= _loc3_)
         {
            _loc5_ = _loc3_ - 1;
         }
         var _loc6_:int = _loc2_ - 2;
         if(_loc6_ < 0)
         {
            _loc6_ = 0;
         }
         _loc4_ = _loc6_;
         while(_loc4_ < _loc5_)
         {
            this.listSprite.addChild(this.listSpriteArray[_loc4_]);
            _loc4_++;
         }
         _loc4_ = _loc2_ + 12;
         while(_loc4_ < _loc3_)
         {
            if(this.listSprite.contains(this.listSpriteArray[_loc4_]))
            {
               this.listSprite.removeChild(this.listSpriteArray[_loc4_]);
            }
            _loc4_++;
         }
      }
      
      private function updateList() : *
      {
         var length:int;
         var i:int;
         var onDown:Function;
         var cell:EquipmentCell = null;
         if(this.listSprite)
         {
            this.removeChild(this.listSprite);
         }
         this.listSprite = new Sprite();
         this.addChild(this.listSprite);
         this.listSpriteArray = new Vector.<Sprite>();
         this.buttonGroup = new ButtonGroup();
         length = int(Player.itemList.length);
         i = 0;
         while(i < length)
         {
            onDown = function():void
            {
               setSelectedCell(this);
               if(MainScene.otherPanel)
               {
                  if(MainScene.otherPanel.itemWindow)
                  {
                     MainScene.otherPanel.itemWindow.removeCurrentItem();
                  }
               }
            };
            cell = new EquipmentCell(Player.itemList[i]);
            this.listSprite.addChild(cell);
            cell.y = i * this.Gap;
            this.buttonGroup.addButton(cell);
            this.listSpriteArray.push(cell);
            cell.downFunction = onDown;
            i++;
         }
      }
      
      private function updateText() : *
      {
         this.text.htmlText = "<p align=\'center\'>" + Player.itemList.length + "/" + Player.BAGMAX + "</p>";
         this.text.y = Player.itemList.length * 50;
      }
      
      public function addOneCell() : *
      {
         var onDown:Function = null;
         onDown = function():void
         {
            setSelectedCell(this);
         };
         var cell:EquipmentCell = new EquipmentCell(Player.itemList[Player.itemList.length - 1]);
         this.listSprite.addChild(cell);
         cell.y = (Player.itemList.length - 1) * this.Gap;
         this.buttonGroup.addButton(cell);
         cell.downFunction = onDown;
      }
      
      private function onUpdate(param1:Event) : *
      {
         this.update();
      }
   }
}

