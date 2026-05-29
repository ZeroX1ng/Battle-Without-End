package tool
{
   import flash.display.Shape;
   import flash.utils.ByteArray;
   
   public class MyMath
   {
      
      public function MyMath()
      {
         super();
      }
      
      public static function balanceRandom(param1:int) : Number
      {
         var _loc9_:int = 0;
         var _loc11_:Number = NaN;
         var _loc2_:int = param1;
         if(param1 < 50)
         {
            _loc2_ = 100 - param1;
         }
         var _loc3_:Number = (3 * _loc2_ - 100) / (100 - _loc2_);
         var _loc4_:Array = new Array();
         var _loc5_:Array = new Array();
         var _loc6_:int = 100;
         var _loc7_:int = 1;
         var _loc8_:Number = _loc7_ / _loc6_;
         _loc9_ = 0;
         while(_loc9_ < _loc6_)
         {
            _loc11_ = _loc8_ * _loc9_;
            _loc4_[_loc9_] = (1 - _loc11_) * Math.pow(_loc11_,_loc3_);
            if(_loc9_ == 0)
            {
               _loc5_[_loc9_] = _loc4_[_loc9_];
            }
            else
            {
               _loc5_[_loc9_] = _loc5_[_loc9_ - 1] + _loc4_[_loc9_];
            }
            _loc9_++;
         }
         var _loc10_:Number = Math.random() * _loc5_[_loc6_ - 1];
         _loc9_ = 0;
         while(_loc9_ < _loc6_)
         {
            if(_loc10_ < _loc5_[_loc9_])
            {
               if(param1 < 50)
               {
                  return 1 - _loc8_ * _loc9_;
               }
               return _loc8_ * _loc9_;
            }
            _loc9_++;
         }
         return 1;
      }
      
      public static function DrawSector(param1:Shape, param2:Number = 200, param3:Number = 200, param4:Number = 100, param5:Number = 27, param6:Number = 270, param7:Number = 16711680) : void
      {
         var _loc11_:* = undefined;
         var _loc12_:* = undefined;
         var _loc13_:* = undefined;
         var _loc14_:* = undefined;
         var _loc15_:* = undefined;
         param1.graphics.beginFill(param7);
         param1.graphics.lineStyle(0,16711680);
         param1.graphics.moveTo(param2,param3);
         param5 = Math.abs(param5) > 360 ? 360 : param5;
         var _loc8_:Number = Math.ceil(Math.abs(param5) / 45);
         var _loc9_:Number = param5 / _loc8_;
         _loc9_ = _loc9_ * Math.PI / 180;
         param6 = param6 * Math.PI / 180;
         param1.graphics.lineTo(param2 + param4 * Math.cos(param6),param3 + param4 * Math.sin(param6));
         var _loc10_:* = 1;
         while(_loc10_ <= _loc8_)
         {
            param6 += _loc9_;
            _loc11_ = param6 - _loc9_ / 2;
            _loc12_ = param2 + param4 / Math.cos(_loc9_ / 2) * Math.cos(_loc11_);
            _loc13_ = param3 + param4 / Math.cos(_loc9_ / 2) * Math.sin(_loc11_);
            _loc14_ = param2 + param4 * Math.cos(param6);
            _loc15_ = param3 + param4 * Math.sin(param6);
            param1.graphics.curveTo(_loc12_,_loc13_,_loc14_,_loc15_);
            _loc10_++;
         }
         if(param5 != 360)
         {
            param1.graphics.lineTo(param2,param3);
         }
         param1.graphics.endFill();
      }
      
      public static function FirstLetterToUpper(param1:String) : String
      {
         var _loc2_:Array = param1.split("");
         _loc2_[0] = _loc2_[0].toUpperCase();
         return _loc2_.join("");
      }
      
      public static function StringFormChange(param1:String, param2:String, param3:String) : String
      {
         var _loc4_:Array = param1.split(param2);
         return _loc4_.join(param3);
      }
      
      public static function cast(param1:String) : String
      {
         var _loc2_:ByteArray = new ByteArray();
         _loc2_.writeMultiByte(param1 + "@","");
         var _loc3_:String = "";
         var _loc4_:int = 0;
         while(_loc4_ < _loc2_.length)
         {
            _loc3_ += _loc2_[_loc4_].toString(16) + " ";
            _loc4_++;
         }
         return _loc3_;
      }
      
      public static function encryptNum(param1:Number) : Number
      {
         return param1 / 2 + 1;
      }
      
      public static function decryptNum(param1:Number) : Number
      {
         return (param1 - 1) * 2;
      }
      
      public static function encryptInt(param1:int) : int
      {
         return param1 + 5;
      }
      
      public static function decryptInt(param1:int) : int
      {
         return param1 - 5;
      }
   }
}

