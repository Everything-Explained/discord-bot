import Bot from './bot';


export abstract class Command {

  abstract bot: Bot;


  constructor(
    public aliases: string[],
    public role: Bot.Role,
  ) {}

  get helpFooter() {
    const aliasList = this.aliases.reduce(
      (str, alias, i) => (
        i == this.aliases.length - 1
          ? str += `and \`;${alias}\``
          : str += `\`;${alias}\` `
      ), ''
    );
    return this.aliases.length > 1
      ? `*Don't forget ${aliasList} are interchangeable.*`
      : ''
    ;
  }


  protected abstract _instruction(...args: string[]): void;


  protected abstract _help(): void;



  exec(admin = false, ...args: string[]) {
    const msg = this.bot.curMsg;
    if (!admin && !this.bot.hasValidRole(msg.member!, this.role)) {
      return void this.bot.sendMedMsg(
        `Sorry <@${msg.member?.id}>, you do not have the necessary \
        permissions use this command.`
      );
    }
    if (args[0] == 'help' || args[0] == '?') {
      if (!this._help) {
        return this.bot.sendHighMsg(
          'Jaeiya is a bad boy!! :face_with_symbols_over_mouth:\n' +
          'He forgot to add a description to the help command. ' +
          '\n\n**Make sure you yell at him thoroughly for me!**.',
          'Command Has No Help'
        );
      }
      return this._help();
    }
    this._instruction(...args);
  }
}