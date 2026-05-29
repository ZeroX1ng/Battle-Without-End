package iPanel.iScene.iPanel.iWindow.iSkill
{
   import flash.events.MouseEvent;
   import flash.geom.ColorTransform;
   import iData.iSkill.Skill;
   import iGlobal.Player;
   
   public class ActiveSkillCell extends SkillCell
   {
      
      public function ActiveSkillCell(param1:Skill)
      {
         super(param1);
         this.addEventListener(MouseEvent.MOUSE_DOWN,this.onMouseDown);
      }
      
      private function onMouseDown(param1:MouseEvent) : void
      {
         if(param1.target is doubleCircle || param1.target is mc_lvup)
         {
            return;
         }
         if(Player.isSkillEquiped(skill))
         {
            Player.unequipSkill(skill);
         }
         else
         {
            Player.equipSkill(skill);
         }
         this.updateEquip();
      }
      
      public function updateEquip() : *
      {
         if(Player.isSkillEquiped(skill))
         {
            this.bg.transform.colorTransform = new ColorTransform(0.9,0.7,0,1,0,0,0,0);
            mc.transform.colorTransform = new ColorTransform(1,1,1,1,255,255,255,0);
            text.transform.colorTransform = new ColorTransform(1,1,1,1,255,255,255,0);
         }
         else
         {
            this.bg.transform.colorTransform = new ColorTransform();
            mc.transform.colorTransform = new ColorTransform();
            text.transform.colorTransform = new ColorTransform();
         }
      }
   }
}

