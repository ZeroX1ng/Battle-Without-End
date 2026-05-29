package tool
{
   import flash.utils.ByteArray;
   
   public class Base64
   {
      
      private static var _linebreaks:Boolean;
      
      private static var _b64Chars:Array = new Array("A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9","+","/");
      
      private static var _b64Lookup:Object = _buildB64Lookup();
      
      public function Base64()
      {
         super();
      }
      
      public static function isWhitespace(param1:String) : Boolean
      {
         switch(param1)
         {
            case " ":
            case "\t":
            case "\r":
            case "\n":
            case "\f":
               return true;
            default:
               return false;
         }
      }
      
      public static function Encode(param1:ByteArray, param2:Boolean = false) : String
      {
         _linebreaks = param2;
         return _encodeBytes(param1);
      }
      
      public static function Decode(param1:String) : ByteArray
      {
         return _decodeSring(param1);
      }
      
      private static function _buildB64Lookup() : Object
      {
         var _loc1_:Object = new Object();
         var _loc2_:Number = 0;
         while(_loc2_ < _b64Chars.length)
         {
            _loc1_[_b64Chars[_loc2_]] = _loc2_;
            _loc2_++;
         }
         return _loc1_;
      }
      
      private static function _isBase64(param1:String) : Boolean
      {
         return _b64Lookup[param1] != undefined;
      }
      
      private static function _encodeBytes(param1:ByteArray) : String
      {
         var _loc3_:uint = 0;
         var _loc5_:ByteArray = null;
         var _loc2_:String = "";
         var _loc4_:uint = 0;
         param1.position = 0;
         while(param1.position < param1.length)
         {
            _loc3_ = param1.bytesAvailable >= 3 ? 3 : param1.bytesAvailable;
            _loc5_ = new ByteArray();
            param1.readBytes(_loc5_,0,_loc3_);
            _loc2_ += _b64EncodeBuffer(_loc5_);
            _loc4_ += 4;
            if(_linebreaks && _loc4_ % 76 == 0)
            {
               _loc2_ += "\n";
               _loc4_ = 0;
            }
         }
         return _loc2_.toString();
      }
      
      private static function _b64EncodeBuffer(param1:ByteArray) : String
      {
         var _loc2_:String = "";
         _loc2_ += _b64Chars[param1[0] >> 2];
         switch(param1.length)
         {
            case 1:
               _loc2_ += _b64Chars[param1[0] << 4 & 0x30];
               _loc2_ += "==";
               break;
            case 2:
               _loc2_ += _b64Chars[param1[0] << 4 & 0x30 | param1[1] >> 4];
               _loc2_ += _b64Chars[param1[1] << 2 & 0x3C];
               _loc2_ += "=";
               break;
            case 3:
               _loc2_ += _b64Chars[param1[0] << 4 & 0x30 | param1[1] >> 4];
               _loc2_ += _b64Chars[param1[1] << 2 & 0x3C | param1[2] >> 6];
               _loc2_ += _b64Chars[param1[2] & 0x3F];
               break;
            default:
               trace("Base64 byteBuffer outOfRange");
         }
         return _loc2_.toString();
      }
      
      private static function _decodeSring(param1:String) : ByteArray
      {
         var _loc7_:String = null;
         var _loc2_:String = "" + param1;
         var _loc3_:ByteArray = new ByteArray();
         var _loc4_:String = "";
         var _loc5_:uint = uint(_loc2_.length);
         var _loc6_:uint = 0;
         while(_loc6_ < _loc5_)
         {
            _loc7_ = _loc2_.charAt(_loc6_);
            if(!isWhitespace(_loc7_) && (_isBase64(_loc7_) || _loc7_ == "="))
            {
               _loc4_ += _loc7_;
               if(_loc4_.length == 4)
               {
                  _loc3_.writeBytes(_b64DecodeBuffer(_loc4_));
                  _loc4_ = "";
               }
            }
            _loc6_++;
         }
         _loc3_.position = 0;
         return _loc3_;
      }
      
      private static function _b64DecodeBuffer(param1:String) : ByteArray
      {
         var _loc2_:ByteArray = new ByteArray();
         var _loc3_:uint = uint(_b64Lookup[param1.charAt(0)]);
         var _loc4_:uint = uint(_b64Lookup[param1.charAt(1)]);
         var _loc5_:uint = uint(_b64Lookup[param1.charAt(2)]);
         var _loc6_:uint = uint(_b64Lookup[param1.charAt(3)]);
         _loc2_.writeByte(_loc3_ << 2 | _loc4_ >> 4);
         if(param1.charAt(2) != "=")
         {
            _loc2_.writeByte(_loc4_ << 4 | _loc5_ >> 2);
         }
         if(param1.charAt(3) != "=")
         {
            _loc2_.writeByte(_loc5_ << 6 | _loc6_);
         }
         return _loc2_;
      }
   }
}

