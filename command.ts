import Bot from './bot';


export abstract class Command {

  abstract bot: Bot;

  /**
   * Returns the body of a commands help info.
   */
  abstract get help(): string;


  constructor(
    public aliases: string[],
    public role: Bot.Role,
  ) {}


  protected abstract _instructions(...args: string[]): void;


  exec(admin = false, ...args: string[]) {
    const msg = this.bot.curMsg;
    if (!admin && !this.bot.hasValidRole(msg.member!, this.role)) {
      return void this.bot.sendMedMsg(
        `Sorry <@${msg.member?.id}>, you do not have the necessary \
        permissions use this command.`
      );
    }
    this._instructions(...args);
  }
}