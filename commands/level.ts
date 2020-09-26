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
    super('level', Bot.Role.Everyone);
  }



  _instruction(level: string, cmd?: string, ...args: string[]) {
    const levelNum = +level
    ;
    if (!isNaN(levelNum)) {
      if (!this._isValidLevel(levelNum)) return;
      if (this._isEditingLevel(levelNum, cmd, ...args)) return;

      return this.bot.sendMsg(
        this._levels[levelNum][1],
        `Level ${level}`,
        `${this._levels[levelNum][2]}`
      );
    }
    return void this._listAllLevels();
  }


  private _isEditingLevel(level: number, cmd: string|undefined, ...args: string[]) {
    if (cmd == 'text') {
      const text = args.join(' ');
      this._setLevelText(level, text);
      return true;
    }
    if (cmd == 'color') {
      const [color] = args;
      this._setLevelColor(level, color);
      return true;
    }
    return false;
  }


  private _setLevelText(level: number, text: string|undefined) {
    if (!text) return this.bot.sendMedMsg(
      `Whoopsie, you forgot to provide a description the level.`
    );
    if (!text.trim()) {
      return this.bot.sendMedMsg(
        `Oops, you sent me an empty description for level \`${level}\``
      );
    }
    this._levels[level][1] = text.trim();
    const freshConfig = importFresh('../config.json') as typeof config;
    this._writeLevelConfig(freshConfig, this._levels[level], level);
  }


  private _setLevelColor(level: number, color: string|undefined) {
    if (!color) return this.bot.sendMedMsg(
      'Oops, you forgot to provide a color for the level.'
    );
    if (!this._colorEx.test(color)) return this.bot.sendMedMsg(
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
  }


  private _isValidLevel(level: number) {
    const realLevel = this._levels.length - 1;
    if (level < 0 || level > (this._levels.length - 1)) {
      return !!this.bot.sendMedMsg(
        `Invalid Level Number: \`${level}\`` +
        `\nLevels must be in the range \`0 to ${realLevel}\``
      );
    }
    return true;
  }


  private _getMessageLevels() {
    return (
      (importFresh('../config.json') as typeof config)
        .bot.message_levels as [number, string, string][]
    );
  }


  private _listAllLevels() {
    this._levels.forEach((v, i) => {
      const [color, text] = v;
      setTimeout(() => {
        this.bot.sendMsg(text, `Level ${color}`,
          this.bot.colorFromLevel(color)
        );
      }, i * 1200);
    });
  }


  private _writeLevelConfig(
    newConfig: typeof config,
    data: [number, string, string],
    level: number)
  {
    newConfig.bot.message_levels[level] = data;
    writeFileSync('./config.json', JSON.stringify(newConfig, null, 2));
    this._instruction(`${level}`);
  }
}

export = LevelCmd;