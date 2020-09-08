import { Message } from 'discord.js';
import { Command } from '../command';
import CommandHandler from '../command-handler';
import { MessagePriority, setMessage } from '../utils';

class NameCmd extends Command {
  constructor() {
    super('name');
  }
  exec(handler: CommandHandler, msg: Message) {}
}

export = NameCmd;