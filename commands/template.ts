import Bot from '../bot';
import { Command } from '../command';




class TemplateCommand extends Command {

  get help() { return Strings.getHelp(); }


  constructor(bot: Bot) {
    super(['name'], Bot.Role.Everyone, bot);
  }


  _instructions() {
    // Implementation goes here
  }

}


namespace Strings {
  export const getHelp = () => (
``
  );
}
export = TemplateCommand;