// ═══ 存档系统 ═══
// AS3 原始: iGlobal.Player.save() + Player.manualSave()
//
// 实现：
// - localSave: 存档到 localStorage（替代 Flash SharedObject）
// - fileExport: 导出存档文件（替代 FileReference.save）
// - fileImport: 导入存档文件（替代 FileReference.load）

import { Base64Encode, Base64Decode } from '../utils/Base64';
import type { PlayerState, GlobalConfig } from '../types';
import type { Equipment } from '../models/Equipment';
import type { Skill } from '../models/Skill';
import { Equipment as EquipmentClass } from '../models/Equipment';
import { Skill as SkillClass } from '../models/Skill';
import { Pet as PetClass } from '../models/Pet';
import { BasicStatus } from '../models/BasicStatus';
import { list as RaceList, UNDEATH } from '../data/raceData';
import { TitleList, createTitleListState, deserializeTitleState, serializeTitleState } from '../data/titleData';
import { updateAllInfo } from '../models/Player';

export const SAVE_PREFIX = 'boe_save_';
export const SAVE_SLOTS = ['slot1', 'slot2', 'slot3', 'slot4'] as const;
export const SAVE_LOCAL_STORAGE_KEYS = SAVE_SLOTS.map(slot => `${SAVE_PREFIX}${slot}`);
export const SAVE_COMPATIBILITY_WARNING = '现在我的修复会对存档造成不可逆的损伤，然后分析如何修复';

export function getBrowserSaveStorageHint(): string {
  return `网页端本地槽位保存在当前网址的 localStorage：${SAVE_LOCAL_STORAGE_KEYS.join(', ')}。手动导出的 .boe 文件由浏览器保存，通常在下载目录；网页安全限制不允许游戏自动预选玩家本机文件夹。`;
}

/**
 * 序列化玩家状态为存档字符串
 * AS3 原始: Player.save() / Player.manuallySave()
 */
export function serializeSave(
  player: PlayerState,
  config: GlobalConfig,
  mapName: string,
  slot: string
): string {
  let _loc2_ = '';

  // @BASIC
  _loc2_ += '@BASIC:';
  const basicKeys = ['lv', 'age', 'ap', 'xp', 'gold', 'apCost', 'caculate', 'BAGMAX', 'PETMAX'];
  for (const key of basicKeys) {
    _loc2_ += key + ',' + (player as any)[key] + ',';
  }

  // @RACE
  _loc2_ += '@RACE:';
  _loc2_ += player.race?.name ?? '';

  // @EQUIP
  _loc2_ += '@EQUIP:';
  const equipKeys = ['head', 'body', 'feet', 'necklace', 'ring', 'leftHand', 'rightHand'];
  for (const key of equipKeys) {
    const equip = (player as any)[key];
    if (equip) {
      _loc2_ += key + ',' + (equip as Equipment).save() + ',';
    }
  }

  // @ITEM
  _loc2_ += '@ITEM:';
  for (const item of player.itemList) {
    _loc2_ += item.save() + ',';
  }

  // @SKILL
  _loc2_ += '@SKILL:';
  for (const skill of player.skillList) {
    _loc2_ += skill.save() + ',';
  }

  // @TITLE
  _loc2_ += '@TITLE:';
  const playerTitleList = createTitleListState(player.titleList?.length ? player.titleList : (player.title ? [player.title] : []));
  for (const title of playerTitleList) {
    _loc2_ += serializeTitleState(title) + ',';
  }

  // @OTHER
  _loc2_ += '@OTHER:';
  const otherKeys = ['hp', 'mp', 'luck', 'intelligence', 'str', 'dex', 'will'];
  for (const key of otherKeys) {
    _loc2_ += key + ',' + (player.basicStatus as any)[key] + ',';
  }

  // @GLOBAL
  _loc2_ += '@GLOBAL:';
  _loc2_ += 'toggle,';
  const toggleKeys = [
    'battle', 'battleIntro', 'money', 'exp', 'item',
    'item0', 'item1', 'item2', 'item3', 'item4',
    'sword', 'axe', 'bow', 'crossbow', 'sceptre', 'staff', 'dagger', 'tome', 'shield',
    'head_light', 'head_medium', 'head_heavy',
    'body_light', 'body_medium', 'body_heavy',
    'feet_light', 'feet_medium', 'feet_heavy',
    'ring', 'necklace', 'sound',
  ];
  for (const key of toggleKeys) {
    _loc2_ += key + '#' + (config as any)[key + '_toggle'] + '#';
  }

  // @SELECTION
  _loc2_ += '@SELECTION:';
  _loc2_ += 'map,' + mapName + '#';
  if (player.title) {
    _loc2_ += 'title,' + player.title.name;
  }

  // @PET
  _loc2_ += '@PET:';
  for (const pet of player.petList) {
    _loc2_ += pet.save() + ',';
  }

  // @EQUIPEDPET
  _loc2_ += '@EQUIPEDPET:';
  if (player.pet) {
    _loc2_ += player.pet.save();
  }

  return Base64Encode(_loc2_);
}

