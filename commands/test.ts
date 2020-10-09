import Bot from '../bot';
import { Command } from '../command';



class TestCmd extends Command {

  get help() {
    return (
`This command could literally do **ANY**thing and should only
be called if you know what it does.`
    );
  }


  constructor(bot: Bot) {
    super(['test'], Bot.Role.Admin, bot);
  }


  _instructions(...args: string[]) {
    this._bot.sendLowMsg('hello');
  }

}
export = TestCmd;