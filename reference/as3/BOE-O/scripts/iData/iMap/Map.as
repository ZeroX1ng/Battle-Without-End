package iData.iMap
{
   import iData.iMonster.Boss;
   
   public class Map
   {
      
      public var mapData:MapData;
      
      public var averageCp:int;
      
      public function Map(param1:MapData)
      {
         super();
         this.mapData = param1;
         this.setAverageCp();
      }
      
      public function setAverageCp() : void
      {
         var _loc3_:int = 0;
         var _loc1_:int = 0;
         var _loc2_:int = int(this.mapData.monsterList.length);
         while(_loc3_ < _loc2_)
         {
            _loc1_ += this.mapData.monsterList[_loc3_].CP;
            _loc3_++;
         }
         this.averageCp = _loc1_ / _loc2_;
      }
      
      public function getBoss() : Boss
      {
         return new Boss(this.mapData.monsterList[Math.random() * this.mapData.monsterList.length >> 0]);
      }
   }
}