/**
 * 保存到 localStorage
 * AS3 原始: Player.save() — SharedObject
 */
export function localSave(
  playerName: string,
  slot: string,
  saveString: string
): void {
  const now = new Date();
  const timeStr = `[${now.getMonth() + 1}/${now.getDate()}/${now.getHours()}:${now.getMinutes()}]`;
  const data = {
    userName: playerName,
    time: timeStr,
    info: saveString,
  };
  localStorage.setItem(SAVE_PREFIX + slot, JSON.stringify(data));
}

/**
 * 从 localStorage 加载
 */
export function localLoad(slot: string): { userName: string; time: string; info: string } | null {
  const raw = localStorage.getItem(SAVE_PREFIX + slot);
  if (!raw) return null;
  return JSON.parse(raw);
}

/**
 * 导出存档文件
 * AS3 原始: Player.manuallySave() — FileReference.save
 */
export function fileExport(
  playerName: string,
  slot: string,
  saveString: string
): void {
  const content = playerName + '<>' + slot + '<>' + saveString;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = slot + '.boe';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 手动存档 — 序列化 + 本地存储 + 文件导出
 * AS3 原始: Player.manuallySave()
 */
export function manuallySave(
  player: PlayerState,
  config: GlobalConfig,
  mapName: string,
  slot: string
): string {
  const saveString = serializeSave(player, config, mapName, slot);
  localSave(player.playerName, slot, saveString);
  fileExport(player.playerName, slot, saveString);
  return saveString;
}

/**
 * 导入存档文件
 * AS3 原始: Player.manualLoad() — FileReference.load
 */
export function fileImport(file: File): Promise<{ playerName: string; slot: string; info: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const parts = content.split('<>');
      if (parts.length < 3) {
        reject(new Error('无效的存档文件'));
        return;
      }
      resolve({
        playerName: parts[0],
        slot: parts[1],
        info: parts[2],
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * 获取所有存档槽位
 */
export function getSaveSlots(): { slot: string; userName: string; time: string }[] {
  const slots: { slot: string; userName: string; time: string }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(SAVE_PREFIX)) {
      const data = JSON.parse(localStorage.getItem(key)!);
      slots.push({
        slot: key.replace(SAVE_PREFIX, ''),
        userName: data.userName,
        time: data.time,
      });
    }
  }
  return slots;
}

// ═══ 反序列化 ═══

export interface DeserializedSave {
  player: PlayerState;
  config: GlobalConfig;
  mapName: string;
  selectedTitleName: string | null;
  playerName: string;
}

/**
 * 反序列化 DSL 格式存档，重建 PlayerState + GlobalConfig
 * AS3 原始: Player.manualLoad() 中的解析逻辑
 *
 * 存档格式（Base64 编码前）：
 * @BASIC:lv,VAL,age,VAL,ap,VAL,...
 * @RACE:raceName
 * @EQUIP:slot,equipSaveStr,slot,equipSaveStr,...
 * @ITEM:itemSaveStr,itemSaveStr,...
 * @SKILL:skillSaveStr,skillSaveStr,...
 * @TITLE:titleSaveStr,titleSaveStr,...
 * @OTHER:hp,VAL,mp,VAL,...
 * @GLOBAL:toggle,key#val#key#val#...
 * @SELECTION:map,mapName#title,titleName
 * @PET:petSaveStr,petSaveStr,...
 * @EQUIPEDPET:petSaveStr
 */
export function deserializeSave(
  saveString: string,
  saveSlot: string
): DeserializedSave {
  const decoded = Base64Decode(saveString);
  const sections = splitSections(decoded);

  // 解析各区块
  let basic: any = {};
  let raceName = '';
  let otherStats: any = {};
  let equipData: [string, string][] = [];
  let itemStrs: string[] = [];
  let skillStrs: string[] = [];
  let titleStrs: string[] = [];
  let togglePairs: [string, string][] = [];
  let mapName = '';
  let selectedTitleName: string | null = null;
  let petStrs: string[] = [];
  let equipedPetStr = '';

  for (const [name, content] of sections) {
    switch (name) {
      case 'BASIC':
        basic = parsePairs(content, ',');
        break;
      case 'RACE':
        raceName = content;
        break;
      case 'EQUIP':
        equipData = parseSlotPairs(content);
        break;
      case 'ITEM':
        itemStrs = content.split(',').filter(s => s !== '');
        break;
      case 'SKILL':
        skillStrs = content.split(',').filter(s => s !== '');
        break;
      case 'TITLE':
        titleStrs = content.split(',').filter(s => s !== '');
        break;
      case 'OTHER':
        otherStats = parsePairs(content, ',');
        break;
      case 'GLOBAL':
        togglePairs = parseTogglePairs(content);
        break;
      case 'SELECTION':
        ({ mapName, selectedTitleName } = parseSelection(content));
        break;
      case 'PET':
        petStrs = content.split(',').filter(s => s !== '');
        break;
      case 'EQUIPEDPET':
        equipedPetStr = content;
        break;
    }
  }

  // 查找种族
  const race = resolveRace(raceName);

  // 构建基础属性
  const basicStatus = new BasicStatus(
    Number(otherStats.hp) || 1,
    Number(otherStats.mp) || 1,
    Number(otherStats.str) || 0,
    Number(otherStats.dex) || 0,
    Number(otherStats.intelligence) || 0,
    Number(otherStats.will) || 0,
    Number(otherStats.luck) || 0
  );

  // 加载装备
  const equipSlots: Record<string, EquipmentClass | null> = {
    head: null, body: null, feet: null, necklace: null, ring: null, leftHand: null, rightHand: null
  };
  for (const [slot, str] of equipData) {
    if (str && slot in equipSlots) {
      equipSlots[slot] = EquipmentClass.load(str);
    }
  }

  // 加载道具
  const itemList: EquipmentClass[] = [];
  for (const str of itemStrs) {
    if (str) itemList.push(EquipmentClass.load(str));
  }

  // 加载技能
  const skillList: SkillClass[] = [];
  for (const str of skillStrs) {
    if (str) skillList.push(SkillClass.load(str));
  }

  // 加载称号
  const titleList: any[] = [];
  for (let i = 0; i < TitleList.length; i++) {
    const title = i < titleStrs.length && titleStrs[i] !== ''
      ? deserializeTitleState(TitleList[i], titleStrs[i])
      : deserializeTitleState(TitleList[i], '');
    titleList.push(title);
  }

  // 选择当前称号
  let currentTitle: any = null;
  if (selectedTitleName) {
    currentTitle = titleList.find(t => t.name === selectedTitleName) ?? null;
  }

  // 加载宠物
  const petList: PetClass[] = [];
  for (const str of petStrs) {
    if (str) petList.push(PetClass.load(str));
  }

  let currentPet: PetClass | null = null;
  if (equipedPetStr) {
    currentPet = PetClass.load(equipedPetStr);
  }

  // 构建配置
  const config: GlobalConfig = createDefaultConfig();
  for (const [key, val] of togglePairs) {
    const configKey = (key + '_toggle') as keyof GlobalConfig;
    if (configKey in config) {
      (config as any)[configKey] = parseToggleValue(val);
    }
  }

  // 构建 PlayerState
  const player: PlayerState = {
    lv: Number(basic.lv) || 1,
    age: Number(basic.age) || 10,
    race,
    basicStatus,
    ap: Number(basic.ap) || 0,
    gold: Number(basic.gold) || 0,
    xp: Number(basic.xp) || 0,
    pet: currentPet,
    title: currentTitle,
    apCost: Number(basic.apCost) || 0,
    storeLv: 0,
    head: equipSlots.head,
    feet: equipSlots.feet,
    body: equipSlots.body,
    necklace: equipSlots.necklace,
    ring: equipSlots.ring,
    leftHand: equipSlots.leftHand,
    rightHand: equipSlots.rightHand,
    BAGMAX: Number(basic.BAGMAX) || 50,
    PETMAX: Number(basic.PETMAX) || 10,
    caculate: Number(basic.caculate) || 0,
    playerName: saveSlot,
    skillStatus: new BasicStatus(0, 0, 0, 0, 0, 0, 0),
    equipStatus: new BasicStatus(0, 0, 0, 0, 0, 0, 0),
    skillList,
    equipSkillList: [],
    itemList: itemList as any,
    titleList,
    petList: petList as any,
  };

  return {
    player: updateAllInfo(player),
    config,
    mapName,
    selectedTitleName,
    playerName: saveSlot,
  };
}

// ═══ DSL 解析辅助函数 ═══

/** 按 @ 分割各区块，返回 [区块名, 内容] 对 */
function splitSections(raw: string): [string, string][] {
  const result: [string, string][] = [];
  const blocks = raw.split('@');
  for (const block of blocks) {
    const colonIdx = block.indexOf(':');
    if (colonIdx < 0) continue;
    const name = block.substring(0, colonIdx);
    const content = block.substring(colonIdx + 1);
    if (name) result.push([name, content]);
  }
  return result;
}

/** 解析 key,val,key,val,... 格式 */
function parsePairs(data: string, sep: string): Record<string, string> {
  const result: Record<string, string> = {};
  const parts = data.split(sep);
  for (let i = 0; i + 1 < parts.length; i += 2) {
    const key = parts[i];
    const val = parts[i + 1];
    if (key) result[key] = val;
  }
  return result;
}

/** 解析 EQUIP 区块的 slot,equipStr 对 */
function parseSlotPairs(data: string): [string, string][] {
  const result: [string, string][] = [];
  const equipSlots = ['head', 'body', 'feet', 'necklace', 'ring', 'leftHand', 'rightHand'];

  let remaining = data;
  for (const slot of equipSlots) {
    if (!remaining.startsWith(slot + ',')) continue;
    remaining = remaining.substring(slot.length + 1); // skip "slot,"

    // 查找下一个装备槽位或结尾
    let endIdx = remaining.length;
    for (const nextSlot of equipSlots) {
      const idx = remaining.indexOf(',' + nextSlot + ',');
      if (idx >= 0 && idx < endIdx) {
        endIdx = idx;
      }
    }

    const equipStr = remaining.substring(0, endIdx);
    result.push([slot, equipStr]);

    if (endIdx < remaining.length) {
      remaining = remaining.substring(endIdx + 1); // skip past the comma
    } else {
      break;
    }
  }

  return result;
}

/** 解析 GLOBAL 区块的 toggle,key#val#key#val#... 格式 */
function parseTogglePairs(data: string): [string, string][] {
  const result: [string, string][] = [];
  // 去掉开头的 "toggle,"
  let content = data;
  if (content.startsWith('toggle,')) {
    content = content.substring(7);
  }
  const parts = content.split('#');
  for (let i = 0; i + 1 < parts.length; i += 2) {
    if (parts[i]) result.push([parts[i], parts[i + 1]]);
  }
  return result;
}

/** 解析 SELECTION 区块的 map,mapName#title,titleName 格式 */
function parseSelection(data: string): { mapName: string; selectedTitleName: string | null } {
  let mapName = '';
  let selectedTitleName: string | null = null;
  const entries = data.split('#');
  for (const entry of entries) {
    if (!entry) continue;
    const commaIndex = entry.indexOf(',');
    if (commaIndex < 0) continue;
    const key = entry.substring(0, commaIndex);
    const value = entry.substring(commaIndex + 1);
    if (key === 'map') {
      mapName = value;
    } else if (key === 'title') {
      selectedTitleName = value || null;
    }
  }
  return { mapName, selectedTitleName };
}

/** 创建默认配置 */
function resolveRace(raceName: string) {
  if (raceName === 'undeath') {
    return UNDEATH;
  }
  const race = RaceList.find(r => r.name === raceName);
  if (!race) {
    throw new Error(`Unknown race in save: ${raceName}`);
  }
  return race;
}

function parseToggleValue(val: string): boolean {
  return val === 'true' || val === '1';
}

function createDefaultConfig(): GlobalConfig {
  return {
    battle_toggle: true, battleIntro_toggle: true,
    money_toggle: true, exp_toggle: true, item_toggle: true, other_toggle: true,
    item0_toggle: true, item1_toggle: true, item2_toggle: true, item3_toggle: true, item4_toggle: true, item5_toggle: true,
    sword_toggle: true, axe_toggle: true, bow_toggle: true, crossbow_toggle: true,
    sceptre_toggle: true, staff_toggle: true, tome_toggle: true, shield_toggle: true, dagger_toggle: true,
    body_light_toggle: true, body_medium_toggle: true, body_heavy_toggle: true,
    head_light_toggle: true, head_medium_toggle: true, head_heavy_toggle: true,
    feet_light_toggle: true, feet_medium_toggle: true, feet_heavy_toggle: true,
    necklace_toggle: true, ring_toggle: true,
    autoSell_toggle: true, sound_toggle: true,
  };
}
