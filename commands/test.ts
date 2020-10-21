import Bot from '../bot';
import { Command } from '../command';



class TestCmd extends Command {

  get help() { return Strings.getHelp(); }


  constructor(bot: Bot) {
    super(['test'], Bot.Role.Admin, bot);
  }


  _instructions(...args: string[]) {
    this._bot.sendLowMsg('hello world!');
  }

}

namespace Strings {
  export const getHelp = () => (
`This command could literally do **ANY**thing and should only
be called if you know what it does.`
  );
}
export = TestCmd;