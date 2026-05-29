package iData.iItem
{
   public class Weapon extends Equipment
   {
      
      public static const ONEHAND:String = "one-handed";
      
      public static const OFFHAND:String = "off hand";
      
      public static const TWOHAND:String = "two-handed";
      
      public var category:String;
      
      public function Weapon(param1:WeaponData, param2:Number, param3:Boolean = false)
      {
         super(param1,param2,param3);
      }
      
      override protected function setData(param1:EquipmentData) : *
      {
         super.setData(param1);
         this.category = (param1 as WeaponData).category;
      }
      
      public function getCategory() : String
      {
         switch(this.category)
         {
            case WeaponCategory.RANGED:
               return "远程";
            case WeaponCategory.MELEE:
               return "近战";
            default:
               return this.category;
         }
      }
   }
}

