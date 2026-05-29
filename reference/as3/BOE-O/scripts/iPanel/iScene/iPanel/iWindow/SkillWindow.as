package iPanel.iScene.iPanel.iWindow
{
   import flash.display.Sprite;
   import flash.events.Event;
   import iGlobal.Global;
   import iGlobal.Player;
   import iPanel.OutterPanel;
   import iPanel.iCell.ButtonGroup;
   import iPanel.iScene.iPanel.iWindow.iSkill.CombatInnerPanel;
   import iPanel.iScene.iPanel.iWindow.iSkill.CombatOutterPanel;
   import iPanel.iScene.iPanel.iWindow.iSkill.MagicInnerPanel;
   import iPanel.iScene.iPanel.iWindow.iSkill.MagicOutterPanel;
   import iPanel.iScene.iPanel.iWindow.iSkill.PassiveInnerPanel;
   import iPanel.iScene.iPanel.iWindow.iSkill.PassiveOutterPanel;
   import iPanel.iScene.iPanel.iWindow.iSkill.StringButton;
   import tool.MyEvent;
   
   public class SkillWindow extends Window
   {
      
      public var panel:OutterPanel;
      
      private var combatPanel:CombatOutterPanel;
      
      private var magicPanel:MagicOutterPanel;
      
      private var passivePanel:PassiveOutterPanel;
      
      public function SkillWindow()
      {
         var buttonSprite:Sprite;
         var combat:StringButton;
         var magic:StringButton;
         var buttonGroup:ButtonGroup;
         var removePanel:Function;
         var passive:StringButton = null;
         var _this:* = undefined;
         var combatDown:Function = null;
         var magicDown:Function = null;
         var passiveDown:Function = null;
         super();
         combatDown = function():void
         {
            removePanel();
            panel = combatPanel;
            _this.addChild(panel);
            panel.y = 25;
         };
         magicDown = function():void
         {
            removePanel();
            panel = magicPanel;
            _this.addChild(panel);
            panel.y = 25;
         };
         passiveDown = function():void
         {
            removePanel();
            panel = passivePanel;
            _this.addChild(panel);
            panel.y = 25;
         };
         removePanel = function():*
         {
            if(_this.panel)
            {
               _this.removeChild(panel);
            }
         };
         buttonSprite = new Sprite();
         this.addChild(buttonSprite);
         combat = new StringButton("战斗",Global.RED);
         buttonSprite.addChild(combat);
         magic = new StringButton("魔法",Global.BLUE);
         buttonSprite.addChild(magic);
         magic.x = 67;
         passive = new StringButton("被动",Global.YELLOW);
         buttonSprite.addChild(passive);
         passive.x = 134;
         buttonGroup = new ButtonGroup();
         buttonGroup.addButton(combat);
         buttonGroup.addButton(magic);
         buttonGroup.addButton(passive);
         this.combatPanel = new CombatOutterPanel();
         this.magicPanel = new MagicOutterPanel();
         this.passivePanel = new PassiveOutterPanel();
         this.addEventListener(MyEvent.Update,this.onUpdate,true);
         combat.downFunction = combatDown;
         _this = this;
         magic.downFunction = magicDown;
         passive.downFunction = passiveDown;
      }
      
      public function onUpdate(param1:Event = null) : *
      {
         (this.combatPanel.innerPanel as CombatInnerPanel).update();
         (this.magicPanel.innerPanel as MagicInnerPanel).update();
         (this.passivePanel.innerPanel as PassiveInnerPanel).update();
         Player.updateSkillInfo();
      }
   }
}

