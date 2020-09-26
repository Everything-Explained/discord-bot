import Bot, { MessageLevel } from '../bot';
import { Command } from '../command';


class LevelCmd extends Command {

  private _levels: [MessageLevel, string][] = [
    [
      MessageLevel.WHITE,
      'Small-Talk and *day-to-day* normalcy.'
    ],
    [
      MessageLevel.BLUE,
      'Personal life review and beliefs.'
    ],
    [
      MessageLevel.GREEN,
      'On the way to considering *conspiracy theories*.'
    ],
    [
      MessageLevel.YELLOW,
      'Taking conspiracy theories down the rabbit hole; slowly but surely.'
    ],
    [
      MessageLevel.ORANGE,
      'Serious existential crisis begin to set in about topics such as: ' +
      '`Impermanence`, `Absolute Truth`, `Infinity`, and `Duality`.'
    ],
    [
      MessageLevel.RED,
      'The **full implications** begin to set in about Orange topics, which ' +
      'lead to a potentially *full on* existential crisis about meaninglessness.'
    ],
    [
      MessageLevel.CHOCOLATE,
      'Grace enters the conversation; paradise and perfection are shown to be ' +
      'objective beyond existence...the subsistential way of life.'
    ],
    [
      MessageLevel.GRAY,
      'At this point, the `Absolute Magnitude` to the `Ineffable` to the `' +
      'Zero-th level of information (including all indirect forms) become a ' +
      'part of the conversation.'
    ],
    [
      MessageLevel.BLACK,
      'Discussions that go *beyond*, *yond*, *contra-yond*, etc...the `Ineffable`'
    ]
  ]



  constructor(public bot: Bot) {
    super('level', Bot.Role.Everyone);
  }



  _instruction(level: string) {
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
        `${this.bot.colorFromLevel(levelNum)}`
      );
    }
    return void this._listAllLevels();
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