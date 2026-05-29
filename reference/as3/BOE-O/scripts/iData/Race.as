package iData
{
   public class Race
   {
      
      public var name:String;
      
      public var initial:BasicStatus;
      
      public var ageupList:Vector.<BasicStatus>;
      
      public function Race(param1:String, param2:BasicStatus, param3:Vector.<BasicStatus>)
      {
         super();
         this.name = param1;
         this.initial = param2;
         this.ageupList = param3;
      }
      
      public function caculateStat(param1:int) : BasicStatus
      {
         var _loc2_:BasicStatus = this.initial.clone();
         var _loc3_:int = param1 - 25;
         if(param1 > 25)
         {
            param1 = 25;
         }
         var _loc4_:int = 10;
         while(_loc4_ < param1)
         {
            _loc2_.hp += this.ageupList[_loc4_ - 10].hp + 1;
            _loc2_.mp += this.ageupList[_loc4_ - 10].mp + 1;
            _loc2_.str += this.ageupList[_loc4_ - 10].str;
            _loc2_.dex += this.ageupList[_loc4_ - 10].dex;
            _loc2_.will += this.ageupList[_loc4_ - 10].will;
            _loc2_.intelligence += this.ageupList[_loc4_ - 10].intelligence;
            _loc2_.luck += this.ageupList[_loc4_ - 10].luck;
            _loc4_++;
         }
         if(param1 == 25)
         {
            _loc2_.hp += _loc3_;
            _loc2_.mp += _loc3_;
         }
         return _loc2_;
      }
   }
}

