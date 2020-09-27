import Bot from '../bot';
import { Command } from '../command';

class TemplateCommand extends Command {
  constructor(public bot: Bot) {
    super(['name'], Bot.Role.Everyone);
  }
  _instruction() {
    // Implementation goes here
  }
}

export = TemplateCommand;