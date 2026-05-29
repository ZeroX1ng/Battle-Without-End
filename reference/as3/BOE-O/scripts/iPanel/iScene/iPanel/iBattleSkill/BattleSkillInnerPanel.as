package iPanel.iScene.iPanel.iBattleSkill
{
   import flash.display.Sprite;
   import iData.iSkill.ActiveSkill;
   import iGlobal.Player;
   import iPanel.InnerPanel;
   import iPanel.iCell.StringCell;
   
   public class BattleSkillInnerPanel extends InnerPanel
   {
      
      private var att:StringCell = new StringCell("攻击",100,24);
      
      private var def:StringCell = new StringCell("防御",100,24);
      
      private const GAP:int = 20;
      
      private const yStart:int = -5;
      
      private const xStart1:int = 5;
      
      private const xStart2:int = 10;
      
      private var attPanel:Sprite;
      
      private var defPanel:Sprite;
      
      private var panel:Sprite;
      
      private var bg:Sprite;
      
      public function BattleSkillInnerPanel()
      {
         super();
         this.bg = new Sprite();
         this.addChild(this.bg);
         this.panel = new Sprite();
         this.attPanel = new Sprite();
         this.defPanel = new Sprite();
         this.addChild(this.panel);
         this.update();
      }
      
      public function update() : *
      {
         var _loc3_:int = 0;
         var _loc4_:int = 0;
         var _loc5_:StringCell = null;
         this.remove();
         var _loc1_:Vector.<ActiveSkill> = Player.attackSkillList;
         var _loc2_:int = int(_loc1_.length);
         if(_loc2_ > 0)
         {
            this.panel.addChild(this.att);
            this.att.x = this.xStart1;
            this.att.y = this.yStart;
            _loc3_ = Player.spellChance + 20 + _loc2_ * 5;
            if(_loc3_ > 95)
            {
               _loc3_ = 95;
            }
            _loc4_ = 0;
            while(_loc4_ < _loc2_)
            {
               _loc5_ = new StringCell(_loc1_[_loc4_].skillData.realName + "  " + (_loc3_ / _loc2_ * 100 >> 0) / 100 + "%",160);
               this.attPanel.addChild(_loc5_);
               _loc5_.y = this.GAP * _loc4_;
               _loc4_++;
            }
            this.panel.addChild(this.attPanel);
            this.attPanel.x = this.xStart2;
            this.attPanel.y = this.yStart + 30;
         }
         _loc1_ = Player.defenceSkillList;
         _loc2_ = int(_loc1_.length);
         if(_loc2_ > 0)
         {
            this.panel.addChild(this.def);
            this.def.x = this.xStart1;
            this.def.y = this.attPanel.y + this.attPanel.height;
            _loc3_ = Player.spellChance + _loc2_ * 20;
            if(_loc3_ > 95)
            {
               _loc3_ = 95;
            }
            _loc4_ = 0;
            while(_loc4_ < _loc2_)
            {
               _loc5_ = new StringCell(_loc1_[_loc4_].skillData.realName + "  " + (_loc3_ / _loc2_ * 100 >> 0) / 100 + "%",160);
               this.defPanel.addChild(_loc5_);
               _loc5_.y = this.GAP * _loc4_;
               _loc4_++;
            }
            this.panel.addChild(this.defPanel);
            this.defPanel.x = this.xStart2;
            this.defPanel.y = this.def.y + 30;
         }
         this.drawBg();
      }
      
      private function remove() : *
      {
         var _loc1_:* = 0;
         if(this.panel.contains(this.att))
         {
            this.panel.removeChild(this.att);
         }
         if(this.panel.contains(this.def))
         {
            this.panel.removeChild(this.def);
         }
         _loc1_ = int(this.attPanel.numChildren - 1);
         while(_loc1_ >= 0)
         {
            this.attPanel.removeChildAt(_loc1_);
            _loc1_--;
         }
         _loc1_ = int(this.defPanel.numChildren - 1);
         while(_loc1_ >= 0)
         {
            this.defPanel.removeChildAt(_loc1_);
            _loc1_--;
         }
      }
      
      private function drawBg() : *
      {
         this.bg.graphics.clear();
         this.bg.graphics.beginFill(16777215,0);
         this.bg.graphics.drawRect(0,0,170,this.height);
         this.bg.graphics.endFill();
      }
   }
}

