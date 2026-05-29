package iData.iSkill.iBuff
{
   public class Buff
   {
      
      public var name:String;
      
      public var count:int;
      
      public function Buff(param1:int)
      {
         super();
      }
      
      public function run() : *
      {
      }
      
      public function combine(param1:Buff) : *
      {
      }
      
      public function isOver() : Boolean
      {
         if(this.count <= 0)
         {
            return true;
         }
         return false;
      }
   }
}

