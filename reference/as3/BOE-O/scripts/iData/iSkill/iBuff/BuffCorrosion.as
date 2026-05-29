package iData.iSkill.iBuff
{
   public class BuffCorrosion extends Buff
   {
      
      public function BuffCorrosion(param1:int)
      {
         super(param1);
         this.name = "corrosion";
         this.count = param1;
      }
      
      override public function run() : *
      {
      }
      
      override public function combine(param1:Buff) : *
      {
         this.count += param1.count;
      }
   }
}

