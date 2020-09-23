import { Message, TextChannel } from 'discord.js';
import { Bot, Role } from '../bot';
import { Command } from '../command';
import CommandHandler from '../command-handler';
import { MessagePriority, setMessage } from '../utils';

class TestCmd extends Command {

  constructor(public bot: Bot) {
    super('test', Role.Admin);
  }


  _instruction(handler: CommandHandler, msg: Message, limit: string) {
    //
  }
}

export = TestCmd;