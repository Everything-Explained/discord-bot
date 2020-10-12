import importFresh from 'import-fresh';
import Bot from '../bot';
import { Command } from '../command';
import config from '../config.json';
import { writeFileSync } from 'fs';


type MessageLevels = [index: number, desc: string, color: string][];


class LevelCmd extends Command {
  // Load fresh on first call
  private _levels = this._getMessageLevels();
  // Matches #F03A8E
  private _colorEx = /^#(([0-9A-F]){2}){3}$/g;

  get help() { return Strings.getHelp(); }


  constructor(bot: Bot) {
    super(['level', 'lvl'], Bot.Role.Everyone, bot);
  }


  _instructions(arg: string, cmd?: string, ...args: string[]) {
    // Commands ANY args NO level
    if (arg == 'count') return this._sendLevelCount();
    if (arg == 'list')  return this._listAllLevels();
    if (arg == 'add')   return (
      this._addLevel(
        cmd && args.length
          // cmd is also part of the description.
          ? [cmd, ...args].join(' ').trim()
          : undefined
      )
    );
    if (arg == 'delete') return this._deleteLevel();
    if (!this._isValidLevel(arg)) return
    ;
    // Commands NO args WITH level
    const level = +arg;
    if (!cmd) return this._displayLevel(level)
    ;
    // Commands WITH args WITH level
    if (!args.length) return this._bot.sendMedMsg(
      `You're missing an expected value for the \`${cmd}\` sub-command.`
    );
    const argStr = args.join(' ').trim();
    if (cmd == 'text')  return this._setLevelText(level, argStr);
    if (cmd == 'color') return this._setLevelColor(level, args[0]);
  }


  private _displayLevel(level: number) {
    this._bot.sendMsg(
      `${this._levels[level][1]}`,
      `Level ${level}`,
      `${this._levels[level][2]}`
    );
  }


  private _addLevel(desc: string|undefined) {
    if (!desc) return (
      this._bot.sendMedMsg(Strings.getMissingLevelDesc())
    );
    const newLevel = this._levels.length;
    this._levels.push(
      [newLevel, desc, this._levels[newLevel - 1][2]]
    );
    this._writeLevelConfig(this._levels);
    this._instructions(`${newLevel}`);
  }


  private _deleteLevel() {
    const lastLevel = this._levels.length - 1;
    this._levels.splice(lastLevel, 1);
    this._writeLevelConfig(this._levels);
    this._bot.sendLowMsg('', `Level ${lastLevel} Deleted`);
  }


  private _setLevelText(level: number, text: string) {
    this._levels[level][1] = text;
    this._writeLevelConfig(this._levels);
    this._instructions(`${level}`);
  }


  private _setLevelColor(level: number, color: string) {
    if (!color.match(this._colorEx)) return (
      this._bot.sendMedMsg(Strings.getInvalidHex())
    );
    this._levels[level][2] = color;
    this._writeLevelConfig(this._levels);
    this._instructions(`${level}`);
  }


  private _isValidLevel(level: string) {
    const userLvlNum = +level;
    if (isNaN(userLvlNum)) return (
      !!this._bot.sendMedMsg(Strings.getLevelNaN())
    );
    const maxLevel = this._levels.length - 1;
    if (userLvlNum < 0 || userLvlNum > maxLevel)
      return !!this._bot.sendMedMsg(Strings.getBadLevelRange(maxLevel))
    ;
    return true;
  }


  private _sendLevelCount() {
    const len = this._levels.length;
    this._bot.sendLowMsg(Strings.getLevelCount(len));
  }


  private _getMessageLevels() {
    return this._getConfig().bot.message_levels as MessageLevels;
  }


  private _listAllLevels() {
    this._levels.forEach((v, i) => {
      const [lvl, text, color] = v;
      setTimeout(
        () => this._bot.sendMsg(text, `Level ${lvl}`, color),
        i * 1200
      );
    });
  }


  private _writeLevelConfig(levels: MessageLevels) {
    const latestConfig = this._getConfig();
    latestConfig.bot.message_levels = levels;
    writeFileSync('./config.json', JSON.stringify(latestConfig, null, 2));
  }


  private _getConfig() {
    return importFresh('../config.json') as typeof config;
  }

}



namespace Strings {
  export const getHelp = () => (
`**Count Level**
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
\`\`\`;level <level> color <color>\`\`\``
  );

  export const getMissingLevelDesc = () => (
`You need to provide a description for the level.`
  );

  export const getInvalidHex = () => (
`Sorry, that's an invalid HEX color. All HEX colors should look
like this: \`#AA034F\`. Notice that there are no lowercase letters
and the length of it is *exactly* **7**.

Check out the color picker here: https://coolors.co/

Click the color swatch on the right and move the controls around to
select your color. Once you're done, you can copy the code that's
generated. :nerd:'`
  );

  export const getLevelNaN = () => (
`You entered a level that is **Not a Number**.`
  );

  export const getBadLevelRange = (maxLevel: number) => (
`The only available levels are from \`0\` to \`${maxLevel}\`. To see all
the levels, you can type \`;level list\`.`
  );

  export const getLevelCount = (levelLength: number) => (
`There are currently \`${levelLength}\` defined levels, but the
level range is between \`0\` and \`${levelLength - 1}\`.`
  );
}
export = LevelCmd;