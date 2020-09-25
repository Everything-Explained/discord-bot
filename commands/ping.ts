import { Message } from 'discord.js';
import Bot from '../bot';
import { Command } from '../command';
import CommandHandler from '../command-handler';

class PingCmd extends Command {
  constructor(public bot: Bot) {
    super('ping', Bot.Role.Admin);
  }
  _instruction(handler: CommandHandler, msg: Message) {
    msg.channel.send(
      this.bot.setLowMsg(`\u2002:clock3: ${msg.client.ws.ping}ms`)
    );
  }
}

export = PingCmd;