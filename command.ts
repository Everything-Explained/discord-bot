import Bot from './bot';


export abstract class Command {

  /** Access to base Bot Class */
  protected _bot: Bot;

  /**
   * Returns the body of a commands help info.
   */
  abstract get help(): string;


  constructor(
    public aliases: string[],
    public role: Bot.Role,
    bot: Bot
  ) { this._bot = bot; }


  protected abstract _instructions(...args: string[]): void;


  exec(admin = false, ...args: string[]) {
    const msg = this._bot.curMsg;
    if (!admin && !this._bot.hasValidRole(msg.member!, this.role)) {
      return void this._bot.sendMedMsg(
        `Sorry <@${msg.member?.id}>, you do not have the necessary \
        permissions use this command.`
      );
    }
    this._instructions(...args);
  }
}