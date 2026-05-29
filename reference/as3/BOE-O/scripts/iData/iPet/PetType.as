package iData.iPet
{
   public class PetType
   {
      
      public static const ATTACK:String = "attack";
      
      public static const DEFENCE:String = "defence";
      
      public static const MAGIC:String = "magic";
      
      public static const BALANCE:String = "balance";
      
      public var type:String;
      
      public var startMin:PetStats;
      
      public var startRange:PetStats;
      
      public var growMin:PetStats;
      
      public var growRange:PetStats;
      
      public function PetType(param1:String, param2:PetStats, param3:PetStats, param4:PetStats, param5:PetStats)
      {
         super();
         this.type = param1;
         this.startMin = param2;
         this.startRange = param3;
         this.growMin = param4;
         this.growRange = param5;
      }
   }
}

