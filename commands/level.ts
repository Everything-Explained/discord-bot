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



  _instruction(arg: string, cmd?: string, ...args: string[]) {
    // Commands ANY args NO level
    if (arg == 'count') return this._sendLevelCount();
    if (arg == 'list')  return this._listAllLevels();
    if (arg == 'add')   return (
      this._addLevel(
        cmd && args.length
          ? [cmd, ...args].join(' ').trim()
          : undefined
      )
    );
    if (arg == 'delete') return this._deleteLevel();
    if (!this._isValidLevel(arg)) return;

    // Commands NO args WITH level
    const level = +arg;
    if (!cmd) return this._displayLevel(level);

    // Commands WITH args WITH level
    if (!args.length) return this.bot.sendMedMsg(
      `You're missing an expected value for the \`${cmd}\` sub-command.`
    );
    const argStr = args.join(' ').trim();
    if (cmd == 'text')  return this._setLevelText(level, argStr);
    if (cmd == 'color') return this._setLevelColor(level, args[0]);
  }


  _help() {
    this.bot.sendLowMsg(
`**Aliases**
\`\`\`${this.aliases.join(', ')}\`\`\`
**Count Level**
Gives you a count of how many levels are currently available.
\`\`\`;level count\`\`\`
**List Levels**
Lists all levels one after the other, with a certain delay. If
a level fails to appear at first, it's because Discord is not
able to keep up with the messages.
\`\`\`;level list\`\`\`
**Lookup Level**
Returns the description and number of the \`<level>\` you
you entered. This is useful if you've forgotten which level
is which and just need to refresh your memory.
\`\`\`;level <level>\`\`\`
**Add Level**
Adds a new level **after** the current last level. It requires
a \`<description>\` to be set for the level during creation.
\`\`\`;level add <description>\`\`\`
**Delete Level**
Deletes the *last existing* level only. This preserves the
order of the levels.
\`\`\`;level delete\`\`\`
**Edit Level Text**
Updates the \`<description>\` of an existing \`<level>\`.
\`\`\`;level <level> text <description>\`\`\`
**Edit Level Color**
Updates the border \`<color>\` of a \`<level>\`. The \`<color>\`
must be in capitalized hex format, e.g. \`#F83CC9\`
\`\`\`;level <level> color <color>\`\`\`
${this.helpFooter}`,
      'Level Command Help'
    );
  }


  private _displayLevel(level: number) {
    this.bot.sendMsg(
      `${this._levels[level][1]}`,
      `Level ${level}`,
      `${this._levels[level][2]}`
    );
  }


  private _addLevel(desc: string|undefined) {
    if (!desc) return this.bot.sendMedMsg(
      'Woah there, you forgot to enter a full description for the level!'
    );
    const newLevel = this._levels.length;
    this._levels.push(
      [newLevel, desc, this._levels[newLevel - 1][2]]
    );
    const freshConfig = importFresh('../config.json') as typeof config;
    this._writeLevelConfig(freshConfig, this._levels, newLevel, true);
    this._instruction(`${newLevel}`);
  }


  private _deleteLevel() {
    const lastLevel = this._levels.length - 1;
    this._levels.splice(lastLevel, 1);
    const freshConfig = importFresh('../config.json') as typeof config;
    this._writeLevelConfig(freshConfig, this._levels, lastLevel, true);
    this.bot.sendLowMsg(
      '', `Level ${lastLevel} Deleted`
    );
  }


  private _setLevelText(level: number, text: string) {
    this._levels[level][1] = text;
    const freshConfig = importFresh('../config.json') as typeof config;
    this._writeLevelConfig(freshConfig, this._levels[level], level);
    this._instruction(`${level}`);
  }


  private _setLevelColor(level: number, color: string) {
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


  private _isValidLevel(level: string) {
    const levelNum = +level
    ;
    if (isNaN(levelNum)) return !!this.bot.sendMedMsg(
      'You entered a level that is **Not a Number**.'
    );
    const realLevel = this._levels.length - 1
    ;
    if (levelNum < 0 || levelNum > realLevel) {
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
      `There are currently **${len}** defined levels.\n` +
      `Level **${len - 1}** is currently the last level.`
    );
  }


  private _getMessageLevels() {
    return (
      (importFresh('../config.json') as typeof config)
        .bot.message_levels as [index: number, desc: string, color: string][]
    );
  }


  private _listAllLevels() {
    this._levels.forEach((v, i) => {
      const [lvl, text, color] = v;
      setTimeout(
        () => this.bot.sendMsg(text, `Level ${lvl}`, color),
        i * 1200
      );
    });
  }


  private _writeLevelConfig(
    newConfig: typeof config,
    data: any,
    level: number,
    all = false
  ){
    if (all) newConfig.bot.message_levels        = data;
    else     newConfig.bot.message_levels[level] = data
    ;
    writeFileSync('./config.json', JSON.stringify(newConfig, null, 2));
  }
}

export = LevelCmd;