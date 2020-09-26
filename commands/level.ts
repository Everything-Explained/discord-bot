import importFresh from 'import-fresh';
import Bot, { MessageLevel } from '../bot';
import { Command } from '../command';
import config from '../config.json';


class LevelCmd extends Command {
  // Load fresh on first call
  private _levelChanged = false;
  private _levels =
    (importFresh('../config.json') as typeof config)
      .bot.message_levels as [number, string, string][]
  ;

  constructor(public bot: Bot) {
    super('level', Bot.Role.Everyone);
  }



  _instruction(level: string) {
    this._refreshLevels();
    const realLevel = this._levels.length - 1;
    const levelNum = +level
    ;
    if (!isNaN(levelNum)) {
      if (levelNum < 0 || levelNum > realLevel) {
        return this.bot.sendMedMsg(
          `Invalid Level Number: \`${levelNum}\`` +
          `\nLevels must be in the range \`0 to ${realLevel}\``
        );
      }
      return this.bot.sendMsg(
        this._levels[levelNum][1],
        `Level ${level}`,
        `${this._levels[levelNum][2]}`
      );
    }
    return void this._listAllLevels();
  }


  private _refreshLevels() {
    if (!this._levelChanged) return;
    this._levels =
      (importFresh('../config.json') as typeof config)
        .bot.message_levels as [number, string, string][]
    ;
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
}

export = LevelCmd;