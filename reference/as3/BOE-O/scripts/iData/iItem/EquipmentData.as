package iData.iItem
{
   public class EquipmentData
   {
      
      public var position:String;
      
      public var type:String;
      
      public var name:String;
      
      public var realName:String;
      
      public var stat:Vector.<RangeStat>;
      
      public var sortWeight:int;
      
      public function EquipmentData(param1:String, param2:String, param3:String, param4:String, param5:Vector.<RangeStat>, param6:int)
      {
         super();
         this.position = param1;
         this.type = param2;
         this.name = param3;
         this.realName = param4;
         this.stat = param5;
         this.sortWeight = param6;
      }
   }
}

