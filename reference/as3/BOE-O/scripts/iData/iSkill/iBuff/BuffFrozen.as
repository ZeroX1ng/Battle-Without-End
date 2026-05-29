package iData.iSkill.iBuff
{
   import iGlobal.Global;
   import iPanel.iScene.MainScene;
   
   public class BuffFrozen extends Buff
   {
      
      public function BuffFrozen(param1:int)
      {
         super(param1);
         this.name = "frozen";
         this.count = param1;
      }
      
      override public function run() : *
      {
         --this.count;
         MainScene.allInfoPanel.addText(MainScene.battle.monster.nameHtml + "被<font color=\'#ff4040\'>冰冻了!</font>",Global.battle);
      }
      
      override public function combine(param1:Buff) : *
      {
         this.count = param1.count;
      }
   }
}

