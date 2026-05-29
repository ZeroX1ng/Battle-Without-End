package iData.iPet
{
   public class PetData
   {
      
      public var name:String;
      
      public var realName:String;
      
      public var type:PetType;
      
      public var mc:String;
      
      public function PetData(param1:String, param2:String, param3:PetType, param4:String)
      {
         super();
         this.name = param1;
         this.realName = param2;
         this.type = param3;
         this.mc = param4;
      }
   }
}

