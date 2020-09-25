import { Message } from 'discord.js';
import Bot from '../bot';
import { Command } from '../command';
import CommandHandler from '../command-handler';

class TemplateCommand extends Command {
  constructor(public bot: Bot) {
    super('name', Bot.Role.Everyone);
  }
  _instruction(handler: CommandHandler, msg: Message) {
    // Implementation goes here
  }
}

export = TemplateCommand;