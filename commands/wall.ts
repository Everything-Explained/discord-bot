import Bot from '../bot';
import { Command } from '../command';

class WallCmd extends Command {

  constructor(public bot: Bot) {
    super('wall', Bot.Role.Everyone);
  }


  _instruction(size: string) {
    let lines = +size;
    if (isNaN(lines)) {
      return this.bot.sendMedMsg(
        `\`${size}\` is an invalid size for the wall.`
      );
    }
    if (lines < 1) return this.bot.sendMedMsg(
      'Wall size **must** be `greater than 0`'
    );
    let wall = '';
    while (lines--) {
      wall += '‎‎\u200B\n';
    }
    this.bot.curMsg.channel.send(wall);
  }


}

export = WallCmd;