package iData.iItem
{
   public class WeaponData extends EquipmentData
   {
      
      public var category:String;
      
      public function WeaponData(param1:String, param2:String, param3:String, param4:String, param5:Vector.<RangeStat>, param6:String, param7:int)
      {
         super(param1,param2,param3,param4,param5,param7);
         this.category = param6;
         trace(param1);
      }
   }
}

