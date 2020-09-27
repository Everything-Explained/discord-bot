import importFresh from 'import-fresh';
import Bot from '../bot';
import { Command } from '../command';
import config from '../config.json';
import { writeFileSync } from 'fs';


class LevelCmd extends Command {
  // Load fresh on first call
  private _levels = this._getMessageLevels();
  private _colorEx = /^#(([0-9A-F]){2}){3}$/g;



  constructor(public bot: Bot) {
    super(['level', 'lvl'], Bot.Role.Everyone);
  }



  _instruction(lvlOrCmd: string, cmd?: string, ...args: string[]) {
    const levelNum = +lvlOrCmd
    ;
    if (isNaN(levelNum)) {
      if (lvlOrCmd == 'count') return void this._sendLevelCount();
      if (lvlOrCmd == 'list')  return void this._listAllLevels();
      return;
    }
    if (!cmd) {
      if (!this._isValidLevel(levelNum)) return;
      return this.bot.sendMsg(
        this._levels[levelNum][1],
        `Level ${lvlOrCmd}`,
        `${this._levels[levelNum][2]}`
      );
    }
    if (this._isEditingLevel(levelNum, cmd, ...args)) return;

  }


  private _isEditingLevel(level: number, cmd: string|undefined, ...args: string[]) {
    if (cmd == 'text') {
      if (!this._isValidLevel(level)) return;
      const text = args.join(' ');
      this._setLevelText(level, text.trim());
      return true;
    }
    if (cmd == 'color') {
      if (!this._isValidLevel(level)) return;
      const [color] = args;
      this._setLevelColor(level, color.trim());
      return true;
    }
    if (cmd == 'add') {
      const desc = args.join(' ');
      this._isAddingLevel(level, desc.trim());
      return true;
    }
    if (cmd == 'delete' || cmd == 'del') {
      if (!this._isValidLevel(level)) return;
      this._isDeletingLevel(level);
      return true;
    }
    return false;
  }


  private _isAddingLevel(level: number, desc: string|undefined) {
    if (!desc) return this.bot.sendMedMsg(
      'Woah there, you forgot to enter the description for the level!'
    );
    const len = this._levels.length;
    if (level != len) return this.bot.sendMedMsg(
      'You can only add levels in order. The next available level that ' +
      `can be added, is \`Level ${len}\`.`
    );
    this._levels.push(
      [len, desc, this._levels[len - 1][2]]
    );
    const freshConfig = importFresh('../config.json') as typeof config;
    this._writeLevelConfig(freshConfig, this._levels, level, true);
    this._instruction(`${level}`);
  }


  private _isDeletingLevel(level: number) {
    const realLen = this._levels.length - 1;
    if (level < realLen) return this.bot.sendMedMsg(
      'Sorry, I cannot allow you to delete any levels below ' +
      `the current last level, which is **${realLen}**.`
    );
    this._levels.splice(realLen, 1);
    const freshConfig = importFresh('../config.json') as typeof config;
    this._writeLevelConfig(freshConfig, this._levels, level, true);
    this.bot.sendLowMsg(
      '', `Level ${realLen} Deleted`
    );
  }


  private _setLevelText(level: number, text: string|undefined) {
    if (!text) return this.bot.sendMedMsg(
      `Whoopsie, you forgot to provide a description the level.`
    );
    this._levels[level][1] = text;
    const freshConfig = importFresh('../config.json') as typeof config;
    this._writeLevelConfig(freshConfig, this._levels[level], level);
    this._instruction(`${level}`);
  }


  private _setLevelColor(level: number, color: string|undefined) {
    if (!color) return this.bot.sendMedMsg(
      'Oops, you forgot to provide a color for the level.'
    );
    if (!color.match(this._colorEx)) return this.bot.sendMedMsg(
      `Sorry, that's an invalid HEX color. All HEX colors should look like this: ` +
      '`#AA034F`. Notice that there are no lowercase letters and the length ' +
      'of it is *exactly* **7**.\n\n' +
      'Check out the color picker here: https://coolors.co/\n\n' +
      'Click the color swatch on the right and move the controls around to ' +
      `select your color. Once you're done, you can copy the code that's ` +
      'generated.',
      ':nerd:'
    );
    this._levels[level][2] = color;
    const freshConfig = importFresh('../config.json') as typeof config;
    this._writeLevelConfig(freshConfig, this._levels[level], level);
    this._instruction(`${level}`);
  }


  private _isValidLevel(level: number) {
    const realLevel = this._levels.length - 1;
    if (level < 0 || level > (realLevel)) {
      return !!this.bot.sendMedMsg(
        `Invalid Level Number: \`${level}\`` +
        `\nLevels must be in the range \`0 to ${realLevel}\``
      );
    }
    return true;
  }


  private _sendLevelCount() {
    const len = this._levels.length;
    this.bot.sendLowMsg(
      `There are currently **${len}** defined levels.\n\n` +
      `Level **${len - 1}** is currently the last level.`
    );
  }


  private _getMessageLevels() {
    return (
      (importFresh('../config.json') as typeof config)
        .bot.message_levels as [number, string, string][]
    );
  }


  private _listAllLevels() {
    this._levels.forEach((v, i) => {
      const [lvl, text, color] = v;
      setTimeout(() => {
        this.bot.sendMsg(text, `Level ${lvl}`,
          color
        );
      }, i * 1200);
    });
  }


  private _writeLevelConfig(
    newConfig: typeof config,
    data: any,
    level: number,
    all = false)
  {
    if (all) newConfig.bot.message_levels        = data;
    else     newConfig.bot.message_levels[level] = data
    ;
    writeFileSync('./config.json', JSON.stringify(newConfig, null, 2));
  }
}

export = LevelCmd;