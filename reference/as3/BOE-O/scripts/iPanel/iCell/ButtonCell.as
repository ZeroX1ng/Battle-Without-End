package iPanel.iCell
{
   import flash.display.Sprite;
   import flash.events.MouseEvent;
   import flash.utils.getDefinitionByName;
   
   public class ButtonCell extends Sprite
   {
      
      protected var before:Sprite;
      
      protected var after:Sprite;
      
      internal var buttonGroup:ButtonGroup;
      
      protected var buttonDown:Boolean = false;
      
      public var downFunction:Function;
      
      public function ButtonCell(param1:String, param2:String)
      {
         super();
         this.before = new (getDefinitionByName(param1) as Class)();
         this.after = new (getDefinitionByName(param2) as Class)();
         this.addChild(this.before);
         this.addChild(this.after);
         this.after.visible = false;
         this.addEventListener(MouseEvent.MOUSE_OVER,this.onMouseOver);
         this.addEventListener(MouseEvent.MOUSE_OUT,this.onMouseOut);
         this.addEventListener(MouseEvent.MOUSE_DOWN,this.onMouseDown);
      }
      
      public function onMouseOver(param1:MouseEvent) : void
      {
         if(!this.buttonDown)
         {
            this.setAfter();
         }
      }
      
      public function onMouseOut(param1:MouseEvent) : void
      {
         if(!this.buttonDown)
         {
            this.setBefore();
         }
      }
      
      public function onMouseDown(param1:MouseEvent) : void
      {
         if(this.buttonGroup)
         {
            this.buttonGroup.setDown(this);
         }
         else
         {
            this.setDown();
         }
      }
      
      public function setAfter() : void
      {
         this.after.visible = true;
      }
      
      public function setBefore() : void
      {
         this.after.visible = false;
         this.buttonDown = false;
      }
      
      public function setDown() : void
      {
         if(!this.buttonDown)
         {
            this.buttonDown = true;
            if(Boolean(this.downFunction))
            {
               this.downFunction();
            }
         }
         else
         {
            this.buttonDown = false;
            this.setBefore();
         }
      }
   }
}

