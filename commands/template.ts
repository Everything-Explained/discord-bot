import Bot from '../bot';
import { Command } from '../command';




class TemplateCommand extends Command {

  get help() {
    return '';
  }


  constructor(bot: Bot) {
    super(['name'], Bot.Role.Everyone, bot);
  }


  _instructions() {
    // Implementation goes here
  }

}
export = TemplateCommand;