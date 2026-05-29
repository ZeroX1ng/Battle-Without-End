package iData.iSkill.iBuff
{
   import iGlobal.Global;
   import iPanel.iScene.MainScene;
   
   public class BuffPoison extends Buff
   {
      
      public function BuffPoison(param1:int)
      {
         super(param1);
         this.name = "poison";
         this.count = param1;
      }
      
      override public function run() : *
      {
         MainScene.battle.monsterHp -= count;
         MainScene.allInfoPanel.addText("<font color=\'#ff4040\'>毒</font>对" + MainScene.battle.monster.nameHtml + "造成了<font color=\'#ff4040\'>" + this.count + "</font>伤害 ",Global.battle);
      }
      
      override public function combine(param1:Buff) : *
      {
         this.count += param1.count;
      }
   }
}

