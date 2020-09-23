import { Message } from 'discord.js';
import { Bot, Role } from '../bot';
import { Command } from '../command';
import CommandHandler from '../command-handler';

class WallCmd extends Command {

  constructor(public bot: Bot) {
    super('wall', Role.Everyone);
  }


  _instruction(handler: CommandHandler, msg: Message, size: string) {
    let lines = +size;
    if (isNaN(lines)) {
      return void msg.channel.send(
        this.bot.setMedMsg(
          `\`${size}\` is an invalid size for the wall.`
        )
      );
    }
    if (lines < 1) return void msg.channel.send(
      this.bot.setMedMsg('Wall size **must** be `greater than 0`')
    );
    let wall = '';
    while (lines--) {
      wall += '‎‎\u200B\n';
    }
    msg.channel.send(wall);
  }


}

export = WallCmd;