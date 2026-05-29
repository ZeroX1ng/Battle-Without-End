package iGlobal
{
   import flash.display.Stage;
   import flash.events.Event;
   import flash.events.TimerEvent;
   import flash.media.Sound;
   import flash.media.SoundChannel;
   import flash.media.SoundTransform;
   import flash.text.Font;
   import flash.text.TextField;
   import flash.text.TextFieldAutoSize;
   import flash.text.TextFormat;
   import flash.utils.Timer;
   import iData.iMap.Map;
   import iData.iMap.MapList;
   import iPanel.iCell.ItemInfoWindow;
   import iPanel.iCell.StringInfoWindow;
   import iPanel.iScene.MainScene;
   import iPanel.iScene.iPanel.HelpPanel;
   import iPanel.iScene.iPanel.ShopPanel;
   import iPanel.iScene.iPanel.SpecialShopPanel;
   
   public class Global
   {
      
      public static var kongregate:*;
      
      public static var stage:Stage;
      
      public static var stringInfoWindow:StringInfoWindow;
      
      public static var itemInfoWindow:ItemInfoWindow;
      
      public static var mainScene:MainScene;
      
      public static var shopPanel:ShopPanel;
      
      public static var helpPanel:HelpPanel;
      
      public static var specialShopPanel:SpecialShopPanel;
      
      public static var soundChannel:SoundChannel;
      
      public static var map:Map = new Map(MapList.list[0]);
      
      public static const RED:uint = 16728128;
      
      public static const BLUE:uint = 4874455;
      
      public static const YELLOW:uint = 16754240;
      
      public static const GREEN:uint = 8056380;
      
      public static const battle:String = "battle";
      
      public static var battle_toggle:Boolean = true;
      
      public static const battleIntro:String = "battleIntro";
      
      public static var battleIntro_toggle:Boolean = true;
      
      public static const money:String = "money";
      
      public static var money_toggle:Boolean = true;
      
      public static const exp:String = "exp";
      
      public static var exp_toggle:Boolean = true;
      
      public static const item:String = "item";
      
      public static var item_toggle:Boolean = true;
      
      public static const other:String = "other";
      
      public static var other_toggle:Boolean = true;
      
      public static const item0:String = "item0";
      
      public static const item1:String = "item1";
      
      public static const item2:String = "item2";
      
      public static const item3:String = "item3";
      
      public static const item4:String = "item4";
      
      public static const item5:String = "item5";
      
      public static var item0_toggle:Boolean = true;
      
      public static var item1_toggle:Boolean = true;
      
      public static var item2_toggle:Boolean = true;
      
      public static var item3_toggle:Boolean = true;
      
      public static var item4_toggle:Boolean = true;
      
      public static var item5_toggle:Boolean = true;
      
      public static var sword:String = "sword";
      
      public static var axe:String = "axe";
      
      public static var bow:String = "bow";
      
      public static var crossbow:String = "crossbow";
      
      public static var sceptre:String = "sceptre";
      
      public static var staff:String = "staff";
      
      public static var tome:String = "tome";
      
      public static var shield:String = "shield";
      
      public static var dagger:String = "dagger";
      
      public static var suit:String = "suit";
      
      public static var jerkin:String = "jerkin";
      
      public static var breastplate:String = "breastplate";
      
      public static var fur_hat:String = "fur_hat";
      
      public static var felt_hat:String = "felt_hat";
      
      public static var helm:String = "helm";
      
      public static var shoes:String = "Shoes";
      
      public static var boots:String = "Boots";
      
      public static var greaves:String = "Greaves";
      
      public static var necklace:String = "necklace";
      
      public static var ring:String = "ring";
      
      public static var sword_toggle:Boolean = true;
      
      public static var axe_toggle:Boolean = true;
      
      public static var bow_toggle:Boolean = true;
      
      public static var crossbow_toggle:Boolean = true;
      
      public static var sceptre_toggle:Boolean = true;
      
      public static var staff_toggle:Boolean = true;
      
      public static var tome_toggle:Boolean = true;
      
      public static var shield_toggle:Boolean = true;
      
      public static var dagger_toggle:Boolean = true;
      
      public static var body_light_toggle:Boolean = true;
      
      public static var body_medium_toggle:Boolean = true;
      
      public static var body_heavy_toggle:Boolean = true;
      
      public static var head_light_toggle:Boolean = true;
      
      public static var head_medium_toggle:Boolean = true;
      
      public static var head_heavy_toggle:Boolean = true;
      
      public static var feet_light_toggle:Boolean = true;
      
      public static var feet_medium_toggle:Boolean = true;
      
      public static var feet_heavy_toggle:Boolean = true;
      
      public static var necklace_toggle:Boolean = true;
      
      public static var ring_toggle:Boolean = true;
      
      public static var autoSell_toggle:Boolean = true;
      
      public static var sound:Sound = new blow_sound();
      
      public static var sound_toggle:Boolean = true;
      
      public function Global()
      {
         super();
      }
      
      public static function init(param1:Stage) : *
      {
         stage = param1;
         stringInfoWindow = new StringInfoWindow();
         stage.addChild(stringInfoWindow);
         itemInfoWindow = new ItemInfoWindow("As");
         stage.addChild(itemInfoWindow);
         itemInfoWindow.visible = false;
         Font.registerFont(font_nesb);
      }
      
      public static function getTextField(param1:int = 16, param2:uint = 7631988) : TextField
      {
         var _loc3_:TextFormat = new TextFormat("RTWS YueGothic Trial Regular",param1,param2);
         var _loc4_:TextField = new TextField();
         _loc4_.embedFonts = true;
         _loc4_.defaultTextFormat = _loc3_;
         _loc4_.selectable = false;
         _loc4_.autoSize = TextFieldAutoSize.CENTER;
         _loc4_.multiline = false;
         _loc4_.wordWrap = true;
         return _loc4_;
      }
      
      public static function setStringInfoWindow(param1:String) : *
      {
         stringInfoWindow.setText(param1);
         stringInfoWindow.visible = true;
         if(stringInfoWindow.parent)
         {
            stringInfoWindow.parent.addChildAt(stringInfoWindow,stringInfoWindow.parent.numChildren - 1);
         }
      }
      
      public static function hideInfoWindow() : *
      {
         stringInfoWindow.visible = false;
      }
      
      public static function setItemInfoWindow(param1:String) : *
      {
         itemInfoWindow.TEXT = param1;
         itemInfoWindow.visible = true;
         if(itemInfoWindow.parent)
         {
            itemInfoWindow.parent.addChildAt(itemInfoWindow,itemInfoWindow.parent.numChildren - 1);
         }
      }
      
      public static function hideItemInfoWindow() : *
      {
         itemInfoWindow.visible = false;
      }
      
      public static function playSound() : *
      {
         soundChannel = sound.play();
      }
      
      public static function soundOut() : *
      {
         var onTimer:Function;
         var timer:Timer = null;
         var n:int = 0;
         if(soundChannel)
         {
            onTimer = function(param1:Event):*
            {
               soundChannel.soundTransform = new SoundTransform(1 - 0.05 * n);
               ++n;
            };
            timer = new Timer(100,21);
            timer.addEventListener(TimerEvent.TIMER,onTimer);
            n = 0;
            timer.start();
         }
      }
   }
}

