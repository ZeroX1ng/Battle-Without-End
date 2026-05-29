package iData.iMap
{
   import iData.iMonster.MonsterData;
   import iData.iPet.PetData;
   
   public class MapData
   {
      
      public var monsterList:Vector.<MonsterData>;
      
      public var name:String;
      
      public var realName:String;
      
      public var x:int;
      
      public var y:int;
      
      public var modifier:Number;
      
      public var petList:Vector.<PetData>;
      
      public function MapData(param1:int, param2:int, param3:String, param4:String, param5:Number, param6:Vector.<MonsterData>, param7:Vector.<PetData>)
      {
         super();
         this.name = param3;
         this.realName = param4;
         this.x = param1;
         this.y = param2;
         this.monsterList = param6;
         this.modifier = param5;
         this.petList = param7;
      }
   }
}

