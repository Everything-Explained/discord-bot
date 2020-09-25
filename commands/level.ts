import { Message } from 'discord.js';
import Bot, { MessageLevel } from '../bot';
import { Command } from '../command';
import CommandHandler from '../command-handler';


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
  _instruction(handler: CommandHandler, msg: Message, level: string) {
    const realLevel = this._levels.length - 1;
    const levelNum = +level
    ;
    if (!isNaN(levelNum)) {
      if (levelNum < 0 || levelNum > realLevel) {
        return void msg.channel.send(this.bot.setMedMsg(
          `Invalid Level Number: \`${levelNum}\`` +
          `\nLevels must be in the range \`0 to ${realLevel}\``
        ));
      }
      return void msg.channel.send(new this.bot.Embed()
        .setTitle(`Level ${level}`)
        .setDescription(this._levels[levelNum][1])
        .setColor(this.bot.colorFromLevel(levelNum))
      );
    }

    // this._levels.forEach((v, i) => {
    //   const [color, text] = v;
    //   setTimeout(() => msg.channel.send(new this.bot.Embed()
    //     .setTitle(`Level ${color}`)
    //     .setColor(this.bot.colorFromLevel(color))
    //     .setDescription(text)
    //   ), i * 1000);
    // });
  }
}

export = LevelCmd;