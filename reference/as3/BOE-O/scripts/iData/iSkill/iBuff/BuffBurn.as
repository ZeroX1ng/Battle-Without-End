package iData.iSkill.iBuff
{
   import iGlobal.Global;
   import iPanel.iScene.MainScene;
   
   public class BuffBurn extends Buff
   {
      
      public function BuffBurn(param1:int)
      {
         super(param1);
         this.name = "burn";
         this.count = param1;
      }
      
      override public function run() : *
      {
         MainScene.battle.monsterHp -= count;
         MainScene.allInfoPanel.addText("<font color=\'#ff4040\'>灼伤</font>对" + MainScene.battle.monster.nameHtml + "造成了<font color=\'#ff4040\'>" + this.count + "</font>伤害",Global.battle);
      }
      
      override public function combine(param1:Buff) : *
      {
         this.count += param1.count;
      }
   }
}

